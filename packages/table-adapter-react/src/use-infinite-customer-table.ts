/**
 * @fileoverview React hook for Infinite Customer Table
 * @description Provides useInfiniteCustomerTable hook with automatic row accumulation
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createInfiniteCustomerTable as createInfiniteCustomerTableCore,
  type InfiniteCustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useInfiniteCustomerTable hook
 */
export interface UseInfiniteCustomerTableResult<TColumns extends CustomerColumnDef[]> {
  /** Current adapter state (loading, error, rows with accumulation, etc.) */
  state: AdapterState<CustomerRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<CustomerRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: InfiniteCustomerTable<TColumns>;
}

/**
 * React hook for creating and managing an infinite scroll customer table
 *
 * Unlike useCustomerTable which replaces rows on each page, this hook
 * accumulates rows across page fetches for infinite scroll behavior.
 * Rows are automatically reset when filters, search, or sorting change.
 *
 * Handles:
 * - Adapter creation (stable across re-renders)
 * - Row accumulation across pages (state.rows contains ALL loaded rows)
 * - Auto-reset on filter/search/sort changes
 * - State subscription (via useSyncExternalStore)
 * - Cleanup on unmount
 * - TanStack Table instance creation
 *
 * @example
 * ```tsx
 * import { useInfiniteCustomerTable } from '@insurup/table-adapter-react';
 *
 * function CustomersInfinite() {
 *   const { state, table, adapter } = useInfiniteCustomerTable({
 *     columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *     fetch: (options) => client.customers.getCustomers(options),
 *     pageSize: 50,
 *     autoFetch: true,
 *   });
 *
 *   // Load more when scrolling near bottom
 *   const loadMore = () => {
 *     if (table.getCanNextPage() && !state.isFetching) {
 *       table.nextPage();
 *     }
 *   };
 *
 *   // state.rows contains ALL accumulated rows, not just current page
 *   return (
 *     <div>
 *       {state.rows.map(row => <CustomerRow key={row.id} data={row} />)}
 *       {table.getCanNextPage() && <LoadMoreButton onClick={loadMore} />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useInfiniteCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): UseInfiniteCustomerTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Ref to ensure only one adapter is created per mount (handles Strict Mode double-invoke)
  const adapterRef = useRef<InfiniteCustomerTable<TColumns> | null>(null);

  // Track if adapter was destroyed (for Strict Mode remount)
  const destroyedRef = useRef(false);

  // Initialize adapter lazily with idempotent creation
  // The ref check prevents duplicate creation from Strict Mode's double-invoke of initializers
  const [adapter, setAdapter] = useState<InfiniteCustomerTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createInfiniteCustomerTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  // Handle cleanup and recreation for React Strict Mode
  useEffect(() => {
    // If adapter was destroyed by previous cleanup (Strict Mode), recreate it
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createInfiniteCustomerTableCore(optionsRef.current);
      adapterRef.current = newAdapter;
      setAdapter(newAdapter);
      return; // Exit early - new effect will run with new adapter
    }

    return () => {
      destroyedRef.current = true;
      adapterRef.current = null;
      adapter.destroy();
    };
  }, [adapter]);

  // Subscribe to adapter state changes
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
