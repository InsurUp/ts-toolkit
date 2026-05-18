/**
 * @fileoverview Svelte 5 wrapper for Infinite Agent User Table
 * @description Provides createInfiniteAgentUserTable with fine-grained reactive state using Svelte 5 runes
 *
 * Unlike createAgentUserTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteAgentUserTable as createInfiniteAgentUserTableCore,
  type InfiniteAgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite agent user table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows automatically reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteAgentUserTableInstance<TColumns extends AgentUserColumnDef[]> = TableCoreResult<
  AgentUserRowType<TColumns>,
  InfiniteAgentUserTable<TColumns>
>;

/**
 * Creates an infinite scroll agent user table for Svelte 5 with fine-grained reactive state.
 *
 * Returns an object with individual reactive signals for optimal performance.
 *
 * Unlike createAgentUserTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfiniteAgentUserTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createInfiniteAgentUserTable(() => ({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   pageSize: 50,
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createInfiniteAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  getOptions: () => AgentUserTableOptions<TColumns>
): InfiniteAgentUserTableInstance<TColumns> {
  return createTableCore<
    AgentUserRowType<TColumns>,
    AgentUserTableOptions<TColumns>,
    InfiniteAgentUserTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteAgentUserTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
