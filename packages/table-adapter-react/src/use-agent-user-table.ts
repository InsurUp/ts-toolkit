/**
 * @fileoverview React hook for AgentUser Table — thin wrapper over `useTable`.
 */

import {
  createAgentUserTable as createAgentUserTableCore,
  type AgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseAgentUserTableResult<TColumns extends AgentUserColumnDef[]> = UseTableResult<
  AgentUserRowType<TColumns>,
  AgentUserTable<TColumns>
>;

/**
 * React hook for creating and managing a agentuser table.
 * See `useTable` for the underlying primitive.
 */
export function useAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): UseAgentUserTableResult<TColumns> {
  return useTable(() => createAgentUserTableCore(options));
}
