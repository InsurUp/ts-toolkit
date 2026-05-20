/**
 * @fileoverview Customer Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the customers SDK call. Both paginated and infinite variants live here.
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
  CustomerUnifiedFilterInput,
} from './types.js';
import {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
  type TableApi,
} from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const customerConfig: EntityFactoryConfig<GetCustomersOptions<CustomerFieldKey[]>> = {
  queryKeyPrefix: 'customers',
  clientMethod: (client) => (vars, requestOptions) =>
    client.customers.getCustomers(vars, requestOptions),
};

/**
 * Create a type-safe customer table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): CustomerTable<TColumns> {
  return createEntityTable<
    QueryCustomerModel,
    CustomerFieldKey,
    TColumns,
    CustomerRowType<TColumns>,
    QueryCustomerModelSortInput,
    CustomerUnifiedFilterInput,
    GetCustomersOptions<CustomerExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, customerConfig);
}

/**
 * Create an infinite-scroll customer table adapter.
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
    QueryCustomerModelSortInput,
    CustomerUnifiedFilterInput,
    GetCustomersOptions<CustomerExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, customerConfig);
}

/** Customer table type — row narrowed to the fields referenced by the columns. */
export type CustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> = TableApi<
  CustomerRowType<TColumns>,
  CustomerUnifiedFilterInput,
  CursorPaginationManager
>;

/** Infinite customer table type — same shape as `CustomerTable`. */
export type InfiniteCustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> =
  TableApi<CustomerRowType<TColumns>, CustomerUnifiedFilterInput, CursorPaginationManager>;
