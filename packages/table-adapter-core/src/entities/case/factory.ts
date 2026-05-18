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
  CaseFilterInput,
  CaseSearchInput,
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

type CaseConfig = EntityFactoryConfig<GetCasesOptions<CaseFieldKey[]>>;

const caseConfig: CaseConfig = {
  queryKeyPrefix: 'cases',
  clientMethod: (client) => (vars, requestOptions) => client.cases.getCases(vars, requestOptions),
};

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
    QueryCaseModelSortInput,
    CaseFilterInput,
    CaseSearchInput,
    GetCasesOptions<CaseExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, caseConfig);
}

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
    QueryCaseModelSortInput,
    CaseFilterInput,
    CaseSearchInput,
    GetCasesOptions<CaseExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, caseConfig);
}

/** Case table type — row narrowed to the fields referenced by the columns. */
export type CaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;

/** Infinite case table type — same shape as `CaseTable`. */
export type InfiniteCaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;
