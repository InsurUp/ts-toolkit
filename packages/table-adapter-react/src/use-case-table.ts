/**
 * @fileoverview React hook for Case Table
 * @description Provides useCaseTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createCaseTable as createCaseTableCore,
  type CaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useCaseTable hook
 */
export interface UseCaseTableResult<TColumns extends CaseColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<CaseRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<CaseRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: CaseTable<TColumns>;
}

/**
 * React hook for creating and managing a case table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = useCaseTable({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function useCaseTable<const TColumns extends CaseColumnDef[]>(
  options: CaseTableOptions<TColumns>
): UseCaseTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<CaseTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<CaseTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createCaseTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createCaseTableCore(optionsRef.current);
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
