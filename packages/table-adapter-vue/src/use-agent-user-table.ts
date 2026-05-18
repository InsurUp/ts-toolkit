/**
 * @fileoverview Vue composable for Agent User Table
 * @description Provides useAgentUserTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createAgentUserTable as createAgentUserTableCore,
  type AgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useAgentUserTable composable
 */
export interface UseAgentUserTableResult<TColumns extends AgentUserColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<AgentUserRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<AgentUserRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: AgentUserTable<TColumns>;
}

/**
 * Vue composable for creating and managing an agent user table
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
 * import { useAgentUserTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useAgentUserTable({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   autoFetch: true,
 * });
 * </script>
 * ```
 */
export function useAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): UseAgentUserTableResult<TColumns> {
  // Create adapter
  const adapter = createAgentUserTableCore(options);

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
  const reactiveData = computed(() => state.value.rows);

  // Create reactive table options computed
  const tableOptions = computed(() => {
    const adapterOptions = adapter.getTableOptions();
    return {
      ...adapterOptions,
      // Override data with our reactive computed to ensure Vue reactivity
      data: reactiveData.value,
    };
  });

  // Create TanStack Table instance with reactive options
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
      return state.value.pageCount ?? undefined;
    },
    get rowCount() {
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
