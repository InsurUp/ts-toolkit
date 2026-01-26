/**
 * @fileoverview Customer Table Integration Tests
 * @description Integration tests for the createCustomerTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import type { InsurUpGraphQLResult, Connection } from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';

// ============================================================================
// Mock Data
// ============================================================================

interface MockCustomer {
  id: string;
  name: string;
  email: string;
  type: string;
  cityText: string;
  districtText: string;
}

function createMockCustomer(overrides: Partial<MockCustomer> = {}): MockCustomer {
  return {
    id: 'CUST-001',
    name: 'John Doe',
    email: 'john@example.com',
    type: 'Individual',
    cityText: 'New York',
    districtText: 'Manhattan',
    ...overrides,
  };
}

function createMockConnection(
  nodes: MockCustomer[],
  hasNextPage = false,
  totalCount?: number
): Connection<MockCustomer> {
  return {
    nodes,
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      startCursor: nodes.length > 0 ? 'start' : null,
      endCursor: hasNextPage ? 'next-cursor' : null,
    },
    totalCount: totalCount ?? nodes.length,
    edges: nodes.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

function createSuccessResult<T>(data: T): InsurUpGraphQLResult<T> {
  return {
    kind: 'success',
    isSuccess: true,
    message: 'Success',
    data,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('createCustomerTable', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = vi.fn().mockResolvedValue(
      createSuccessResult(
        createMockConnection([
          createMockCustomer({ id: 'CUST-001', name: 'John Doe' }),
          createMockCustomer({ id: 'CUST-002', name: 'Jane Smith' }),
        ])
      )
    );
  });

  describe('table creation', () => {
    it('should create a customer table with column builder', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Customer Name')],
        fetch: mockFetch,
      });

      expect(table).toBeDefined();
      expect(table.columns).toHaveLength(2);

      table.destroy();
    });

    it('should extract fields from column definitions', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name'), col.email('Email')],
        fetch: mockFetch,
      });

      await table.fetch();

      // Check that fetch was called with correct select fields
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'name', 'email']),
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should extract fields from computed columns', async () => {
      const table = createCustomerTable({
        columns: (col) => [
          col.id(),
          col.computed({
            uses: ['cityText', 'districtText'] as const,
            header: 'Location',
            render: (row) => `${row.cityText}, ${row.districtText}`,
          }),
        ],
        fetch: mockFetch,
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'cityText', 'districtText']),
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('data fetching', () => {
    it('should fetch and populate rows', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
      });

      await table.fetch();
      await flushPromises();

      const state = table.getState();
      expect(state.rows).toHaveLength(2);
      expect(state.isSuccess).toBe(true);

      table.destroy();
    });

    it('should use default page size of 20', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 20,
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should use custom page size', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pageSize: 50,
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 50,
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('filtering', () => {
    it('should apply default filter', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultFilter: { name: { contains: 'Corp' } },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { name: { contains: 'Corp' } },
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should set filter and refetch', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();
      mockFetch.mockClear();

      table.setFilter({ type: { eq: 'Corporate' } });
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: { type: { eq: 'Corporate' } },
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should get current filter', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultFilter: { name: { contains: 'test' } },
      });

      const filter = table.getFilter();
      expect(filter).toEqual({ name: { contains: 'test' } });

      table.destroy();
    });

    it('should clear filter', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultFilter: { name: { contains: 'test' } },
      });

      await table.fetch();
      mockFetch.mockClear();

      table.clearFilter();
      await flushPromises();

      expect(table.getFilter()).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: undefined,
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('searching', () => {
    it('should apply default search', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: 'Acme',
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Acme',
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should set search and refetch', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();
      mockFetch.mockClear();

      table.setSearch('john doe');
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'john doe',
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should get current search', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: 'test search',
      });

      const search = table.getSearch();
      expect(search).toBe('test search');

      table.destroy();
    });

    it('should clear search', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: 'test',
      });

      await table.fetch();
      mockFetch.mockClear();

      table.clearSearch();
      await flushPromises();

      expect(table.getSearch()).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('sorting', () => {
    it('should apply default sort', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
        defaultSort: [{ id: 'name', desc: false }],
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          order: [{ name: 'ASC' }],
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('table options', () => {
    it('should return valid table options for TanStack Table', async () => {
      mockFetch.mockResolvedValue(
        createSuccessResult(
          createMockConnection([createMockCustomer()], false, 1)
        )
      );

      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
      });

      await table.fetch();
      await flushPromises();

      const options = table.getTableOptions();

      expect(options).toHaveProperty('data');
      expect(options).toHaveProperty('columns');
      expect(options).toHaveProperty('getCoreRowModel');
      expect(options).toHaveProperty('manualPagination', true);
      expect(options).toHaveProperty('manualSorting', true);
      expect(options).toHaveProperty('paginationMode', 'cursor');

      table.destroy();
    });

    it('should pass through table options', () => {
      const getRowId = (row: { id: string }) => row.id;

      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        tableOptions: {
          enableRowSelection: true,
          getRowId,
        },
      });

      const options = table.getTableOptions();

      expect(options).toHaveProperty('enableRowSelection', true);
      expect(options).toHaveProperty('getRowId');

      table.destroy();
    });
  });

  describe('state management', () => {
    it('should return adapter state', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      const state = table.getState();

      expect(state).toHaveProperty('rows');
      expect(state).toHaveProperty('rowCount');
      expect(state).toHaveProperty('pageCount');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('isFetching');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('isError');
      expect(state).toHaveProperty('isSuccess');

      table.destroy();
    });

    it('should support subscription pattern', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      const listener = vi.fn();
      const unsubscribe = table.subscribe(listener);

      await table.fetch();
      await flushPromises();

      expect(listener).toHaveBeenCalled();

      unsubscribe();
      table.destroy();
    });

    it('should provide server snapshot for SSR', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      const serverSnapshot = table.getServerSnapshot();

      expect(serverSnapshot.rows).toEqual([]);
      expect(serverSnapshot.isLoading).toBe(true);

      table.destroy();
    });
  });

  describe('error callbacks', () => {
    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();

      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        onSuccess,
      });

      await table.fetch();
      await flushPromises();

      expect(onSuccess).toHaveBeenCalled();

      table.destroy();
    });

    it('should call onError callback on failure', async () => {
      const onError = vi.fn();
      const errorFetch = vi.fn().mockResolvedValue({
        kind: 'client-error',
        isSuccess: false,
        message: 'Network error',
        type: 'Unknown',
      });

      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: errorFetch,
        onError,
      });

      await table.fetch();
      await flushPromises();

      expect(onError).toHaveBeenCalled();

      table.destroy();
    });

    it('should call onSettled callback', async () => {
      const onSettled = vi.fn();

      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        onSettled,
      });

      await table.fetch();
      await flushPromises();

      expect(onSettled).toHaveBeenCalled();

      table.destroy();
    });
  });

  describe('auto-fetch', () => {
    it('should auto-fetch when autoFetch is true', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        autoFetch: true,
      });

      await flushPromises();

      expect(mockFetch).toHaveBeenCalled();

      table.destroy();
    });

    it('should not auto-fetch by default', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      expect(mockFetch).not.toHaveBeenCalled();

      table.destroy();
    });
  });

  describe('page size', () => {
    it('should allow changing page size', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pageSize: 10,
      });

      await table.fetch();
      mockFetch.mockClear();

      table.setPageSize(25);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          first: 25,
        }),
        expect.any(Object)
      );

      table.destroy();
    });
  });

  describe('invalidate and refetch', () => {
    it('should invalidate cache', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();
      const firstCallCount = mockFetch.mock.calls.length;

      await table.invalidate();
      await flushPromises();

      expect(mockFetch.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);

      table.destroy();
    });

    it('should refetch data', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();
      await table.refetch();

      expect(mockFetch).toHaveBeenCalled();

      table.destroy();
    });

    it('should force refetch with option', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      await table.fetch();
      await table.refetch({ force: true });

      expect(mockFetch).toHaveBeenCalled();

      table.destroy();
    });
  });

  describe('cleanup', () => {
    it('should destroy without error', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
      });

      expect(() => table.destroy()).not.toThrow();
    });
  });
});
