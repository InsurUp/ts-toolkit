/**
 * @fileoverview Generic React hook for any entity table adapter.
 *
 * Per-entity hooks (`useCustomerTable`, `usePolicyTable`, …) are thin
 * wrappers around this primitive. The primitive owns the React-specific
 * lifecycle (Strict Mode double-invoke handling, useSyncExternalStore
 * subscription, cleanup on unmount).
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import type { AdapterState } from '@insurup/table-adapter-core';

/**
 * Minimal shape `useTable` requires — a covariant subset of `TableApi`.
 * Any entity's `TableApi<TRow, …>` structurally satisfies this.
 */
interface TableApiMin<TRow> {
  subscribe(listener: () => void): () => void;
  getSnapshot(): AdapterState<TRow>;
  getServerSnapshot(): AdapterState<TRow>;
  getTable(): Table<TRow>;
  destroy(): void;
}

export interface UseTableResult<TRow, TAdapter extends TableApiMin<TRow>> {
  /** Current adapter state (loading, error, rows, pageCount, …). */
  state: AdapterState<TRow>;
  /** TanStack Table instance with all table methods. */
  table: Table<TRow>;
  /** Raw adapter for advanced use (setFilter, invalidate, …). */
  adapter: TAdapter;
}

/**
 * Create and manage any entity table adapter with React lifecycle.
 *
 * Pass a thunk that builds the adapter — `useTable` runs it once, keeps the
 * adapter stable across re-renders (including Strict Mode's double-invoke),
 * subscribes via `useSyncExternalStore`, and destroys on unmount.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useTable(() =>
 *   createCustomerTable({ columns, fetch, autoFetch: true })
 * );
 * ```
 */
export function useTable<TRow, TAdapter extends TableApiMin<TRow>>(
  createAdapter: () => TAdapter
): UseTableResult<TRow, TAdapter> {
  const createAdapterRef = useRef(createAdapter);
  createAdapterRef.current = createAdapter;

  // Ref to ensure only one adapter is created per mount (handles Strict Mode double-invoke)
  const adapterRef = useRef<TAdapter | null>(null);

  // Track if adapter was destroyed (for Strict Mode remount)
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<TAdapter>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createAdapterRef.current();
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createAdapterRef.current();
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
