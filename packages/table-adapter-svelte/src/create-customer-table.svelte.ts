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
 * Return type for createCustomerTable (Svelte 5)
 */
export interface CustomerTableResult<TColumns extends CustomerColumnDef[]> {
  /** Get current adapter state */
  readonly state: AdapterState<CustomerRowType<TColumns>>;
  /** TanStack Table instance */
  readonly table: Table<CustomerRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  readonly adapter: CustomerTable<TColumns>;
  /** Subscribe to state changes */
  subscribe: (run: (state: AdapterState<CustomerRowType<TColumns>>) => void) => () => void;
  /** Cleanup function - call on component destroy */
  destroy: () => void;
}

/**
 * Creates a customer table for Svelte 5
 *
 * Uses @tanstack/table-core directly for Svelte 5 compatibility.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * const customerTable = createCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 *
 * onDestroy(() => customerTable.destroy());
 *
 * // Access state and table directly
 * $: state = customerTable.state;
 * $: table = customerTable.table;
 * </script>
 *
 * {#if state.isLoading}
 *   <p>Loading...</p>
 * {:else if state.error}
 *   <p>Error: {state.error.message}</p>
 * {:else}
 *   <table>
 *     <thead>
 *       {#each table.getHeaderGroups() as headerGroup}
 *         <tr>
 *           {#each headerGroup.headers as header}
 *             <th>{header.column.columnDef.header}</th>
 *           {/each}
 *         </tr>
 *       {/each}
 *     </thead>
 *     <tbody>
 *       {#each table.getRowModel().rows as row}
 *         <tr>
 *           {#each row.getVisibleCells() as cell}
 *             <td>{cell.getValue()}</td>
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
): CustomerTableResult<TColumns> {
  // Create the core adapter
  const adapter = createCustomerTableCore(options);

  // Track current state
  let currentState = adapter.getSnapshot();

  // Store listeners for Svelte store contract
  const listeners = new Set<(state: AdapterState<CustomerRowType<TColumns>>) => void>();

  // Get table options from adapter (includes getCoreRowModel, data, columns, state)
  const adapterOptions = adapter.getTableOptions();

  // Create table options for table-core
  const tableOptions: TableOptionsResolved<CustomerRowType<TColumns>> = {
    ...adapterOptions,
    onStateChange: () => {
      // Notify listeners when table state changes
      notifyListeners();
    },
    renderFallbackValue: null,
  } as TableOptionsResolved<CustomerRowType<TColumns>>;

  // Create TanStack Table instance
  const table = createTable(tableOptions);

  // Function to notify all listeners
  const notifyListeners = () => {
    listeners.forEach((listener) => listener(currentState));
  };

  // Subscribe to adapter state changes
  const adapterUnsubscribe = adapter.subscribe(() => {
    currentState = adapter.getSnapshot();
    // Update table options when adapter state changes
    const newOptions = adapter.getTableOptions();
    table.setOptions((prev) => ({
      ...prev,
      ...newOptions,
      state: {
        ...prev.state,
        ...newOptions.state,
      },
    }));
    notifyListeners();
  });

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
    get table() {
      return table;
    },
    adapter,
    subscribe,
    destroy,
  };
}
