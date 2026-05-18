/**
 * @fileoverview React hook for Infinite Case Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteCaseTable as createInfiniteCaseTableCore,
  type InfiniteCaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteCaseTableResult<TColumns extends CaseColumnDef[]> = UseTableResult<
  CaseRowType<TColumns>,
  InfiniteCaseTable<TColumns>
>;

/**
 * React hook for an infinite scroll case table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): UseInfiniteCaseTableResult<TColumns> {
  return useTable(() => createInfiniteCaseTableCore(options));
}
