/**
 * @insurup/table-adapter-svelte
 *
 * Svelte bindings for @insurup/table-adapter-core.
 * Provides createCustomerTable with Svelte 5 runes for fine-grained reactive state.
 *
 * Each property is an individual reactive signal, allowing components to
 * subscribe to only what they need for optimal re-render performance.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCustomerTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createCustomerTable(() => ({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 *
 * {#if ct.isLoading}
 *   <p>Loading...</p>
 * {:else if ct.isEmpty}
 *   <p>No data found</p>
 * {:else}
 *   {#each ct.table.getRowModel().rows as row}
 *     <tr>{row.id}</tr>
 *   {/each}
 * {/if}
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Svelte-specific exports
// ============================================================================

export { createCustomerTable } from './create-customer-table.svelte.js';
export type { CustomerTableInstance } from './create-customer-table.svelte.js';

export { createInfiniteCustomerTable } from './create-infinite-customer-table.svelte.js';
export type { InfiniteCustomerTableInstance } from './create-infinite-customer-table.svelte.js';

export type { TableCoreResult } from './internal/create-table-core.svelte.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factory (for advanced use cases)
export { createCustomerTable as createCustomerTableCore } from '@insurup/table-adapter-core';
export type { CustomerTable } from '@insurup/table-adapter-core';

// Infinite scroll core factory (for advanced use cases)
export { createInfiniteCustomerTable as createInfiniteCustomerTableCore } from '@insurup/table-adapter-core';
export type { InfiniteCustomerTable } from '@insurup/table-adapter-core';

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
  ColumnInfo,
} from '@insurup/table-adapter-core';

// SDK re-exports
export type {
  GetCustomersOptions,
  CustomerFieldKey,
  QueryCustomerModel,
} from '@insurup/table-adapter-core';
