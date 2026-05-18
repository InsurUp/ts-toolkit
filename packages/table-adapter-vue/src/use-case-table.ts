/**
 * @fileoverview Vue composable for Case Table
 * @description Provides useCaseTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createCaseTable as createCaseTableCore,
  type CaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useCaseTable composable
 */
export interface UseCaseTableResult<TColumns extends CaseColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<CaseRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<CaseRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: CaseTable<TColumns>;
}

/**
 * Vue composable for creating and managing a case table.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCaseTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useCaseTable({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   autoFetch: true,
 * });
 * </script>
 * ```
 */
export function useCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): UseCaseTableResult<TColumns> {
  const adapter = createCaseTableCore(options);

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
