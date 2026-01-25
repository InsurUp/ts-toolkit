/**
 * @insurup/table-adapter-vue
 *
 * Vue bindings for @insurup/table-adapter-core.
 * Provides useCustomerTable composable with automatic lifecycle management.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useCustomerTable } from '@insurup/table-adapter-vue';
 *
 * const { state, table, adapter } = useCustomerTable({
 *   columns: (col) => [col.id(), col.name(), col.primaryEmail()],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   autoFetch: true,
 * });
 * </script>
 *
 * <template>
 *   <div v-if="state.isLoading">Loading...</div>
 *   <table v-else>
 *     <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">...</tr>
 *     <tr v-for="row in table.getRowModel().rows" :key="row.id">...</tr>
 *   </table>
 * </template>
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Vue-specific composables
// ============================================================================

export { useCustomerTable, type UseCustomerTableResult } from './use-customer-table.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factory (for advanced use cases)
export { createCustomerTable, type CustomerTable } from '@insurup/table-adapter-core';

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
