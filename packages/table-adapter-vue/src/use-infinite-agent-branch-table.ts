/**
 * @fileoverview Vue composable for Infinite Agent Branch Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteAgentBranchTable as createInfiniteAgentBranchTableCore,
  type InfiniteAgentBranchTable,
  type AgentBranchTableOptions,
  type AgentBranchColumnDef,
  type AgentBranchRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteAgentBranchTableResult<TColumns extends AgentBranchColumnDef[]> =
  UseTableResult<AgentBranchRowType<TColumns>, InfiniteAgentBranchTable<TColumns>>;

/**
 * Vue composable for an infinite scroll agent branch table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  options: AgentBranchTableOptions<TColumns>
): UseInfiniteAgentBranchTableResult<TColumns> {
  return useTable(() => createInfiniteAgentBranchTableCore(options));
}
