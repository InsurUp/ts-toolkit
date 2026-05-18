/**
 * @fileoverview Infinite Case Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the cases SDK call.
 */

import type {
  CaseFieldKey,
  GetCasesOptions,
  QueryCaseModel,
  QueryCaseModelSortInput,
} from '@insurup/sdk';
import type {
  CaseTableOptions,
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseFilterInput,
  CaseSearchInput,
} from './types.js';
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll case table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): InfiniteCaseTable<TColumns> {
  return createInfiniteEntityTable<
    QueryCaseModel,
    CaseFieldKey,
    TColumns,
    CaseRowType<TColumns>,
    GetCasesOptions<CaseExtractFields<TColumns>[]>,
    QueryCaseModelSortInput,
    CaseFilterInput,
    CaseSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'cases',
    clientMethod: (client) => (vars, requestOptions) => client.cases.getCases(vars, requestOptions),
  }) as InfiniteCaseTable<TColumns>;
}

/**
 * Infinite case table type — same shape as `CaseTable`.
 */
export type InfiniteCaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;
