/**
 * @fileoverview Svelte 5 wrapper for Infinite Proposal Table
 * @description Provides createInfiniteProposalTable with fine-grained reactive state using Svelte 5 runes
 *
 * Unlike createProposalTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteProposalTable as createInfiniteProposalTableCore,
  type InfiniteProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite proposal table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteProposalTableInstance<TColumns extends ProposalColumnDef[]> = TableCoreResult<
  ProposalRowType<TColumns>,
  InfiniteProposalTable<TColumns>
>;

/**
 * Creates an infinite scroll proposal table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfiniteProposalTable } from '@insurup/table-adapter-svelte';
 *
 * const pt = createInfiniteProposalTable(() => ({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => pt.destroy());
 * </script>
 * ```
 */
export function createInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  getOptions: () => ProposalTableOptions<TColumns>
): InfiniteProposalTableInstance<TColumns> {
  return createTableCore<
    ProposalRowType<TColumns>,
    ProposalTableOptions<TColumns>,
    InfiniteProposalTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteProposalTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
