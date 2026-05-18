/**
 * @fileoverview Proposal Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the proposals SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

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
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    QueryProposalsResultSortInput,
    ProposalFilterInput,
    ProposalSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'proposals',
    clientMethod: (client) => (vars, requestOptions) =>
      client.proposals.getProposals(vars, requestOptions),
  }) as ProposalTable<TColumns>;
}

/**
 * Proposal table type — row narrowed to the fields referenced by the columns.
 */
export type ProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> = TableApi<
  ProposalRowType<TColumns>,
  ProposalFilterInput,
  ProposalSearchInput,
  CursorPaginationManager
>;
