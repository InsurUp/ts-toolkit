/**
 * @fileoverview Proposal Table Factories
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
  ProposalUnifiedFilterInput,
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

const proposalConfig: EntityFactoryConfig<GetProposalsOptions<ProposalFieldKey[]>> = {
  queryKeyPrefix: 'proposals',
  clientMethod: (client) => (vars, requestOptions) =>
    client.proposals.getProposals(vars, requestOptions),
};

export function createProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): ProposalTable<TColumns> {
  return createEntityTable<
    QueryProposalsResult,
    ProposalFieldKey,
    TColumns,
    ProposalRowType<TColumns>,
    QueryProposalsResultSortInput,
    ProposalUnifiedFilterInput,
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, proposalConfig);
}

export function createInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): InfiniteProposalTable<TColumns> {
  return createInfiniteEntityTable<
    QueryProposalsResult,
    ProposalFieldKey,
    TColumns,
    ProposalRowType<TColumns>,
    QueryProposalsResultSortInput,
    ProposalUnifiedFilterInput,
    GetProposalsOptions<ProposalExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, proposalConfig);
}

export type ProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> = TableApi<
  ProposalRowType<TColumns>,
  ProposalUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfiniteProposalTable<TColumns extends ProposalColumnDef[] = ProposalColumnDef[]> =
  TableApi<ProposalRowType<TColumns>, ProposalUnifiedFilterInput, CursorPaginationManager>;
