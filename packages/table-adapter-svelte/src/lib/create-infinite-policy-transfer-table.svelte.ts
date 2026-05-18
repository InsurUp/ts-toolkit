/**
 * @fileoverview Svelte 5 wrapper for Infinite Policy Transfer Table
 * @description Provides createInfinitePolicyTransferTable with fine-grained reactive state using Svelte 5 runes
 *
 * Unlike createPolicyTransferTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfinitePolicyTransferTable as createInfinitePolicyTransferTableCore,
  type InfinitePolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite policy transfer table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows automatically reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfinitePolicyTransferTableInstance<TColumns extends PolicyTransferColumnDef[]> =
  TableCoreResult<PolicyTransferRowType<TColumns>, InfinitePolicyTransferTable<TColumns>>;

/**
 * Creates an infinite scroll policy transfer table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: Must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfinitePolicyTransferTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createInfinitePolicyTransferTable(() => ({
 *   columns: (col) => [col.id(), col.startDate(), col.policyCount()],
 *   fetch: (options) => client.policies.getPolicyTransfers(options),
 *   pageSize: 50,
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  getOptions: () => PolicyTransferTableOptions<TColumns>
): InfinitePolicyTransferTableInstance<TColumns> {
  return createTableCore<
    PolicyTransferRowType<TColumns>,
    PolicyTransferTableOptions<TColumns>,
    InfinitePolicyTransferTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfinitePolicyTransferTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
