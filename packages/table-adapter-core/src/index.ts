/**
 * @insurup/tanstack-table-adapter
 *
 * A framework-agnostic adapter for using @insurup/sdk with TanStack Table.
 * Handles cursor pagination, sorting, caching, and state management.
 *
 * @example
 * ```typescript
 * import { createCustomerTable } from '@insurup/tanstack-table-adapter'
 * import { DefaultInsurUpClient } from '@insurup/sdk'
 *
 * const client = new DefaultInsurUpClient({ baseUrl, tokenProvider })
 *
 * const customerTable = createCustomerTable({
 *   columns: col => [
 *     col.id(),
 *     col.name('Customer Name'),
 *     col.type({ header: 'Type', render: v => v === 'Individual' ? '👤' : '🏢' }),
 *     col.computed({
 *       uses: ['cityText', 'districtText'] as const,
 *       header: 'Location',
 *       render: row => `${row.cityText}, ${row.districtText}`
 *     })
 *   ],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 *
 * // state.rows[0] only has: id, name, type, cityText, districtText ✅
 * const state = useSyncExternalStore(customerTable.subscribe, customerTable.getSnapshot)
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Entity Table Factories
// ============================================================================

// Customer entity - Pagination mode
export { createCustomerTable, type CustomerTable } from './entities/customer/index.js';

// Customer entity - Infinite scroll mode
export {
  createInfiniteCustomerTable,
  type InfiniteCustomerTable,
} from './entities/customer/index.js';

// ============================================================================
// Entity-Specific Types
// ============================================================================

// Customer types
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
} from './entities/customer/index.js';

// Re-export SDK types for convenience
export type { GetCustomersOptions, CustomerFieldKey, QueryCustomerModel } from '@insurup/sdk';

// ============================================================================
// Base Adapter (for advanced usage)
// ============================================================================

export {
  BaseTableAdapter,
  InfiniteTableAdapter,
  type BaseTableAdapterOptions,
  type TableOptions,
  type TableError,
  type ErrorCallbacks,
  type ITableAdapter,
} from './lib/adapter/index.js';

// ============================================================================
// Query Manager (for advanced usage)
// ============================================================================

export { QueryManager } from './lib/query/index.js';
export type { QueryManagerOptions, QueryState } from './lib/query/index.js';

// ============================================================================
// Core Utilities (for creating custom entity table factories)
// ============================================================================

export {
  createSortingConverters,
  createClientFetchFn,
  createFetchFnFromClient,
  createTableApi,
  extractFieldsFromColumns,
} from './lib/index.js';

export type { TableApi, TableApiConfig, ColumnInfo } from './lib/factory/index.js';

// ============================================================================
// Shared Types
// ============================================================================

export type {
  // Builder types
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  // Field extraction
  ExtractFieldFromColumnDef,
  ExtractFieldsFromColumnDefs,
  // Column types
  ColumnConfig,
  ComputedColumnConfig,
  // State and options
  AdapterState,
  TableAdapterOptionsBase,
  TableAdapterClientModeOptions,
  TableAdapterFetchModeOptions,
  TableAdapterOptions,
  // Generic entity types (for creating new entity adapters)
  EntityExtractFields,
  EntityRowType,
  EntityFetchFn,
  EntityTableOptions,
  // Type utilities
  FieldValueType,
  DeepFieldKeys,
  Connection,
  PageInfo,
  InsurUpClientOptions,
  InsurUpGraphQLResult,
  PickFields,
  // Fetch types
  FetchFn,
  FetchRequestOptions,
  QueryOptionsBuilder,
  QueryOptionsBuilderArgs,
} from './lib/index.js';

// ============================================================================
// Pagination & Sorting
// ============================================================================

export { createCursorPagination, createPaginationManager } from './lib/pagination/index.js';
export type {
  PaginationManager,
  PaginationState,
  CursorPaginationOptions,
  CursorPaginationManager,
  PaginationOptions,
  PaginationManagerFromOptions,
} from './lib/pagination/index.js';

export type { SortingState } from './lib/sorting/index.js';
export { SortEnumType, SortDirection } from './lib/sorting/index.js';
