/**
 * @fileoverview Infinite Proposal Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the proposals SDK call.
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
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

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
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    QueryProposalsResultSortInput,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'proposals',
    clientMethod: (client) => (vars, requestOptions) =>
      client.proposals.getProposals(vars, requestOptions),
  }) as InfiniteProposalTable<TColumns>;
}

/**
 * Infinite proposal table type — same shape as `ProposalTable`.
 */
export type InfiniteProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> =
  TableApi<
    ProposalRowType<TColumns>,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationManager
  >;
