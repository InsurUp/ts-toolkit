/**
 * @fileoverview React hook for Infinite Proposal Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteProposalTable as createInfiniteProposalTableCore,
  type InfiniteProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteProposalTableResult<TColumns extends ProposalColumnDef[]> = UseTableResult<
  ProposalRowType<TColumns>,
  InfiniteProposalTable<TColumns>
>;

/**
 * React hook for an infinite scroll proposal table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): UseInfiniteProposalTableResult<TColumns> {
  return useTable(() => createInfiniteProposalTableCore(options));
}
