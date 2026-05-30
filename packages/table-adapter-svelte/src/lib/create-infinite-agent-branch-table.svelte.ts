/**
 * @fileoverview Svelte 5 wrapper for Infinite Agent Branch Table
 * @description Provides createInfiniteAgentBranchTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createAgentBranchTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteAgentBranchTable as createInfiniteAgentBranchTableCore,
  type InfiniteAgentBranchTable,
  type AgentBranchTableOptions,
  type AgentBranchColumnDef,
  type AgentBranchRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite agent branch table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteAgentBranchTableInstance<TColumns extends AgentBranchColumnDef[]> =
  TableCoreResult<AgentBranchRowType<TColumns>, InfiniteAgentBranchTable<TColumns>>;

/**
 * Creates an infinite scroll agent branch table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createAgentBranchTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  getOptions: () => AgentBranchTableOptions<TColumns>
): InfiniteAgentBranchTableInstance<TColumns> {
  return createTableCore<
    AgentBranchRowType<TColumns>,
    AgentBranchTableOptions<TColumns>,
    InfiniteAgentBranchTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteAgentBranchTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
