/**
 * @fileoverview Vue composable for Infinite PolicyTransfer Table — thin wrapper over `useTable`.
 */

import {
  createInfinitePolicyTransferTable as createInfinitePolicyTransferTableCore,
  type InfinitePolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfinitePolicyTransferTableResult<TColumns extends PolicyTransferColumnDef[]> =
  UseTableResult<PolicyTransferRowType<TColumns>, InfinitePolicyTransferTable<TColumns>>;

/**
 * Vue composable for an infinite scroll policytransfer table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): UseInfinitePolicyTransferTableResult<TColumns> {
  return useTable(() => createInfinitePolicyTransferTableCore(options));
}
