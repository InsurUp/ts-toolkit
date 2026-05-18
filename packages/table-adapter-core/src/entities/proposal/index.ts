/**
 * @fileoverview Proposal Entity Exports
 */

export { createProposalTable, type ProposalTable } from './factory.js';
export { createInfiniteProposalTable, type InfiniteProposalTable } from './infinite-factory.js';

export type {
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
  ProposalFilterInput,
  ProposalSearchInput,
  // Re-export SDK types for convenience
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
} from './types.js';
