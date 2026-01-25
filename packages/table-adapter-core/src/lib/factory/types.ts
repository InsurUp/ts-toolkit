/**
 * @fileoverview Factory Types
 * @description Types for entity-specific table factory creation
 */

import type { ColumnDef, TableOptionsResolved } from '@tanstack/table-core';
import type { AdapterState, ErrorCallbacks, TableOptions } from '../adapter/types.js';
import type { InternalColumnDef, FetchFn, QueryOptionsBuilder } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';

/**
 * Configuration for creating a table API (schema-based)
 * @template TEntity - The full entity type
 * @template TRow - The row type with selected fields
 * @template TQueryOptions - The SDK query options type
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 */
export interface TableApiConfig<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
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
  /** Internal column definitions (converted from schema) */
  columns: InternalColumnDef[];
  /** Fields to select from GraphQL */
  select: string[];
  /** Number of items per page */
  pageSize: number;
  /** Default sorting in SDK format */
  defaultSort?: TSortInput[];
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
}

/**
 * Standard table API returned by entity table factories
 * @template TRow - The row type with selected fields
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 */
export interface TableApi<TRow, TFilterInput = unknown, TSearchInput = unknown> {
  /** TanStack ColumnDef[] - converted from entity columns (frozen, immutable) */
  readonly columns: readonly ColumnDef<TRow, unknown>[];
  /** Get current adapter state */
  getState: () => AdapterState<TRow>;
  /**
   * Get TanStack Table options - includes data, columns, and getCoreRowModel.
   * Can be spread directly into useReactTable() for one-liner setup.
   *
   * @example
   * ```tsx
   * const table = useReactTable(customerTable.getTableOptions())
   * ```
   */
  getTableOptions: () => TableOptions<TRow>;
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
}
