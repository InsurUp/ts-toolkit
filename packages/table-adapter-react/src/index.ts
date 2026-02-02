/**
 * @insurup/table-adapter-react
 *
 * React bindings for @insurup/table-adapter-core.
 * Provides useCustomerTable hook with automatic lifecycle management.
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
 *
 *   return (
 *     <table>
 *       {table.getHeaderGroups().map(headerGroup => ...)}
 *       {table.getRowModel().rows.map(row => ...)}
 *     </table>
 *   );
 * }
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// React-specific hooks
// ============================================================================

export { useCustomerTable, type UseCustomerTableResult } from './use-customer-table.js';
export {
  useInfiniteCustomerTable,
  type UseInfiniteCustomerTableResult,
} from './use-infinite-customer-table.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factory (for advanced use cases)
export { createCustomerTable, type CustomerTable } from '@insurup/table-adapter-core';
export {
  createInfiniteCustomerTable,
  type InfiniteCustomerTable,
} from '@insurup/table-adapter-core';

// Entity types
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
} from '@insurup/table-adapter-core';

// Adapter types
export type {
  AdapterState,
  TableOptions,
  TableError,
  ErrorCallbacks,
} from '@insurup/table-adapter-core';

// Column builder types
export type {
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  ColumnConfig,
  ComputedColumnConfig,
} from '@insurup/table-adapter-core';

// SDK re-exports
export type {
  GetCustomersOptions,
  CustomerFieldKey,
  QueryCustomerModel,
} from '@insurup/table-adapter-core';
