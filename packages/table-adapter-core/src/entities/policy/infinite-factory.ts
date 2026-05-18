/**
 * @fileoverview Infinite Policy Table Factory
 * @description Creates type-safe infinite scroll policy table adapters with builder API
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
 * Create an infinite scroll policy table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfinitePolicyTable({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): InfinitePolicyTable<TColumns> {
  type TFields = PolicyExtractFields<TColumns>;
  type TRow = PolicyRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryPoliciesResult, PolicyFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getPolicyFetchFn(options);

  return createInfiniteTableApi<
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
    queryKeyPrefix: 'policies-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfinitePolicyTable<TColumns>;
}

/**
 * Infinite policy table type - same interface as PolicyTable.
 */
export type InfinitePolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;
