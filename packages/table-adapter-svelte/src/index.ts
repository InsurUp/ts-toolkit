/**
 * @insurup/table-adapter-svelte
 *
 * Svelte bindings for @insurup/table-adapter-core.
 * Provides createCustomerTable with Svelte 5 runes ($state) for reactive state.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * const customerTable = createCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 *
 * onDestroy(() => customerTable.destroy());
 *
 * const { state, table } = customerTable;
 * </script>
 *
 * {#if state.isLoading}
 *   <p>Loading...</p>
 * {:else}
 *   <table>...</table>
 * {/if}
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Svelte-specific exports
// ============================================================================

export { createCustomerTable, type CustomerTableStore } from './create-customer-table.svelte.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factory (for advanced use cases)
export { createCustomerTable as createCustomerTableCore } from '@insurup/table-adapter-core';
export type { CustomerTable } from '@insurup/table-adapter-core';

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
