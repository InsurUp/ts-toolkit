/**
 * @fileoverview React hook for Policy Table
 * @description Provides usePolicyTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createPolicyTable as createPolicyTableCore,
  type PolicyTable,
  type PolicyTableOptions,
  type PolicyColumnDef,
  type PolicyRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for usePolicyTable hook
 */
export interface UsePolicyTableResult<TColumns extends PolicyColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<PolicyRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<PolicyRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: PolicyTable<TColumns>;
}

/**
 * React hook for creating and managing a policy table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = usePolicyTable({
 *   columns: (col) => [col.id(), col.insuranceCompanyPolicyNumber(), col.state()],
 *   fetch: (options) => client.policies.getPolicies(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function usePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): UsePolicyTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<PolicyTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<PolicyTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createPolicyTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createPolicyTableCore(optionsRef.current);
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
