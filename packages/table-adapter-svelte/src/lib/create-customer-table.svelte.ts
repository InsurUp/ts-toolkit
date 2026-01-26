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
 *
 * The `state` property is reactive via `$state` - access it directly in templates.
 * No subscription needed!
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
export class CustomerTableInstance<TColumns extends CustomerColumnDef[]> {
  /** Reactive adapter state - automatically triggers re-renders */
  state!: AdapterState<CustomerRowType<TColumns>>;

  /** Raw adapter for advanced use (setFilter, setSearch, invalidate, etc.) */
  readonly adapter: CustomerTable<TColumns>;

  /** TanStack Table instance */
  readonly table: Table<CustomerRowType<TColumns>>;

  /** Unsubscribe function for cleanup */
  #unsubscribe: () => void;

  constructor(options: CustomerTableOptions<TColumns>) {
    // Create the core adapter
    this.adapter = createCustomerTableCore(options);

    // Initialize reactive state from adapter snapshot
    this.state = $state.raw(this.adapter.getSnapshot());

    // Get table options from adapter (includes getCoreRowModel, data, columns, state)
    const adapterOptions = this.adapter.getTableOptions();

    // Create table options for table-core
    const tableOptions: TableOptionsResolved<CustomerRowType<TColumns>> = {
      ...adapterOptions,
      onStateChange: () => {
        // Table state changed - update reactive state
        this.state = this.adapter.getSnapshot();
      },
      renderFallbackValue: null,
    } as TableOptionsResolved<CustomerRowType<TColumns>>;

    // Create TanStack Table instance
    this.table = createTable(tableOptions);

    // Subscribe to adapter state changes
    this.#unsubscribe = this.adapter.subscribe(() => {
      this.state = this.adapter.getSnapshot();
      this.#syncTableOptions();
    });
  }

  /** Syncs table options when adapter state changes */
  #syncTableOptions(): void {
    const newOptions = this.adapter.getTableOptions();
    this.table.setOptions((prev) => ({
      ...prev,
      ...newOptions,
      state: { ...prev.state, ...newOptions.state },
    }));
  }

  /** Cleanup function - call in onDestroy */
  destroy(): void {
    this.#unsubscribe();
    this.adapter.destroy();
  }
}

/**
 * Creates a customer table for Svelte 5 with reactive state.
 *
 * Returns a `CustomerTableInstance` with reactive `state` property.
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
  return new CustomerTableInstance(options);
}
