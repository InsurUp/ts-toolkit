/**
 * @fileoverview Proposal Entity Exports
 */

export {
  createProposalTable,
  createInfiniteProposalTable,
  type ProposalTable,
  type InfiniteProposalTable,
} from './factory.js';

export type {
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
  ProposalFilterInput,
  ProposalSearchInput,
} from './types.js';
