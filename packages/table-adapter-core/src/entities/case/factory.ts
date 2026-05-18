/**
 * @fileoverview Case Table Factory
 * @description Creates type-safe case table adapters with builder API and field inference
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
import {
  getFetchFn,
  createColumnBuilder,
  createTableApi,
  type TableApi,
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
    includeTotalCount: params.includeTotalCount,
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
 * Create a type-safe case table adapter.
 *
 * @example
 * ```typescript
 * const table = createCaseTable({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): CaseTable<TColumns> {
  type TFields = CaseExtractFields<TColumns>;
  type TRow = CaseRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryCaseModel, CaseFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getCaseFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'cases',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as CaseTable<TColumns>;
}

/**
 * Case table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type CaseTable<TColumns extends CaseColumnDef[] = CaseColumnDef[]> = TableApi<
  CaseRowType<TColumns>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationManager
>;
