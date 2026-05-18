/**
 * @fileoverview Svelte 5 wrapper for Customer Table
 * @description Provides createCustomerTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Customer table instance for Svelte 5 with fine-grained reactive state.
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
export type CustomerTableInstance<TColumns extends CustomerColumnDef[]> = TableCoreResult<
  CustomerRowType<TColumns>,
  CustomerTable<TColumns>
>;

/**
 * Creates a customer table for Svelte 5 with fine-grained reactive state.
 *
 * Returns an object with individual reactive signals for optimal performance:
 * - `ct.isLoading` - only triggers re-render when loading state changes
 * - `ct.rows` - only triggers re-render when rows change
 * - `ct.error` - only triggers re-render when error changes
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 * When tableOptions.state changes (e.g., columnOrder), the table is automatically updated.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component (e.g., in a plain `.ts` file or at module level)
 * will cause memory leaks as the internal `$effect` cleanup will never run.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * let columnOrder = $state(['id', 'name', 'email']);
 *
 * const ct = createCustomerTable(() => ({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 *   tableOptions: {
 *     state: { columnOrder },  // Reactive!
 *   },
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 *
 * <!-- Fine-grained reactivity - spinner only re-renders when isLoading changes -->
 * {#if ct.isLoading}
 *   <p>Loading...</p>
 * {:else if ct.isEmpty}
 *   <p>No data found</p>
 * {:else}
 *   {#each ct.table.getRowModel().rows as row}
 *     <tr>{row.id}</tr>
 *   {/each}
 * {/if}
 * ```
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  getOptions: () => CustomerTableOptions<TColumns>
): CustomerTableInstance<TColumns> {
  return createTableCore<
    CustomerRowType<TColumns>,
    CustomerTableOptions<TColumns>,
    CustomerTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createCustomerTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
