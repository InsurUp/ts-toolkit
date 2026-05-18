/**
 * @fileoverview Vue composable for Webhook Delivery Table
 */

import { shallowRef, onUnmounted, computed, type ShallowRef } from 'vue';
import { useVueTable } from '@tanstack/vue-table';
import type { Table } from '@tanstack/vue-table';
import {
  createWebhookDeliveryTable as createWebhookDeliveryTableCore,
  type WebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

export interface UseWebhookDeliveryTableResult<TColumns extends WebhookDeliveryColumnDef[]> {
  state: ShallowRef<AdapterState<WebhookDeliveryRowType<TColumns>>>;
  table: Table<WebhookDeliveryRowType<TColumns>>;
  adapter: WebhookDeliveryTable<TColumns>;
}

/**
 * Vue composable for creating and managing a webhook delivery table.
 */
export function useWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): UseWebhookDeliveryTableResult<TColumns> {
  const adapter = createWebhookDeliveryTableCore(options);

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
