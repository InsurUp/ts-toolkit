/**
 * @fileoverview Infinite Table API Factory
 * @description Thin wrapper over the shared `buildTableApi` helper that wires
 * `InfiniteTableAdapter` as the adapter class. Rows accumulate across pages.
 */

import type { TableApi, TableApiConfig } from './types.js';
import { InfiniteTableAdapter } from '../adapter/infinite-adapter/index.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/index.js';
import { buildTableApi } from './create-table-api-from-adapter.js';

/**
 * Create an infinite-scroll table API. Same shape as `createTableApi`,
 * backed by the adapter that accumulates rows across page fetches.
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
  return buildTableApi(InfiniteTableAdapter, config) as TableApi<
    TRow,
    TFilterInput,
    TSearchInput,
    PaginationManagerFromOptions<TPaginationOptions>
  >;
}
