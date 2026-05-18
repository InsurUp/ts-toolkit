/**
 * @fileoverview Vue composable for File Policy Transfer Table
 * @description Provides useFilePolicyTransferTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createFilePolicyTransferTable as createFilePolicyTransferTableCore,
  type FilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useFilePolicyTransferTable composable
 */
export interface UseFilePolicyTransferTableResult<TColumns extends FilePolicyTransferColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<FilePolicyTransferRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<FilePolicyTransferRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: FilePolicyTransferTable<TColumns>;
}

/**
 * Vue composable for creating and managing a file policy transfer table
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useFilePolicyTransferTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useFilePolicyTransferTable({
 *   columns: (col) => [col.id(), col.fileName(), col.createdAt()],
 *   fetch: (options) => client.policies.getFilePolicyTransfers(options),
 *   autoFetch: true,
 * });
 * </script>
 * ```
 */
export function useFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): UseFilePolicyTransferTableResult<TColumns> {
  // Create adapter
  const adapter = createFilePolicyTransferTableCore(options);

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
