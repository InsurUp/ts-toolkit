/**
 * @fileoverview Base Table Adapter
 * @description Framework-agnostic table adapter with TanStack Query integration
 */

import type { SortingState, ColumnDef, Updater, TableOptionsResolved } from '@tanstack/table-core';
import { getCoreRowModel } from '@tanstack/table-core';
import type { DeepFieldKeys, InsurUpGraphQLResult, Connection } from '@insurup/sdk';
import { InsurUpClientErrorType } from '@insurup/sdk';
import { QueryManager } from '../query/manager.js';
import { createCursorPagination } from '../pagination/cursor.js';
import type {
  AdapterState,
  TableOptions,
  BaseTableAdapterOptions,
  ErrorCallbacks,
  TableError,
} from './types.js';
import type { FetchFn, QueryOptionsBuilder as FetchQueryOptionsBuilder } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';
import { internalColumnsToColumnDefs, createTableError } from './utils.js';

/**
 * BaseTableAdapter - Core adapter logic for TanStack Table integration
 *
 * @template TEntity - The full entity type (e.g., QueryCustomerModel)
 * @template TRow - The row type with only selected fields (use SDK's PickFields<TEntity, TFields>)
 * @template TQueryOptions - The query options type (e.g., GetCustomersOptions)
 * @template TSortInput - The SDK sort input type (e.g., QueryCustomerModelSortInput)
 * @template TFilterInput - The SDK filter input type (e.g., QueryCustomerModelFilterInput)
 * @template TSearchInput - The SDK search input type (e.g., QueryCustomerModelSearchInput)
 *
 * The fetchFn must return Connection<TRow> (not Connection<TEntity>) for type safety.
 * Use SDK's PickFields or PickCustomerFields to compute TRow from selected fields.
 *
 * Handles:
 * - Column conversion (schema → ColumnDef[])
 * - GraphQL select extraction from schema fields
 * - Sorting transformation (TanStack → SDK format)
 * - Filter and search state management
 * - Cursor pagination management
 * - State management via @tanstack/query-core
 */
export class BaseTableAdapter<
  TEntity,
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput = unknown,
  TSearchInput = unknown,
> {
  /** Static server snapshot for SSR - frozen for referential stability */
  private static readonly SERVER_SNAPSHOT: AdapterState<unknown> = Object.freeze({
    rows: [],
    rowCount: 0,
    pageCount: 0,
    isLoading: true,
    isFetching: false,
    error: null,
    isError: false,
    isSuccess: false,
  });

  readonly columns: ColumnDef<TRow, unknown>[];
  private select: DeepFieldKeys<TEntity>[];
  private pagination: ReturnType<typeof createCursorPagination>;
  /** Sorting stored in SDK format for type safety */
  private sorting: TSortInput[] | undefined;
  /** Filter stored in SDK format */
  private filter: TFilterInput | undefined;
  /** Search stored in SDK format */
  private search: TSearchInput | undefined;
  private sortingConverters: SortingConverters<TSortInput>;
  private queryKeyPrefix: string;
  private queryManager: QueryManager<InsurUpGraphQLResult<Connection<TRow>>, TQueryOptions>;
  private pageSize: number;
  private listeners: Set<() => void> = new Set();
  private cachedState: AdapterState<TRow>;
  private callbacks: ErrorCallbacks<TRow>;
  private unsubscribeQueryManager: (() => void) | null = null;
  /** Pass-through TanStack Table options for client-side features */
  private tableOptions:
    | Partial<Omit<TableOptionsResolved<TRow>, 'data' | 'columns' | 'getCoreRowModel'>>
    | undefined;
  /** Cached getCoreRowModel result - stable reference for React */
  private coreRowModel: ReturnType<typeof getCoreRowModel<TRow>>;
  /** Cached table options - stable reference for React */
  private cachedTableOptions: TableOptions<TRow> | null = null;
  /** Last state used to build cachedTableOptions - for comparison */
  private lastOptionsState: {
    rows: TRow[];
    pageCount: number;
    rowCount: number;
    sorting: TSortInput[] | undefined;
    pageIndex: number;
    pageSize: number;
    passedState: object | undefined;
  } | null = null;

  /**
   * Handle sorting change from TanStack Table
   * Bound method for stable reference in React
   */
  private handleSortingChange = (updater: Updater<SortingState>): void => {
    const tanstackSorting = this.sortingConverters.toTanStack(this.sorting);
    const newTanStackSorting = typeof updater === 'function' ? updater(tanstackSorting) : updater;
    // Convert TanStack sorting to SDK format for storage
    this.sorting = this.sortingConverters.toSdk(newTanStackSorting);
    this.pagination.reset();
    void this.fetch();
  };

  /**
   * Handle pagination change from TanStack Table
   * Bound method for stable reference in React
   */
  private handlePaginationChange = (
    updater: Updater<{ pageIndex: number; pageSize: number }>
  ): void => {
    const current = {
      pageIndex: this.pagination.getState().pageIndex,
      pageSize: this.pageSize,
    };
    const newPagination = typeof updater === 'function' ? updater(current) : updater;

    const pageDiff = Math.abs(newPagination.pageIndex - current.pageIndex);

    // Warn if attempting to jump multiple pages (cursor pagination limitation)
    if (pageDiff > 1) {
      console.warn(
        `[tanstack-table-adapter] Cursor pagination only supports sequential navigation. ` +
          `Attempted to jump ${pageDiff} pages (from ${current.pageIndex} to ${newPagination.pageIndex}). ` +
          `Moving one page instead. Check paginationMode to disable page-jump UI controls.`
      );
    }

    // Move one step in requested direction
    if (newPagination.pageIndex > current.pageIndex && this.pagination.canGoNext()) {
      this.pagination.next();
    } else if (newPagination.pageIndex < current.pageIndex && this.pagination.canGoPrevious()) {
      this.pagination.previous();
    }

    void this.fetch();
  };

  constructor(
    private fetchFn: FetchFn<TRow, TQueryOptions>,
    private buildFetchQueryOptions: FetchQueryOptionsBuilder<
      TEntity,
      TQueryOptions,
      TSortInput,
      TFilterInput,
      TSearchInput
    >,
    options: BaseTableAdapterOptions<TRow, TSortInput, TFilterInput, TSearchInput>
  ) {
    // Input validation
    if (options.pageSize <= 0) {
      throw new Error('pageSize must be greater than 0');
    }
    if (!options.columns || options.columns.length === 0) {
      throw new Error('At least one column must be provided');
    }

    this.pageSize = options.pageSize;
    this.sortingConverters = options.sortingConverters;
    this.queryKeyPrefix = options.queryKeyPrefix ?? 'table';

    // Store select fields from options (already extracted from schema)
    this.select = options.select as DeepFieldKeys<TEntity>[];

    // Convert internal columns to TanStack ColumnDef
    this.columns = internalColumnsToColumnDefs<TRow>(options.columns);

    // Store sorting, filter, and search in SDK format directly
    this.sorting = options.defaultSort;
    this.filter = options.defaultFilter;
    this.search = options.defaultSearch;
    this.pagination = createCursorPagination({ pageSize: options.pageSize });

    // Store error callbacks
    this.callbacks = {
      onError: options.onError,
      onSuccess: options.onSuccess,
      onSettled: options.onSettled,
    };

    // Store pass-through table options
    this.tableOptions = options.tableOptions;

    // Cache getCoreRowModel result - stable reference for React
    this.coreRowModel = getCoreRowModel();

    // Initialize cached state
    this.cachedState = {
      rows: [],
      rowCount: 0,
      pageCount: 0,
      isLoading: false,
      isFetching: false,
      error: null,
      isError: false,
      isSuccess: false,
    };

    // Initialize query manager - stores SDK result directly
    this.queryManager = new QueryManager({
      queryFn: async (vars, context) => {
        const result = await this.fetchFn(vars, { signal: context.signal });
        // Update pagination state on success
        if (result.isSuccess) {
          this.pagination.update(result.data.pageInfo);
        }
        return result;
      },
      getQueryKey: () => this.getQueryKey(),
      getVariables: () => this.buildVariables(),
      staleTime: options.staleTime,
      gcTime: options.gcTime,
    });

    // Forward query manager subscriptions and update cached state
    this.unsubscribeQueryManager = this.queryManager.subscribe(() => {
      this.updateCachedState();
      this.notifyListeners();
    });

    // Auto-fetch on creation if enabled
    if (options.autoFetch) {
      void this.fetch();
    }
  }

  /**
   * Update the cached state from query manager
   * Extracts rows, calculates pageCount, and handles errors from SDK result
   * Calls error callbacks when appropriate
   */
  private updateCachedState(): void {
    const queryState = this.queryManager.getState();
    const sdkResult = queryState.data;

    // Handle SDK result - extract data or use defaults
    let rows: TRow[] = [];
    let rowCount = 0;
    let pageCount = 0;
    let tableError: TableError | null = null;

    if (sdkResult?.isSuccess) {
      const data = sdkResult.data;
      rows = (data.nodes ?? []).filter((node): node is NonNullable<typeof node> => node !== null);
      rowCount = data.totalCount;
      pageCount = Math.ceil(rowCount / this.pageSize);
    } else if (sdkResult && !sdkResult.isSuccess) {
      // SDK returned an error - create TableError
      tableError = createTableError(sdkResult);
    }

    // Also check for query-level errors (network errors caught by query manager)
    if (queryState.error && !tableError) {
      // This shouldn't happen often since SDK wraps errors, but handle it
      tableError = {
        name: 'TableError',
        message: queryState.error.message,
        cause: {
          kind: 'client-error',
          isSuccess: false,
          message: queryState.error.message,
          type: InsurUpClientErrorType.Unknown,
        },
        retryable: true,
      } as TableError;
    }

    const previousState = this.cachedState;
    const isSuccess = queryState.isSuccess && (sdkResult?.isSuccess ?? false);

    this.cachedState = {
      rows,
      rowCount,
      pageCount,
      isLoading: queryState.isLoading,
      isFetching: queryState.isFetching,
      error: tableError,
      isError: tableError !== null,
      isSuccess,
    };

    // Call callbacks only when fetch completes (not during loading)
    if (!queryState.isFetching && previousState.isFetching) {
      if (tableError) {
        this.callbacks.onError?.(tableError);
      } else if (isSuccess) {
        this.callbacks.onSuccess?.(this.cachedState);
      }
      this.callbacks.onSettled?.(isSuccess ? this.cachedState : undefined, tableError);
    }
  }

  /**
   * Get unique query key for caching
   * Uses queryKeyPrefix to prevent cache collisions between different entity types
   * Includes filter and search for proper cache isolation
   */
  private getQueryKey(): unknown[] {
    return [
      this.queryKeyPrefix,
      this.select,
      this.sorting,
      this.filter,
      this.search,
      this.pagination.getState().pageIndex,
    ];
  }

  /**
   * Build query variables for fetch
   * Uses SDK sorting, filter, and search formats directly (no transformation needed)
   */
  private buildVariables(): TQueryOptions {
    return this.buildFetchQueryOptions({
      first: this.pageSize,
      after: this.pagination.getState().cursor,
      order: this.sorting,
      select: this.select,
      filter: this.filter,
      search: this.search,
    });
  }

  /**
   * Trigger a fetch
   */
  async fetch(): Promise<void> {
    await this.queryManager.fetch();
  }

  /**
   * Invalidate cache and refetch
   */
  async invalidate(): Promise<void> {
    await this.queryManager.invalidate();
  }

  /**
   * Refetch data with optional force bypass of cache
   *
   * - `refetch()` or `refetch({ force: false })` - same as `fetch()`, uses cache if fresh
   * - `refetch({ force: true })` - forces a network request, bypassing cache staleness
   *
   * @param options - Refetch options
   * @param options.force - If true, forces a network request regardless of cache state
   */
  async refetch(options?: { force?: boolean }): Promise<void> {
    if (options?.force) {
      await this.queryManager.refetch({ throwOnError: false });
    } else {
      await this.queryManager.fetch();
    }
  }

  /**
   * Change page size and reset to first page
   * @param size - New page size (must be greater than 0)
   * @throws Error if size is not greater than 0
   */
  setPageSize(size: number): void {
    if (size <= 0) {
      throw new Error('pageSize must be greater than 0');
    }
    this.pageSize = size;
    this.pagination.setPageSize(size);
    void this.fetch();
  }

  /**
   * Get TanStack Table options
   *
   * Returns a complete options object that can be spread directly into useReactTable().
   * Includes data, columns, getCoreRowModel, and any pass-through options.
   *
   * The returned object is memoized - the same reference is returned if the underlying
   * state hasn't changed, preventing unnecessary React re-renders.
   *
   * @example
   * ```tsx
   * // One-liner usage!
   * const table = useReactTable(customerTable.getTableOptions())
   * ```
   */
  getTableOptions(): TableOptions<TRow> {
    // Extract state from pass-through options (excluding sorting/pagination which we control)
    const { state: passedState, ...otherTableOptions } = this.tableOptions ?? {};

    // Current state for comparison
    const currentState = {
      rows: this.cachedState.rows,
      pageCount: this.cachedState.pageCount,
      rowCount: this.cachedState.rowCount,
      sorting: this.sorting,
      pageIndex: this.pagination.getState().pageIndex,
      pageSize: this.pageSize,
      passedState: passedState as object | undefined,
    };

    // Return cached options if state hasn't changed
    if (this.cachedTableOptions && this.lastOptionsState) {
      const last = this.lastOptionsState;
      if (
        last.rows === currentState.rows &&
        last.pageCount === currentState.pageCount &&
        last.rowCount === currentState.rowCount &&
        last.sorting === currentState.sorting &&
        last.pageIndex === currentState.pageIndex &&
        last.pageSize === currentState.pageSize &&
        last.passedState === currentState.passedState
      ) {
        return this.cachedTableOptions;
      }
    }

    // Convert SDK sorting to TanStack format for the table state
    const tanstackSorting = this.sortingConverters.toTanStack(this.sorting);

    // Build new options object
    this.cachedTableOptions = {
      // Spread pass-through options first (for row selection, column visibility, etc.)
      // Note: manualPagination, manualSorting, state handlers come after to ensure they aren't overwritten
      ...otherTableOptions,
      // Data and columns - no need to pass separately!
      data: this.cachedState.rows,
      columns: this.columns,
      // Core row model - cached reference, no need to import separately!
      getCoreRowModel: this.coreRowModel,
      // Server-side settings (these override any pass-through values)
      manualPagination: true as const,
      manualSorting: true as const,
      paginationMode: 'cursor',
      pageCount: this.cachedState.pageCount,
      rowCount: this.cachedState.rowCount,
      state: {
        // Default state (user can override via tableOptions.state)
        columnPinning: { left: [], right: [] },
        // User's pass-through state (e.g., rowSelection, columnVisibility, expanded)
        ...passedState,
        // Adapter-managed state (always takes precedence - server-side controlled)
        sorting: tanstackSorting,
        pagination: {
          pageIndex: this.pagination.getState().pageIndex,
          pageSize: this.pageSize,
        },
      },
      // Use bound methods for stable references
      onSortingChange: this.handleSortingChange,
      onPaginationChange: this.handlePaginationChange,
    };

    // Store current state for next comparison
    this.lastOptionsState = currentState;

    return this.cachedTableOptions;
  }

  /**
   * Get current adapter state
   */
  getState(): AdapterState<TRow> {
    return this.cachedState;
  }

  /**
   * Subscribe to state changes
   * Compatible with React's useSyncExternalStore
   */
  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  /**
   * Get current state snapshot
   * Compatible with React's useSyncExternalStore
   * Returns a cached reference to avoid infinite loops
   */
  getSnapshot = (): AdapterState<TRow> => {
    return this.cachedState;
  };

  /**
   * Get server-side state snapshot
   * Returns initial loading state for server-side rendering
   * Compatible with React's useSyncExternalStore third parameter
   * Returns a cached static reference for referential stability
   */
  getServerSnapshot = (): AdapterState<TRow> => {
    return BaseTableAdapter.SERVER_SNAPSHOT as AdapterState<TRow>;
  };

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // ============================================================================
  // Filter Methods
  // ============================================================================

  /**
   * Set filter criteria and refetch
   * Resets pagination to first page when filter changes
   * @param filter - The filter criteria using SDK's filter input type
   */
  setFilter(filter: TFilterInput): void {
    this.filter = filter;
    this.pagination.reset();
    void this.fetch();
  }

  /**
   * Get current filter criteria
   * @returns The current filter or undefined if not set
   */
  getFilter(): TFilterInput | undefined {
    return this.filter;
  }

  /**
   * Clear filter criteria and refetch
   * Resets pagination to first page
   */
  clearFilter(): void {
    this.filter = undefined;
    this.pagination.reset();
    void this.fetch();
  }

  // ============================================================================
  // Search Methods
  // ============================================================================

  /**
   * Set search criteria and refetch
   * Resets pagination to first page when search changes
   * @param search - The search criteria using SDK's search input type
   */
  setSearch(search: TSearchInput): void {
    this.search = search;
    this.pagination.reset();
    void this.fetch();
  }

  /**
   * Get current search criteria
   * @returns The current search or undefined if not set
   */
  getSearch(): TSearchInput | undefined {
    return this.search;
  }

  /**
   * Clear search criteria and refetch
   * Resets pagination to first page
   */
  clearSearch(): void {
    this.search = undefined;
    this.pagination.reset();
    void this.fetch();
  }

  /**
   * Destroy the adapter and clean up resources
   * Call this when unmounting the table to prevent memory leaks
   */
  destroy(): void {
    this.unsubscribeQueryManager?.();
    this.queryManager.destroy();
    this.listeners.clear();
  }
}
