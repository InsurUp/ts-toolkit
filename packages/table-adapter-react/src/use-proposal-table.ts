/**
 * @fileoverview React hook for Proposal Table
 * @description Provides useProposalTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createProposalTable as createProposalTableCore,
  type ProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useProposalTable hook
 */
export interface UseProposalTableResult<TColumns extends ProposalColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<ProposalRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<ProposalRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: ProposalTable<TColumns>;
}

/**
 * React hook for creating and managing a proposal table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useProposalTable({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function useProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): UseProposalTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<ProposalTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<ProposalTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createProposalTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createProposalTableCore(optionsRef.current);
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
