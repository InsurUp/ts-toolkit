/**
 * @fileoverview React hook for Webhook Delivery Table
 * @description Provides useWebhookDeliveryTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createWebhookDeliveryTable as createWebhookDeliveryTableCore,
  type WebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useWebhookDeliveryTable hook
 */
export interface UseWebhookDeliveryTableResult<TColumns extends WebhookDeliveryColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<WebhookDeliveryRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<WebhookDeliveryRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: WebhookDeliveryTable<TColumns>;
}

/**
 * React hook for creating and managing a webhook delivery table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useWebhookDeliveryTable({
 *   columns: (col) => [col.id(), col.event(), col.state()],
 *   fetch: (options) => client.webhooks.getWebhookDeliveries(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function useWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): UseWebhookDeliveryTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<WebhookDeliveryTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<WebhookDeliveryTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createWebhookDeliveryTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createWebhookDeliveryTableCore(optionsRef.current);
      adapterRef.current = newAdapter;
      setAdapter(newAdapter);
      return;
    }

    return () => {
      destroyedRef.current = true;
      adapterRef.current = null;
      adapter.destroy();
    };
  }, [adapter]);

  const state = useSyncExternalStore(
    adapter.subscribe,
    adapter.getSnapshot,
    adapter.getServerSnapshot
  );

  const table = adapter.getTable();

  return {
    state,
    table,
    adapter,
  };
}
