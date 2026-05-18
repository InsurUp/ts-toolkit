/**
 * @fileoverview Svelte 5 wrapper for Agent User Table
 * @description Provides createAgentUserTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createAgentUserTable as createAgentUserTableCore,
  type AgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Agent user table instance for Svelte 5 with fine-grained reactive state.
 *
 * Provides fine-grained state signals (isLoading, rows, etc.) for optimal
 * re-render performance.
 *
 * Column visibility is managed via TanStack Table API directly:
 * - `table.setColumnVisibility({ columnKey: false })` to hide a column
 * - `table.getColumn('columnKey')?.toggleVisibility()` to toggle
 *
 * The adapter automatically syncs visibility with GraphQL select fields.
 *
 * @template TColumns - The column definitions type
 */
export type AgentUserTableInstance<TColumns extends AgentUserColumnDef[]> = TableCoreResult<
  AgentUserRowType<TColumns>,
  AgentUserTable<TColumns>
>;

/**
 * Creates an agent user table for Svelte 5 with fine-grained reactive state.
 *
 * Returns an object with individual reactive signals for optimal performance:
 * - `ct.isLoading` - only triggers re-render when loading state changes
 * - `ct.rows` - only triggers re-render when rows change
 * - `ct.error` - only triggers re-render when error changes
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createAgentUserTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createAgentUserTable(() => ({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  getOptions: () => AgentUserTableOptions<TColumns>
): AgentUserTableInstance<TColumns> {
  return createTableCore<
    AgentUserRowType<TColumns>,
    AgentUserTableOptions<TColumns>,
    AgentUserTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createAgentUserTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
