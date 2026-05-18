/**
 * @fileoverview React hook for Infinite Customer Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteCustomerTable as createInfiniteCustomerTableCore,
  type InfiniteCustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteCustomerTableResult<TColumns extends CustomerColumnDef[]> = UseTableResult<
  CustomerRowType<TColumns>,
  InfiniteCustomerTable<TColumns>
>;

/**
 * React hook for an infinite scroll customer table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): UseInfiniteCustomerTableResult<TColumns> {
  return useTable(() => createInfiniteCustomerTableCore(options));
}
