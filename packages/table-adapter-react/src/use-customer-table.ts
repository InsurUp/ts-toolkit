/**
 * @fileoverview React hook for Customer Table
 * @description Provides useCustomerTable hook with automatic lifecycle management
 */

import { useRef, useEffect, useSyncExternalStore, useState } from 'react';
import type { Table } from '@tanstack/react-table';
import {
  createCustomerTable as createCustomerTableCore,
  type CustomerTable,
  type CustomerTableOptions,
  type CustomerColumnDef,
  type CustomerRowType,
  type AdapterState,
} from '@insurup/table-adapter-core';

/**
 * Return type for useCustomerTable hook
 */
export interface UseCustomerTableResult<TColumns extends CustomerColumnDef[]> {
  /** Current adapter state (loading, error, rows, pageCount, etc.) */
  state: AdapterState<CustomerRowType<TColumns>>;
  /** TanStack Table instance with all table methods */
  table: Table<CustomerRowType<TColumns>>;
  /** Raw adapter for advanced use (setFilter, invalidate, etc.) */
  adapter: CustomerTable<TColumns>;
}

/**
 * React hook for creating and managing a customer table
 *
 * Handles:
 * - Adapter creation (stable across re-renders)
 * - State subscription (via useSyncExternalStore)
 * - Cleanup on unmount
 * - TanStack Table instance creation
 *
 * @example
 * ```tsx
 * import { useCustomerTable } from '@insurup/table-adapter-react';
 *
 * function CustomersPage() {
 *   const { state, table, adapter } = useCustomerTable({
 *     columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *     fetch: (options) => client.customers.getCustomers(options),
 *     autoFetch: true,
 *   });
 *
 *   if (state.isLoading) return <div>Loading...</div>;
 *   if (state.error) return <div>Error: {state.error.message}</div>;
 *
 *   return (
 *     <table>
 *       <thead>
 *         {table.getHeaderGroups().map(headerGroup => (
 *           <tr key={headerGroup.id}>
 *             {headerGroup.headers.map(header => (
 *               <th key={header.id}>
 *                 {flexRender(header.column.columnDef.header, header.getContext())}
 *               </th>
 *             ))}
 *           </tr>
 *         ))}
 *       </thead>
 *       <tbody>
 *         {table.getRowModel().rows.map(row => (
 *           <tr key={row.id}>
 *             {row.getVisibleCells().map(cell => (
 *               <td key={cell.id}>
 *                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 *               </td>
 *             ))}
 *           </tr>
 *         ))}
 *       </tbody>
 *     </table>
 *   );
 * }
 * ```
 */
export function useCustomerTable<const TColumns extends CustomerColumnDef[]>(
  options: CustomerTableOptions<TColumns>
): UseCustomerTableResult<TColumns> {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Ref to ensure only one adapter is created per mount (handles Strict Mode double-invoke)
  const adapterRef = useRef<CustomerTable<TColumns> | null>(null);

  // Track if adapter was destroyed (for Strict Mode remount)
  const destroyedRef = useRef(false);

  // Initialize adapter lazily with idempotent creation
  // The ref check prevents duplicate creation from Strict Mode's double-invoke of initializers
  const [adapter, setAdapter] = useState<CustomerTable<TColumns>>(() => {
    if (adapterRef.current && !destroyedRef.current) {
      return adapterRef.current;
    }
    const newAdapter = createCustomerTableCore(optionsRef.current);
    adapterRef.current = newAdapter;
    destroyedRef.current = false;
    return newAdapter;
  });

  // Handle cleanup and recreation for React Strict Mode
  useEffect(() => {
    // If adapter was destroyed by previous cleanup (Strict Mode), recreate it
    if (destroyedRef.current) {
      destroyedRef.current = false;
      const newAdapter = createCustomerTableCore(optionsRef.current);
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
