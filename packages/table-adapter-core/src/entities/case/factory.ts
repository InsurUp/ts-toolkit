/**
 * @fileoverview Case Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the cases SDK call. Both paginated and infinite variants live here.
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
  CaseUnifiedFilterInput,
} from './types.js';
import {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
  type TableApi,
} from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const caseConfig: EntityFactoryConfig<GetCasesOptions<CaseFieldKey[]>> = {
  queryKeyPrefix: 'cases',
  clientMethod: (client) => (vars, requestOptions) => client.cases.getCases(vars, requestOptions),
};

export function createCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): CaseTable<TColumns> {
  return createEntityTable<
    QueryCaseModel,
    CaseFieldKey,
    TColumns,
    CaseRowType<TColumns>,
    QueryCaseModelSortInput,
    CaseUnifiedFilterInput,
    GetCasesOptions<CaseExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, caseConfig);
}

export function createInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): InfiniteCaseTable<TColumns> {
  return createInfiniteEntityTable<
    QueryCaseModel,
    CaseFieldKey,
    TColumns,
    CaseRowType<TColumns>,
    QueryCaseModelSortInput,
    CaseUnifiedFilterInput,
    GetCasesOptions<CaseExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, caseConfig);
}

export type CaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfiniteCaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseUnifiedFilterInput,
  CursorPaginationManager
>;
