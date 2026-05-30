/**
 * @fileoverview Vue composable for Agent Branch Table — thin wrapper over `useTable`.
 */

import {
  createAgentBranchTable as createAgentBranchTableCore,
  type AgentBranchTable,
  type AgentBranchTableOptions,
  type AgentBranchColumnDef,
  type AgentBranchRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseAgentBranchTableResult<TColumns extends AgentBranchColumnDef[]> = UseTableResult<
  AgentBranchRowType<TColumns>,
  AgentBranchTable<TColumns>
>;

/**
 * Vue composable for creating and managing a agent branch table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  options: AgentBranchTableOptions<TColumns>
): UseAgentBranchTableResult<TColumns> {
  return useTable(() => createAgentBranchTableCore(options));
}
