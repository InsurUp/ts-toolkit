/**
 * @fileoverview React hook for Infinite File Policy Transfer Table
 * @description Provides useInfiniteFilePolicyTransferTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteFilePolicyTransferTable as createInfiniteFilePolicyTransferTableCore,
  type InfiniteFilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteFilePolicyTransferTable hook
 */
export interface UseInfiniteFilePolicyTransferTableResult<
  TColumns extends FilePolicyTransferColumnDef[],
> {
  state: AdapterState<FilePolicyTransferRowType<TColumns>>;
  table: Table<FilePolicyTransferRowType<TColumns>>;
  adapter: InfiniteFilePolicyTransferTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll file policy transfer table.
 */
export function useInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(
  options: FilePolicyTransferTableOptions<TColumns>
): UseInfiniteFilePolicyTransferTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfiniteFilePolicyTransferTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfiniteFilePolicyTransferTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteFilePolicyTransferTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteFilePolicyTransferTableCore(optionsRef.current);
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
