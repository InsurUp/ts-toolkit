/**
 * @fileoverview React hook for Policy Transfer Table
 * @description Provides usePolicyTransferTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createPolicyTransferTable as createPolicyTransferTableCore,
  type PolicyTransferTable,
  type PolicyTransferTableOptions,
  type PolicyTransferColumnDef,
  type PolicyTransferRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for usePolicyTransferTable hook
 */
export interface UsePolicyTransferTableResult<TColumns extends PolicyTransferColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<PolicyTransferRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<PolicyTransferRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: PolicyTransferTable<TColumns>;
}

/**
 * React hook for creating and managing a policy transfer table.
 *
 * @example
 * ```tsx
 * const { state, table, adapter } = usePolicyTransferTable({
 *   columns: (col) => [col.id(), col.startDate(), col.policyCount()],
 *   fetch: (options) => client.policies.getPolicyTransfers(options),
 *   autoFetch: true,
 * });
 * ```
 */
export function usePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): UsePolicyTransferTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const adapterRef = useRef<PolicyTransferTable<TColumns> | null>(null);
  const destroyedRef = useRef(false);

  const [adapter, setAdapter] = useState<PolicyTransferTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createPolicyTransferTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  useEffect(() => {
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createPolicyTransferTableCore(optionsRef.current);
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
