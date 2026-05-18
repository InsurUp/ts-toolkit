/**
 * @fileoverview Customer Table Factory
 * @description Creates type-safe customer table adapters with builder API and field inference
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
import {
  getFetchFn,
  createColumnBuilder,
  createTableApi,
  type TableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

// ============================================================================
// Sorting Converters
// ============================================================================

const customerSortingConverters = createSortingConverters<QueryCustomerModelSortInput>();

// ============================================================================
// Query Options Builder
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
    includeTotalCount: params.includeTotalCount,
  };
}

// ============================================================================
// Customer Fetch Function Helper
// ============================================================================

/**
 * Create a fetch function for customers from either a custom fetch or client configuration
 * Derives TRow and TFields from TColumns automatically
 */
function getCustomerFetchFn<TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): FetchFn<CustomerRowType<TColumns>, GetCustomersOptions<CustomerExtractFields<TColumns>[]>> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.customers.getCustomers(vars, requestOptions)
  );
}

// ============================================================================
// Customer Table Factory
// ============================================================================

/**
 * Create a type-safe customer table adapter
 *
 * The row type is automatically narrowed to only include the fields
 * specified in the columns callback.
 *
 * @example
 * ```typescript
 * const customerTable = createCustomerTable({
 *   columns: col => [
 *     col.id(),
 *     col.name('Customer Name'),
 *     col.type({ header: 'Type', render: v => v === 'Individual' ? '👤' : '🏢' }),
 *     col.computed({
 *       uses: ['cityText', 'districtText'] as const,
 *       header: 'Location',
 *       render: row => `${row.cityText}, ${row.districtText}`
 *     })
 *   ],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 *   defaultFilter: { type: { eq: CustomerType.Corporate } },
 *   defaultSearch: 'Acme',
 * })
 *
 * // state.rows[0] only has: id, name, type, cityText, districtText ✅
 *
 * // Filter and search methods
 * customerTable.setFilter({ name: { contains: 'Corp' } })
 * customerTable.setSearch('john doe')
 * customerTable.clearFilter()
 * customerTable.clearSearch()
 * ```
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): CustomerTable<TColumns> {
  type TFields = CustomerExtractFields<TColumns>;
  type TRow = CustomerRowType<TColumns>;

  // Create the column builder and get column definitions
  const columnBuilder = createColumnBuilder<QueryCustomerModel, CustomerFieldKey>();
  const columns = options.columns(columnBuilder);

  // Create fetch function based on mode
  const fetchFn = getCustomerFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'customers',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as CustomerTable<TColumns>;
}

/**
 * Customer table type - row type is inferred from column definitions
 * Includes type-safe filter and search methods
 * @template TColumns - The column definitions
 */
export type CustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> = TableApi<
  CustomerRowType<TColumns>,
  CustomerFilterInput,
  CustomerSearchInput,
  CursorPaginationManager
>;
