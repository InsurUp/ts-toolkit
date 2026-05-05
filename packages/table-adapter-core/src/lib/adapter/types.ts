/**
 * @fileoverview Adapter Types
 * @description Types specific to the BaseTableAdapter and shared interfaces
 */

import type {
  TableOptions as TanStackTableOptions,
  TableOptionsResolved,
  ColumnDef,
  Table,
} from '@tanstack/table-core';
import type { GraphQLErrors, ClientError, DeepFieldKeys } from '@insurup/sdk';
import type { AnyColumnDef } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';
import type { PaginationManager, PaginationOptions } from '../pagination/types.js';

// ============================================================================
// Error Types
// ============================================================================

/**
 * Rich error type wrapping SDK GraphQL/Client errors
 * Extends Error for compatibility with existing error handling patterns
 */
export interface TableError extends Error {
  /** The original SDK error (GraphQL or Client error) */
  cause: GraphQLErrors | ClientError;
  /** Whether this error is retryable (network errors, timeouts, server errors) */
  retryable: boolean;
}

/**
 * Error handling callbacks for table operations
 * @template TRow - The row type (Pick of entity with selected fields)
 */
export interface ErrorCallbacks<TRow> {
  /** Called when a fetch fails */
  onError?: (error: TableError) => void;
  /** Called when a fetch succeeds */
  onSuccess?: (data: AdapterState<TRow>) => void;
  /** Called after fetch completes (success or error) */
  onSettled?: (data: AdapterState<TRow> | undefined, error: TableError | null) => void;
}

// ============================================================================
// Adapter State
// ============================================================================

/**
 * Adapter state returned by getSnapshot
 * @template TRow - The row type (Pick of entity with selected fields)
 */
export interface AdapterState<TRow> {
  /** Array of entity rows */
  rows: TRow[];
  /** Total number of rows (null while loading when splitTotalCount is enabled) */
  rowCount: number | null;
  /** Total number of pages (null while loading when splitTotalCount is enabled) */
  pageCount: number | null;
  /** Initial loading state */
  isLoading: boolean;
  /** Fetching state (includes refetches) */
  isFetching: boolean;
  /** Error if any (rich error with SDK details) */
  error: TableError | null;
  /** Whether in error state */
  isError: boolean;
  /** Whether data was successfully fetched */
  isSuccess: boolean;
  /** Whether total count is currently being fetched separately (only when splitTotalCount is enabled) */
  isCountLoading: boolean;
}

/**
 * TanStack Table options returned by getTableOptions()
 *
 * Uses TanStack's native TableOptions type, extended with our custom `paginationMode` property.
 * Includes data, columns, getCoreRowModel, and any pass-through options.
 * Can be spread directly into useReactTable() for a one-liner setup.
 *
 * @template TRow - The row type
 *
 * @example
 * ```tsx
 * // One-liner usage!
 * const table = useReactTable(customerTable.getTableOptions())
 * ```
 */
export type TableOptions<TRow> = TanStackTableOptions<TRow> & {
  /**
   * Pagination mode - 'cursor' indicates only sequential (prev/next) navigation is supported.
   * Consumers should disable page-jump UI controls when this is 'cursor'.
   */
  paginationMode: 'cursor';
};

// ============================================================================
// Column Info Types
// ============================================================================

/**
 * Column information for visibility -> fields mapping
 * Used to compute which GraphQL fields to select based on visible columns
 */
export interface ColumnInfo {
  /** Column key (matches TanStack column id) */
  key: string;
  /** Column header text */
  header: string;
  /** GraphQL fields this column requires */
  fields: string[];
  /** Whether the column can be hidden */
  hideable: boolean;
  /** Whether column is hidden by default */
  hiddenByDefault: boolean;
}

/**
 * Options for BaseTableAdapter constructor
 * @template TEntity - The full entity type (for field key derivation)
 * @template TRow - The row type (for callback typing)
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @template TPaginationOptions - The pagination options type
 */
export interface BaseTableAdapterOptions<
  TEntity,
  TRow,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
> extends ErrorCallbacks<TRow> {
  /** Column definitions from the builder */
  columns: AnyColumnDef<DeepFieldKeys<TEntity> & string>[];
  /** Pagination strategy configuration */
  pagination: TPaginationOptions;
  /** Default filter criteria */
  defaultFilter?: TFilterInput;
  /** Default search criteria */
  defaultSearch?: TSearchInput;
  /** Converters for sorting between TanStack and SDK formats */
  sortingConverters: SortingConverters<TSortInput>;
  /** Query key prefix for cache isolation (e.g., 'customers', 'policies') */
  queryKeyPrefix?: string;
  staleTime?: number;
  gcTime?: number;
  /**
   * Optional TanStack Table options to pass through.
   * Use this for client-side features like row selection, column visibility, etc.
   */
  tableOptions?: Partial<Omit<TableOptionsResolved<TRow>, 'data' | 'columns' | 'getCoreRowModel'>>;
  /**
   * Automatically fetch data when the table is created.
   * When true, the initial fetch is triggered immediately on construction.
   * @default false
   */
  autoFetch?: boolean;
  /**
   * When true, fetches total count in a separate query for faster initial data load.
   * The main query will return data immediately, while count loads asynchronously.
   * Use `isCountLoading` state to show loading indicator for the count.
   * @default false
   */
  splitTotalCount?: boolean;
  /**
   * When true, the table preserves previously fetched rows during query-key
   * transitions (sort, page, filter, search, visibility) instead of flashing
   * to an empty state while the new query loads. `state.rows` will hold the
   * previous result until the new fetch resolves; `state.isFetching` indicates
   * the background load.
   *
   * Recommended for paginated/sortable UI tables. Implemented via TanStack
   * Query's `placeholderData: keepPreviousData`.
   * @default false
   */
  keepPreviousData?: boolean;
}

// ============================================================================
// Shared Adapter Interface
// ============================================================================

/**
 * Shared interface for all table adapters (Base and Infinite)
 * Both adapters implement this interface for consistent API
 *
 * @template TRow - The row type with selected fields
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @template TPagination - The pagination manager type (CursorPaginationManager, etc.)
 */
export interface ITableAdapter<
  TRow,
  TFilterInput,
  TSearchInput,
  TPagination extends PaginationManager,
> {
  // ============================================================================
  // TanStack Table Integration
  // ============================================================================

  /** TanStack ColumnDef[] - converted from entity columns (frozen, immutable) */
  readonly columns: readonly ColumnDef<TRow, unknown>[];

  /**
   * Get managed TanStack Table instance.
   * Creates a table instance on first call and returns the same instance on subsequent calls.
   * The table is automatically synced when adapter state changes.
   */
  getTable(): Table<TRow>;

  /**
   * Get TanStack Table options - includes data, columns, getCoreRowModel, and onStateChange.
   * Use once for initialization with useReactTable() or createTable().
   * After init, use the table instance directly for state changes.
   */
  getTableOptions(): TableOptions<TRow>;

  // ============================================================================
  // State Management (useSyncExternalStore compatible)
  // ============================================================================

  /** Get current adapter state */
  getState(): AdapterState<TRow>;

  /** Get state snapshot (compatible with useSyncExternalStore) */
  getSnapshot(): AdapterState<TRow>;

  /** Get server snapshot (compatible with useSyncExternalStore SSR) */
  getServerSnapshot(): AdapterState<TRow>;

  /** Subscribe to state changes (compatible with useSyncExternalStore) */
  subscribe(listener: () => void): () => void;

  // ============================================================================
  // Data Operations
  // ============================================================================

  /** Trigger a manual fetch */
  fetch(): Promise<void>;

  /** Invalidate cache and refetch */
  invalidate(): Promise<void>;

  /** Refetch data with optional force bypass of cache */
  refetch(options?: { force?: boolean }): Promise<void>;

  // ============================================================================
  // Pagination
  // ============================================================================

  /**
   * Pagination manager - single source of truth for pagination state.
   * Use this to navigate pages, check if next/previous is available, etc.
   *
   * @example
   * ```ts
   * // Navigate to next page
   * adapter.pagination.next();
   * adapter.fetch();
   *
   * // Check if can go next
   * const canNext = adapter.pagination.canGoNext();
   *
   * // Get current page
   * const page = adapter.pagination.getState().pageIndex;
   * ```
   */
  readonly pagination: TPagination;

  /** Change page size and reset to first page */
  setPageSize(size: number): void;

  // ============================================================================
  // Filtering & Search
  // ============================================================================

  /** Set filter criteria and refetch (resets pagination) */
  setFilter(filter: TFilterInput): void;

  /** Get current filter criteria */
  getFilter(): TFilterInput | undefined;

  /** Clear filter criteria and refetch (resets pagination) */
  clearFilter(): void;

  /** Set search criteria and refetch (resets pagination) */
  setSearch(search: TSearchInput): void;

  /** Get current search criteria */
  getSearch(): TSearchInput | undefined;

  /** Clear search criteria and refetch (resets pagination) */
  clearSearch(): void;

  // ============================================================================
  // Column Info
  // ============================================================================

  /** Get column metadata for UI (e.g., column visibility toggle) */
  getColumnInfo(): ColumnInfo[];

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /** Destroy the adapter and clean up resources */
  destroy(): void;
}
