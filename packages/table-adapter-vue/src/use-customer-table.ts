/**
 * @fileoverview Vue composable for Customer Table
 * @description Provides useCustomerTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useCustomerTable composable
 */
export interface UseCustomerTableResult<TColumns extends CustomerColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<CustomerRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<CustomerRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: CustomerTable<TColumns>;
}

/**
 * Vue composable for creating and managing a customer table
 *
 * Handles:
 * - Adapter creation
 * - Reactive state via shallowRef
 * - State subscription
 * - Cleanup on unmount
 * - TanStack Table instance creation with reactive data
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCustomerTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 * </script>
 *
 * <template>
 *   <div v-if="state.isLoading">Loading...</div>
 *   <div v-else-if="state.error">Error: {{ state.error.message }}</div>
 *   <table v-else>
 *     <thead>
 *       <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
 *         <th v-for="header in headerGroup.headers" :key="header.id">
 *           <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
 *         </th>
 *       </tr>
 *     </thead>
 *     <tbody>
 *       <tr v-for="row in table.getRowModel().rows" :key="row.id">
 *         <td v-for="cell in row.getVisibleCells()" :key="cell.id">
 *           <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
 *         </td>
 *       </tr>
 *     </tbody>
 *   </table>
 * </template>
 * ```
 */
export function useCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): UseCustomerTableResult<TColumns> {
  // Create adapter
  const adapter = createCustomerTableCore(options);

  // Create reactive state using shallowRef (better perf than deep ref)
  const state = shallowRef(adapter.getSnapshot());

  // Subscribe to adapter state changes
  const unsubscribe = adapter.subscribe(() => {
    state.value = adapter.getSnapshot();
  });

  // Cleanup on unmount
  onUnmounted(() => {
    unsubscribe();
    adapter.destroy();
  });

  // Get initial table options from adapter
  const initialOptions = adapter.getTableOptions();

  // Create reactive data ref that updates when state changes
  // useVueTable (v8.20.0+) supports reactive refs for the data option
  const reactiveData = computed(() => state.value.rows);

  // Create reactive table options computed
  // This ensures table state (sorting, pagination) stays in sync with adapter
  const tableOptions = computed(() => {
    const adapterOptions = adapter.getTableOptions();
    return {
      ...adapterOptions,
      // Override data with our reactive computed to ensure Vue reactivity
      data: reactiveData.value,
    };
  });

  // Create TanStack Table instance with reactive options
  // Pass individual reactive properties for proper Vue reactivity
  const table = useVueTable({
    get columns() {
      return initialOptions.columns;
    },
    get data() {
      return reactiveData.value;
    },
    get getCoreRowModel() {
      return initialOptions.getCoreRowModel;
    },
    get manualPagination() {
      return true;
    },
    get manualSorting() {
      return true;
    },
    get pageCount() {
      // TanStack Table expects undefined, not null
      return state.value.pageCount ?? undefined;
    },
    get rowCount() {
      // TanStack Table expects undefined, not null
      return state.value.rowCount ?? undefined;
    },
    get state() {
      return tableOptions.value.state;
    },
    get onSortingChange() {
      return initialOptions.onSortingChange;
    },
    get onPaginationChange() {
      return initialOptions.onPaginationChange;
    },
  });

  return {
    state,
    table,
    adapter,
  };
}
