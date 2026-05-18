/**
 * @fileoverview Shared TableApi wrapper.
 *
 * Both `createTableApi` (paginated) and `createInfiniteTableApi` (infinite scroll)
 * delegate identically to an `ITableAdapter` — the only difference between them
 * is which adapter class they instantiate. This helper owns the wrapping
 * (frozen columns cache + method delegation) so neither factory has to
 * duplicate it.
 */

import type { ColumnDef } from '@tanstack/table-core';
import type { ITableAdapter, AdapterState } from '../adapter/types.js';
import type { PaginationManager } from '../pagination/types.js';
import type { TableApi } from './types.js';

/**
 * Wrap any `ITableAdapter` in the public `TableApi` shape.
 *
 * @template TRow - The row type with selected fields
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @template TPagination - The pagination manager type
 */
export function createTableApiFromAdapter<
  TRow,
  TFilterInput,
  TSearchInput,
  TPagination extends PaginationManager,
>(
  adapter: ITableAdapter<TRow, TFilterInput, TSearchInput, TPagination>
): TableApi<TRow, TFilterInput, TSearchInput, TPagination> {
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
