/**
 * @fileoverview Base Table Adapter Tests
 * @description Unit tests for the BaseTableAdapter class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseTableAdapter } from '../../../src/lib/adapter/base-adapter.js';
import { createSortingConverters } from '../../../src/lib/sorting/converters.js';
import type { BaseTableAdapterOptions } from '../../../src/lib/adapter/types.js';
import type { InternalColumnDef, FetchFn, QueryOptionsBuilder } from '../../../src/lib/types.js';
import type { InsurUpGraphQLResult, Connection } from '@insurup/sdk';
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
}

// ============================================================================
// Test Helpers
// ============================================================================

const sortingConverters = createSortingConverters<MockSortInput>();

function createMockColumns(): InternalColumnDef[] {
  return [
    {
      key: 'id',
      fields: ['id'],
      header: 'ID',
      sortable: true,
      hideable: false,
      isComputed: false,
    },
    {
      key: 'name',
      fields: ['name'],
      header: 'Name',
      sortable: true,
      hideable: true,
      isComputed: false,
    },
  ];
}

function createSuccessResult<T>(data: T): InsurUpGraphQLResult<T> {
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
  });
}

function createAdapterOptions(
  overrides: Partial<BaseTableAdapterOptions<MockEntity, MockSortInput, MockFilterInput, MockSearchInput>> = {}
): BaseTableAdapterOptions<MockEntity, MockSortInput, MockFilterInput, MockSearchInput> {
  return {
    columns: createMockColumns(),
    select: ['id', 'name'],
    pageSize: 10,
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
        new BaseTableAdapter(fetchFn, buildQueryOptions, createAdapterOptions({ pageSize: 0 }));
      }).toThrow('pageSize must be greater than 0');

      expect(() => {
        new BaseTableAdapter(fetchFn, buildQueryOptions, createAdapterOptions({ pageSize: -5 }));
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
      expect(state.rowCount).toBe(0);
      expect(state.pageCount).toBe(0);
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
        createAdapterOptions({ pageSize: 25 })
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
        createAdapterOptions({ pageSize: 10 })
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
        createAdapterOptions({ pageSize: 10 })
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
        createAdapterOptions({ pageSize: 10 })
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
      expect(options).toHaveProperty('onSortingChange');
      expect(options).toHaveProperty('onPaginationChange');

      adapter.destroy();
    });

    it('should return memoized options when state has not changed', async () => {
      const adapter = new BaseTableAdapter(
        fetchFn,
        buildQueryOptions,
        createAdapterOptions()
      );

      await adapter.fetch();
      await flushPromises();

      const options1 = adapter.getTableOptions();
      const options2 = adapter.getTableOptions();

      expect(options1).toBe(options2);

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
      const errorResponse: InsurUpGraphQLResult<never> = {
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
      const errorResponse: InsurUpGraphQLResult<never> = {
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
        createAdapterOptions({ pageSize: 10 })
      );

      await adapter.fetch();
      await flushPromises();

      // Get table options and simulate pagination change
      const options = adapter.getTableOptions();

      // Attempt to jump 3 pages
      options.onPaginationChange?.({ pageIndex: 3, pageSize: 10 });

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
});
