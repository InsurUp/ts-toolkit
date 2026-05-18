/**
 * @fileoverview Shared TableApi wrapper + adapter-construction helper.
 *
 * Both `createTableApi` (paginated, uses `BaseTableAdapter`) and
 * `createInfiniteTableApi` (infinite scroll, uses `InfiniteTableAdapter`)
 * follow the same shape: construct the adapter, wrap it in `TableApi`.
 * `buildTableApi` owns that shared body, parametrised by the adapter class.
 */

import type { ColumnDef } from '@tanstack/table-core';
import type { ITableAdapter, AdapterState, BaseTableAdapterOptions } from '../adapter/types.js';
import type { PaginationManager, PaginationOptions } from '../pagination/types.js';
import type { FetchFn, QueryOptionsBuilder } from '../types.js';
import type { TableApi, TableApiConfig } from './types.js';

/**
 * Wrap any `ITableAdapter` in the public `TableApi` shape.
 */
export function createTableApiFromAdapter<
  TRow,
  TFilterInput,
  TSearchInput,
  TPagination extends PaginationManager,
>(
  adapter: ITableAdapter<TRow, TFilterInput, TSearchInput, TPagination>
): TableApi<TRow, TFilterInput, TSearchInput, TPagination> {
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
    subscribe: adapter.subscribe.bind(adapter),
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

/**
 * Adapter constructor shape that both `BaseTableAdapter` and
 * `InfiniteTableAdapter` satisfy.
 */
type AdapterCtor<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
> = new (
  fetchFn: FetchFn<TRow, TQueryOptions>,
  buildQueryOptions: QueryOptionsBuilder<
    TEntity,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput
  >,
  options: BaseTableAdapterOptions<
    TEntity,
    TRow,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >
) => ITableAdapter<TRow, TFilterInput, TSearchInput, PaginationManager>;

/**
 * Construct an adapter of the given class from a `TableApiConfig` and wrap
 * it in the public `TableApi` shape. Shared body of `createTableApi`
 * and `createInfiniteTableApi`.
 */
export function buildTableApi<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
>(
  AdapterCtor: AdapterCtor<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >,
  config: TableApiConfig<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManager> {
  const adapter = new AdapterCtor(config.fetchFn, config.buildQueryOptions, {
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
    splitTotalCount: config.splitTotalCount,
    keepPreviousData: config.keepPreviousData,
  });
  return createTableApiFromAdapter(adapter);
}
