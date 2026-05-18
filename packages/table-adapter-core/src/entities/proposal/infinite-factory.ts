/**
 * @fileoverview Infinite Proposal Table Factory
 * @description Creates type-safe infinite scroll proposal table adapters with builder API
 */

import type {
  ProposalFieldKey,
  GetProposalsOptions,
  QueryProposalsResult,
  QueryProposalsResultSortInput,
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
} from '@insurup/sdk';
import type {
  ProposalTableOptions,
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalFilterInput,
  ProposalSearchInput,
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

const proposalSortingConverters = createSortingConverters<QueryProposalsResultSortInput>();

function buildProposalQueryOptions<TFields extends ProposalFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryProposalsResult,
    QueryProposalsResultSortInput,
    QueryProposalsResultFilterInput,
    QueryProposalsResultSearchInput
  >
): GetProposalsOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getProposalFetchFn<TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): FetchFn<ProposalRowType<TColumns>, GetProposalsOptions<ProposalExtractFields<TColumns>[]>> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.proposals.getProposals(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll proposal table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfiniteProposalTable({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): InfiniteProposalTable<TColumns> {
  type TFields = ProposalExtractFields<TColumns>;
  type TRow = ProposalRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryProposalsResult, ProposalFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getProposalFetchFn(options);

  return createInfiniteTableApi<
    QueryProposalsResult,
    TRow,
    GetProposalsOptions<TFields[]>,
    QueryProposalsResultSortInput,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildProposalQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: proposalSortingConverters,
    queryKeyPrefix: 'proposals-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteProposalTable<TColumns>;
}

/**
 * Infinite proposal table type - same interface as ProposalTable.
 */
export type InfiniteProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> =
  TableApi<
    ProposalRowType<TColumns>,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationManager
  >;
