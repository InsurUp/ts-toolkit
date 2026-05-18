/**
 * @fileoverview Svelte 5 wrapper for Policy Table
 * @description Provides createPolicyTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createPolicyTable as createPolicyTableCore,
  type PolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Policy table instance for Svelte 5 with fine-grained reactive state.
 *
 * @template TColumns - The column definitions type
 */
export type PolicyTableInstance<TColumns extends PolicyColumnDef[]> = TableCoreResult<
  PolicyRowType<TColumns>,
  PolicyTable<TColumns>
>;

/**
 * Creates a policy table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createPolicyTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createPolicyTable(() => ({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createPolicyTable<const TColumns extends PolicyColumnDef[]>(
  getOptions: () => PolicyTableOptions<TColumns>
): PolicyTableInstance<TColumns> {
  return createTableCore<
    PolicyRowType<TColumns>,
    PolicyTableOptions<TColumns>,
    PolicyTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createPolicyTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
