/**
 * @fileoverview React hook for Infinite Policy Table — thin wrapper over `useTable`.
 */

import {
  createInfinitePolicyTable as createInfinitePolicyTableCore,
  type InfinitePolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfinitePolicyTableResult<TColumns extends PolicyColumnDef[]> = UseTableResult<
  PolicyRowType<TColumns>,
  InfinitePolicyTable<TColumns>
>;

/**
 * React hook for an infinite scroll policy table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): UseInfinitePolicyTableResult<TColumns> {
  return useTable(() => createInfinitePolicyTableCore(options));
}
