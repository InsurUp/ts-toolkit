/**
 * @fileoverview Vue composable for Infinite Coverage Group Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteCoverageGroupTable as createInfiniteCoverageGroupTableCore,
  type InfiniteCoverageGroupTable,
  type CoverageGroupTableOptions,
  type CoverageGroupColumnDef,
  type CoverageGroupRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteCoverageGroupTableResult<TColumns extends CoverageGroupColumnDef[]> =
  UseTableResult<CoverageGroupRowType<TColumns>, InfiniteCoverageGroupTable<TColumns>>;

/**
 * Vue composable for an infinite scroll coverage group table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  options: CoverageGroupTableOptions<TColumns>
): UseInfiniteCoverageGroupTableResult<TColumns> {
  return useTable(() => createInfiniteCoverageGroupTableCore(options));
}
