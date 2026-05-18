/**
 * @fileoverview React hook for Infinite Proposal Table
 * @description Provides useInfiniteProposalTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteProposalTable as createInfiniteProposalTableCore,
  type InfiniteProposalTable,
  type ProposalTableOptions,
  type ProposalColumnDef,
  type ProposalRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteProposalTable hook
 */
export interface UseInfiniteProposalTableResult<TColumns extends ProposalColumnDef[]> {
  /** Current adapter state (loading, error, rows with accumulation, etc.) */
  state: AdapterState<ProposalRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<ProposalRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: InfiniteProposalTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll proposal table.
 *
 * Unlike useProposalTable which replaces rows on each page, this hook
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useInfiniteProposalTable({
 *   columns: (col) => [col.id(), col.state(), col.insuredCustomerName()],
 *   fetch: (options) => client.proposals.getProposals(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * });
 * ```
 */
export function useInfiniteProposalTable<const TColumns extends ProposalColumnDef[]>(
  options: ProposalTableOptions<TColumns>
): UseInfiniteProposalTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<InfiniteProposalTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<InfiniteProposalTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteProposalTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteProposalTableCore(optionsRef.current);
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
