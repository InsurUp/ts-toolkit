/**
 * @fileoverview Vue composable for Customer Table — thin wrapper over `useTable`.
 */

import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseCustomerTableResult<TColumns extends CustomerColumnDef[]> = UseTableResult<
  CustomerRowType<TColumns>,
  CustomerTable<TColumns>
>;

/**
 * Vue composable for creating and managing a customer table.
 * See `useTable` for the underlying primitive.
 */
export function useCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): UseCustomerTableResult<TColumns> {
  return useTable(() => createCustomerTableCore(options));
}
