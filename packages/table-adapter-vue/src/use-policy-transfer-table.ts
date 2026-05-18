/**
 * @fileoverview Vue composable for PolicyTransfer Table — thin wrapper over `useTable`.
 */

import {
  createPolicyTransferTable as createPolicyTransferTableCore,
  type PolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UsePolicyTransferTableResult<TColumns extends PolicyTransferColumnDef[]> =
  UseTableResult<PolicyTransferRowType<TColumns>, PolicyTransferTable<TColumns>>;

/**
 * Vue composable for creating and managing a policytransfer table.
 * See `useTable` for the underlying primitive.
 */
export function usePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): UsePolicyTransferTableResult<TColumns> {
  return useTable(() => createPolicyTransferTableCore(options));
}
