/**
 * @fileoverview Customer Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the customer SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe customer table adapter.
 *
 * The row type is narrowed to exactly the fields referenced by the columns.
 *
 * @example
 * ```typescript
 * const customerTable = createCustomerTable({
 *   columns: (col) => [
 *     col.id(),
 *     col.name('Customer Name'),
 *     col.computed({
 *       uses: ['cityText', 'districtText'] as const,
 *       header: 'Location',
 *       render: (row) => `${row.cityText}, ${row.districtText}`,
 *     }),
 *   ],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * });
 * ```
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): CustomerTable<TColumns> {
  return createEntityTable<
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
  }) as CustomerTable<TColumns>;
}

/**
 * Customer table type — row narrowed to the fields referenced by the columns.
 */
export type CustomerTable<TColumns extends CustomerColumnDef[] = CustomerColumnDef[]> = TableApi<
  CustomerRowType<TColumns>,
  CustomerFilterInput,
  CustomerSearchInput,
  CursorPaginationManager
>;
