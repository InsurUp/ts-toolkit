/**
 * @fileoverview React hook for Coverage Group Table — thin wrapper over `useTable`.
 */

import {
  createCoverageGroupTable as createCoverageGroupTableCore,
  type CoverageGroupTable,
  type CoverageGroupTableOptions,
  type CoverageGroupColumnDef,
  type CoverageGroupRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseCoverageGroupTableResult<TColumns extends CoverageGroupColumnDef[]> = UseTableResult<
  CoverageGroupRowType<TColumns>,
  CoverageGroupTable<TColumns>
>;

/**
 * React hook for creating and managing a coverage group table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  options: CoverageGroupTableOptions<TColumns>
): UseCoverageGroupTableResult<TColumns> {
  return useTable(() => createCoverageGroupTableCore(options));
}
