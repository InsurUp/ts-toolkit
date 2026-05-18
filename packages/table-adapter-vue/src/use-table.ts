/**
 * @fileoverview Generic Vue composable for any entity table adapter.
 *
 * Per-entity composables (`useCustomerTable`, `usePolicyTable`, …) are thin
 * wrappers around this primitive. The primitive owns the Vue-specific
 * lifecycle (shallowRef subscription, onUnmounted cleanup, reactive
 * useVueTable wiring).
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable, type Table } from '@tanstack/vue-table';
import type { AdapterState, TableOptions } from '@insurup/table-adapter-core';

interface TableApiMin<TRow> {
  subscribe(listener: () => void): () => void;
  getSnapshot(): AdapterState<TRow>;
  getTableOptions(): TableOptions<TRow>;
  destroy(): void;
}

export interface UseTableResult<TRow, TAdapter extends TableApiMin<TRow>> {
  /** Reactive adapter state (loading, error, rows, pageCount, …). */
  state: ShallowRef<AdapterState<TRow>>;
  /** TanStack Table instance with all table methods. */
  table: Table<TRow>;
  /** Raw adapter for advanced use (setFilter, invalidate, …). */
  adapter: TAdapter;
}

/**
 * Create and manage any entity table adapter with Vue reactivity.
 *
 * Pass a thunk that builds the adapter — `useTable` runs it once, subscribes
 * via `shallowRef`, and destroys on unmount.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { state, table, adapter } = useTable(() =>
 *   createCustomerTable({ columns, fetch, autoFetch: true })
 * );
 * </script>
 * ```
 */
export function useTable<TRow, TAdapter extends TableApiMin<TRow>>(
  createAdapter: () => TAdapter
): UseTableResult<TRow, TAdapter> {
  const adapter = createAdapter();
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
      return adapter.getTableOptions().state;
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
