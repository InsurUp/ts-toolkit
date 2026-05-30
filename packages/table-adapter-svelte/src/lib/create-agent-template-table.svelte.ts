/**
 * @fileoverview Svelte 5 wrapper for Agent Template Table
 * @description Provides createAgentTemplateTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createAgentTemplateTable as createAgentTemplateTableCore,
  type AgentTemplateTable,
  type AgentTemplateTableOptions,
  type AgentTemplateColumnDef,
  type AgentTemplateRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Agent Template table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type AgentTemplateTableInstance<TColumns extends AgentTemplateColumnDef[]> = TableCoreResult<
  AgentTemplateRowType<TColumns>,
  AgentTemplateTable<TColumns>
>;

/**
 * Creates a agent template table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  getOptions: () => AgentTemplateTableOptions<TColumns>
): AgentTemplateTableInstance<TColumns> {
  return createTableCore<
    AgentTemplateRowType<TColumns>,
    AgentTemplateTableOptions<TColumns>,
    AgentTemplateTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createAgentTemplateTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
