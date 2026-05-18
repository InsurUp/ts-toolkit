/**
 * @fileoverview Policy Transfer Table Factory
 * @description Creates type-safe policy transfer table adapters with builder API and field inference
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
    includeTotalCount: params.includeTotalCount,
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
 * Create a type-safe policy transfer table adapter.
 *
 * @example
 * ```typescript
 * const table = createPolicyTransferTable({
 *   columns: (col) => [col.id(), col.startDate(), col.policyCount()],
 *   fetch: (options) => client.policies.getPolicyTransfers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createPolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): PolicyTransferTable<TColumns> {
  type TFields = PolicyTransferExtractFields<TColumns>;
  type TRow = PolicyTransferRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryPolicyTransfersResult, PolicyTransferFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getPolicyTransferFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'policy-transfers',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as PolicyTransferTable<TColumns>;
}

/**
 * Policy transfer table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type PolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;
