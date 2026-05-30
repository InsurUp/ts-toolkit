/**
 * @fileoverview React hook for Infinite Role Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteRoleTable as createInfiniteRoleTableCore,
  type InfiniteRoleTable,
  type RoleTableOptions,
  type RoleColumnDef,
  type RoleRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteRoleTableResult<TColumns extends RoleColumnDef[]> = UseTableResult<
  RoleRowType<TColumns>,
  InfiniteRoleTable<TColumns>
>;

/**
 * React hook for an infinite scroll role table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteRoleTable<const TColumns extends RoleColumnDef[]>(
  options: RoleTableOptions<TColumns>
): UseInfiniteRoleTableResult<TColumns> {
  return useTable(() => createInfiniteRoleTableCore(options));
}
