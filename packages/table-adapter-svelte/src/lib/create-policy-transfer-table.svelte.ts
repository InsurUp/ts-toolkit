/**
 * @fileoverview Svelte 5 wrapper for Policy Transfer Table
 * @description Provides createPolicyTransferTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createPolicyTransferTable as createPolicyTransferTableCore,
  type PolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Policy transfer table instance for Svelte 5 with fine-grained reactive state.
 *
 * Column visibility is managed via TanStack Table API directly:
 * - `table.setColumnVisibility({ columnKey: false })` to hide a column
 * - `table.getColumn('columnKey')?.toggleVisibility()` to toggle
 *
 * The adapter automatically syncs visibility with GraphQL select fields.
 *
 * @template TColumns - The column definitions type
 */
export type PolicyTransferTableInstance<TColumns extends PolicyTransferColumnDef[]> =
  TableCoreResult<PolicyTransferRowType<TColumns>, PolicyTransferTable<TColumns>>;

/**
 * Creates a policy transfer table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: Must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createPolicyTransferTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createPolicyTransferTable(() => ({
 *   columns: (col) => [col.id(), col.startDate(), col.succeededPolicyCount()],
 *   fetch: (options) => client.policies.getPolicyTransfers(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createPolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  getOptions: () => PolicyTransferTableOptions<TColumns>
): PolicyTransferTableInstance<TColumns> {
  return createTableCore<
    PolicyTransferRowType<TColumns>,
    PolicyTransferTableOptions<TColumns>,
    PolicyTransferTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createPolicyTransferTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
