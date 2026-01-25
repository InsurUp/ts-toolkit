/**
 * @fileoverview Svelte wrapper for Customer Table
 * @description Provides createCustomerTable with reactive state via getters
 */

import { createSvelteTable, type TableOptions } from '@tanstack/svelte-table';
import type { Readable } from 'svelte/store';
import type { Table } from '@tanstack/table-core';
import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for createCustomerTable (Svelte)
 */
export interface CustomerTableStore<TColumns extends CustomerColumnDef[]> {
  /** Get current adapter state */
  readonly state: AdapterState<CustomerRowType<TColumns>>;
  /** TanStack Table store (Svelte Readable) */
  readonly table: Readable<Table<CustomerRowType<TColumns>>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  readonly adapter: CustomerTable<TColumns>;
  /** Subscribe to state changes (Svelte store contract) */
  subscribe: (run: (state: AdapterState<CustomerRowType<TColumns>>) => void) => () => void;
  /** Cleanup function - call on component destroy */
  destroy: () => void;
}

/**
 * Creates a customer table for Svelte
 *
 * Returns an object with:
 * - `state` getter for current adapter state
 * - `table` Svelte store for TanStack Table
 * - `adapter` for advanced use
 * - `subscribe` for Svelte store contract (use with $: syntax or $store)
 * - `destroy` for cleanup
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 * import { FlexRender } from '@tanstack/svelte-table';
 *
 * const customerTable = createCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 *
 * // Cleanup on unmount
 * onDestroy(() => customerTable.destroy());
 *
 * // For Svelte 5 runes: use $state
 * let state = $state(customerTable.state);
 * customerTable.subscribe(s => state = s);
 *
 * // For Svelte 4: use reactive statement
 * // $: state = customerTable.state;
 *
 * // Table is a Svelte store
 * const { table } = customerTable;
 * </script>
 *
 * {#if state.isLoading}
 *   <p>Loading...</p>
 * {:else if state.error}
 *   <p>Error: {state.error.message}</p>
 * {:else}
 *   <table>
 *     <thead>
 *       {#each $table.getHeaderGroups() as headerGroup}
 *         <tr>
 *           {#each headerGroup.headers as header}
 *             <th>
 *               <FlexRender content={header.column.columnDef.header} context={header.getContext()} />
 *             </th>
 *           {/each}
 *         </tr>
 *       {/each}
 *     </thead>
 *     <tbody>
 *       {#each $table.getRowModel().rows as row}
 *         <tr>
 *           {#each row.getVisibleCells() as cell}
 *             <td>
 *               <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
 *             </td>
 *           {/each}
 *         </tr>
 *       {/each}
 *     </tbody>
 *   </table>
 * {/if}
 * ```
 */
export function createCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): CustomerTableStore<TColumns> {
  // Create the core adapter
  const adapter = createCustomerTableCore(options);

  // Track current state
  let currentState = adapter.getSnapshot();

  // Store listeners for Svelte store contract
  const listeners = new Set<(state: AdapterState<CustomerRowType<TColumns>>) => void>();

  // Subscribe to adapter state changes
  const adapterUnsubscribe = adapter.subscribe(() => {
    currentState = adapter.getSnapshot();
    listeners.forEach((listener) => listener(currentState));
  });

  // Create TanStack Table store
  const table = createSvelteTable(
    adapter.getTableOptions() as TableOptions<CustomerRowType<TColumns>>
  );

  // Subscribe function for Svelte store contract
  const subscribe = (run: (state: AdapterState<CustomerRowType<TColumns>>) => void) => {
    listeners.add(run);
    run(currentState); // Immediately call with current value
    return () => {
      listeners.delete(run);
    };
  };

  // Cleanup function
  const destroy = () => {
    adapterUnsubscribe();
    adapter.destroy();
    listeners.clear();
  };

  return {
    get state() {
      return currentState;
    },
    table,
    adapter,
    subscribe,
    destroy,
  };
}
