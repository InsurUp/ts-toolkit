/**
 * @fileoverview Integration tests for createInfiniteCustomerTable.
 *
 * Scope: behavior that is *specific* to InfiniteTableAdapter — row
 * accumulation across pagination, the accumulator-reset contract on state
 * changes, the infinite-specific auto-fetch wiring, and cleanup. Behavior
 * inherited from BaseTableAdapter (filter/search forwarding, sorting,
 * snapshot shape, callbacks, etc.) is covered by `customer-table.spec.ts`
 * and not duplicated here.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInfiniteCustomerTable } from '../../src/entities/customer/infinite-factory.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
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
  return vi.fn<
    (
      options: GetCustomersOptions<CustomerFieldKey[]>,
      requestOptions?: { signal?: AbortSignal }
    ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
  >(async () => createSuccessResult(connection(rows)));
}

/**
 * Pages-by-cursor mock. Each call returns the page indexed by the incoming
 * `after` cursor (undefined → page 0).
 */
function pagedFetch(pages: ReadonlyArray<Connection<FullCustomerRow>>): ExpectedFetchFn {
  return vi.fn<
    (
      options: GetCustomersOptions<CustomerFieldKey[]>,
      requestOptions?: { signal?: AbortSignal }
    ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
  >(async (options) => {
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
  });
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
      expect(table.getState().rows.map((r) => r.id)).toEqual(['A1', 'A2']);
      expect(table.pagination.canGoNext()).toBe(true);

      table.pagination.next();
      await flushPromises();
      await flushPromises();

      const ids = table.getState().rows.map((r) => r.id);
      expect(ids).toEqual(['A1', 'A2', 'B1', 'B2']);
      expect(new Set(ids).size).toBe(ids.length);
      table.destroy();
    });

    it('does not double-append when pagination changes before the new fetch settles', async () => {
      let resolveB: (v: InsurUpGraphQLResult<Connection<FullCustomerRow>>) => void = () => {};
      const pageA = connection([row('A1', 'Alice')], 'cursor-1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);

      const fetchFn = vi.fn<
        (
          options: GetCustomersOptions<CustomerFieldKey[]>,
          requestOptions?: { signal?: AbortSignal }
        ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
      >(async (options) => {
        if (!options.after) return createSuccessResult(pageA);
        return new Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>((resolve) => {
          resolveB = resolve;
        });
      });

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
      const idsWhileLoading = table.getState().rows.map((r) => r.id);
      expect(idsWhileLoading.filter((id) => id === 'A1').length).toBeLessThanOrEqual(1);

      resolveB(createSuccessResult(pageB));
      await flushPromises();
      await flushPromises();

      expect(table.getState().rows.map((r) => r.id)).toEqual(['A1', 'B1']);
      table.destroy();
    });

    it('refuses to append when pagination jumps ahead of the initial fetch', async () => {
      // Regression: if pagination.next() fires before the page-0 fetch settles,
      // TanStack cancels page 0 and runs page 1. The original `>` gate would
      // append page 1's rows into an empty accumulator, silently dropping
      // page 0. The strict `=== lastFetched + 1` gate refuses the append so
      // the accumulator stays a contiguous prefix of pages.
      let resolveA: (v: InsurUpGraphQLResult<Connection<FullCustomerRow>>) => void = () => {};
      const pageA = connection([row('A1', 'Alice')], 'cursor-1', true);
      const pageB = connection([row('B1', 'Bob')], null, false);

      const fetchFn = vi.fn<
        (
          options: GetCustomersOptions<CustomerFieldKey[]>,
          requestOptions?: { signal?: AbortSignal }
        ) => Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>
      >(async (options) => {
        if (!options.after) {
          return new Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>((resolve) => {
            resolveA = resolve;
          });
        }
        return createSuccessResult(pageB);
      });

      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: fetchFn,
        pagination: { type: 'cursor', pageSize: 1 },
      });

      // Kick off page 0 — fetch is held open via resolveA.
      void table.fetch();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(0);

      // Jump to page 1 before page 0 settles. The base adapter cancels the
      // page-0 query and starts a page-1 query, which resolves with pageB.
      table.pagination.next();
      await flushPromises();
      await flushPromises();

      // The accumulator must NOT contain pageB rows: page 0 was never
      // captured, so appending page 1 would violate the prefix contract.
      expect(table.getState().rows).toHaveLength(0);

      // Cleanup: resolve the canceled page-0 promise so vi's queue settles.
      resolveA(createSuccessResult(pageA));
      await flushPromises();

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
      expect(table.getState().rows).toHaveLength(0);
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
  // auto-fetch — InfiniteTableAdapter passes autoFetch=false to the base
  // adapter and triggers the first fetch itself, so the contract is
  // worth verifying at this layer.
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
