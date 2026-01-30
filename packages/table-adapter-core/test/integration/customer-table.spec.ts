/**
 * @fileoverview Customer Table Integration Tests
 * @description Integration tests for the createCustomerTable factory
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCustomerTable } from '../../src/entities/customer/factory.js';
import type {
  Connection,
  QueryCustomerModelSearchInput,
  InsurUpGraphQLResult,
  CustomerFieldKey,
  GetCustomersOptions,
} from '@insurup/sdk';
import { flushPromises } from '../utils/helpers.js';
import {
  createMockPageInfo,
  createSuccessResult,
  createClientError,
} from '../utils/mocks.js';
import type {
  CustomerFetchFn,
  CustomerRowType,
  CustomerColumnDef,
} from '../../src/entities/customer/types.js';

// ============================================================================
// Mock Customer Data Types
// ============================================================================

/**
 * The row type when all CustomerFieldKey fields are selected.
 * This matches what CustomerTableOptions expects for the fetch function.
 */
type FullCustomerRow = CustomerRowType<CustomerColumnDef[]>;

/**
 * The fetch function type expected by CustomerTableOptions
 */
type ExpectedFetchFn = CustomerFetchFn<FullCustomerRow, CustomerFieldKey[]>;

// ============================================================================
// Mock Customer Data
// ============================================================================

/**
 * Create a mock customer with all fields as required (matching FullCustomerRow)
 */
function createMockCustomer(
  overrides: Partial<FullCustomerRow> = {}
): FullCustomerRow {
  return {
    id: 'CUST-001',
    name: 'John Doe',
    primaryEmail: 'john@example.com',
    type: 'Individual',
    cityText: 'New York',
    districtText: 'Manhattan',
    agentBranchId: null,
    identityNumber: null,
    taxNumber: null,
    primaryPhoneNumber: null,
    primaryPhoneNumberCountryCode: null,
    cityValue: null,
    districtValue: null,
    createdAt: '2024-01-01T00:00:00Z',
    birthDate: null,
    gender: null,
    educationStatus: null,
    nationality: null,
    maritalStatus: null,
    job: null,
    passportNumber: null,
    searchScore: null,
    ...overrides,
  } as FullCustomerRow;
}

/**
 * Create a mock customer connection
 */
function createCustomerConnection(
  customers: FullCustomerRow[],
  hasNextPage = false,
  totalCount?: number
): Connection<FullCustomerRow> {
  return {
    nodes: customers,
    pageInfo: createMockPageInfo({
      hasNextPage,
      endCursor: hasNextPage ? 'next-cursor' : null,
    }),
    totalCount: totalCount ?? customers.length,
    edges: customers.map((node, i) => ({ node, cursor: `cursor-${i}` })),
  };
}

// ============================================================================
// Mock Fetch Function Factory
// ============================================================================

/**
 * Create a mock fetch function with the correct type signature
 */
function createCustomerFetchMock(
  response: InsurUpGraphQLResult<Connection<FullCustomerRow>>
): ExpectedFetchFn {
  return vi.fn<
    (
      options: GetCustomersOptions<CustomerFieldKey[]>,
      requestOptions?: { signal?: AbortSignal }
    ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
  >().mockResolvedValue(response);
}

// ============================================================================
// Tests
// ============================================================================

describe('createCustomerTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createCustomerFetchMock(
      createSuccessResult(
        createCustomerConnection([
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
        columns: (col) => [col.id(), col.name('Name'), col.primaryEmail('Email')],
        fetch: mockFetch,
      });

      await table.fetch();

      // Check that fetch was called with correct select fields
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'name', 'primaryEmail']),
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
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

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
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

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
    const searchInput: QueryCustomerModelSearchInput = {
      name: { textSearch: { value: 'Acme' } },
    };

    const johnDoeSearch: QueryCustomerModelSearchInput = {
      name: { textSearch: { value: 'john doe' } },
    };

    it('should apply default search', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: searchInput,
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: searchInput,
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
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

      table.setSearch(johnDoeSearch);
      await flushPromises();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          search: johnDoeSearch,
        }),
        expect.any(Object)
      );

      table.destroy();
    });

    it('should get current search', () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: searchInput,
      });

      const search = table.getSearch();
      expect(search).toEqual(searchInput);

      table.destroy();
    });

    it('should clear search', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        defaultSearch: searchInput,
      });

      await table.fetch();
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

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
    it('should apply sorting from tableOptions.state.sorting', async () => {
      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
        tableOptions: {
          state: {
            sorting: [{ id: 'name', desc: false }],
          },
        },
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
      const localMock = createCustomerFetchMock(
        createSuccessResult(
          createCustomerConnection([createMockCustomer()], false, 1)
        )
      );

      const table = createCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: localMock,
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
      const errorFetch = createCustomerFetchMock(createClientError());

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
      (mockFetch as ReturnType<typeof vi.fn>).mockClear();

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
      const mockedFetch = mockFetch as ReturnType<typeof vi.fn>;
      const firstCallCount = mockedFetch.mock.calls.length;

      await table.invalidate();
      await flushPromises();

      expect(mockedFetch.mock.calls.length).toBeGreaterThanOrEqual(firstCallCount);

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
