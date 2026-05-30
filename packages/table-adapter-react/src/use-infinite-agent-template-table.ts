/**
 * @fileoverview React hook for Infinite Agent Template Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteAgentTemplateTable as createInfiniteAgentTemplateTableCore,
  type InfiniteAgentTemplateTable,
  type AgentTemplateTableOptions,
  type AgentTemplateColumnDef,
  type AgentTemplateRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteAgentTemplateTableResult<TColumns extends AgentTemplateColumnDef[]> =
  UseTableResult<AgentTemplateRowType<TColumns>, InfiniteAgentTemplateTable<TColumns>>;

/**
 * React hook for an infinite scroll agent template table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  options: AgentTemplateTableOptions<TColumns>
): UseInfiniteAgentTemplateTableResult<TColumns> {
  return useTable(() => createInfiniteAgentTemplateTableCore(options));
}
