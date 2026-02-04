/**
 * @fileoverview Fine-grained reactive state class for Svelte 5
 * @description Provides granular reactivity for table adapter state
 *
 * Instead of a monolithic state object that triggers re-renders for all properties,
 * this class exposes individual reactive signals. Components can subscribe to only
 * what they need (e.g., `isLoading` for a spinner, `rows` for the table body).
 *
 * Uses createSubscriber (official Svelte 5 pattern) for integrating the adapter's
 * external event system with Svelte's reactivity.
 */

import { createSubscriber } from 'svelte/reactivity';
import type { Table, TableOptionsResolved } from '@tanstack/table-core';
import type { TableError, ITableAdapter, AdapterState, PaginationManager } from '@insurup/table-adapter-core';

/**
 * Fine-grained reactive state for table adapters.
 *
 * Each property is an individual Svelte 5 reactive signal, allowing components
 * to subscribe to only what they need for optimal re-render performance.
 *
 * @template TRow - The row type with selected fields
 *
 * @example
 * ```svelte
 * <!-- Only re-renders when isLoading changes -->
 * {#if ct.isLoading}
 *   <Spinner />
 * {/if}
 *
 * <!-- Only re-renders when rows changes -->
 * {#each ct.rows as row}
 *   <Row {row} />
 * {/each}
 * ```
 */
export class TableState<TRow> {
  // ============================================================================
  // Fine-grained state signals (from AdapterState)
  // ============================================================================

  /** Array of entity rows */
  rows = $state.raw<TRow[]>([]);

  /** Total number of rows (null while loading when splitTotalCount is enabled) */
  rowCount = $state<number | null>(0);

  /** Total number of pages (null while loading when splitTotalCount is enabled) */
  pageCount = $state<number | null>(0);

  /** Initial loading state */
  isLoading = $state(false);

  /** Fetching state (includes refetches) */
  isFetching = $state(false);

  /** Error if any (rich error with SDK details) */
  error = $state.raw<TableError | null>(null);

  /** Whether in error state */
  isError = $state(false);

  /** Whether data was successfully fetched */
  isSuccess = $state(false);

  /** Whether total count is currently being fetched separately (only when splitTotalCount is enabled) */
  isCountLoading = $state(false);

  // ============================================================================
  // Table reference (with createSubscriber reactivity)
  // ============================================================================

  /**
   * Internal table reference.
   *
   * Uses `null!` (definite assignment assertion) because the table is immediately
   * assigned in the constructor before any method can access it. This pattern
   * avoids an unnecessary `| null` union type while remaining type-safe.
   */
  #table: Table<TRow> = null!;

  /** Subscriber function for table reactivity (official Svelte 5 pattern) */
  #subscribeToTable: () => void = () => {};

  /**
   * Trigger function to notify subscribers that the table has changed.
   * This is the `update` function from createSubscriber, stored for manual triggering.
   */
  #triggerTableUpdate: () => void = () => {};

  /**
   * TanStack Table instance - reactive via createSubscriber pattern.
   * Calling this getter in an effect/template makes it re-run when adapter changes
   * or when table options are updated via updateTableOptions().
   */
  get table(): Table<TRow> {
    this.#subscribeToTable();
    return this.#table;
  }

  /**
   * Update table options and trigger reactivity.
   * Use this method instead of calling table.setOptions() directly
   * to ensure Svelte re-renders components that depend on the table.
   *
   * @param updater - Function that receives previous options and returns new options
   */
  updateTableOptions(
    updater: (prev: TableOptionsResolved<TRow>) => TableOptionsResolved<TRow>
  ): void {
    this.#table.setOptions(updater);
    this.#triggerTableUpdate();
  }

  // ============================================================================
  // Pagination (with createSubscriber reactivity)
  // ============================================================================

  /** Subscriber function for pagination reactivity */
  #subscribeToPagination: () => void = () => {};

  /** Trigger function to notify subscribers that pagination has changed */
  #triggerPaginationUpdate: () => void = () => {};

  /**
   * Pagination manager - reactive via createSubscriber pattern.
   * Calling this getter in an effect/template makes it re-run when adapter state changes.
   *
   * @example
   * ```svelte
   * <button disabled={!ct.pagination.canGoNext()} onclick={() => { ct.pagination.next(); ct.adapter.fetch(); }}>
   *   Next
   * </button>
   * <span>Page {ct.pagination.getState().pageIndex + 1}</span>
   * ```
   */
  get pagination(): PaginationManager {
    this.#subscribeToPagination();
    return this.#adapter.pagination;
  }

  /** Whether there's a next page available */
  hasNextPage = $state(false);

  // ============================================================================
  // Derived computed values
  // ============================================================================

  /** True when data is loaded and rows array is empty */
  isEmpty = $derived(this.rows.length === 0 && this.isSuccess);

  /** True when rows array has data */
  hasData = $derived(this.rows.length > 0);

  /** True when more data can be loaded (not fetching and has next page) */
  canLoadMore = $derived(!this.isFetching && this.hasNextPage);

  // ============================================================================
  // Adapter (with createSubscriber reactivity)
  // ============================================================================

  readonly #adapter: ITableAdapter<TRow, unknown, unknown, PaginationManager>;

  /** Subscriber function for adapter reactivity */
  #subscribeToAdapter: () => void = () => {};

  /** Trigger function to notify subscribers that adapter state has changed */
  #triggerAdapterUpdate: () => void = () => {};

  /**
   * Raw adapter for advanced use (setFilter, setSearch, invalidate, etc.)
   * Reactive via createSubscriber pattern - re-renders when adapter state changes.
   *
   * Use this for accessing adapter.pagination when you need reactivity.
   */
  get adapter(): ITableAdapter<TRow, unknown, unknown, PaginationManager> {
    this.#subscribeToAdapter();
    return this.#adapter;
  }

  // ============================================================================
  // Subscription management
  // ============================================================================

  #unsubscribe: (() => void) | null = null;

  // ============================================================================
  // Constructor
  // ============================================================================

  constructor(adapter: ITableAdapter<TRow, unknown, unknown, PaginationManager>) {
    this.#adapter = adapter;
    this.#table = adapter.getTable();

    // Initialize state from adapter
    this.#updateState(adapter.getSnapshot());

    // Create a subscriber for table reactivity using the official Svelte 5 pattern.
    // This integrates the adapter's external event system with Svelte's reactivity.
    this.#subscribeToTable = createSubscriber((update) => {
      // Store the update function so we can trigger re-renders manually
      // when table options change via updateTableOptions()
      this.#triggerTableUpdate = update;
      // Cleanup is handled by the main subscription below
      return () => {};
    });

    // Create a subscriber for pagination reactivity
    // Reuses the same trigger mechanism since pagination changes when adapter state changes
    this.#subscribeToPagination = createSubscriber((update) => {
      // Store update function - will be called when adapter state changes
      this.#triggerPaginationUpdate = update;
      return () => {};
    });

    // Create a subscriber for adapter reactivity
    // Triggered when pagination changes so adapter.pagination is reactive
    this.#subscribeToAdapter = createSubscriber((update) => {
      this.#triggerAdapterUpdate = update;
      return () => {};
    });

    // Single subscription for fine-grained state updates, table, and pagination reactivity
    this.#unsubscribe = adapter.subscribe(() => {
      this.#updateState(adapter.getSnapshot());
      this.#triggerTableUpdate();
    });

    // Pagination subscription triggers both pagination and adapter updates
    // This ensures adapter.pagination is also reactive
    adapter.pagination.subscribe(() => {
      this.#triggerPaginationUpdate();
      this.#triggerAdapterUpdate();
    });
  }

  // ============================================================================
  // State update (efficient - only mutates changed properties)
  // ============================================================================

  #updateState(snapshot: AdapterState<TRow>): void {
    // Only update properties that have changed to minimize reactivity triggers
    if (this.rows !== snapshot.rows) {
      this.rows = snapshot.rows;
    }
    if (this.rowCount !== snapshot.rowCount) {
      this.rowCount = snapshot.rowCount;
    }
    if (this.pageCount !== snapshot.pageCount) {
      this.pageCount = snapshot.pageCount;
    }
    if (this.isLoading !== snapshot.isLoading) {
      this.isLoading = snapshot.isLoading;
    }
    if (this.isFetching !== snapshot.isFetching) {
      this.isFetching = snapshot.isFetching;
    }
    if (this.error !== snapshot.error) {
      this.error = snapshot.error;
    }
    if (this.isError !== snapshot.isError) {
      this.isError = snapshot.isError;
    }
    if (this.isSuccess !== snapshot.isSuccess) {
      this.isSuccess = snapshot.isSuccess;
    }
    if (this.isCountLoading !== snapshot.isCountLoading) {
      this.isCountLoading = snapshot.isCountLoading;
    }
    // Update pagination state for canLoadMore reactivity
    const canNextPage = this.#table.getCanNextPage();
    if (this.hasNextPage !== canNextPage) {
      this.hasNextPage = canNextPage;
    }
  }

  // ============================================================================
  // Cleanup
  // ============================================================================

  /**
   * Cleanup function - call in onDestroy
   * Unsubscribes from adapter and cleans up resources
   */
  destroy(): void {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
    this.#adapter.destroy();
  }
}
