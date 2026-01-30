/**
 * @fileoverview Infinite Customer Table Factory
 * @description Creates type-safe infinite scroll customer table adapters with builder API
 */

import type {
  CustomerFieldKey,
  GetCustomersOptions,
  QueryCustomerModel,
  QueryCustomerModelSortInput,
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
} from '@insurup/sdk';
import type { ColumnDef } from '@tanstack/table-core';
import type {
  CustomerTableOptions,
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerFilterInput,
  CustomerSearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi, TableApiConfig } from '../../lib/factory/types.js';
import type { AdapterState } from '../../lib/adapter/types.js';
import {
  getFetchFn,
  createColumnBuilder,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import { InfiniteTableAdapter } from '../../lib/adapter/infinite-adapter/index.js';

// ============================================================================
// Sorting Converters (shared with regular factory)
// ============================================================================

const customerSortingConverters = createSortingConverters<QueryCustomerModelSortInput>();

// ============================================================================
// Query Options Builder (shared with regular factory)
// ============================================================================

function buildCustomerQueryOptions<TFields extends CustomerFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryCustomerModel,
    QueryCustomerModelSortInput,
    QueryCustomerModelFilterInput,
    QueryCustomerModelSearchInput
  >
): GetCustomersOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

// ============================================================================
// Customer Fetch Function Helper (shared with regular factory)
// ============================================================================

function getCustomerFetchFn<TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): FetchFn<CustomerRowType<TColumns>, GetCustomersOptions<CustomerExtractFields<TColumns>[]>> {
  return getFetchFn(options, (client) => (vars, requestOptions) =>
    client.customers.getCustomers(vars, requestOptions)
  );
}

// ============================================================================
// Infinite Table API Factory
// ============================================================================

/**
 * Create the infinite table API that wraps InfiniteTableAdapter
 *
 * This factory creates a consistent public API using the infinite adapter
 * that accumulates rows across page fetches.
 */
function createInfiniteTableApi<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
>(
  config: TableApiConfig<TEntity, TRow, TQueryOptions, TSortInput, TFilterInput, TSearchInput>
): TableApi<TRow, TFilterInput, TSearchInput> {
  const adapter = new InfiniteTableAdapter<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput
  >(config.fetchFn, config.buildQueryOptions, {
    columns: config.columns,
    pageSize: config.pageSize,
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

    setPageSize: (size: number) => adapter.setPageSize(size),

    // Filter methods
    setFilter: (filter: TFilterInput) => adapter.setFilter(filter),
    getFilter: () => adapter.getFilter(),
    clearFilter: () => adapter.clearFilter(),

    // Search methods
    setSearch: (search: TSearchInput) => adapter.setSearch(search),
    getSearch: () => adapter.getSearch(),
    clearSearch: () => adapter.clearSearch(),

    // Column info method
    getColumnInfo: () => adapter.getColumnInfo(),
  };
}

// ============================================================================
// Infinite Customer Table Factory
// ============================================================================

/**
 * Create an infinite scroll customer table adapter
 *
 * Unlike createCustomerTable which uses pagination, this adapter accumulates
 * rows across page fetches for infinite scroll behavior.
 *
 * @example
 * ```typescript
 * const customerTable = createInfiniteCustomerTable({
 *   columns: col => [
 *     col.id(),
 *     col.name('Customer Name'),
 *     col.type({ header: 'Type' }),
 *   ],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pageSize: 50,  // Larger page size for infinite scroll
 *   autoFetch: true,
 * })
 *
 * // Use with TanStack Virtual for virtualization
 * const table = customerTable.getTable();
 *
 * // Load more when scrolling near bottom
 * if (table.getCanNextPage() && !state.isFetching) {
 *   table.nextPage();  // Rows accumulate in state.rows
 * }
 * ```
 */
export function createInfiniteCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): InfiniteCustomerTable<TColumns> {
  type TFields = CustomerExtractFields<TColumns>;
  type TRow = CustomerRowType<TColumns>;

  // Create the column builder and get column definitions
  const columnBuilder = createColumnBuilder<QueryCustomerModel, CustomerFieldKey>();
  const columns = options.columns(columnBuilder);

  // Create fetch function based on mode
  const fetchFn = getCustomerFetchFn(options);

  return createInfiniteTableApi<
    QueryCustomerModel,
    TRow,
    GetCustomersOptions<TFields[]>,
    QueryCustomerModelSortInput,
    CustomerFilterInput,
    CustomerSearchInput
  >({
    fetchFn,
    buildQueryOptions: buildCustomerQueryOptions,
    columns,
    pageSize: options.pageSize ?? 50, // Default larger page size for infinite scroll
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: customerSortingConverters,
    queryKeyPrefix: 'customers-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
  }) as InfiniteCustomerTable<TColumns>;
}

/**
 * Infinite customer table type - same interface as CustomerTable
 * Uses ITableAdapter for consistent API across pagination and infinite scroll modes
 */
export type InfiniteCustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> =
  TableApi<CustomerRowType<TColumns>, CustomerFilterInput, CustomerSearchInput>;
