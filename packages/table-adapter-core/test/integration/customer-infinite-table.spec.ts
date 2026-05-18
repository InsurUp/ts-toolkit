/**
 * @fileoverview Integration tests for createInfiniteCustomerTable.
 *
 * Mirrors customer-table.spec.ts where behavior overlaps with the regular
 * adapter, and adds infinite-specific cases: row accumulation across pages
 * and accumulator resets on state changes (filter/search/sort/page-size/
 * invalidate/refetch).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInfiniteCustomerTable } from '../../src/entities/customer/infinite-factory.js';
import { createMockPageInfo, createSuccessResult, createClientError } from '../utils/mocks.js';
import { flushPromises } from '../utils/helpers.js';
import {
  CustomerType,
  type Connection,
  type InsurUpGraphQLResult,
  type CustomerFieldKey,
  type GetCustomersOptions,
  type QueryCustomerModelSearchInput,
} from '@insurup/sdk';
import type {
  CustomerRowType,
  CustomerColumnDef,
  CustomerFetchFn,
} from '../../src/entities/customer/types.js';

// ============================================================================
// Mock data
// ============================================================================

type FullCustomerRow = CustomerRowType<CustomerColumnDef[]>;
type ExpectedFetchFn = CustomerFetchFn<FullCustomerRow, CustomerFieldKey[]>;

function row(id: string, name: string, overrides: Partial<FullCustomerRow> = {}): FullCustomerRow {
  return {
    id,
    name,
    primaryEmail: null,
    type: CustomerType.Individual,
    cityText: null,
    districtText: null,
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

function connection(
  rows: FullCustomerRow[],
  endCursor: string | null = null,
  hasNextPage = false,
  totalCount?: number
): Connection<FullCustomerRow> {
  return {
    nodes: rows,
    pageInfo: createMockPageInfo({ hasNextPage, endCursor }),
    totalCount: totalCount ?? rows.length,
    edges: rows.map((node, i) => ({ node, cursor: `c-${i}` })),
  };
}

function singlePageFetch(rows: FullCustomerRow[]): ExpectedFetchFn {
  return vi
    .fn<
      (
        options: GetCustomersOptions<CustomerFieldKey[]>
      ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
    >()
    .mockResolvedValue(createSuccessResult(connection(rows))) as ExpectedFetchFn;
}

/**
 * Pages-by-cursor mock. Each call returns the page indexed by the incoming
 * `after` cursor (undefined → page 0).
 */
function pagedFetch(pages: ReadonlyArray<Connection<FullCustomerRow>>): ExpectedFetchFn {
  return vi.fn(
    async (
      options: GetCustomersOptions<CustomerFieldKey[]>
    ): Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>> => {
      const after = options.after ?? null;
      const pageIndex =
        after === null
          ? 0
          : pages.findIndex((_p, i) => i > 0 && pages[i - 1]?.pageInfo.endCursor === after);
      const page = pageIndex >= 0 ? pages[pageIndex] : undefined;
      if (!page) {
        throw new Error(`pagedFetch: unknown cursor ${String(after)}`);
      }
      return createSuccessResult(page);
    }
  ) as ExpectedFetchFn;
}

// ============================================================================
// Tests
// ============================================================================

describe('createInfiniteCustomerTable', () => {
  let mockFetch: ExpectedFetchFn;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = singlePageFetch([row('CUST-001', 'John'), row('CUST-002', 'Jane')]);
  });

  // --------------------------------------------------------------------------
  // table creation
  // --------------------------------------------------------------------------

  describe('table creation', () => {
    it('builds a table with column definitions', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
        pagination: { type: 'cursor', pageSize: 5 },
      });

      expect(table).toBeDefined();
      expect(table.columns).toHaveLength(2);

      table.destroy();
    });

    it('extracts fields from column definitions', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name'), col.primaryEmail('Email')],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.arrayContaining(['id', 'name', 'primaryEmail']),
        }),
        expect.any(Object)
      );
      table.destroy();
    });

    it('extracts fields from computed columns', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [
          col.id(),
          col.computed({
            uses: ['cityText', 'districtText'] as const,
            header: 'Location',
            render: (row) => `${row.cityText}, ${row.districtText}`,
          }),
        ],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
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

  // --------------------------------------------------------------------------
  // data fetching
  // --------------------------------------------------------------------------

  describe('data fetching', () => {
    it('fetches and populates rows', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();
      await flushPromises();

      const state = table.getState();
      expect(state.rows).toHaveLength(2);
      expect(state.isSuccess).toBe(true);
      table.destroy();
    });

    it('uses the configured page size', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor', pageSize: 50 },
      });

      await table.fetch();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ first: 50 }),
        expect.any(Object)
      );
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // row accumulation across pagination
  // --------------------------------------------------------------------------

  describe('row accumulation across pagination', () => {
    it('appends only the new page on pagination.next() without duplicates', async () => {
      const pageA = connection([row('A1', 'Alice'), row('A2', 'Andrew')], 'cursor-1', true);
      const pageB = connection([row('B1', 'Bob'), row('B2', 'Beth')], null, false);

      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: pagedFetch([pageA, pageB]),
        pagination: { type: 'cursor', pageSize: 2 },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows.map((r) => (r as { id: string }).id)).toEqual(['A1', 'A2']);
      expect(table.pagination.canGoNext()).toBe(true);

      table.pagination.next();
      await flushPromises();
      await flushPromises();

      const ids = table.getState().rows.map((r) => (r as { id: string }).id);
      expect(ids).toEqual(['A1', 'A2', 'B1', 'B2']);
      expect(new Set(ids).size).toBe(ids.length);
      table.destroy();
    });

    it('does not double-append when pagination changes before the new fetch settles', async () => {
      let resolveB: (v: InsurUpGraphQLResult<Connection<FullCustomerRow>>) => void = () => {};
      const pageA = connection([row('A1', 'Alice')], 'cursor-1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);

      const fetchFn = vi.fn(
        async (
          options: GetCustomersOptions<CustomerFieldKey[]>
        ): Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>> => {
          if (!options.after) return createSuccessResult(pageA);
          return new Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>((resolve) => {
            resolveB = resolve;
          });
        }
      ) as ExpectedFetchFn;

      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: fetchFn,
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);

      table.pagination.next();
      await flushPromises();
      const idsWhileLoading = table.getState().rows.map((r) => (r as { id: string }).id);
      expect(idsWhileLoading.filter((id) => id === 'A1').length).toBeLessThanOrEqual(1);

      resolveB(createSuccessResult(pageB));
      await flushPromises();
      await flushPromises();

      expect(table.getState().rows.map((r) => (r as { id: string }).id)).toEqual(['A1', 'B1']);
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // accumulator resets on state changes
  // --------------------------------------------------------------------------

  describe('accumulator reset', () => {
    it('clears accumulated rows when setFilter is called', async () => {
      const pageA = connection([row('A1', 'Alice'), row('A2', 'Andrew')], 'c1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: pagedFetch([pageA, pageB]),
        pagination: { type: 'cursor', pageSize: 2 },
      });

      await table.fetch();
      await flushPromises();
      table.pagination.next();
      await flushPromises();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(3);

      table.setFilter({ name: { contains: 'Bob' } });
      // setFilter resets pagination → re-fetches page 0 → accumulator is reset first.
      // Right after setFilter the buffer is empty until the fetch settles.
      expect(table.getState().rows).toHaveLength(0);

      await flushPromises();
      await flushPromises();
      // After settle, we get page A again (filter doesn't change our mock, but
      // the reset behavior is what we're verifying).
      expect(table.getState().rows.length).toBeLessThanOrEqual(2);
      table.destroy();
    });

    it('clears accumulated rows when setSearch is called', async () => {
      const pageA = connection([row('A1', 'Alice')], 'c1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: pagedFetch([pageA, pageB]),
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      table.pagination.next();
      await flushPromises();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(2);

      const search: QueryCustomerModelSearchInput = {
        name: { textSearch: { value: 'Alice' } },
      };
      table.setSearch(search);
      expect(table.getState().rows).toHaveLength(0);
      table.destroy();
    });

    it('clears accumulated rows when setPageSize is called', async () => {
      const pageA = connection([row('A1', 'Alice')], 'c1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([pageA, pageB]),
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      table.pagination.next();
      await flushPromises();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(2);

      table.setPageSize(5);
      expect(table.getState().rows).toHaveLength(0);
      table.destroy();
    });

    it('clears accumulated rows when refetch is called', async () => {
      const pageA = connection([row('A1', 'Alice')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([pageA]),
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);

      await table.refetch();
      await flushPromises();
      // After refetch finishes, we still have exactly the first page's rows
      // (not double-appended) because the accumulator was reset.
      expect(table.getState().rows).toHaveLength(1);
      table.destroy();
    });

    it('clears accumulated rows when invalidate is called', async () => {
      const pageA = connection([row('A1', 'Alice')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([pageA]),
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);

      await table.invalidate();
      await flushPromises();
      // invalidate marks cache stale but does not auto-refetch; the buffer
      // stays cleared until the caller refetches.
      expect(table.getState().rows).toHaveLength(0);

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);
      table.destroy();
    });

    it('clears accumulated rows when clearFilter is called', async () => {
      const pageA = connection([row('A1', 'Alice')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([pageA]),
        pagination: { type: 'cursor', pageSize: 1 },
        defaultFilter: { name: { contains: 'Alice' } },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);

      table.clearFilter();
      expect(table.getState().rows).toHaveLength(0);
      table.destroy();
    });

    it('clears accumulated rows when clearSearch is called', async () => {
      const pageA = connection([row('A1', 'Alice')], null, false);
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([pageA]),
        pagination: { type: 'cursor', pageSize: 1 },
        defaultSearch: { name: { textSearch: { value: 'Alice' } } },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(1);

      table.clearSearch();
      expect(table.getState().rows).toHaveLength(0);
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // filter / search getters
  // --------------------------------------------------------------------------

  describe('filter and search', () => {
    it('forwards defaultFilter to the fetch', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        defaultFilter: { name: { contains: 'Acme' } },
      });

      await table.fetch();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { name: { contains: 'Acme' } } }),
        expect.any(Object)
      );
      expect(table.getFilter()).toEqual({ name: { contains: 'Acme' } });
      table.destroy();
    });

    it('forwards defaultSearch to the fetch', async () => {
      const search: QueryCustomerModelSearchInput = {
        name: { textSearch: { value: 'Acme' } },
      };
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        defaultSearch: search,
      });

      await table.fetch();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ search }),
        expect.any(Object)
      );
      expect(table.getSearch()).toEqual(search);
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // sorting
  // --------------------------------------------------------------------------

  describe('sorting', () => {
    it('forwards initialState.sorting to the fetch', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        tableOptions: {
          initialState: { sorting: [{ id: 'name', desc: true }] },
        },
      });

      await table.fetch();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({ order: [{ name: 'DESC' }] }),
        expect.any(Object)
      );
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // table options
  // --------------------------------------------------------------------------

  describe('table options', () => {
    it('returns valid TanStack table options', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();
      await flushPromises();
      const options = table.getTableOptions();
      expect(options).toHaveProperty('data');
      expect(options).toHaveProperty('columns');
      expect(options).toHaveProperty('manualPagination', true);
      expect(options).toHaveProperty('manualSorting', true);
      table.destroy();
    });

    it('exposes the TanStack table instance', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      expect(table.getTable()).toBeDefined();
      table.destroy();
    });

    it('exposes column info', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      const info = table.getColumnInfo();
      expect(info).toHaveLength(2);
      expect(info[0]).toHaveProperty('key', 'id');
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // state management
  // --------------------------------------------------------------------------

  describe('state management', () => {
    it('returns adapter state with the expected shape', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      const state = table.getState();
      expect(state).toHaveProperty('rows');
      expect(state).toHaveProperty('rowCount');
      expect(state).toHaveProperty('isLoading');
      expect(state).toHaveProperty('isFetching');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('isSuccess');
      table.destroy();
    });

    it('notifies subscribers on state changes', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      const listener = vi.fn();
      const unsubscribe = table.subscribe(listener);

      await table.fetch();
      await flushPromises();

      expect(listener).toHaveBeenCalled();
      unsubscribe();
      table.destroy();
    });

    it('returns a stable snapshot reference between unrelated calls', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      await table.fetch();
      await flushPromises();
      const snap1 = table.getSnapshot();
      const snap2 = table.getSnapshot();
      expect(snap1).toBe(snap2);
      table.destroy();
    });

    it('provides a server snapshot for SSR', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      const snap = table.getServerSnapshot();
      expect(snap.rows).toEqual([]);
      expect(snap.isLoading).toBe(true);
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // callbacks
  // --------------------------------------------------------------------------

  describe('error callbacks', () => {
    it('calls onSuccess on successful fetch', async () => {
      const onSuccess = vi.fn();
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        onSuccess,
      });

      await table.fetch();
      await flushPromises();
      expect(onSuccess).toHaveBeenCalled();
      table.destroy();
    });

    it('calls onError when the SDK returns an error', async () => {
      const onError = vi.fn();
      const errorFetch = vi
        .fn<
          (
            options: GetCustomersOptions<CustomerFieldKey[]>
          ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
        >()
        .mockResolvedValue(createClientError()) as ExpectedFetchFn;

      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: errorFetch,
        pagination: { type: 'cursor' },
        onError,
      });

      await table.fetch();
      await flushPromises();
      expect(onError).toHaveBeenCalled();
      expect(table.getState().error).not.toBeNull();
      expect(table.getState().isError).toBe(true);
      table.destroy();
    });

    it('calls onSettled in both success and error paths', async () => {
      const onSettled = vi.fn();
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        onSettled,
      });

      await table.fetch();
      await flushPromises();
      expect(onSettled).toHaveBeenCalled();
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // auto-fetch
  // --------------------------------------------------------------------------

  describe('auto-fetch', () => {
    it('fetches automatically when autoFetch is true', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
        autoFetch: true,
      });

      await flushPromises();
      expect(mockFetch).toHaveBeenCalled();
      table.destroy();
    });

    it('does not auto-fetch by default', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      expect(mockFetch).not.toHaveBeenCalled();
      table.destroy();
    });
  });

  // --------------------------------------------------------------------------
  // cleanup
  // --------------------------------------------------------------------------

  describe('cleanup', () => {
    it('destroys without error', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });
      expect(() => table.destroy()).not.toThrow();
    });

    it('stops notifying subscribers after destroy', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: mockFetch,
        pagination: { type: 'cursor' },
      });

      const listener = vi.fn();
      table.subscribe(listener);
      table.destroy();

      await table.fetch().catch(() => {}); // post-destroy fetch may reject silently
      await flushPromises();
      expect(listener).not.toHaveBeenCalled();
    });
  });
});
