/**
 * @fileoverview Policy Table Factory
 * @description Creates type-safe policy table adapters with builder API and field inference
 */

import type {
  PolicyFieldKey,
  GetPoliciesOptions,
  QueryPoliciesResult,
  QueryPoliciesResultSortInput,
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
} from '@insurup/sdk';
import type {
  PolicyTableOptions,
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyFilterInput,
  PolicySearchInput,
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

const policySortingConverters = createSortingConverters<QueryPoliciesResultSortInput>();

function buildPolicyQueryOptions<TFields extends PolicyFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryPoliciesResult,
    QueryPoliciesResultSortInput,
    QueryPoliciesResultFilterInput,
    QueryPoliciesResultSearchInput
  >
): GetPoliciesOptions<TFields> {
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

function getPolicyFetchFn<TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): FetchFn<PolicyRowType<TColumns>, GetPoliciesOptions<PolicyExtractFields<TColumns>[]>> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.policies.getPolicies(vars, requestOptions)
  );
}

/**
 * Create a type-safe policy table adapter.
 *
 * @example
 * ```typescript
 * const table = createPolicyTable({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createPolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): PolicyTable<TColumns> {
  type TFields = PolicyExtractFields<TColumns>;
  type TRow = PolicyRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryPoliciesResult, PolicyFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getPolicyFetchFn(options);

  return createTableApi<
    QueryPoliciesResult,
    TRow,
    GetPoliciesOptions<TFields[]>,
    QueryPoliciesResultSortInput,
    PolicyFilterInput,
    PolicySearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildPolicyQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: policySortingConverters,
    queryKeyPrefix: 'policies',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as PolicyTable<TColumns>;
}

/**
 * Policy table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type PolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;
