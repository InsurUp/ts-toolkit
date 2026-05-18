/**
 * @fileoverview Infinite Case Table Factory
 * @description Creates type-safe infinite scroll case table adapters with builder API
 */

import type {
  CaseFieldKey,
  GetCasesOptions,
  QueryCaseModel,
  QueryCaseModelSortInput,
  QueryCaseModelFilterInput,
  QueryCaseModelSearchInput,
} from '@insurup/sdk';
import type {
  CaseTableOptions,
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseFilterInput,
  CaseSearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi } from '../../lib/factory/types.js';
import {
  getFetchFn,
  createColumnBuilder,
  createInfiniteTableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const caseSortingConverters = createSortingConverters<QueryCaseModelSortInput>();

function buildCaseQueryOptions<TFields extends CaseFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryCaseModel,
    QueryCaseModelSortInput,
    QueryCaseModelFilterInput,
    QueryCaseModelSearchInput
  >
): GetCasesOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getCaseFetchFn<TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): FetchFn<CaseRowType<TColumns>, GetCasesOptions<CaseExtractFields<TColumns>[]>> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.cases.getCases(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll case table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfiniteCaseTable({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): InfiniteCaseTable<TColumns> {
  type TFields = CaseExtractFields<TColumns>;
  type TRow = CaseRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryCaseModel, CaseFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getCaseFetchFn(options);

  return createInfiniteTableApi<
    QueryCaseModel,
    TRow,
    GetCasesOptions<TFields[]>,
    QueryCaseModelSortInput,
    CaseFilterInput,
    CaseSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildCaseQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: caseSortingConverters,
    queryKeyPrefix: 'cases-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteCaseTable<TColumns>;
}

/**
 * Infinite case table type - same interface as CaseTable.
 */
export type InfiniteCaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;
