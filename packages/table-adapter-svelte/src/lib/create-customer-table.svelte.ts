/**
 * @fileoverview Svelte 5 wrapper for Customer Table
 * @description Provides createCustomerTable using @tanstack/table-core directly with Svelte 5 runes
 */

import {
  createTable,
  type Table,
  type TableOptionsResolved,
} from '@tanstack/table-core';
import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Customer table instance for Svelte 5 with reactive state.
 */
export interface CustomerTableInstance<TColumns extends CustomerColumnDef[]> {
  /** Reactive adapter state - automatically triggers re-renders */
  readonly state: AdapterState<CustomerRowType<TColumns>>;

  /** Raw adapter for advanced use (setFilter, setSearch, invalidate, etc.) */
  readonly adapter: CustomerTable<TColumns>;

  /** TanStack Table instance - call methods like nextPage(), getRowModel(), etc. */
  readonly table: Table<CustomerRowType<TColumns>>;

  /** Cleanup function - call in onDestroy */
  destroy(): void;
}

/**
 * Creates a customer table for Svelte 5 with reactive state.
 *
 * Returns an object with reactive `state` property that triggers re-renders.
 * Access `ct.state` directly in templates - no subscription needed!
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 *
 * onDestroy(() => ct.destroy());
 * </script>
 *
 * {#if ct.state.isLoading}
 *   <p>Loading...</p>
 * {:else}
 *   {#each ct.table.getRowModel().rows as row}
 *     <tr>{row.id}</tr>
 *   {/each}
 * {/if}
 * ```
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): CustomerTableInstance<TColumns> {
  // Create the core adapter
  const adapter = createCustomerTableCore(options);

  // Reactive state - this is properly transformed by Svelte compiler
  // because it's at the top level of a function (not in a constructor)
  let state = $state.raw(adapter.getSnapshot());

  // Get table options from adapter (includes getCoreRowModel, data, columns, state)
  const adapterOptions = adapter.getTableOptions();

  // Create table options for table-core
  const tableOptions: TableOptionsResolved<CustomerRowType<TColumns>> = {
    ...adapterOptions,
    onStateChange: () => {
      // Table state changed - update reactive state
      state = adapter.getSnapshot();
    },
    renderFallbackValue: null,
  } as TableOptionsResolved<CustomerRowType<TColumns>>;

  // Create TanStack Table instance
  const table = createTable(tableOptions);

  // Sync table options when adapter state changes
  function syncTableOptions(): void {
    const newOptions = adapter.getTableOptions();
    table.setOptions((prev) => ({
      ...prev,
      ...newOptions,
      state: { ...prev.state, ...newOptions.state },
    }));
  }

  // Subscribe to adapter state changes
  const unsubscribe = adapter.subscribe(() => {
    state = adapter.getSnapshot();
    syncTableOptions();
  });

  // Cleanup function
  function destroy(): void {
    unsubscribe();
    adapter.destroy();
  }

  // Return object with getters for reactivity
  // The table getter reads state to create a Svelte dependency.
  // This ensures template re-renders when state changes, even when
  // accessing table methods like getRowModel() or getHeaderGroups().
  return {
    get state() {
      return state;
    },
    adapter,
    get table() {
      // Reading state creates a Svelte reactivity dependency.
      // When state changes, Svelte re-runs code that accessed ct.table.
      void state;
      return table;
    },
    destroy,
  };
}
