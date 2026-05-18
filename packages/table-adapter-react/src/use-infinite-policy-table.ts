/**
 * @fileoverview React hook for Infinite Policy Table
 * @description Provides useInfinitePolicyTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfinitePolicyTable as createInfinitePolicyTableCore,
  type InfinitePolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfinitePolicyTable hook
 */
export interface UseInfinitePolicyTableResult<TColumns extends PolicyColumnDef[]> {
  state: AdapterState<PolicyRowType<TColumns>>;
  table: Table<PolicyRowType<TColumns>>;
  adapter: InfinitePolicyTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll policy table.
 */
export function useInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): UseInfinitePolicyTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfinitePolicyTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfinitePolicyTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfinitePolicyTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfinitePolicyTableCore(optionsRef.current);
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
