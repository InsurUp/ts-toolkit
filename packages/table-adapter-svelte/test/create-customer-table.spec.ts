/**
 * @fileoverview createCustomerTable Tests for Svelte
 * @description Unit tests for the Svelte createCustomerTable function
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCustomerTable } from '../src/lib/create-customer-table.svelte.js';
import type { CustomerTableOptions, CustomerColumnDef } from '@insurup/table-adapter-core';
import type { CustomerTestFetchModeOptions } from './utils/mocks';
import {
  createMockFetchFn,
  createMockConnection,
  createSuccessResult,
  flushPromises,
} from './utils/mocks';

// Helper to create options with proper typing
function createTestOptions(
  overrides: Partial<CustomerTestFetchModeOptions> = {}
): CustomerTableOptions<CustomerColumnDef[]> {
  return {
    columns: (col) => [col.id(), col.name()],
    fetch: createMockFetchFn(),
    pagination: { type: 'cursor', pageSize: 10 },
    ...overrides,
  };
}

// Helper to wrap options in a getter function (required by the new API)
function createTestOptionsGetter(
  overrides: Partial<CustomerTestFetchModeOptions> = {}
): () => CustomerTableOptions<CustomerColumnDef[]> {
  const options = createTestOptions(overrides);
  return () => options;
}

describe('createCustomerTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('factory function', () => {
    it('should create result with all required properties', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('isLoading');
      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('adapter');
      expect(result).toHaveProperty('destroy');

      result.destroy();
    });

    it('should return reactive state with initial adapter state', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(result.rows).toEqual([]);
      expect(result.isLoading).toBe(false);
      expect(result.isFetching).toBe(false);
      expect(result.error).toBeNull();

      result.destroy();
    });

    it('should return TanStack Table instance', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(result.table).toBeDefined();
      expect(typeof result.table.getHeaderGroups).toBe('function');
      expect(typeof result.table.getRowModel).toBe('function');
      expect(typeof result.table.getCoreRowModel).toBe('function');

      result.destroy();
    });

    it('should return adapter with methods', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(result.adapter).toBeDefined();
      expect(typeof result.adapter.fetch).toBe('function');
      expect(typeof result.adapter.setFilter).toBe('function');
      expect(typeof result.adapter.setSearch).toBe('function');
      expect(typeof result.adapter.invalidate).toBe('function');
      expect(typeof result.adapter.destroy).toBe('function');

      result.destroy();
    });
  });

  describe('reactive state', () => {
    it('should update state after fetch', async () => {
      const mockData = createMockConnection([
        { id: '1', name: 'Test User' },
        { id: '2', name: 'Another User' },
      ]);
      const mockFetch = vi.fn().mockResolvedValue(createSuccessResult(mockData));
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      // Initial state
      expect(result.rows).toHaveLength(0);

      // Fetch data
      await result.adapter.fetch();
      await flushPromises();

      // State should be updated (reactive in Svelte components)
      expect(result.rows).toHaveLength(2);

      result.destroy();
    });
  });

  describe('table integration', () => {
    it('should create table with columns', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      // Table should have the columns defined
      const allColumns = result.table.getAllColumns();
      expect(allColumns).toHaveLength(2);
      expect(allColumns[0]!.id).toBe('id');
      expect(allColumns[1]!.id).toBe('name');

      result.destroy();
    });

    it('should update table when adapter state changes', async () => {
      const mockData = createMockConnection([
        { id: '1', name: 'Test User' },
        { id: '2', name: 'Another User' },
      ]);
      const mockFetch = vi.fn().mockResolvedValue(createSuccessResult(mockData));
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      // Initial state - no rows
      expect(result.table.getRowModel().rows).toHaveLength(0);

      // Fetch data
      await result.adapter.fetch();
      await flushPromises();

      // Table should have rows now
      expect(result.table.getRowModel().rows).toHaveLength(2);

      result.destroy();
    });

    it('should expose table pagination methods', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(typeof result.table.getCanNextPage).toBe('function');
      expect(typeof result.table.getCanPreviousPage).toBe('function');
      expect(typeof result.table.nextPage).toBe('function');
      expect(typeof result.table.previousPage).toBe('function');

      result.destroy();
    });

    it('should expose table sorting methods', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(typeof result.table.setSorting).toBe('function');
      expect(typeof result.table.getSortedRowModel).toBe('function');

      result.destroy();
    });
  });

  describe('data fetching', () => {
    it('should fetch data through adapter', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      await result.adapter.fetch();
      await flushPromises();

      expect(mockFetch).toHaveBeenCalled();
      expect(result.rows).toHaveLength(2);

      result.destroy();
    });

    it('should auto-fetch when autoFetch is true', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch, autoFetch: true }));

      await flushPromises();

      expect(mockFetch).toHaveBeenCalled();

      result.destroy();
    });

    it('should update state after fetch', async () => {
      const mockData = createMockConnection([{ id: '1', name: 'Test' }], {}, 1);
      const mockFetch = vi.fn().mockResolvedValue(createSuccessResult(mockData));
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      await result.adapter.fetch();
      await flushPromises();

      expect(result.rows).toHaveLength(1);
      expect(result.rowCount).toBe(1);
      expect(result.isSuccess).toBe(true);

      result.destroy();
    });
  });

  describe('adapter methods', () => {
    it('should expose setFilter method', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      result.adapter.setFilter({ name: { contains: 'test' } });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { name: { contains: 'test' } },
        }),
        expect.any(Object)
      );

      result.destroy();
    });

    it('should expose setSearch method', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      result.adapter.setSearch({ name: { textSearch: { value: 'test query' } } });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: { name: { textSearch: { value: 'test query' } } },
        }),
        expect.any(Object)
      );

      result.destroy();
    });

    it('should expose setPageSize method', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      result.adapter.setPageSize(25);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 25,
        }),
        expect.any(Object)
      );

      result.destroy();
    });
  });

  describe('cleanup (destroy)', () => {
    it('should destroy the adapter on destroy', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      const destroySpy = vi.spyOn(result.adapter, 'destroy');

      result.destroy();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('should not throw when destroy is called multiple times', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      expect(() => {
        result.destroy();
        result.destroy();
      }).not.toThrow();
    });
  });

  describe('state reactivity', () => {
    it('should return current state', async () => {
      const mockFetch = createMockFetchFn();
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      // Initial state
      expect(result.rows).toEqual([]);

      // After fetch
      await result.adapter.fetch();
      await flushPromises();

      // State should be updated
      expect(result.rows).toHaveLength(2);

      result.destroy();
    });
  });

  describe('fine-grained state signals', () => {
    it('should expose fine-grained state signals', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      // Should have individual reactive signals
      expect(result.isLoading).toBe(false);
      expect(result.isFetching).toBe(false);
      expect(result.isError).toBe(false);
      expect(result.isSuccess).toBe(false);
      expect(result.rows).toEqual([]);
      expect(result.rowCount).toBe(0);
      expect(result.pageCount).toBe(0);
      expect(result.error).toBeNull();

      result.destroy();
    });

    it('should expose derived values', () => {
      const result = createCustomerTable(createTestOptionsGetter());

      // Should have derived computed values
      expect(result.isEmpty).toBe(false); // false because isSuccess is false
      expect(result.hasData).toBe(false);
      expect(result.canLoadMore).toBe(false);

      result.destroy();
    });

    it('should update fine-grained signals after fetch', async () => {
      const mockData = createMockConnection([
        { id: '1', name: 'Test User' },
      ]);
      const mockFetch = vi.fn().mockResolvedValue(createSuccessResult(mockData));
      const result = createCustomerTable(createTestOptionsGetter({ fetch: mockFetch }));

      await result.adapter.fetch();
      await flushPromises();

      // Fine-grained signals should be updated
      expect(result.rows).toHaveLength(1);
      expect(result.rowCount).toBe(1);
      expect(result.isSuccess).toBe(true);
      expect(result.hasData).toBe(true);

      result.destroy();
    });
  });
});
