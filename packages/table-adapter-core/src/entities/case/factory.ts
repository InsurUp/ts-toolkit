/**
 * @fileoverview Case Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the cases SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe case table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): CaseTable<TColumns> {
  return createEntityTable<
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
  }) as CaseTable<TColumns>;
}

/**
 * Case table type — row narrowed to the fields referenced by the columns.
 */
export type CaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;
