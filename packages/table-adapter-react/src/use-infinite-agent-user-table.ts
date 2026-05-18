/**
 * @fileoverview React hook for Infinite AgentUser Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteAgentUserTable as createInfiniteAgentUserTableCore,
  type InfiniteAgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteAgentUserTableResult<TColumns extends AgentUserColumnDef[]> = UseTableResult<
  AgentUserRowType<TColumns>,
  InfiniteAgentUserTable<TColumns>
>;

/**
 * React hook for an infinite scroll agentuser table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): UseInfiniteAgentUserTableResult<TColumns> {
  return useTable(() => createInfiniteAgentUserTableCore(options));
}
