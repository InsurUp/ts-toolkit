/**
 * @fileoverview Infinite Table API Factory
 * @description Reused by every entity's infinite-factory.ts. Instantiates an
 * InfiniteTableAdapter and wraps it in the shared TableApi shape.
 */

import type { TableApi, TableApiConfig } from './types.js';
import { InfiniteTableAdapter } from '../adapter/infinite-adapter/index.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/index.js';
import { createTableApiFromAdapter } from './create-table-api-from-adapter.js';

/**
 * Create an infinite-scroll table API.
 *
 * Produces the same TableApi shape as `createTableApi`, backed by the
 * infinite adapter that accumulates rows across page fetches.
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

  return createTableApiFromAdapter(adapter);
}
