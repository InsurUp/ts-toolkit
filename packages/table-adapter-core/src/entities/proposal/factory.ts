/**
 * @fileoverview Proposal Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the proposals SDK call. Both paginated and infinite variants live here.
 */

import type {
  ProposalFieldKey,
  GetProposalsOptions,
  QueryProposalsResult,
  QueryProposalsResultSortInput,
} from '@insurup/sdk';
import type {
  ProposalTableOptions,
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalFilterInput,
  ProposalSearchInput,
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

type ProposalConfig = EntityFactoryConfig<GetProposalsOptions<ProposalFieldKey[]>>;

const proposalConfig: ProposalConfig = {
  queryKeyPrefix: 'proposals',
  clientMethod: (client) => (vars, requestOptions) =>
    client.proposals.getProposals(vars, requestOptions),
};

/**
 * Create a type-safe proposal table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): ProposalTable<TColumns> {
  return createEntityTable<
    QueryProposalsResult,
    ProposalFieldKey,
    TColumns,
    ProposalRowType<TColumns>,
    QueryProposalsResultSortInput,
    ProposalFilterInput,
    ProposalSearchInput,
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, proposalConfig);
}

/**
 * Create an infinite-scroll proposal table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): InfiniteProposalTable<TColumns> {
  return createInfiniteEntityTable<
    QueryProposalsResult,
    ProposalFieldKey,
    TColumns,
    ProposalRowType<TColumns>,
    QueryProposalsResultSortInput,
    ProposalFilterInput,
    ProposalSearchInput,
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, proposalConfig);
}

/** Proposal table type — row narrowed to the fields referenced by the columns. */
export type ProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> = TableApi<
  ProposalRowType<TColumns>,
  ProposalFilterInput,
  ProposalSearchInput,
  CursorPaginationManager
>;

/** Infinite proposal table type — same shape as `ProposalTable`. */
export type InfiniteProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> =
  TableApi<
    ProposalRowType<TColumns>,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationManager
  >;
