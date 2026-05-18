/**
 * @fileoverview Svelte 5 wrapper for Proposal Table
 * @description Provides createProposalTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createProposalTable as createProposalTableCore,
  type ProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Proposal table instance for Svelte 5 with fine-grained reactive state.
 *
 * @template TColumns - The column definitions type
 */
export type ProposalTableInstance<TColumns extends ProposalColumnDef[]> = TableCoreResult<
  ProposalRowType<TColumns>,
  ProposalTable<TColumns>
>;

/**
 * Creates a proposal table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createProposalTable } from '@insurup/table-adapter-svelte';
 *
 * const pt = createProposalTable(() => ({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => pt.destroy());
 * </script>
 * ```
 */
export function createProposalTable<const TColumns extends ProposalColumnDef[]>(
  getOptions: () => ProposalTableOptions<TColumns>
): ProposalTableInstance<TColumns> {
  return createTableCore<
    ProposalRowType<TColumns>,
    ProposalTableOptions<TColumns>,
    ProposalTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createProposalTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
