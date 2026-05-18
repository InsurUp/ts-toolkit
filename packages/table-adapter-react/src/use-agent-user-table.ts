/**
 * @fileoverview React hook for Agent User Table
 * @description Provides useAgentUserTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createAgentUserTable as createAgentUserTableCore,
  type AgentUserTable,
  type AgentUserTableOptions,
  type AgentUserColumnDef,
  type AgentUserRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useAgentUserTable hook
 */
export interface UseAgentUserTableResult<TColumns extends AgentUserColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<AgentUserRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<AgentUserRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: AgentUserTable<TColumns>;
}

/**
 * React hook for creating and managing an agent user table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useAgentUserTable({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function useAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): UseAgentUserTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<AgentUserTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<AgentUserTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createAgentUserTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createAgentUserTableCore(optionsRef.current);
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
