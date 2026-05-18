/**
 * @fileoverview React hook for Case Table — thin wrapper over `useTable`.
 */

import {
  createCaseTable as createCaseTableCore,
  type CaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseCaseTableResult<TColumns extends CaseColumnDef[]> = UseTableResult<
  CaseRowType<TColumns>,
  CaseTable<TColumns>
>;

/**
 * React hook for creating and managing a case table.
 * See `useTable` for the underlying primitive.
 */
export function useCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): UseCaseTableResult<TColumns> {
  return useTable(() => createCaseTableCore(options));
}
