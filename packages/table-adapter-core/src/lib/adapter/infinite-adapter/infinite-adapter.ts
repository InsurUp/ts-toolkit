/**
 * @fileoverview Infinite Table Adapter
 * @description Table adapter with row accumulation for infinite scroll
 */

import type { ColumnDef, Table } from '@tanstack/table-core';
import { BaseTableAdapter } from '../base-adapter.js';
import type {
  AdapterState,
  TableOptions,
  BaseTableAdapterOptions,
  ColumnInfo,
  ITableAdapter,
} from '../types.js';
import type { FetchFn, QueryOptionsBuilder } from '../../types.js';

/**
 * InfiniteTableAdapter - Adapter for infinite scroll with row accumulation
 *
 * Wraps BaseTableAdapter and accumulates rows across page fetches instead of replacing.
 * Implements the same ITableAdapter interface for consistent API.
 *
 * @template TEntity - The full entity type (e.g., QueryCustomerModel)
 * @template TRow - The row type with only selected fields
 * @template TQueryOptions - The query options type (e.g., GetCustomersOptions)
 * @template TSortInput - The SDK sort input type
 * @template TFilterInput - The SDK filter input type
 * @template TSearchInput - The SDK search input type
 */
export class InfiniteTableAdapter<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
> implements ITableAdapter<TRow, TFilterInput, TSearchInput> {
  /** Wrapped base adapter - handles all core functionality */
  private readonly baseAdapter: BaseTableAdapter<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput
  >;

  /** Accumulated rows across all fetched pages */
  private accumulatedRows: TRow[] = [];

  /** Last page index that was successfully fetched (to avoid duplicates) */
  private lastFetchedPageIndex = -1;

  /** Subscription listeners */
  private listeners = new Set<() => void>();

  /** Unsubscribe function for base adapter subscription */
  private unsubscribeBase: (() => void) | null = null;

  /** Cached state snapshot for useSyncExternalStore compatibility */
  private cachedState: AdapterState<TRow> | null = null;

  constructor(
    fetchFn: FetchFn<TRow, TQueryOptions>,
    buildQueryOptions: QueryOptionsBuilder<
      TEntity,
      TQueryOptions,
      TSortInput,
      TFilterInput,
      TSearchInput
    >,
    options: BaseTableAdapterOptions<TEntity, TRow, TSortInput, TFilterInput, TSearchInput>
  ) {
    // Create base adapter with autoFetch disabled - we control the first fetch
    this.baseAdapter = new BaseTableAdapter(fetchFn, buildQueryOptions, {
      ...options,
      autoFetch: false,
    });

    // Initialize cached state
    this.updateCachedState();

    // Subscribe to base adapter state changes
    this.unsubscribeBase = this.baseAdapter.subscribe(() => this.handleBaseUpdate());

    // Trigger initial fetch if autoFetch was requested
    if (options.autoFetch) {
      void this.baseAdapter.fetch();
    }
  }

  /**
   * Handle state updates from the base adapter
   * Accumulates rows instead of replacing them
   */
  private handleBaseUpdate(): void {
    const baseState = this.baseAdapter.getState();
    const currentPageIndex = this.baseAdapter.getTable().getState().pagination.pageIndex;

    // Detect if pagination was reset (e.g., sorting changed, filter changed via table)
    // If current page is before our last fetched page, we need to reset accumulated rows
    if (currentPageIndex < this.lastFetchedPageIndex) {
      this.resetRows();
    }

    // Only append rows if this is a new page we haven't fetched before
    if (baseState.isSuccess && currentPageIndex > this.lastFetchedPageIndex) {
      this.accumulatedRows = [...this.accumulatedRows, ...baseState.rows];
      this.lastFetchedPageIndex = currentPageIndex;
    }

    // Update cached state for useSyncExternalStore compatibility
    this.updateCachedState();
    this.notifyListeners();
  }

  /**
   * Update the cached state snapshot
   * Only called when state actually changes to maintain referential stability
   */
  private updateCachedState(): void {
    const base = this.baseAdapter.getState();
    this.cachedState = {
      ...base,
      rows: this.accumulatedRows,
      rowCount: this.accumulatedRows.length,
    };
  }

  /**
   * Reset accumulated rows (called when filters/search/etc change)
   */
  private resetRows(): void {
    this.accumulatedRows = [];
    this.lastFetchedPageIndex = -1;
    this.updateCachedState();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // ============================================================================
  // ITableAdapter Implementation - TanStack Table Integration
  // ============================================================================

  get columns(): readonly ColumnDef<TRow, unknown>[] {
    return this.baseAdapter.columns;
  }

  getTable(): Table<TRow> {
    return this.baseAdapter.getTable();
  }

  getTableOptions(): TableOptions<TRow> {
    return this.baseAdapter.getTableOptions();
  }

  // ============================================================================
  // ITableAdapter Implementation - State Management
  // ============================================================================

  getState(): AdapterState<TRow> {
    return this.getSnapshot();
  }

  /**
   * Get state snapshot with accumulated rows
   * Returns cached state for useSyncExternalStore compatibility (stable reference)
   */
  getSnapshot(): AdapterState<TRow> {
    // Return cached state - it's updated in handleBaseUpdate when state changes
    // This ensures referential stability required by useSyncExternalStore
    return this.cachedState!;
  }

  getServerSnapshot(): AdapterState<TRow> {
    return this.baseAdapter.getServerSnapshot();
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // ============================================================================
  // ITableAdapter Implementation - Data Operations
  // ============================================================================

  async fetch(): Promise<void> {
    await this.baseAdapter.fetch();
  }

  async invalidate(): Promise<void> {
    this.resetRows();
    await this.baseAdapter.invalidate();
  }

  async refetch(options?: { force?: boolean }): Promise<void> {
    this.resetRows();
    await this.baseAdapter.refetch(options);
  }

  // ============================================================================
  // ITableAdapter Implementation - Pagination
  // ============================================================================

  setPageSize(size: number): void {
    this.resetRows();
    this.baseAdapter.setPageSize(size);
  }

  // ============================================================================
  // ITableAdapter Implementation - Filtering & Search
  // ============================================================================

  setFilter(filter: TFilterInput): void {
    this.resetRows();
    this.baseAdapter.setFilter(filter);
  }

  getFilter(): TFilterInput | undefined {
    return this.baseAdapter.getFilter();
  }

  clearFilter(): void {
    this.resetRows();
    this.baseAdapter.clearFilter();
  }

  setSearch(search: TSearchInput): void {
    this.resetRows();
    this.baseAdapter.setSearch(search);
  }

  getSearch(): TSearchInput | undefined {
    return this.baseAdapter.getSearch();
  }

  clearSearch(): void {
    this.resetRows();
    this.baseAdapter.clearSearch();
  }

  // ============================================================================
  // ITableAdapter Implementation - Column Info
  // ============================================================================

  getColumnInfo(): ColumnInfo[] {
    return this.baseAdapter.getColumnInfo();
  }

  // ============================================================================
  // ITableAdapter Implementation - Lifecycle
  // ============================================================================

  destroy(): void {
    this.unsubscribeBase?.();
    this.baseAdapter.destroy();
    this.listeners.clear();
    this.accumulatedRows = [];
  }
}
