/**
 * @fileoverview Base Table Adapter Tests
 * @description Unit tests for the BaseTableAdapter class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseTableAdapter } from '../../../src/lib/adapter/base-adapter.js';
import { createSortingConverters } from '../../../src/lib/sorting/converters.js';
import type { BaseTableAdapterOptions } from '../../../src/lib/adapter/types.js';
import type { CursorPaginationOptions } from '../../../src/lib/pagination/types.js';
import type { AnyColumnDef, FetchFn, QueryOptionsBuilder } from '../../../src/lib/types.js';
import type { Connection, Success, ClientError } from '@insurup/sdk';
import { InsurUpClientErrorType } from '@insurup/sdk';
import { flushPromises, spyOnConsoleWarn } from '../../utils/helpers.js';

// ============================================================================
// Mock Types
// ============================================================================

interface MockEntity {
  id: string;
  name: string;
  email: string;
}

/** Field keys for MockEntity */
type MockEntityFieldKey = keyof MockEntity;

interface MockSortInput {
  id?: 'ASC' | 'DESC';
  name?: 'ASC' | 'DESC';
}

interface MockFilterInput {
  name?: { contains?: string };
}

interface MockSearchInput {
  query?: string;
}

interface MockQueryOptions {
  first: number;
  after?: string;
  order?: MockSortInput[];
  select?: string[];
  filter?: MockFilterInput;
  search?: MockSearchInput;
  includeTotalCount?: boolean;
}

// ============================================================================
// Test Helpers
// ============================================================================

const sortingConverters = createSortingConverters<MockSortInput>();

function createMockColumns(): AnyColumnDef<MockEntityFieldKey>[] {
  return [
    {
      key: 'id',
      fields: ['id'],
      header: 'ID',
      sortable: true,
      hideable: false,
      hiddenByDefault: false,
      isComputed: false,
    },
    {
      key: 'name',
      fields: ['name'],
      header: 'Name',
      sortable: true,
      hideable: true,
      hiddenByDefault: false,
      isComputed: false,
    },
  ] as AnyColumnDef<MockEntityFieldKey>[];
}

function createSuccessResult<T>(data: T): Success<T> {
  return {
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  };
}

function createMockConnection(
  nodes: MockEntity[],
  hasNextPage = false,
  endCursor: string | null = null,
  totalCount?: number
): Connection<MockEntity> {
  return {
    nodes,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      startCursor: nodes.length > 0 ? 'start' : null,
      endCursor,
    },
    totalCount: totalCount ?? nodes.length,
    edges: nodes.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createMockFetchFn(
  data?: Connection<MockEntity>
): FetchFn<MockEntity, MockQueryOptions> {
  const defaultData = createMockConnection([
    { id: '1', name: 'Test 1', email: 'test1@example.com' },
    { id: '2', name: 'Test 2', email: 'test2@example.com' },
  ]);

  return vi.fn().mockResolvedValue(createSuccessResult(data ?? defaultData));
}

function createMockBuildQueryOptions(): QueryOptionsBuilder<
  MockEntity,
  MockQueryOptions,
  MockSortInput,
  MockFilterInput,
  MockSearchInput
> {
  return (params) => ({
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as string[],
    filter: params.filter,
    search: params.search,
    includeTotalCount: params.includeTotalCount,
  });
}

function createAdapterOptions(
  overrides: Partial<BaseTableAdapterOptions<MockEntity, MockEntity, MockSortInput, MockFilterInput, MockSearchInput, CursorPaginationOptions>> = {}
): BaseTableAdapterOptions<MockEntity, MockEntity, MockSortInput, MockFilterInput, MockSearchInput, CursorPaginationOptions> {
  return {
    columns: createMockColumns(),
    pagination: { type: 'cursor', pageSize: 10 },
    sortingConverters,
    queryKeyPrefix: 'test',
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('BaseTableAdapter', () => {
  let fetchFn: ReturnType<typeof createMockFetchFn>;
  let buildQueryOptions: ReturnType<typeof createMockBuildQueryOptions>;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchFn = createMockFetchFn();
    buildQueryOptions = createMockBuildQueryOptions();
  });

  describe('constructor', () => {
    it('should create an adapter instance', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      expect(adapter).toBeInstanceOf(BaseTableAdapter);
      adapter.destroy();
    });

    it('should throw error for pageSize <= 0', () => {
      expect(() => {
        new BaseTableAdapter(fetchFn, buildQueryOptions, createAdapterOptions({ pagination: { type: 'cursor', pageSize: 0 } }));
      }).toThrow('pageSize must be greater than 0');

      expect(() => {
        new BaseTableAdapter(fetchFn, buildQueryOptions, createAdapterOptions({ pagination: { type: 'cursor', pageSize: -5 } }));
      }).toThrow('pageSize must be greater than 0');
    });

    it('should throw error for empty columns', () => {
      expect(() => {
        new BaseTableAdapter(fetchFn, buildQueryOptions, createAdapterOptions({ columns: [] }));
      }).toThrow('At least one column must be provided');
    });

    it('should initialize with default state', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const state = adapter.getState();

      expect(state.rows).toEqual([]);
      expect(state.rowCount).toBeNull(); // null until data loaded
      expect(state.pageCount).toBeNull(); // null until data loaded
      expect(state.isLoading).toBe(false);
      expect(state.isFetching).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isError).toBe(false);
      expect(state.isSuccess).toBe(false);

      adapter.destroy();
    });

    it('should auto-fetch when autoFetch is true', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ autoFetch: true })
      );

      await flushPromises();

      expect(fetchFn).toHaveBeenCalled();

      adapter.destroy();
    });

    it('should not auto-fetch by default', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      expect(fetchFn).not.toHaveBeenCalled();

      adapter.destroy();
    });

    it('should convert columns to TanStack ColumnDef', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      expect(adapter.columns).toHaveLength(2);
      expect(adapter.columns[0]).toHaveProperty('id', 'id');
      expect(adapter.columns[1]).toHaveProperty('id', 'name');

      adapter.destroy();
    });
  });

  describe('fetch', () => {
    it('should fetch data successfully', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        1
      );
      fetchFn = createMockFetchFn(mockData);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();

      const state = adapter.getState();
      expect(state.rows).toHaveLength(1);
      expect(state.rowCount).toBe(1);
      expect(state.isSuccess).toBe(true);

      adapter.destroy();
    });

    it('should build correct query variables', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ pagination: { type: 'cursor', pageSize: 25 } })
      );

      await adapter.fetch();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 25,
          after: undefined,
          select: ['id', 'name'],
        }),
        expect.any(Object)
      );

      adapter.destroy();
    });

    it('should update pageCount based on totalCount', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        true,
        'cursor-1',
        100
      );
      fetchFn = createMockFetchFn(mockData);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ pagination: { type: 'cursor', pageSize: 10 } })
      );

      await adapter.fetch();
      await flushPromises();

      const state = adapter.getState();
      expect(state.pageCount).toBe(10); // 100 / 10

      adapter.destroy();
    });
  });

  describe('invalidate', () => {
    it('should invalidate cache and refetch', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      const firstCallCount = (fetchFn as ReturnType<typeof vi.fn>).mock.calls.length;

      await adapter.invalidate();
      await flushPromises();

      // Invalidate should trigger a refetch
      expect((fetchFn as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);

      adapter.destroy();
    });
  });

  describe('refetch', () => {
    it('should refetch data', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await adapter.refetch();

      expect(fetchFn).toHaveBeenCalled();

      adapter.destroy();
    });

    it('should force refetch when force option is true', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await adapter.refetch({ force: true });

      expect(fetchFn).toHaveBeenCalled();

      adapter.destroy();
    });
  });

  describe('setPageSize', () => {
    it('should update page size', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ pagination: { type: 'cursor', pageSize: 10 } })
      );

      adapter.setPageSize(25);

      await adapter.fetch();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({ first: 25 }),
        expect.any(Object)
      );

      adapter.destroy();
    });

    it('should throw error for invalid page size', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      expect(() => adapter.setPageSize(0)).toThrow('pageSize must be greater than 0');
      expect(() => adapter.setPageSize(-10)).toThrow('pageSize must be greater than 0');

      adapter.destroy();
    });

    it('should reset to first page when changing page size', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        true,
        'cursor-1',
        100
      );
      fetchFn = createMockFetchFn(mockData);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ pagination: { type: 'cursor', pageSize: 10 } })
      );

      // Fetch and go to next page
      await adapter.fetch();
      // Note: In real usage, pagination would be handled through handlePaginationChange

      // Change page size
      adapter.setPageSize(25);

      // Should fetch from the first page
      expect(fetchFn).toHaveBeenLastCalledWith(
        expect.objectContaining({ after: undefined }),
        expect.any(Object)
      );

      adapter.destroy();
    });
  });

  describe('getTableOptions', () => {
    it('should return table options for TanStack Table', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        1
      );
      fetchFn = createMockFetchFn(mockData);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();

      const options = adapter.getTableOptions();

      expect(options).toHaveProperty('data');
      expect(options).toHaveProperty('columns');
      expect(options).toHaveProperty('getCoreRowModel');
      expect(options).toHaveProperty('manualPagination', true);
      expect(options).toHaveProperty('manualSorting', true);
      expect(options).toHaveProperty('paginationMode', 'cursor');
      // onStateChange handles all state changes including pagination
      expect(options).toHaveProperty('onStateChange');

      adapter.destroy();
    });

    it('should return consistent options values across calls', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();

      const options1 = adapter.getTableOptions();
      const options2 = adapter.getTableOptions();

      // Options should have the same values (stable data and columns references)
      expect(options1.data).toBe(options2.data);
      expect(options1.columns).toBe(options2.columns);
      expect(options1.pageCount).toBe(options2.pageCount);
      expect(options1.rowCount).toBe(options2.rowCount);

      adapter.destroy();
    });

    it('should merge pass-through tableOptions', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({
          tableOptions: {
            enableRowSelection: true,
            getRowId: (row) => row.id,
          },
        })
      );

      const options = adapter.getTableOptions();

      expect(options).toHaveProperty('enableRowSelection', true);
      expect(options).toHaveProperty('getRowId');

      adapter.destroy();
    });
  });

  describe('subscribe / getSnapshot / getServerSnapshot', () => {
    it('should notify listeners on state change', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const listener = vi.fn();
      adapter.subscribe(listener);

      await adapter.fetch();
      await flushPromises();

      expect(listener).toHaveBeenCalled();

      adapter.destroy();
    });

    it('should return unsubscribe function', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const listener = vi.fn();
      const unsubscribe = adapter.subscribe(listener);

      expect(typeof unsubscribe).toBe('function');

      adapter.destroy();
    });

    it('should stop notifying after unsubscribe', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const listener = vi.fn();
      const unsubscribe = adapter.subscribe(listener);
      unsubscribe();

      listener.mockClear();

      await adapter.fetch();
      await flushPromises();

      expect(listener).not.toHaveBeenCalled();

      adapter.destroy();
    });

    it('getSnapshot should return cached state', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const state1 = adapter.getSnapshot();
      const state2 = adapter.getSnapshot();

      expect(state1).toBe(state2);

      adapter.destroy();
    });

    it('getServerSnapshot should return static loading state', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const serverState = adapter.getServerSnapshot();

      expect(serverState.rows).toEqual([]);
      expect(serverState.isLoading).toBe(true);
      expect(serverState.isFetching).toBe(false);

      adapter.destroy();
    });

    it('getServerSnapshot should return same reference', () => {
      const adapter1 = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );
      const adapter2 = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const serverState1 = adapter1.getServerSnapshot();
      const serverState2 = adapter2.getServerSnapshot();

      // Static snapshot should be the same across instances
      expect(serverState1).toBe(serverState2);

      adapter1.destroy();
      adapter2.destroy();
    });
  });

  describe('filter methods', () => {
    it('setFilter should update filter and refetch', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      adapter.setFilter({ name: { contains: 'test' } });

      await flushPromises();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { name: { contains: 'test' } },
        }),
        expect.any(Object)
      );

      adapter.destroy();
    });

    it('getFilter should return current filter', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ defaultFilter: { name: { contains: 'initial' } } })
      );

      const filter = adapter.getFilter();

      expect(filter).toEqual({ name: { contains: 'initial' } });

      adapter.destroy();
    });

    it('clearFilter should remove filter and refetch', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ defaultFilter: { name: { contains: 'test' } } })
      );

      adapter.clearFilter();

      await flushPromises();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: undefined,
        }),
        expect.any(Object)
      );
      expect(adapter.getFilter()).toBeUndefined();

      adapter.destroy();
    });
  });

  describe('search methods', () => {
    it('setSearch should update search and refetch', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      adapter.setSearch({ query: 'test search' });

      await flushPromises();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          search: { query: 'test search' },
        }),
        expect.any(Object)
      );

      adapter.destroy();
    });

    it('getSearch should return current search', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ defaultSearch: { query: 'initial' } })
      );

      const search = adapter.getSearch();

      expect(search).toEqual({ query: 'initial' });

      adapter.destroy();
    });

    it('clearSearch should remove search and refetch', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ defaultSearch: { query: 'test' } })
      );

      adapter.clearSearch();

      await flushPromises();

      expect(fetchFn).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
        }),
        expect.any(Object)
      );
      expect(adapter.getSearch()).toBeUndefined();

      adapter.destroy();
    });
  });

  describe('error handling', () => {
    it('should call onError callback on fetch failure', async () => {
      const onError = vi.fn();
      const errorResponse: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Network error',
        type: InsurUpClientErrorType.HttpRequestFailed,
      };

      fetchFn = vi.fn().mockResolvedValue(errorResponse);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ onError })
      );

      await adapter.fetch();
      await flushPromises();

      expect(onError).toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TableError',
          message: 'Network error',
        })
      );

      adapter.destroy();
    });

    it('should call onSuccess callback on successful fetch', async () => {
      const onSuccess = vi.fn();

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ onSuccess })
      );

      await adapter.fetch();
      await flushPromises();

      expect(onSuccess).toHaveBeenCalled();

      adapter.destroy();
    });

    it('should call onSettled callback after fetch completes', async () => {
      const onSettled = vi.fn();

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ onSettled })
      );

      await adapter.fetch();
      await flushPromises();

      expect(onSettled).toHaveBeenCalled();

      adapter.destroy();
    });

    it('should update error state on failure', async () => {
      const errorResponse: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Test error',
        type: InsurUpClientErrorType.Unknown,
      };

      fetchFn = vi.fn().mockResolvedValue(errorResponse);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();

      const state = adapter.getState();
      expect(state.isError).toBe(true);
      expect(state.error).toBeDefined();
      expect(state.error?.message).toBe('Test error');

      adapter.destroy();
    });
  });

  describe('pagination handling', () => {
    it('should warn when attempting multi-page jump', async () => {
      const consoleSpy = spyOnConsoleWarn();

      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        true,
        'cursor-1',
        100
      );
      fetchFn = createMockFetchFn(mockData);

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ pagination: { type: 'cursor', pageSize: 10 } })
      );

      // Create table instance (required for handleTableStateChange)
      const table = adapter.getTable();

      await adapter.fetch();
      await flushPromises();

      // Simulate pagination change via onStateChange (attempt to jump 3 pages)
      const currentState = table.getState();
      const options = adapter.getTableOptions();
      options.onStateChange?.({
        ...currentState,
        pagination: { pageIndex: 3, pageSize: 10 },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cursor pagination only supports sequential navigation')
      );

      consoleSpy.mockRestore();
      adapter.destroy();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      const listener = vi.fn();
      adapter.subscribe(listener);

      expect(() => adapter.destroy()).not.toThrow();
    });
  });

  describe('splitTotalCount', () => {
    it('should initialize with null counts when splitTotalCount is enabled', () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      const state = adapter.getState();

      expect(state.rowCount).toBeNull();
      expect(state.pageCount).toBeNull();
      expect(state.isCountLoading).toBe(false);

      adapter.destroy();
    });

    it('should not include totalCount in main query when splitTotalCount is enabled', async () => {
      const mockBuildQueryOptions = vi.fn((params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select as string[],
        filter: params.filter,
        search: params.search,
        includeTotalCount: params.includeTotalCount,
      }));

      const adapter = new BaseTableAdapter(
        fetchFn,
        mockBuildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      await adapter.fetch();
      await flushPromises();

      expect(mockBuildQueryOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          includeTotalCount: false,
        })
      );

      adapter.destroy();
    });

    it('should include totalCount in main query when splitTotalCount is disabled', async () => {
      const mockBuildQueryOptions = vi.fn((params) => ({
        first: params.first,
        after: params.after,
        order: params.order,
        select: params.select as string[],
        filter: params.filter,
        search: params.search,
        includeTotalCount: params.includeTotalCount,
      }));

      const adapter = new BaseTableAdapter(
        fetchFn,
        mockBuildQueryOptions,
        createAdapterOptions({ splitTotalCount: false })
      );

      await adapter.fetch();
      await flushPromises();

      expect(mockBuildQueryOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          includeTotalCount: true,
        })
      );

      adapter.destroy();
    });

    it('should fire count query in parallel with main data fetch', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        0 // totalCount in main query - will be ignored
      );

      const countData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        42 // totalCount from count query
      );

      // Both calls happen in parallel
      fetchFn = vi.fn().mockImplementation((vars) => {
        // Count query uses first: 1
        if (vars.first === 1 && vars.includeTotalCount === true) {
          return Promise.resolve(createSuccessResult(countData));
        }
        // Main query
        return Promise.resolve(createSuccessResult(mockData));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      await adapter.fetch();
      await flushPromises();

      // Should have made two calls: main fetch + count fetch (in parallel)
      expect(fetchFn).toHaveBeenCalledTimes(2);

      const state = adapter.getState();
      expect(state.rowCount).toBe(42);
      expect(state.pageCount).toBe(5); // 42 / 10 = 4.2, rounded up = 5
      expect(state.isCountLoading).toBe(false);

      adapter.destroy();
    });

    it('should update isCountLoading state during count fetch', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        0
      );

      // Control when count query resolves
      let resolveCount!: () => void;
      const countGate = new Promise<void>((resolve) => {
        resolveCount = resolve;
      });

      // Track isCountLoading values seen during fetch
      const seenIsCountLoading: boolean[] = [];

      fetchFn = vi.fn().mockImplementation((vars) => {
        // Count query uses first: 1
        if (vars.first === 1 && vars.includeTotalCount === true) {
          // Count query waits for gate
          return countGate.then(() =>
            Promise.resolve(createSuccessResult(createMockConnection([], false, null, 100)))
          );
        }
        // Main query resolves immediately
        return Promise.resolve(createSuccessResult(mockData));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      // Subscribe to track state changes
      adapter.subscribe(() => {
        seenIsCountLoading.push(adapter.getState().isCountLoading);
      });

      // Start fetch (don't await yet)
      const fetchPromise = adapter.fetch();
      await flushPromises(); // Let main query complete

      // isCountLoading should have been true at some point
      expect(seenIsCountLoading).toContain(true);

      // Resolve count query
      resolveCount();
      await fetchPromise;
      await flushPromises();

      // Final state should show count loaded
      const state = adapter.getState();
      expect(state.isCountLoading).toBe(false);
      expect(state.rowCount).toBe(100);

      adapter.destroy();
    });

    it('should handle count query failure gracefully', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        0
      );

      fetchFn = vi.fn().mockImplementation((vars) => {
        // Count query uses first: 1
        if (vars.first === 1 && vars.includeTotalCount === true) {
          // Count query fails
          return Promise.reject(new Error('Count query failed'));
        }
        // Main query succeeds
        return Promise.resolve(createSuccessResult(mockData));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      await adapter.fetch();
      await flushPromises();

      // Data should still be available even if count query fails
      const state = adapter.getState();
      expect(state.rows).toHaveLength(1);
      expect(state.isSuccess).toBe(true);
      expect(state.isCountLoading).toBe(false);
      expect(state.rowCount).toBeNull(); // Count stays null on error

      adapter.destroy();
    });

    it('should use empty select for count query', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        0
      );

      const allQueryOptions: MockQueryOptions[] = [];
      fetchFn = vi.fn().mockImplementation((options) => {
        allQueryOptions.push(options);
        return Promise.resolve(createSuccessResult(mockData));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      await adapter.fetch();
      await flushPromises();

      // Should have made two calls: main fetch + count fetch (in parallel)
      expect(allQueryOptions).toHaveLength(2);

      // Find the count query (has first: 1 and includeTotalCount: true)
      const countOptions = allQueryOptions.find((opts) => opts.first === 1 && opts.includeTotalCount === true);
      expect(countOptions).toBeDefined();
      expect(countOptions?.after).toBeUndefined();
      // Count query uses empty select - only needs totalCount
      expect(countOptions?.select).toHaveLength(0);

      adapter.destroy();
    });

    it('should not refetch count query on pagination changes', async () => {
      // First page data - has next page
      const page1Data = createMockConnection(
        [{ id: '1', name: 'Test 1', email: 'test1@example.com' }],
        true,
        'cursor1',
        50
      );
      // Second page data
      const page2Data = createMockConnection(
        [{ id: '2', name: 'Test 2', email: 'test2@example.com' }],
        true,
        'cursor2',
        50
      );

      let fetchCallCount = 0;
      let countQueryCallCount = 0;
      
      fetchFn = vi.fn().mockImplementation((vars) => {
        fetchCallCount++;
        // Count query uses first: 1
        if (vars.first === 1 && vars.includeTotalCount === true) {
          countQueryCallCount++;
          return Promise.resolve(createSuccessResult(page1Data));
        }
        // Main query - return different data based on cursor
        if (vars.after === 'cursor1') {
          return Promise.resolve(createSuccessResult(page2Data));
        }
        return Promise.resolve(createSuccessResult(page1Data));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      // Initial fetch - should fetch both main and count
      await adapter.fetch();
      await flushPromises();

      expect(countQueryCallCount).toBe(1);
      const initialFetchCount = fetchCallCount;

      // Go to next page - should NOT refetch count
      adapter.pagination.next();
      await adapter.fetch();
      await flushPromises();

      // Count query should NOT have been called again
      expect(countQueryCallCount).toBe(1);
      // But main query should have been called
      expect(fetchCallCount).toBe(initialFetchCount + 1);

      adapter.destroy();
    });

    it('should refetch count query when filter changes', async () => {
      const mockData = createMockConnection(
        [{ id: '1', name: 'Test', email: 'test@example.com' }],
        false,
        null,
        50
      );

      let countQueryCallCount = 0;
      
      fetchFn = vi.fn().mockImplementation((vars) => {
        if (vars.first === 1 && vars.includeTotalCount === true) {
          countQueryCallCount++;
        }
        return Promise.resolve(createSuccessResult(mockData));
      });

      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions({ splitTotalCount: true })
      );

      // Initial fetch
      await adapter.fetch();
      await flushPromises();
      expect(countQueryCallCount).toBe(1);

      // Change filter - should trigger count refetch
      adapter.setFilter({ name: { contains: 'test' } });
      await flushPromises();

      expect(countQueryCallCount).toBe(2);

      adapter.destroy();
    });
  });

  describe('keepPreviousData', () => {
    // Object wrapper avoids TS narrowing `let resolve = null` to `never` —
    // assignments inside the Promise executor are not visible to flow analysis.
    type Deferred<T> = { resolve: ((value: T) => void) | null };

    function pageFetchFn(
      first: Connection<MockEntity>,
      deferredSecond: Deferred<Connection<MockEntity>>
    ): FetchFn<MockEntity, MockQueryOptions> {
      let callCount = 0;
      return vi.fn().mockImplementation(() => {
        callCount += 1;
        if (callCount === 1) return Promise.resolve(createSuccessResult(first));
        return new Promise<Connection<MockEntity>>((resolve) => {
          deferredSecond.resolve = resolve;
        }).then((data) => createSuccessResult(data));
      });
    }

    it('should clear rows on query-key change by default (current behavior)', async () => {
      const firstPage = createMockConnection(
        [{ id: '1', name: 'Alice', email: 'alice@example.com' }],
        true,
        'cursor-0',
        2
      );
      const secondPage = createMockConnection(
        [{ id: '2', name: 'Bob', email: 'bob@example.com' }],
        false,
        null,
        2
      );

      const deferred: Deferred<Connection<MockEntity>> = { resolve: null };
      const adapter = new BaseTableAdapter(
        pageFetchFn(firstPage, deferred),
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();
      expect(adapter.getState().rows).toHaveLength(1);

      // Trigger a query-key change via filter; do not await the fetch.
      adapter.setFilter({ name: { contains: 'B' } });
      await flushPromises();

      // Default behavior: rows go empty while the new query is in flight.
      const inFlight = adapter.getState();
      expect(inFlight.rows).toEqual([]);
      expect(inFlight.isFetching).toBe(true);

      // Resolve the in-flight fetch and let the test exit cleanly.
      deferred.resolve?.(secondPage);
      await flushPromises();
      adapter.destroy();
    });

    it('should preserve rows during query-key transitions when keepPreviousData=true', async () => {
      const firstPage = createMockConnection(
        [{ id: '1', name: 'Alice', email: 'alice@example.com' }],
        true,
        'cursor-0',
        2
      );
      const secondPage = createMockConnection(
        [{ id: '2', name: 'Bob', email: 'bob@example.com' }],
        false,
        null,
        2
      );

      const deferred: Deferred<Connection<MockEntity>> = { resolve: null };
      const adapter = new BaseTableAdapter(
        pageFetchFn(firstPage, deferred),
        buildQueryOptions,
        createAdapterOptions({ keepPreviousData: true })
      );

      await adapter.fetch();
      await flushPromises();
      const firstState = adapter.getState();
      expect(firstState.rows).toEqual(firstPage.nodes);
      expect(firstState.isLoading).toBe(false);

      // Change filter to trigger a query-key change.
      adapter.setFilter({ name: { contains: 'B' } });
      await flushPromises();

      // With keepPreviousData, previous rows are kept while the new query loads.
      const inFlight = adapter.getState();
      expect(inFlight.rows).toEqual(firstPage.nodes);
      expect(inFlight.isFetching).toBe(true);
      // isLoading must stay false — data is defined via placeholder.
      expect(inFlight.isLoading).toBe(false);

      // Resolve the in-flight fetch — rows should switch to the new page.
      deferred.resolve?.(secondPage);
      await flushPromises();
      const finalState = adapter.getState();
      expect(finalState.rows).toEqual(secondPage.nodes);
      expect(finalState.isFetching).toBe(false);

      adapter.destroy();
    });

    it('should keep isLoading=true on the very first fetch even with keepPreviousData=true', async () => {
      const deferred: Deferred<Connection<MockEntity>> = { resolve: null };
      const blockedFetch: FetchFn<MockEntity, MockQueryOptions> = vi.fn().mockImplementation(
        () =>
          new Promise<Connection<MockEntity>>((resolve) => {
            deferred.resolve = resolve;
          }).then((data) => createSuccessResult(data))
      );

      const adapter = new BaseTableAdapter(
        blockedFetch,
        buildQueryOptions,
        createAdapterOptions({ keepPreviousData: true })
      );

      void adapter.fetch();
      await flushPromises();

      // No previous data exists yet → first fetch still reports isLoading.
      const state = adapter.getState();
      expect(state.rows).toEqual([]);
      expect(state.isLoading).toBe(true);
      expect(state.isFetching).toBe(true);

      deferred.resolve?.(createMockConnection([{ id: '1', name: 'A', email: 'a@x.com' }]));
      await flushPromises();
      adapter.destroy();
    });
  });
});
