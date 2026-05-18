/**
 * @fileoverview Infinite Policy Transfer Table Factory
 * @description Creates type-safe infinite scroll policy transfer table adapters with builder API
 */

import type {
  PolicyTransferFieldKey,
  GetPolicyTransfersOptions,
  QueryPolicyTransfersResult,
  QueryPolicyTransfersResultSortInput,
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
} from '@insurup/sdk';
import type {
  PolicyTransferTableOptions,
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
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

const policyTransferSortingConverters =
  createSortingConverters<QueryPolicyTransfersResultSortInput>();

function buildPolicyTransferQueryOptions<TFields extends PolicyTransferFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryPolicyTransfersResult,
    QueryPolicyTransfersResultSortInput,
    QueryPolicyTransfersResultFilterInput,
    QueryPolicyTransfersResultSearchInput
  >
): GetPolicyTransfersOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getPolicyTransferFetchFn<TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): FetchFn<
  PolicyTransferRowType<TColumns>,
  GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>
> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.policies.getPolicyTransfers(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll policy transfer table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfinitePolicyTransferTable({
 *   columns: (col) => [col.id(), col.startDate(), col.policyCount()],
 *   fetch: (options) => client.policies.getPolicyTransfers(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): InfinitePolicyTransferTable<TColumns> {
  type TFields = PolicyTransferExtractFields<TColumns>;
  type TRow = PolicyTransferRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryPolicyTransfersResult, PolicyTransferFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getPolicyTransferFetchFn(options);

  return createInfiniteTableApi<
    QueryPolicyTransfersResult,
    TRow,
    GetPolicyTransfersOptions<TFields[]>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildPolicyTransferQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: policyTransferSortingConverters,
    queryKeyPrefix: 'policy-transfers-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfinitePolicyTransferTable<TColumns>;
}

/**
 * Infinite policy transfer table type - same interface as PolicyTransferTable.
 */
export type InfinitePolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;
