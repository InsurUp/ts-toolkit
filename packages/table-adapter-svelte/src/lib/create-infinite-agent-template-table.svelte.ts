/**
 * @fileoverview Svelte 5 wrapper for Infinite Agent Template Table
 * @description Provides createInfiniteAgentTemplateTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createAgentTemplateTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteAgentTemplateTable as createInfiniteAgentTemplateTableCore,
  type InfiniteAgentTemplateTable,
  type AgentTemplateTableOptions,
  type AgentTemplateColumnDef,
  type AgentTemplateRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite agent template table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteAgentTemplateTableInstance<TColumns extends AgentTemplateColumnDef[]> =
  TableCoreResult<AgentTemplateRowType<TColumns>, InfiniteAgentTemplateTable<TColumns>>;

/**
 * Creates an infinite scroll agent template table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createAgentTemplateTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  getOptions: () => AgentTemplateTableOptions<TColumns>
): InfiniteAgentTemplateTableInstance<TColumns> {
  return createTableCore<
    AgentTemplateRowType<TColumns>,
    AgentTemplateTableOptions<TColumns>,
    InfiniteAgentTemplateTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteAgentTemplateTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
