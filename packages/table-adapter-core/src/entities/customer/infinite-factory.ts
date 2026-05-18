/**
 * @fileoverview Infinite Customer Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the customer SDK call.
 */

import type {
  CustomerFieldKey,
  GetCustomersOptions,
  QueryCustomerModel,
  QueryCustomerModelSortInput,
} from '@insurup/sdk';
import type {
  CustomerTableOptions,
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerFilterInput,
  CustomerSearchInput,
} from './types.js';
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll customer table adapter.
 *
 * Rows accumulate across page fetches.
 */
export function createInfiniteCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): InfiniteCustomerTable<TColumns> {
  return createInfiniteEntityTable<
    QueryCustomerModel,
    CustomerFieldKey,
    TColumns,
    CustomerRowType<TColumns>,
    GetCustomersOptions<CustomerExtractFields<TColumns>[]>,
    QueryCustomerModelSortInput,
    CustomerFilterInput,
    CustomerSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'customers',
    clientMethod: (client) => (vars, requestOptions) =>
      client.customers.getCustomers(vars, requestOptions),
  }) as InfiniteCustomerTable<TColumns>;
}

/**
 * Infinite customer table type — same shape as `CustomerTable`.
 */
export type InfiniteCustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> =
  TableApi<
    CustomerRowType<TColumns>,
    CustomerFilterInput,
    CustomerSearchInput,
    CursorPaginationManager
  >;
