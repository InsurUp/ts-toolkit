/**
 * @fileoverview React hook for Proposal Table — thin wrapper over `useTable`.
 */

import {
  createProposalTable as createProposalTableCore,
  type ProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseProposalTableResult<TColumns extends ProposalColumnDef[]> = UseTableResult<
  ProposalRowType<TColumns>,
  ProposalTable<TColumns>
>;

/**
 * React hook for creating and managing a proposal table.
 * See `useTable` for the underlying primitive.
 */
export function useProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): UseProposalTableResult<TColumns> {
  return useTable(() => createProposalTableCore(options));
}
