/**
 * @fileoverview Library Module Exports
 * @description Shared infrastructure for entity-agnostic table adapters
 */

// ============================================================================
// Adapter
// ============================================================================
export { BaseTableAdapter, type BaseTableAdapterOptions } from './adapter/index.js';
export type { AdapterState, TableOptions, TableError, ErrorCallbacks } from './adapter/index.js';

// ============================================================================
// Pagination
// ============================================================================
export { createCursorPagination } from './pagination/index.js';
export type {
  PaginationState,
  PageInfo,
  CursorPaginationOptions,
  CursorPaginationManager,
} from './pagination/index.js';

// ============================================================================
// Sorting
// ============================================================================
export { createSortingConverters, SortEnumType, SortDirection } from './sorting/index.js';
export type { SortingState, TanStackSortingState, SortingConverters } from './sorting/index.js';

// ============================================================================
// Query
// ============================================================================
export { QueryManager } from './query/index.js';
export type { QueryManagerOptions, QueryState } from './query/index.js';

// ============================================================================
// Factory
// ============================================================================
export { createClientFetchFn, createFetchFnFromClient, createTableApi } from './factory/index.js';
export type { TableApiConfig, TableApi } from './factory/index.js';

// ============================================================================
// Shared Types (Builder-Based)
// ============================================================================
export type {
  // Builder types
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  // Branded column defs
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  // Field extraction
  ExtractFieldFromColumnDef,
  ExtractFieldsFromColumnDefs,
  // Column config types
  ColumnConfig,
  ComputedColumnConfig,
  // Type utilities
  FieldValueType,
  // Options types
  TableAdapterOptionsBase,
  TableAdapterClientModeOptions,
  TableAdapterFetchModeOptions,
  TableAdapterOptions,
  // Generic entity types (for easy entity creation)
  EntityExtractFields,
  EntityRowType,
  EntityFetchFn,
  EntityTableOptions,
  // Fetch types
  FetchFn,
  FetchRequestOptions,
  QueryOptionsBuilderArgs,
  QueryOptionsBuilder,
  // SDK re-exports
  DeepFieldKeys,
  InsurUpGraphQLResult,
  Connection,
  InsurUpClientOptions,
  PickFields,
} from './types.js';

// ============================================================================
// Adapter Utilities
// ============================================================================
export {
  schemaToColumnDefs,
  extractFieldsFromColumns,
  columnsToTanStackColumnDefs,
  createTableError,
  isRetryable,
} from './adapter/utils.js';
