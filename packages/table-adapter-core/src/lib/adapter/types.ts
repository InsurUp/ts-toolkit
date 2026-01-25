/**
 * @fileoverview Adapter Types
 * @description Types specific to the BaseTableAdapter
 */

import type {
  TableOptions as TanStackTableOptions,
  TableOptionsResolved,
} from '@tanstack/table-core';
import type { GraphQLErrors, ClientError } from '@insurup/sdk';
import type { InternalColumnDef } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';

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
  /** Total number of rows */
  rowCount: number;
  /** Total number of pages */
  pageCount: number;
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

/**
 * Options for BaseTableAdapter constructor
 * @template TRow - The row type (for callback typing)
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 */
export interface BaseTableAdapterOptions<
  TRow,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
> extends ErrorCallbacks<TRow> {
  /** Internal column definitions (converted from schema) */
  columns: InternalColumnDef[];
  /** Fields to select from GraphQL */
  select: string[];
  /** Page size */
  pageSize: number;
  /** Default sorting in SDK format */
  defaultSort?: TSortInput[];
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
}
