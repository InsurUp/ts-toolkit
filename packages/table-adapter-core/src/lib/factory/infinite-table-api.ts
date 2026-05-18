/**
 * @fileoverview Infinite Table API Factory
 * @description Shared helper that wraps InfiniteTableAdapter in the public TableApi shape.
 * Reused by every entity's infinite-factory.ts.
 */

import type { ColumnDef } from '@tanstack/table-core';
import type { TableApi, TableApiConfig } from './types.js';
import type { AdapterState } from '../adapter/types.js';
import { InfiniteTableAdapter } from '../adapter/infinite-adapter/index.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/index.js';

/**
 * Create the infinite table API that wraps InfiniteTableAdapter.
 *
 * Produces the same TableApi shape as `createTableApi`, backed by the infinite
 * adapter that accumulates rows across page fetches.
 */
export function createInfiniteTableApi<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
>(
  config: TableApiConfig<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  const adapter = new InfiniteTableAdapter<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >(config.fetchFn, config.buildQueryOptions, {
    columns: config.columns,
    pagination: config.pagination,
    defaultFilter: config.defaultFilter,
    defaultSearch: config.defaultSearch,
    sortingConverters: config.sortingConverters,
    queryKeyPrefix: config.queryKeyPrefix,
    staleTime: config.staleTime,
    gcTime: config.gcTime,
    onError: config.onError,
    onSuccess: config.onSuccess,
    onSettled: config.onSettled,
    tableOptions: config.tableOptions,
    autoFetch: config.autoFetch,
    keepPreviousData: config.keepPreviousData,
  });

  // Cached frozen columns for referential stability
  let cachedFrozenColumns: readonly ColumnDef<TRow, unknown>[] | null = null;
  let lastSourceColumns: readonly ColumnDef<TRow, unknown>[] | null = null;

  return {
    get columns() {
      if (adapter.columns !== lastSourceColumns) {
        lastSourceColumns = adapter.columns;
        cachedFrozenColumns = Object.freeze(
          [...adapter.columns].map((col) => Object.freeze({ ...col }))
        );
      }
      return cachedFrozenColumns!;
    },

    getState: (): AdapterState<TRow> => adapter.getState(),

    getTableOptions: () => adapter.getTableOptions(),

    getTable: () => adapter.getTable(),

    subscribe: adapter.subscribe,

    getSnapshot: (): AdapterState<TRow> => adapter.getSnapshot(),

    getServerSnapshot: (): AdapterState<TRow> => adapter.getServerSnapshot(),

    fetch: () => adapter.fetch(),

    invalidate: () => adapter.invalidate(),

    refetch: (options?: { force?: boolean }) => adapter.refetch(options),

    destroy: () => adapter.destroy(),

    get pagination() {
      return adapter.pagination;
    },

    setPageSize: (size: number) => adapter.setPageSize(size),

    setFilter: (filter: TFilterInput) => adapter.setFilter(filter),
    getFilter: () => adapter.getFilter(),
    clearFilter: () => adapter.clearFilter(),

    setSearch: (search: TSearchInput) => adapter.setSearch(search),
    getSearch: () => adapter.getSearch(),
    clearSearch: () => adapter.clearSearch(),

    getColumnInfo: () => adapter.getColumnInfo(),
  };
}
