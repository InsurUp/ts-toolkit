/**
 * @fileoverview Vue composable for Policy Table
 * @description Provides usePolicyTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createPolicyTable as createPolicyTableCore,
  type PolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for usePolicyTable composable
 */
export interface UsePolicyTableResult<TColumns extends PolicyColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<PolicyRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<PolicyRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: PolicyTable<TColumns>;
}

/**
 * Vue composable for creating and managing a policy table.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { usePolicyTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = usePolicyTable({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   autoFetch: true,
 * });
 * </script>
 * ```
 */
export function usePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): UsePolicyTableResult<TColumns> {
  const adapter = createPolicyTableCore(options);

  const state = shallowRef(adapter.getSnapshot());

  const unsubscribe = adapter.subscribe(() => {
    state.value = adapter.getSnapshot();
  });

  onUnmounted(() => {
    unsubscribe();
    adapter.destroy();
  });

  const initialOptions = adapter.getTableOptions();

  const reactiveData = computed(() => state.value.rows);

  const tableOptions = computed(() => {
    const adapterOptions = adapter.getTableOptions();
    return {
      ...adapterOptions,
      data: reactiveData.value,
    };
  });

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
