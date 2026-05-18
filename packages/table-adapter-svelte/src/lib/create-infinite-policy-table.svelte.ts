/**
 * @fileoverview Svelte 5 wrapper for Infinite Policy Table
 * @description Provides createInfinitePolicyTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createInfinitePolicyTable as createInfinitePolicyTableCore,
  type InfinitePolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite policy table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches.
 *
 * @template TColumns - The column definitions type
 */
export type InfinitePolicyTableInstance<TColumns extends PolicyColumnDef[]> = TableCoreResult<
  PolicyRowType<TColumns>,
  InfinitePolicyTable<TColumns>
>;

/**
 * Creates an infinite scroll policy table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfinitePolicyTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createInfinitePolicyTable(() => ({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  getOptions: () => PolicyTableOptions<TColumns>
): InfinitePolicyTableInstance<TColumns> {
  return createTableCore<
    PolicyRowType<TColumns>,
    PolicyTableOptions<TColumns>,
    InfinitePolicyTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfinitePolicyTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
