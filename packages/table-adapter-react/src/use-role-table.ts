/**
 * @fileoverview React hook for Role Table — thin wrapper over `useTable`.
 */

import {
  createRoleTable as createRoleTableCore,
  type RoleTable,
  type RoleTableOptions,
  type RoleColumnDef,
  type RoleRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseRoleTableResult<TColumns extends RoleColumnDef[]> = UseTableResult<
  RoleRowType<TColumns>,
  RoleTable<TColumns>
>;

/**
 * React hook for creating and managing a role table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useRoleTable<const TColumns extends RoleColumnDef[]>(
  options: RoleTableOptions<TColumns>
): UseRoleTableResult<TColumns> {
  return useTable(() => createRoleTableCore(options));
}
