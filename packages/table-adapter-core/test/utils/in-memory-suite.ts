/**
 * @fileoverview Shared integration suite for in-memory (REST list) tables.
 * @description Every in-memory entity behaves identically (same engine/factory),
 * so each entity's spec supplies mock rows + a few filter/sort expectations and
 * this helper runs the full behavioural contract against them.
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { InsurUpResult } from '@insurup/sdk';
import type { SortingState } from '@tanstack/table-core';
import type { TableApi } from '../../src/lib/factory/index.js';
import type { CursorPaginationManager } from '../../src/lib/pagination/index.js';
import { flushPromises } from './helpers.js';
import { createSuccessResult, createClientError } from './mocks.js';

type Loader<TEntity> = Mock<() => Promise<InsurUpResult<TEntity[]>>>;
type InMemoryTable<TRow, TFilter> = TableApi<TRow, TFilter, CursorPaginationManager>;

export interface InMemorySuiteConfig<TEntity, TRow, TFilter> {
  /** describe() label, e.g. 'createAgentBranchTable'. */
  name: string;
  /** Mock rows in the order the API returns them. */
  rows: TEntity[];
  /** Stable ids in API order (used to assert page slices). */
  orderedIds: unknown[];
  /** Read the stable id off a fetched (column-narrowed) row. */
  idOf: (row: TRow) => unknown;
  /** Build the paginated table from a loader mock and page size. */
  build: (fetchAll: Loader<TEntity>, pageSize: number) => InMemoryTable<TRow, TFilter>;
  /** Build the infinite table from a loader mock and page size. */
  buildInfinite: (fetchAll: Loader<TEntity>, pageSize: number) => InMemoryTable<TRow, TFilter>;
  /** A `$search` filter and the ids it should leave. */
  search: { filter: TFilter; expectedIds: unknown[] };
  /** A per-field predicate filter and the ids it should leave. */
  fieldFilter: { filter: TFilter; expectedIds: unknown[] };
  /** A sorting state and the resulting id order. */
  sort: { sorting: SortingState; expectedIds: unknown[] };
}

export function describeInMemoryTable<TEntity, TRow, TFilter>(
  config: InMemorySuiteConfig<TEntity, TRow, TFilter>
): void {
  const { rows, orderedIds, idOf } = config;
  const idsOf = (table: InMemoryTable<TRow, TFilter>): unknown[] => table.getState().rows.map(idOf);

  describe(config.name, () => {
    let fetchAll: Loader<TEntity>;

    beforeEach(() => {
      fetchAll = vi.fn(async (): Promise<InsurUpResult<TEntity[]>> => createSuccessResult(rows));
    });

    it('loads the list and exposes the first page', async () => {
      const table = config.build(fetchAll, 2);
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(0, 2));
      expect(table.getState().rowCount).toBe(rows.length);
      table.destroy();
    });

    it('loads the source only once across filter / sort / page changes', async () => {
      const table = config.build(fetchAll, 2);
      await flushPromises();

      table.setFilter(config.search.filter);
      await flushPromises();
      table.getTable().setSorting(config.sort.sorting);
      await flushPromises();
      table.clearFilter();
      await flushPromises();
      table.pagination.next();
      await flushPromises();

      expect(fetchAll).toHaveBeenCalledTimes(1);
      table.destroy();
    });

    it('filters in memory via $search', async () => {
      const table = config.build(fetchAll, 50);
      await flushPromises();
      table.setFilter(config.search.filter);
      await flushPromises();
      expect(idsOf(table)).toEqual(config.search.expectedIds);
      table.destroy();
    });

    it('filters in memory via a per-field predicate', async () => {
      const table = config.build(fetchAll, 50);
      await flushPromises();
      table.setFilter(config.fieldFilter.filter);
      await flushPromises();
      expect(idsOf(table)).toEqual(config.fieldFilter.expectedIds);
      table.destroy();
    });

    it('clears the filter back to the full list', async () => {
      const table = config.build(fetchAll, 50);
      await flushPromises();
      table.setFilter(config.search.filter);
      await flushPromises();
      table.clearFilter();
      await flushPromises();
      expect(table.getState().rows).toHaveLength(rows.length);
      table.destroy();
    });

    it('sorts in memory when the table sorting changes', async () => {
      const table = config.build(fetchAll, 50);
      await flushPromises();
      table.getTable().setSorting(config.sort.sorting);
      await flushPromises();
      expect(idsOf(table)).toEqual(config.sort.expectedIds);
      table.destroy();
    });

    it('paginates in memory with prev/next', async () => {
      const table = config.build(fetchAll, 2);
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(0, 2));

      table.pagination.next();
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(2, 4));

      table.pagination.previous();
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(0, 2));
      table.destroy();
    });

    it('re-pulls the source on invalidate() and forced refetch()', async () => {
      const table = config.build(fetchAll, 50);
      await flushPromises();
      expect(fetchAll).toHaveBeenCalledTimes(1);

      await table.invalidate();
      await flushPromises();
      expect(fetchAll).toHaveBeenCalledTimes(2);

      await table.refetch({ force: true });
      await flushPromises();
      expect(fetchAll).toHaveBeenCalledTimes(3);
      table.destroy();
    });

    it('surfaces a loader error as table error state', async () => {
      fetchAll.mockResolvedValueOnce(createClientError());
      const table = config.build(fetchAll, 50);
      await flushPromises();
      expect(table.getState().isError).toBe(true);
      expect(table.getState().error).not.toBeNull();
      table.destroy();
    });

    it('accumulates rows across pages (infinite)', async () => {
      const table = config.buildInfinite(fetchAll, 2);
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(0, 2));

      table.pagination.next();
      await flushPromises();
      expect(idsOf(table)).toEqual(orderedIds.slice(0, 4));
      expect(fetchAll).toHaveBeenCalledTimes(1);
      table.destroy();
    });
  });
}
