/**
 * @fileoverview Shared factory logic for Svelte 5 table wrappers
 * @description Common code for createCustomerTable and createInfiniteCustomerTable
 *
 * This module extracts the shared reactive setup logic:
 * - TableState class instantiation (handles fine-grained signals + table reactivity)
 * - Reactive tableOptions syncing via $effect.pre
 * - Cleanup handling
 */

import type { Table } from '@tanstack/table-core';
import type { ITableAdapter, TableError, PaginationManager } from '@insurup/table-adapter-core';
import { TableState } from './table-state.svelte.js';

/**
 * Options for the table core factory
 * @template TRow - The row type with selected fields
 * @template TOptions - The options type for creating the adapter
 */
export interface CreateTableCoreOptions<TRow, TOptions> {
  /** Getter function for options (enables reactive tableOptions) */
  getOptions: () => TOptions;
  /** Factory function to create the core adapter */
  createAdapter: (options: TOptions) => ITableAdapter<TRow, unknown, unknown, PaginationManager>;
  /** Extract tableOptions.state from options for reactive syncing */
  getTableOptionsState: (options: TOptions) => Record<string, unknown> | undefined;
}

/**
 * Result from createTableCore
 * Extends TableState with the specific adapter type
 *
 * @template TRow - The row type with selected fields
 * @template TAdapter - The specific adapter type (CustomerTable or InfiniteCustomerTable)
 */
export interface TableCoreResult<
  TRow,
  TAdapter extends ITableAdapter<TRow, unknown, unknown, PaginationManager>,
> {
  // ============================================================================
  // Fine-grained state signals (from TableState)
  // ============================================================================

  /** Array of entity rows */
  readonly rows: TRow[];

  /** Total number of rows (null while loading when splitTotalCount is enabled) */
  readonly rowCount: number | null;

  /** Total number of pages (null while loading when splitTotalCount is enabled) */
  readonly pageCount: number | null;

  /** Initial loading state */
  readonly isLoading: boolean;

  /** Fetching state (includes refetches) */
  readonly isFetching: boolean;

  /** Error if any (rich error with SDK details) */
  readonly error: TableError | null;

  /** Whether in error state */
  readonly isError: boolean;

  /** Whether data was successfully fetched */
  readonly isSuccess: boolean;

  /** Whether total count is currently being fetched separately (only when splitTotalCount is enabled) */
  readonly isCountLoading: boolean;

  // ============================================================================
  // Derived computed values
  // ============================================================================

  /** True when data is loaded and rows array is empty */
  readonly isEmpty: boolean;

  /** True when rows array has data */
  readonly hasData: boolean;

  /** True when more data can be loaded */
  readonly canLoadMore: boolean;

  /** Whether there's a next page available */
  readonly hasNextPage: boolean;

  // ============================================================================
  // Pagination
  // ============================================================================

  /** Pagination manager - reactive via createSubscriber pattern */
  readonly pagination: PaginationManager;

  // ============================================================================
  // Table and adapter
  // ============================================================================

  /** TanStack Table instance */
  readonly table: Table<TRow>;

  /** Raw adapter for advanced use */
  readonly adapter: TAdapter;

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /** Cleanup function - call in onDestroy */
  destroy(): void;
}

/**
 * Creates a table wrapper with reactive state for Svelte 5.
 *
 * This is the shared factory logic used by both createCustomerTable
 * and createInfiniteCustomerTable. It handles:
 * - Creating the adapter from options
 * - Setting up fine-grained reactive state via TableState
 * - Syncing reactive tableOptions to TanStack Table via $effect.pre
 * - Cleanup on destroy
 *
 * **Important**: This function uses Svelte 5 runes (`$effect.pre`) and must be
 * called within a Svelte component context. Calling it outside a component
 * (e.g., in a plain `.ts` file or at module level) will cause memory leaks
 * as the effect cleanup will never run.
 *
 * @template TRow - The row type with selected fields
 * @template TOptions - The options type for creating the adapter
 * @template TAdapter - The specific adapter type
 */
export function createTableCore<
  TRow,
  TOptions,
  TAdapter extends ITableAdapter<TRow, unknown, unknown, PaginationManager>,
>(options: CreateTableCoreOptions<TRow, TOptions>): TableCoreResult<TRow, TAdapter> {
  const { getOptions, createAdapter, getTableOptionsState } = options;

  // Get initial options and create the adapter
  const initialOptions = getOptions();
  const adapter = createAdapter(initialOptions) as TAdapter;

  // Create fine-grained reactive state
  const tableState = new TableState<TRow>(adapter);

  // Watch for tableOptions changes and sync to table.
  // Using $effect.pre ensures options are applied before render.
  //
  // Change detection uses $state.snapshot() to unwrap Svelte proxies
  // and structurally compares with the cached previous snapshot.
  // This prevents:
  // 1. Calling onStateChange during initialization (TDZ safety)
  // 2. Redundant onStateChange calls on sync-back from userOnStateChange
  // Seed with the initial state so the first effect run sees no change,
  // preventing onStateChange from firing before the consumer's `ct` is assigned (TDZ).
  const initialState = getTableOptionsState(getOptions());
  let prevStateSnapshot: Record<string, unknown> | undefined = initialState
    ? ($state.snapshot(initialState) as Record<string, unknown>)
    : undefined;

  $effect.pre(() => {
    const currentOptions = getOptions();
    const tableOptionsState = getTableOptionsState(currentOptions);

    if (tableOptionsState) {
      const snapshot = $state.snapshot(tableOptionsState) as Record<string, unknown>;
      const hasStateChange = !isEqual(snapshot, prevStateSnapshot);
      prevStateSnapshot = snapshot;

      tableState.updateTableOptions(
        (prev) => ({
          ...prev,
          state: {
            ...prev.state,
            ...tableOptionsState,
          },
        }),
        hasStateChange
      );
    }
  });

  // Cleanup function
  function destroy(): void {
    tableState.destroy();
  }

  // Return object with getters that delegate to TableState
  // This provides both fine-grained access and backward compatibility
  return {
    // Fine-grained state signals
    get rows() {
      return tableState.rows;
    },
    get rowCount() {
      return tableState.rowCount;
    },
    get pageCount() {
      return tableState.pageCount;
    },
    get isLoading() {
      return tableState.isLoading;
    },
    get isFetching() {
      return tableState.isFetching;
    },
    get error() {
      return tableState.error;
    },
    get isError() {
      return tableState.isError;
    },
    get isSuccess() {
      return tableState.isSuccess;
    },
    get isCountLoading() {
      return tableState.isCountLoading;
    },

    // Derived values
    get isEmpty() {
      return tableState.isEmpty;
    },
    get hasData() {
      return tableState.hasData;
    },
    get canLoadMore() {
      return tableState.canLoadMore;
    },
    get hasNextPage() {
      return tableState.hasNextPage;
    },

    // Pagination - delegates to TableState's reactive getter
    get pagination() {
      return tableState.pagination;
    },

    // Table - delegates to TableState's reactive getter
    get table() {
      return tableState.table;
    },

    // Adapter - delegates to TableState's reactive getter
    get adapter() {
      return tableState.adapter as TAdapter;
    },

    // Lifecycle
    destroy,
  };
}

/**
 * Lightweight structural equality check.
 * Faster than JSON.stringify for small objects — short-circuits on first
 * mismatch and avoids string allocation entirely.
 */
function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => isEqual(v, (b as unknown[])[i]));
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  const recA = a as Record<string, unknown>;
  const recB = b as Record<string, unknown>;
  return keysA.every((k) => isEqual(recA[k], recB[k]));
}
