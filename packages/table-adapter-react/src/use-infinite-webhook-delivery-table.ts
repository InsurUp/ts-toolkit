/**
 * @fileoverview React hook for Infinite Webhook Delivery Table
 * @description Provides useInfiniteWebhookDeliveryTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteWebhookDeliveryTable as createInfiniteWebhookDeliveryTableCore,
  type InfiniteWebhookDeliveryTable,
  type WebhookDeliveryTableOptions,
  type WebhookDeliveryColumnDef,
  type WebhookDeliveryRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteWebhookDeliveryTable hook
 */
export interface UseInfiniteWebhookDeliveryTableResult<
  TColumns extends WebhookDeliveryColumnDef[],
> {
  state: AdapterState<WebhookDeliveryRowType<TColumns>>;
  table: Table<WebhookDeliveryRowType<TColumns>>;
  adapter: InfiniteWebhookDeliveryTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll webhook delivery table.
 */
export function useInfiniteWebhookDeliveryTable<const TColumns extends WebhookDeliveryColumnDef[]>(
  options: WebhookDeliveryTableOptions<TColumns>
): UseInfiniteWebhookDeliveryTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfiniteWebhookDeliveryTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfiniteWebhookDeliveryTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteWebhookDeliveryTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteWebhookDeliveryTableCore(optionsRef.current);
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
