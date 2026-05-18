/**
 * @fileoverview Vue composable for Proposal Table
 * @description Provides useProposalTable composable with automatic lifecycle management
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createProposalTable as createProposalTableCore,
  type ProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useProposalTable composable
 */
export interface UseProposalTableResult<TColumns extends ProposalColumnDef[]> {
  /** Reactive adapter state (loading, error, rows, pageCount, etc.) */
  state: ShallowRef<AdapterState<ProposalRowType<TColumns>>>;
  /** TanStack Table instance with all table methods */
  table: Table<ProposalRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: ProposalTable<TColumns>;
}

/**
 * Vue composable for creating and managing a proposal table.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useProposalTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useProposalTable({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   autoFetch: true,
 * });
 * </script>
 * ```
 */
export function useProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): UseProposalTableResult<TColumns> {
  const adapter = createProposalTableCore(options);

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
