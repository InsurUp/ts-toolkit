/**
 * @fileoverview Vue composable for Policy Table — thin wrapper over `useTable`.
 */

import {
  createPolicyTable as createPolicyTableCore,
  type PolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UsePolicyTableResult<TColumns extends PolicyColumnDef[]> = UseTableResult<
  PolicyRowType<TColumns>,
  PolicyTable<TColumns>
>;

/**
 * Vue composable for creating and managing a policy table.
 * See `useTable` for the underlying primitive.
 */
export function usePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): UsePolicyTableResult<TColumns> {
  return useTable(() => createPolicyTableCore(options));
}
