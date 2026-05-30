/**
 * @fileoverview React hook for Agent Template Table — thin wrapper over `useTable`.
 */

import {
  createAgentTemplateTable as createAgentTemplateTableCore,
  type AgentTemplateTable,
  type AgentTemplateTableOptions,
  type AgentTemplateColumnDef,
  type AgentTemplateRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseAgentTemplateTableResult<TColumns extends AgentTemplateColumnDef[]> = UseTableResult<
  AgentTemplateRowType<TColumns>,
  AgentTemplateTable<TColumns>
>;

/**
 * React hook for creating and managing a agent template table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  options: AgentTemplateTableOptions<TColumns>
): UseAgentTemplateTableResult<TColumns> {
  return useTable(() => createAgentTemplateTableCore(options));
}
