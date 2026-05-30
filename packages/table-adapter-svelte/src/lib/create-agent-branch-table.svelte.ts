/**
 * @fileoverview Svelte 5 wrapper for Agent Branch Table
 * @description Provides createAgentBranchTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createAgentBranchTable as createAgentBranchTableCore,
  type AgentBranchTable,
  type AgentBranchTableOptions,
  type AgentBranchColumnDef,
  type AgentBranchRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Agent Branch table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type AgentBranchTableInstance<TColumns extends AgentBranchColumnDef[]> = TableCoreResult<
  AgentBranchRowType<TColumns>,
  AgentBranchTable<TColumns>
>;

/**
 * Creates a agent branch table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  getOptions: () => AgentBranchTableOptions<TColumns>
): AgentBranchTableInstance<TColumns> {
  return createTableCore<
    AgentBranchRowType<TColumns>,
    AgentBranchTableOptions<TColumns>,
    AgentBranchTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createAgentBranchTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
