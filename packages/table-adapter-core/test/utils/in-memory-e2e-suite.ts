/**
 * @fileoverview Shared e2e suite for in-memory (REST list) tables.
 * @description Real tenant data is unknown, so instead of hard-coded expectations
 * this asserts data-independent invariants (sort is a correctly-ordered permutation,
 * pages are disjoint and covering) and data-derived correctness (a search term
 * taken from a real row returns only rows that genuinely match it).
 */

import { it, expect } from 'vitest';
import type { TableApi } from '../../src/lib/factory/index.js';
import type { CursorPaginationManager } from '../../src/lib/pagination/index.js';
import { createE2EClient, e2eClientOptions } from '@insurup/test-helpers-e2e/client';
import { describeE2E } from '@insurup/test-helpers-e2e/describe';
import { waitForIdle } from '@insurup/test-helpers-e2e/wait';

export { createE2EClient, e2eClientOptions };

type InMemoryTable<TRow, TFilter> = TableApi<TRow, TFilter, CursorPaginationManager>;

export interface InMemoryE2EConfig<TRow, TFilter> {
  /** describe() label, e.g. 'createRoleTable'. */
  name: string;
  /** Build the table wired to a real client via the `fetchAll` option. */
  buildFetchAll: (pageSize: number) => InMemoryTable<TRow, TFilter>;
  /** Build the table via the `client` option (SDK config). */
  buildClient: (pageSize: number) => InMemoryTable<TRow, TFilter>;
  /** Read the stable id/key off a fetched row. */
  idOf: (row: TRow) => unknown;
  /** TanStack column id of the (string) column used for sorting assertions. */
  sortColumnId: string;
  /** Read the sorted column's value off a row. */
  sortValueOf: (row: TRow) => unknown;
  /** All searchable column values for a row (mirrors what `$search` scans). */
  searchableValuesOf: (row: TRow) => unknown[];
  /** The primary text field a search term is derived from. */
  searchTextOf: (row: TRow) => string | null | undefined;
  /** Build the entity's filter input for a `$search` term. */
  searchFilter: (term: string) => TFilter;
}

/** Comparator matching the engine for the (string) columns used here. */
function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function expectOrdered(values: unknown[], direction: 'asc' | 'desc'): void {
  for (let i = 1; i < values.length; i++) {
    const cmp = compareValues(values[i - 1], values[i]);
    if (direction === 'asc') expect(cmp).toBeLessThanOrEqual(0);
    else expect(cmp).toBeGreaterThanOrEqual(0);
  }
}

function deriveSearchTerm(text: string | null | undefined): string | null {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (trimmed.length < 2) return null;
  return trimmed.slice(0, Math.min(3, trimmed.length));
}

export function describeInMemoryE2E<TRow, TFilter>(config: InMemoryE2EConfig<TRow, TFilter>): void {
  const idsOf = (table: InMemoryTable<TRow, TFilter>): unknown[] =>
    table.getState().rows.map(config.idOf);

  describeE2E(`${config.name} [e2e]`, () => {
    it('loads real data without error', async () => {
      const table = config.buildFetchAll(100);
      try {
        await table.fetch();
        await waitForIdle(table);
        const state = table.getState();
        expect(state.error).toBeNull();
        expect(state.isSuccess).toBe(true);
        expect(typeof state.rowCount).toBe('number');
        const sample = state.rows[0];
        if (sample) expect(config.idOf(sample)).toBeDefined();
      } finally {
        table.destroy();
      }
    });

    it('sorts in memory as a correctly-ordered permutation (asc + desc)', async () => {
      const table = config.buildFetchAll(500);
      try {
        await table.fetch();
        await waitForIdle(table);
        const baseline = idsOf(table).slice().sort();
        if (baseline.length < 2) return; // Not enough data to assert ordering.

        table.getTable().setSorting([{ id: config.sortColumnId, desc: false }]);
        await waitForIdle(table);
        const ascRows = table.getState().rows;
        expect(idsOf(table).slice().sort()).toEqual(baseline); // same set, nothing lost
        expectOrdered(ascRows.map(config.sortValueOf), 'asc');

        table.getTable().setSorting([{ id: config.sortColumnId, desc: true }]);
        await waitForIdle(table);
        expect(idsOf(table).slice().sort()).toEqual(baseline);
        expectOrdered(table.getState().rows.map(config.sortValueOf), 'desc');
      } finally {
        table.destroy();
      }
    });

    it('paginates with disjoint, covering pages', async () => {
      const big = config.buildFetchAll(500);
      let allIds: unknown[] = [];
      try {
        await big.fetch();
        await waitForIdle(big);
        allIds = idsOf(big);
      } finally {
        big.destroy();
      }
      const total = allIds.length;

      const table = config.buildFetchAll(2);
      try {
        await table.fetch();
        await waitForIdle(table);
        const page0 = idsOf(table);
        expect(page0.length).toBeLessThanOrEqual(2);

        if (total > 2) {
          expect(table.pagination.canGoNext()).toBe(true);
          table.pagination.next();
          await waitForIdle(table);
          const page1 = idsOf(table);
          expect(page0.some((id) => page1.includes(id))).toBe(false); // disjoint
          expect([...page0, ...page1].every((id) => allIds.includes(id))).toBe(true); // covering

          table.pagination.previous();
          await waitForIdle(table);
          expect(idsOf(table)).toEqual(page0); // prev returns to the first page
        } else {
          expect(table.pagination.canGoNext()).toBe(false);
        }
      } finally {
        table.destroy();
      }
    });

    it('filters by a term derived from real data and returns only matches', async () => {
      const table = config.buildFetchAll(500);
      try {
        await table.fetch();
        await waitForIdle(table);
        const rows = table.getState().rows;
        const total = rows.length;

        let term: string | null = null;
        let sourceId: unknown;
        for (const row of rows) {
          const candidate = deriveSearchTerm(config.searchTextOf(row));
          if (candidate) {
            term = candidate;
            sourceId = config.idOf(row);
            break;
          }
        }
        if (term === null) return; // Empty tenant / no searchable text — invariant vacuous.

        const matches = (row: TRow): boolean =>
          config
            .searchableValuesOf(row)
            .some(
              (value) =>
                typeof value === 'string' && value.toLowerCase().includes(term.toLowerCase())
            );

        table.setFilter(config.searchFilter(term));
        await waitForIdle(table);
        const filtered = table.getState().rows;

        expect(table.getState().error).toBeNull();
        expect(filtered.length).toBeGreaterThan(0); // the source row matches, so never empty
        expect(filtered.length).toBeLessThanOrEqual(total);
        for (const row of filtered) expect(matches(row)).toBe(true); // no false positives
        expect(filtered.map(config.idOf)).toContain(sourceId); // the source row survives
      } finally {
        table.destroy();
      }
    });

    it('accepts the client option directly', async () => {
      const table = config.buildClient(5);
      try {
        await table.fetch();
        await waitForIdle(table);
        expect(table.getState().isSuccess).toBe(true);
        expect(table.getState().error).toBeNull();
        expect(table.getState().rows.length).toBeLessThanOrEqual(5);
      } finally {
        table.destroy();
      }
    });
  });
}
