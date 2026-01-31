/**
 * @fileoverview useCustomerTable Composable Tests for Vue
 * @description Unit tests for the Vue useCustomerTable composable
 *
 * Note: These tests verify the integration layer between the core adapter
 * and Vue. The actual adapter functionality is tested in table-adapter-core.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock adapter returned by createCustomerTable
const mockAdapter = {
  columns: [
    { id: 'id', accessorKey: 'id', header: 'ID' },
    { id: 'name', accessorKey: 'name', header: 'Name' },
  ],
  getState: vi.fn(() => ({
    rows: [{ id: '1', name: 'Test' }],
    rowCount: 1,
    pageCount: 1,
    isLoading: false,
    isFetching: false,
    error: null,
    isError: false,
    isSuccess: true,
  })),
  getSnapshot: vi.fn(() => ({
    rows: [{ id: '1', name: 'Test' }],
    rowCount: 1,
    pageCount: 1,
    isLoading: false,
    isFetching: false,
    error: null,
    isError: false,
    isSuccess: true,
  })),
  getTableOptions: vi.fn(() => ({
    data: [{ id: '1', name: 'Test' }],
    columns: [
      { id: 'id', accessorKey: 'id', header: 'ID' },
      { id: 'name', accessorKey: 'name', header: 'Name' },
    ],
    getCoreRowModel: () => ({ rows: [], flatRows: [], rowsById: {} }),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting: [],
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    onSortingChange: vi.fn(),
    onPaginationChange: vi.fn(),
  })),
  subscribe: vi.fn((_callback: () => void) => {
    return () => {};
  }),
  fetch: vi.fn().mockResolvedValue(undefined),
  invalidate: vi.fn().mockResolvedValue(undefined),
  refetch: vi.fn().mockResolvedValue(undefined),
  setFilter: vi.fn(),
  getFilter: vi.fn(),
  clearFilter: vi.fn(),
  setSearch: vi.fn(),
  getSearch: vi.fn(),
  clearSearch: vi.fn(),
  setPageSize: vi.fn(),
  destroy: vi.fn(),
};

// Track onUnmounted callbacks for cleanup testing
let onUnmountedCallback: (() => void) | null = null;

// Mock core adapter and Vue to test integration logic without jsdom
vi.mock('@insurup/table-adapter-core', () => ({
  createCustomerTable: vi.fn(() => mockAdapter),
}));

vi.mock('vue', () => ({
  shallowRef: vi.fn((initial) => ({ value: initial })),
  onUnmounted: vi.fn((cb) => {
    onUnmountedCallback = cb;
  }),
  computed: vi.fn((getter) => ({ value: getter() })),
}));

vi.mock('@tanstack/vue-table', () => ({
  useVueTable: vi.fn((options) => ({
    getHeaderGroups: vi.fn(() => [
      {
        id: 'header',
        headers: options.columns.map((col: { id: string }) => ({
          id: col.id,
          column: { columnDef: col },
          getContext: vi.fn(),
        })),
      },
    ]),
    getRowModel: vi.fn(() => ({
      rows: (options.data ?? []).map((d: unknown, i: number) => ({
        id: String(i),
        original: d,
        getVisibleCells: vi.fn(() => []),
      })),
    })),
    getAllColumns: vi.fn(() => options.columns),
    getCanNextPage: vi.fn(() => false),
    getCanPreviousPage: vi.fn(() => false),
    nextPage: vi.fn(),
    previousPage: vi.fn(),
  })),
}));

// Import after mocking
import { useCustomerTable } from '../src/use-customer-table';
import { createCustomerTable } from '@insurup/table-adapter-core';

describe('useCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onUnmountedCallback = null;
  });

  describe('adapter creation', () => {
    it('should create adapter with provided options', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      useCustomerTable(options as never);

      expect(createCustomerTable).toHaveBeenCalledWith(options);
    });

    it('should pass autoFetch option to adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 20 },
        autoFetch: true,
      };

      useCustomerTable(options as never);

      expect(createCustomerTable).toHaveBeenCalledWith(
        expect.objectContaining({ autoFetch: true })
      );
    });

    it('should pass pageSize option to adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 25 },
      };

      useCustomerTable(options as never);

      expect(createCustomerTable).toHaveBeenCalledWith(
        expect.objectContaining({ pagination: { type: 'cursor', pageSize: 25 } })
      );
    });
  });

  describe('return value', () => {
    it('should return state, table, and adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('adapter');
    });

    it('should return state from adapter snapshot', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result.state.value).toEqual(mockAdapter.getSnapshot());
    });

    it('should return adapter with all methods', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(typeof result.adapter.fetch).toBe('function');
      expect(typeof result.adapter.invalidate).toBe('function');
      expect(typeof result.adapter.refetch).toBe('function');
      expect(typeof result.adapter.setFilter).toBe('function');
      expect(typeof result.adapter.getFilter).toBe('function');
      expect(typeof result.adapter.clearFilter).toBe('function');
      expect(typeof result.adapter.setSearch).toBe('function');
      expect(typeof result.adapter.getSearch).toBe('function');
      expect(typeof result.adapter.clearSearch).toBe('function');
      expect(typeof result.adapter.setPageSize).toBe('function');
      expect(typeof result.adapter.destroy).toBe('function');
    });

    it('should return table with TanStack Table methods', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(typeof result.table.getHeaderGroups).toBe('function');
      expect(typeof result.table.getRowModel).toBe('function');
      expect(typeof result.table.getCanNextPage).toBe('function');
      expect(typeof result.table.getCanPreviousPage).toBe('function');
    });
  });

  describe('adapter methods', () => {
    it('should call fetch on adapter', async () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      await result.adapter.fetch();

      expect(mockAdapter.fetch).toHaveBeenCalled();
    });

    it('should call setFilter on adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      result.adapter.setFilter({ name: { contains: 'test' } });

      expect(mockAdapter.setFilter).toHaveBeenCalledWith({ name: { contains: 'test' } });
    });

    it('should call setSearch on adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      result.adapter.setSearch({ name: { textSearch: { value: 'test query' } } });

      expect(mockAdapter.setSearch).toHaveBeenCalledWith({ name: { textSearch: { value: 'test query' } } });
    });

    it('should call clearSearch on adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      result.adapter.clearSearch();

      expect(mockAdapter.clearSearch).toHaveBeenCalled();
    });

    it('should call setPageSize on adapter', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      result.adapter.setPageSize(50);

      expect(mockAdapter.setPageSize).toHaveBeenCalledWith(50);
    });

    it('should call invalidate on adapter', async () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);
      await result.adapter.invalidate();

      expect(mockAdapter.invalidate).toHaveBeenCalled();
    });
  });

  describe('state properties', () => {
    it('should include rows in state', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result.state.value).toHaveProperty('rows');
      expect(Array.isArray(result.state.value.rows)).toBe(true);
    });

    it('should include pagination info in state', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result.state.value).toHaveProperty('rowCount');
      expect(result.state.value).toHaveProperty('pageCount');
    });

    it('should include loading states in state', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result.state.value).toHaveProperty('isLoading');
      expect(result.state.value).toHaveProperty('isFetching');
      expect(result.state.value).toHaveProperty('isSuccess');
      expect(result.state.value).toHaveProperty('isError');
    });

    it('should include error in state', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      const result = useCustomerTable(options as never);

      expect(result.state.value).toHaveProperty('error');
    });
  });

  describe('subscription and cleanup', () => {
    it('should subscribe to adapter state changes', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      useCustomerTable(options as never);

      expect(mockAdapter.subscribe).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should register onUnmounted cleanup', () => {
      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      useCustomerTable(options as never);

      expect(onUnmountedCallback).toBeTypeOf('function');
    });

    it('should unsubscribe and destroy adapter on unmount', () => {
      const mockUnsubscribe = vi.fn();
      mockAdapter.subscribe.mockReturnValue(mockUnsubscribe);

      const options = {
        columns: (col: { id: () => unknown; name: () => unknown }) => [col.id(), col.name()],
        fetch: vi.fn(),
        pagination: { type: 'cursor' as const, pageSize: 10 },
      };

      useCustomerTable(options as never);

      // Simulate unmount
      onUnmountedCallback!();

      expect(mockUnsubscribe).toHaveBeenCalled();
      expect(mockAdapter.destroy).toHaveBeenCalled();
    });
  });
});
