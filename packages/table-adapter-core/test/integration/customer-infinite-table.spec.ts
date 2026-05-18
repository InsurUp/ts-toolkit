/**
 * @fileoverview Integration tests for createInfiniteCustomerTable.
 *
 * Scope: behavior that is *specific* to InfiniteTableAdapter — row
 * accumulation across pagination, the accumulator-reset contract on state
 * changes, and cleanup. Behavior inherited from BaseTableAdapter
 * (filter/search forwarding, sorting, snapshot shape, callbacks, etc.) is
 * covered by `customer-table.spec.ts` and not duplicated here.
 */

import { describe, it, expect, vi } from 'vitest';
import { createInfiniteCustomerTable } from '../../src/entities/customer/factory.js';
import { createMockPageInfo, createSuccessResult } from '../utils/mocks.js';
import { flushPromises } from '../utils/helpers.js';
import {
  CustomerType,
  DateTime,
  type Connection,
  type InsurUpGraphQLResult,
  type CustomerFieldKey,
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
    createdAt: new DateTime('2024-01-01T00:00:00Z'),
    birthDate: null,
    gender: null,
    educationStatus: null,
    nationality: null,
    maritalStatus: null,
    job: null,
    passportNumber: null,
    searchScore: null,
    consents: [],
    ...overrides,
  };
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

/**
 * Pages-by-cursor mock. Each call returns the page indexed by the incoming
 * `after` cursor (undefined → page 0).
 */
function pagedFetch(pages: ReadonlyArray<Connection<FullCustomerRow>>): ExpectedFetchFn {
  return vi.fn<ExpectedFetchFn>(async (options) => {
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

      const fetchFn = vi.fn<ExpectedFetchFn>(async (options) => {
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

    it('refuses out-of-order appends when pagination jumps past the next page', async () => {
      // Regression: cursor pagination's `next()` only checks `hasNextPage`,
      // which page 0 sets to true on its successful settle. Rapid clicks
      // (next ×2 before page 1 finishes) advance currentPageIndex from 0
      // → 1 → 2 while page 1's fetch is still in flight. TanStack cancels
      // page 1 and runs page 2. Page 2's settle then sees
      // currentPageIndex=2 with lastFetchedPageIndex=0 — the old `>` gate
      // would append page 2's rows into the accumulator, dropping page 1
      // and violating the contiguous-prefix contract. The strict
      // `=== lastFetched + 1` gate refuses (2 !== 1) and keeps the buffer
      // consistent.
      let resolvePage1: (v: InsurUpGraphQLResult<Connection<FullCustomerRow>>) => void = () => {};
      const pageA = connection([row('A1', 'Alice')], 'c-0', true);

      const fetchFn = vi.fn<ExpectedFetchFn>(async (options) => {
        // No cursor → page 0 (also covers page 2 since cursorHistory has no
        // entry for index 2 after only one successful settle).
        if (!options.after) return createSuccessResult(pageA);
        // Page 1 cursor → held open so the rapid second next() races it.
        return new Promise<InsurUpGraphQLResult<Connection<FullCustomerRow>>>((resolve) => {
          resolvePage1 = resolve;
        });
      });

      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id(), col.name('Name')],
        fetch: fetchFn,
        pagination: { type: 'cursor', pageSize: 1 },
      });

      await table.fetch();
      await flushPromises();
      expect(table.getState().rows.map((r) => r.id)).toEqual(['A1']);
      expect(table.pagination.canGoNext()).toBe(true);

      // First click: advance to page 1, fetch starts and is held.
      table.pagination.next();
      await flushPromises();

      // Second click: advance to page 2. `hasNextPage` is still true from
      // page 0's settle, so cursor.next() succeeds without waiting on
      // page 1. The base adapter cancels page 1 and starts a page-2 fetch.
      // cursorHistory has no entry for index 2 → fetch is issued with
      // `after: undefined`, which the mock resolves with pageA data.
      table.pagination.next();
      await flushPromises();
      await flushPromises();

      // With the strict-sequential gate, page 2's settle is refused
      // (currentPageIndex=2, lastFetched=0, 2 !== 1). Accumulator stays
      // exactly as it was after page 0.
      expect(table.getState().rows.map((r) => r.id)).toEqual(['A1']);

      // Cleanup: resolve the canceled page-1 promise so vi's queue settles.
      resolvePage1(createSuccessResult(connection([row('B1', 'Bob')], null, false)));
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
  // cleanup
  // --------------------------------------------------------------------------

  describe('cleanup', () => {
    it('destroys without error', () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([connection([row('A1', 'Alice')])]),
        pagination: { type: 'cursor' },
      });
      expect(() => table.destroy()).not.toThrow();
    });

    it('stops notifying subscribers after destroy', async () => {
      const table = createInfiniteCustomerTable({
        columns: (col) => [col.id()],
        fetch: pagedFetch([connection([row('A1', 'Alice')])]),
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
