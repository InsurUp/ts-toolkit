/**
 * @fileoverview Factory Types
 * @description Types for entity-specific table factory creation
 */

import type { ColumnDef, Table, TableOptionsResolved } from '@tanstack/table-core';
import type { AdapterState, ErrorCallbacks, TableOptions, ColumnInfo } from '../adapter/types.js';
import type { AnyColumnDef, FetchFn, QueryOptionsBuilder, DeepFieldKeys } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';
import type { PaginationManager, PaginationOptions } from '../pagination/types.js';

/**
 * Configuration for creating a table API (schema-based)
 * @template TEntity - The full entity type
 * @template TRow - The row type with selected fields
 * @template TQueryOptions - The SDK query options type
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @template TPaginationOptions - The pagination options type
 */
export interface TableApiConfig<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
> extends ErrorCallbacks<TRow> {
  /** The fetch function to use */
  fetchFn: FetchFn<TRow, TQueryOptions>;
  /** Function that builds query options from params */
  buildQueryOptions: QueryOptionsBuilder<
    TEntity,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput
  >;
  /** Column definitions from the builder */
  columns: AnyColumnDef<DeepFieldKeys<TEntity> & string>[];
  /** Pagination strategy configuration */
  pagination: TPaginationOptions;
  /** Default filter criteria */
  defaultFilter?: TFilterInput;
  /** Default search criteria */
  defaultSearch?: TSearchInput;
  /** Sorting converters for this entity type */
  sortingConverters: SortingConverters<TSortInput>;
  /** Query key prefix for cache isolation */
  queryKeyPrefix: string;
  /** Time until data is considered stale (ms) */
  staleTime?: number;
  /** Time until inactive data is garbage collected (ms) */
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
   * transitions instead of flashing to an empty state while the new query
   * loads. Implemented via TanStack Query's `placeholderData: keepPreviousData`.
   * @default false
   */
  keepPreviousData?: boolean;
}

/**
 * Standard table API returned by entity table factories
 * @template TRow - The row type with selected fields
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 * @template TPagination - The pagination manager type (CursorPaginationManager, etc.)
 */
export interface TableApi<
  TRow,
  TFilterInput,
  TSearchInput,
  TPagination extends PaginationManager,
> {
  /** TanStack ColumnDef[] - converted from entity columns (frozen, immutable) */
  readonly columns: readonly ColumnDef<TRow, unknown>[];
  /** Get current adapter state */
  getState: () => AdapterState<TRow>;
  /**
   * Get TanStack Table options - includes data, columns, getCoreRowModel, and onStateChange.
   * Use once for initialization with useReactTable() or createTable().
   * After init, use the table instance directly for state changes.
   *
   * @example
   * ```tsx
   * const table = useReactTable(customerTable.getTableOptions())
   * ```
   */
  getTableOptions: () => TableOptions<TRow>;
  /**
   * Get managed TanStack Table instance.
   * Creates a table instance on first call and returns the same instance on subsequent calls.
   * The table is automatically synced when adapter state changes.
   *
   * Use this for simpler integration without manually syncing table options.
   *
   * @example
   * ```ts
   * const table = customerTable.getTable();
   * adapter.subscribe(() => render()); // Table is auto-synced
   * ```
   */
  getTable: () => Table<TRow>;
  /** Subscribe to state changes (compatible with useSyncExternalStore) */
  subscribe: (listener: () => void) => () => void;
  /** Get state snapshot (compatible with useSyncExternalStore) */
  getSnapshot: () => AdapterState<TRow>;
  /** Get server snapshot (compatible with useSyncExternalStore SSR) */
  getServerSnapshot: () => AdapterState<TRow>;
  /** Trigger a manual fetch */
  fetch: () => Promise<void>;
  /** Invalidate cache and refetch */
  invalidate: () => Promise<void>;
  /** Refetch data with optional force bypass of cache */
  refetch: (options?: { force?: boolean }) => Promise<void>;
  /** Destroy the adapter and clean up resources */
  destroy: () => void;
  /**
   * Pagination manager - single source of truth for pagination state.
   * Use this to navigate pages, check if next/previous is available, etc.
   *
   * @example
   * ```ts
   * // Navigate to next page
   * table.pagination.next();
   * table.fetch();
   *
   * // Check if can go next
   * const canNext = table.pagination.canGoNext();
   *
   * // Get current page
   * const page = table.pagination.getState().pageIndex;
   * ```
   */
  readonly pagination: TPagination;

  /** Change page size and reset to first page */
  setPageSize: (size: number) => void;

  // ============================================================================
  // Filter Methods
  // ============================================================================

  /** Set filter criteria and refetch (resets pagination) */
  setFilter: (filter: TFilterInput) => void;
  /** Get current filter criteria */
  getFilter: () => TFilterInput | undefined;
  /** Clear filter criteria and refetch (resets pagination) */
  clearFilter: () => void;

  // ============================================================================
  // Search Methods
  // ============================================================================

  /** Set search criteria and refetch (resets pagination) */
  setSearch: (search: TSearchInput) => void;
  /** Get current search criteria */
  getSearch: () => TSearchInput | undefined;
  /** Clear search criteria and refetch (resets pagination) */
  clearSearch: () => void;

  // ============================================================================
  // Column Info Methods
  // ============================================================================

  /** Get column metadata for UI (e.g., column visibility toggle) */
  getColumnInfo: () => ColumnInfo[];
}

// Re-export ColumnInfo from adapter types for convenience
export type { ColumnInfo } from '../adapter/types.js';
