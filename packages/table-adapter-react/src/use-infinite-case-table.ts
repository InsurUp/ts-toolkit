/**
 * @fileoverview React hook for Infinite Case Table
 * @description Provides useInfiniteCaseTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteCaseTable as createInfiniteCaseTableCore,
  type InfiniteCaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteCaseTable hook
 */
export interface UseInfiniteCaseTableResult<TColumns extends CaseColumnDef[]> {
  state: AdapterState<CaseRowType<TColumns>>;
  table: Table<CaseRowType<TColumns>>;
  adapter: InfiniteCaseTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll case table.
 */
export function useInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): UseInfiniteCaseTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfiniteCaseTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfiniteCaseTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteCaseTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteCaseTableCore(optionsRef.current);
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
