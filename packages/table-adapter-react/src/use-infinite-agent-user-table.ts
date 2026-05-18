/**
 * @fileoverview React hook for Infinite Agent User Table
 * @description Provides useInfiniteAgentUserTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteAgentUserTable as createInfiniteAgentUserTableCore,
  type InfiniteAgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteAgentUserTable hook
 */
export interface UseInfiniteAgentUserTableResult<TColumns extends AgentUserColumnDef[]> {
  state: AdapterState<AgentUserRowType<TColumns>>;
  table: Table<AgentUserRowType<TColumns>>;
  adapter: InfiniteAgentUserTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll agent user table.
 */
export function useInfiniteAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): UseInfiniteAgentUserTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfiniteAgentUserTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfiniteAgentUserTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteAgentUserTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteAgentUserTableCore(optionsRef.current);
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
