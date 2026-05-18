/**
 * @fileoverview React hook for Infinite Policy Transfer Table
 * @description Provides useInfinitePolicyTransferTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfinitePolicyTransferTable as createInfinitePolicyTransferTableCore,
  type InfinitePolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfinitePolicyTransferTable hook
 */
export interface UseInfinitePolicyTransferTableResult<TColumns extends PolicyTransferColumnDef[]> {
  state: AdapterState<PolicyTransferRowType<TColumns>>;
  table: Table<PolicyTransferRowType<TColumns>>;
  adapter: InfinitePolicyTransferTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll policy transfer table.
 */
export function useInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): UseInfinitePolicyTransferTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfinitePolicyTransferTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfinitePolicyTransferTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfinitePolicyTransferTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfinitePolicyTransferTableCore(optionsRef.current);
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
