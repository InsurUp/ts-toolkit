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
import type {
  CustomerTableOptions,
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerFilterInput,
  CustomerSearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi } from '../../lib/factory/types.js';
import {
  getFetchFn,
  createColumnBuilder,
  createInfiniteTableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

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
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.customers.getCustomers(vars, requestOptions)
  );
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
 *   pagination: { type: 'cursor', pageSize: 50 },  // Larger page size for infinite scroll
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
    CustomerSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildCustomerQueryOptions,
    columns,
    pagination: options.pagination,
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
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteCustomerTable<TColumns>;
}

/**
 * Infinite customer table type - same interface as CustomerTable
 * Uses ITableAdapter for consistent API across pagination and infinite scroll modes
 */
export type InfiniteCustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> =
  TableApi<
    CustomerRowType<TColumns>,
    CustomerFilterInput,
    CustomerSearchInput,
    CursorPaginationManager
  >;
