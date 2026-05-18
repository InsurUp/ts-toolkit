/**
 * @fileoverview Svelte 5 wrapper for Infinite Customer Table
 * @description Provides createInfiniteCustomerTable with fine-grained reactive state using Svelte 5 runes
 *
 * Unlike createCustomerTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteCustomerTable as createInfiniteCustomerTableCore,
  type InfiniteCustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite customer table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows automatically reset when filters, search, or sorting change.
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
 * For infinite scroll, use:
 * - `table.getCanNextPage()` - check if more data available
 * - `table.nextPage()` - load more rows (they accumulate in rows)
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteCustomerTableInstance<TColumns extends CustomerColumnDef[]> = TableCoreResult<
  CustomerRowType<TColumns>,
  InfiniteCustomerTable<TColumns>
>;

/**
 * Creates an infinite scroll customer table for Svelte 5 with fine-grained reactive state.
 *
 * Returns an object with individual reactive signals for optimal performance:
 * - `ct.isLoading` - only triggers re-render when loading state changes
 * - `ct.rows` - only triggers re-render when rows change (accumulated across pages)
 * - `ct.isFetching` - use with infinite scroll to show loading indicator
 * - `ct.canLoadMore` - derived: true when more data can be loaded
 *
 * Unlike createCustomerTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
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
 * import { createInfiniteCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * let columnOrder = $state(['id', 'name', 'email']);
 *
 * const ct = createInfiniteCustomerTable(() => ({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pageSize: 50,
 *   autoFetch: true,
 *   tableOptions: {
 *     state: { columnOrder },  // Reactive!
 *   },
 * }));
 *
 * onDestroy(() => ct.destroy());
 *
 * // Load more when scrolling near bottom
 * function loadMore() {
 *   if (ct.canLoadMore && !ct.isFetching) {
 *     ct.table.nextPage(); // Rows accumulate in ct.rows
 *   }
 * }
 * </script>
 *
 * <!-- Fine-grained reactivity -->
 * {#if ct.isLoading}
 *   <p>Loading...</p>
 * {:else if ct.isEmpty}
 *   <p>No data found</p>
 * {:else}
 *   <!-- ct.rows contains ALL accumulated rows -->
 *   {#each ct.rows as row}
 *     <tr>{row.name}</tr>
 *   {/each}
 *
 *   {#if ct.isFetching}
 *     <p>Loading more...</p>
 *   {/if}
 * {/if}
 * ```
 */
export function createInfiniteCustomerTable<const TColumns extends CustomerColumnDef[]>(
  getOptions: () => CustomerTableOptions<TColumns>
): InfiniteCustomerTableInstance<TColumns> {
  return createTableCore<
    CustomerRowType<TColumns>,
    CustomerTableOptions<TColumns>,
    InfiniteCustomerTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteCustomerTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
