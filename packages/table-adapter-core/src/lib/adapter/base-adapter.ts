/**
 * @fileoverview Base Table Adapter
 * @description Framework-agnostic table adapter with TanStack Query integration
 */

import type {
  ColumnDef,
  Updater,
  TableOptionsResolved,
  Table,
  TableState,
} from '@tanstack/table-core';
import { getCoreRowModel, createTable } from '@tanstack/table-core';
import type { DeepFieldKeys, InsurUpGraphQLResult, Connection } from '@insurup/sdk';
import { InsurUpClientErrorType } from '@insurup/sdk';
import { QueryManager } from '../query/manager.js';
import { createPaginationManager } from '../pagination/factory.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/types.js';
import type {
  AdapterState,
  TableOptions,
  BaseTableAdapterOptions,
  ErrorCallbacks,
  TableError,
  ColumnInfo,
  ITableAdapter,
} from './types.js';
import type { FetchFn, QueryOptionsBuilder as FetchQueryOptionsBuilder, AnyColumnDef } from '../types.js';
import type { SortingConverters } from '../sorting/types.js';
import { columnsToTanStackColumnDefs, createTableError } from './utils.js';

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
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
> implements ITableAdapter<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  /** Static server snapshot for SSR - frozen for referential stability */
  private static readonly SERVER_SNAPSHOT: AdapterState<unknown> = Object.freeze({
    rows: [],
    rowCount: 0,
    pageCount: 0,
    isLoading: true,
    isFetching: false,
    error: null,
    isError: false,
    isSuccess: false
  });

  readonly columns: ColumnDef<TRow, unknown>[];
  /** Original column definitions (for field mapping, visibility) */
  private readonly internalColumns: AnyColumnDef<DeepFieldKeys<TEntity> & string>[];
  private _pagination: PaginationManagerFromOptions<TPaginationOptions>;
  /** Filter stored in SDK format */
  private filter: TFilterInput | undefined;
  /** Search stored in SDK format */
  private search: TSearchInput | undefined;
  private sortingConverters: SortingConverters<TSortInput>;
  private queryKeyPrefix: string;
  private queryManager: QueryManager<InsurUpGraphQLResult<Connection<TRow>>, TQueryOptions>;
  private pageSize: number;
  private listeners: Set<() => void> = new Set();
  private state: AdapterState<TRow>;
  private callbacks: ErrorCallbacks<TRow>;
  private unsubscribeQueryManager: (() => void) | null = null;
  private unsubscribePagination: (() => void) | null = null;
  /** Flag to prevent double-notification when pagination change originates from TanStack table */
  private isPaginationChangeFromTable = false;
  /** Flag to prevent refetch loop when pagination is updated after fetch completes */
  private isPaginationUpdateFromFetch = false;
  /** Pass-through TanStack Table options for client-side features */
  private initialTableOptions:
    | Partial<Omit<TableOptionsResolved<TRow>, 'data' | 'columns' | 'getCoreRowModel'>>
    | undefined;
  /** Cached getCoreRowModel result - stable reference for React */
  private coreRowModel: ReturnType<typeof getCoreRowModel<TRow>>;
  /** Managed TanStack Table instance (created lazily by getTable) */
  private tableInstance: Table<TRow> | null = null;
  /** User's onStateChange callback from tableOptions */
  private userOnStateChange: ((updater: Updater<TableState>) => void) | undefined;

  /**
   * Compute visible fields from column visibility state
   * Reads visibility from tableState (internal state managed via onStateChange)
   * Falls back to tableOptions.state for initial visibility before table is created
   * @returns Array of field keys for visible columns
   */
  private computeVisibleFields(): DeepFieldKeys<TEntity>[] {
    // Use tableState if available (after getTable() is called), otherwise fall back to initial options
    const visibility = this.tableInstance?.getState().columnVisibility ?? this.initialTableOptions?.state?.columnVisibility ?? {};
    const visibleFields: string[] = [];
    for (const col of this.internalColumns) {
      // Column is visible if not explicitly set to false
      if (visibility[col.key] !== false) {
        for (const field of col.fields) {
          if (!visibleFields.includes(field)) {
            visibleFields.push(field);
          }
        }
      }
    }
    return visibleFields as DeepFieldKeys<TEntity>[];
  }

  /**
   * Check if two field arrays are equal
   */
  private areFieldsEqual(a: DeepFieldKeys<TEntity>[], b: DeepFieldKeys<TEntity>[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  constructor(
    private fetchFn: FetchFn<TRow, TQueryOptions>,
    private buildFetchQueryOptions: FetchQueryOptionsBuilder<
      TEntity,
      TQueryOptions,
      TSortInput,
      TFilterInput,
      TSearchInput
    >,
    options: BaseTableAdapterOptions<TEntity, TRow, TSortInput, TFilterInput, TSearchInput, TPaginationOptions>
  ) {
    // Input validation
    if (!options.columns || options.columns.length === 0) {
      throw new Error('At least one column must be provided');
    }

    // Get pageSize from pagination options with default
    const DEFAULT_PAGE_SIZE = 20;
    this.pageSize = options.pagination.pageSize ?? DEFAULT_PAGE_SIZE;
    if (this.pageSize <= 0) {
      throw new Error('pageSize must be greater than 0');
    }
    this.sortingConverters = options.sortingConverters;
    this.queryKeyPrefix = options.queryKeyPrefix ?? 'table';

    // Store original column definitions
    this.internalColumns = options.columns;

    // Convert to TanStack ColumnDef
    this.columns = columnsToTanStackColumnDefs<TRow>(options.columns);

    // Store pass-through table options (select fields are computed dynamically from columnVisibility)
    // Extract and store user's onStateChange separately for proper forwarding
    const { onStateChange: userOnStateChange, ...restTableOptions } = options.tableOptions ?? {};
    this.userOnStateChange = userOnStateChange;
    this.initialTableOptions = restTableOptions;

    // Store filter and search in SDK format directly
    this.filter = options.defaultFilter;
    this.search = options.defaultSearch;
    this._pagination = createPaginationManager(options.pagination);

    // Store error callbacks
    this.callbacks = {
      onError: options.onError,
      onSuccess: options.onSuccess,
      onSettled: options.onSettled,
    };

    // Cache getCoreRowModel result - stable reference for React
    this.coreRowModel = getCoreRowModel();

    // Initialize cached state
    this.state = {
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
        // Set flag to prevent pagination subscription from triggering another fetch
        if (result.isSuccess) {
          this.isPaginationUpdateFromFetch = true;
          try {
            this._pagination.update(result.data.pageInfo);
          } finally {
            this.isPaginationUpdateFromFetch = false;
          }
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
      this.updateState();
      this.notifyListeners();
    });

    // Subscribe to pagination changes for bidirectional sync
    // When pagination changes directly (not via TanStack table), sync table and refetch
    this.unsubscribePagination = this._pagination.subscribe(() => {
      // Skip if change is from table state handler or from fetch completion
      if (!this.isPaginationChangeFromTable && !this.isPaginationUpdateFromFetch) {
        this.syncTableInstance();
        this.notifyListeners();
        void this.fetch();
      }
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
  private updateState(): void {
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

    const previousState = this.state;
    const isSuccess = queryState.isSuccess && (sdkResult?.isSuccess ?? false);

    this.state = {
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
        this.callbacks.onSuccess?.(this.state);
      }
      this.callbacks.onSettled?.(isSuccess ? this.state : undefined, tableError);
    }

    // Sync table instance with new data
    this.syncTableInstance();
  }

  /**
   * Sync table instance with current adapter state
   * Called when data changes (after fetch) to update the table's data and pagination
   *
   * Uses getTableOptions() which preserves runtime options and state changes,
   * only overriding adapter-managed properties (data, pagination counts, pagination state).
   */
  private syncTableInstance(): void {
    if (!this.tableInstance) return;

    this.tableInstance.setOptions((prev) => ({
      ...prev,
      ...this.getTableOptions(),
    }));
  }

  /**
   * Get unique query key for caching
   * Uses queryKeyPrefix to prevent cache collisions between different entity types
   * Includes sorting (from tableState), select (derived from visibility), filter and search for proper cache isolation
   */
  private getQueryKey(): unknown[] {
    // Read sorting from tableState (internal state managed via onStateChange)
    // Falls back to initialTableOptions.state for initial sorting before table is created
    const sorting = this.tableInstance?.getState().sorting ?? this.initialTableOptions?.state?.sorting;
    // Compute select fields dynamically from column visibility
    const fields = this.computeVisibleFields();
    return [
      this.queryKeyPrefix,
      fields,
      sorting,
      this.filter,
      this.search,
      this._pagination.getState().pageIndex,
    ];
  }

  /**
   * Build query variables for fetch
   * Reads sorting from tableState and converts to SDK format at fetch time
   * Computes select fields dynamically from column visibility
   */
  private buildVariables(): TQueryOptions {
    // Read sorting from tableState (internal state managed via onStateChange)
    // Falls back to initialTableOptions.state for initial sorting before table is created
    const tanstackSorting = this.tableInstance?.getState().sorting ?? this.initialTableOptions?.state?.sorting;
    const sdkSorting = tanstackSorting ? this.sortingConverters.toSdk(tanstackSorting) : undefined;

    // Compute select fields dynamically from column visibility
    const select = this.computeVisibleFields();

    return this.buildFetchQueryOptions({
      first: this.pageSize,
      after: this._pagination.getState().cursor,
      order: sdkSorting,
      select,
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
  get pagination(): PaginationManagerFromOptions<TPaginationOptions> {
    return this._pagination;
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
    this._pagination.setPageSize(size);
    void this.fetch();
  }

  /**
   * Get TanStack Table options
   *
   * Returns a complete options object for initializing TanStack Table.
   * Includes data, columns, getCoreRowModel, onStateChange, and any pass-through options.
   *
   * If a table instance exists (via getTable()), returns the table's current runtime state.
   * This ensures consumers calling table.setOptions(adapter.getTableOptions()) preserve
   * any state changes made during runtime (e.g., column reordering, visibility changes).
   *
   * After initialization, use the table instance directly for state changes.
   * The adapter's onStateChange hook handles:
   * - Sorting changes → reset pagination → refetch
   * - Visibility changes → refetch if fields changed
   * - Internal state sync
   *
   * @example
   * ```tsx
   * // Initialize table once
   * const table = useReactTable(adapter.getTableOptions())
   *
   * // Or use getTable() for simpler integration
   * const table = adapter.getTable()
   * ```
   */
  getTableOptions(): TableOptions<TRow> {
    // Extract initial options for first-time initialization
    const { state: initialUserState, ...initialOtherOptions } = this.initialTableOptions ?? {};

    // If table instance exists, use its current options and state to preserve runtime changes.
    // This ensures both option changes (e.g., enableColumnResizing) and state changes
    // (e.g., columnOrder, sorting) are preserved when consumers call getTableOptions().
    const currentOptions = this.tableInstance?.options;
    const currentState = this.tableInstance?.getState();

    return {
      // Start with current options if table exists, otherwise use initial options.
      // This preserves runtime option changes (enableColumnResizing, columnResizeMode, etc.)
      ...(currentOptions ?? initialOtherOptions),
      // Adapter-managed options always take precedence
      data: this.state.rows,
      columns: this.columns,
      getCoreRowModel: this.coreRowModel,
      manualPagination: true as const,
      manualSorting: true as const,
      paginationMode: 'cursor',
      pageCount: this.state.pageCount,
      rowCount: this.state.rowCount,
      state: {
        // Use current table state if available, otherwise use initial user state
        ...(currentState ?? initialUserState),
        // Adapter-managed pagination always takes precedence
        pagination: {
          pageIndex: this._pagination.getState().pageIndex,
          pageSize: this.pageSize,
        },
      },
      // Adapter's onStateChange - handles sorting/visibility/pagination changes and triggers refetch
      onStateChange: this.handleTableStateChange,
    };
  }

  /**
   * Check if two sorting states are equal
   */
  private isSortingEqual(
    a: { id: string; desc: boolean }[] | undefined,
    b: { id: string; desc: boolean }[] | undefined
  ): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const aItem = a[i];
      const bItem = b[i];
      if (!aItem || !bItem) return false;
      if (aItem.id !== bItem.id || aItem.desc !== bItem.desc) return false;
    }
    return true;
  }

  /**
   * Handle table state change from TanStack Table
   * Detects sorting/visibility/pagination changes and triggers refetch when needed
   * Forwards to user's onStateChange callback if provided
   * Bound method for stable reference
   */
  private handleTableStateChange = (updater: Updater<TableState>): void => {
    if (!this.tableInstance) return;

    const prevState = this.tableInstance.getState();

    // Get fields BEFORE state change (for visibility comparison)
    const prevFields = this.computeVisibleFields();

    // Compute new state from updater
    // Note: TanStack Table does NOT auto-update internal state when onStateChange is provided.
    // We must apply the new state back to the table via setOptions() after processing.
    const newState = typeof updater === 'function' ? updater(prevState) : updater;

    // Apply new state to the table instance
    // This is required because TanStack Table's createTable() does not auto-update
    // internal state when onStateChange is provided - it expects controlled state management.
    this.tableInstance.setOptions((prev) => ({
      ...prev,
      state: newState,
    }));

    let needsRefetch = false;

    // Set flag to prevent pagination subscription from double-handling these changes
    // The subscription auto-fetches, but we handle fetching here after all state changes
    this.isPaginationChangeFromTable = true;

    try {
      // Detect sorting change - reset pagination and refetch
      if (!this.isSortingEqual(prevState.sorting, newState.sorting)) {
        this._pagination.reset();
        needsRefetch = true;
      }

      // Check if visibility changed and fields are different - trigger refetch
      const newFields = this.computeVisibleFields();
      if (!this.areFieldsEqual(prevFields, newFields)) {
        this._pagination.reset();
        needsRefetch = true;
      }

      // Handle pagination change (replaces handlePaginationChange)
      const prevPagination = prevState.pagination;
      const newPagination = newState.pagination;
      if (prevPagination && newPagination) {
        // Handle page size change
        if (newPagination.pageSize !== prevPagination.pageSize) {
          this.pageSize = newPagination.pageSize;
          this._pagination.setPageSize(newPagination.pageSize);
          needsRefetch = true;
        }
        // Handle page index change (cursor navigation)
        else if (newPagination.pageIndex !== prevPagination.pageIndex) {
          const pageDiff = Math.abs(newPagination.pageIndex - prevPagination.pageIndex);

          // Warn if attempting to jump multiple pages (cursor pagination limitation)
          if (pageDiff > 1) {
            console.warn(
              `[tanstack-table-adapter] Cursor pagination only supports sequential navigation. ` +
                `Attempted to jump ${pageDiff} pages (from ${prevPagination.pageIndex} to ${newPagination.pageIndex}). ` +
                `Moving one page instead. Check paginationMode to disable page-jump UI controls.`
            );
          }

          // Move one step in requested direction
          if (newPagination.pageIndex > prevPagination.pageIndex && this._pagination.canGoNext()) {
            this._pagination.next();
            needsRefetch = true;
          } else if (newPagination.pageIndex < prevPagination.pageIndex && this._pagination.canGoPrevious()) {
            this._pagination.previous();
            needsRefetch = true;
          }
        }
      }
    } finally {
      this.isPaginationChangeFromTable = false;
    }

    if (needsRefetch) {
      void this.fetch();
    }

    this.state = {
      ...this.state,
    };

    // Forward to user's onStateChange callback if provided
    this.userOnStateChange?.(updater);

    // Notify listeners for re-render
    this.notifyListeners();
  };

  /**
   * Get managed TanStack Table instance
   *
   * Creates a TanStack Table instance on first call and returns the same instance
   * on subsequent calls. The table is automatically synced when adapter state changes
   * via syncTableInstance() called from updateState().
   *
   * The table's initialState is used to seed internal state management, matching
   * TanStack's useReactTable pattern for proper client-side state persistence.
   *
   * After initialization, use the table instance directly for state changes:
   * - table.setSorting() - sorting changes trigger refetch via onStateChange
   * - table.setColumnVisibility() - visibility changes trigger refetch if fields change
   * - table.nextPage() / table.previousPage() - pagination via adapter
   *
   * @example
   * ```ts
   * const adapter = createCustomerTable({ ... });
   * const table = adapter.getTable();
   *
   * // Subscribe to re-render (table is auto-synced)
   * adapter.subscribe(() => render());
   *
   * // Use table directly for state changes
   * table.setSorting([{ id: 'name', desc: false }]);
   * ```
   */
  getTable(): Table<TRow> {
    if (!this.tableInstance) {
      // Create table with initial options (includes onStateChange hook)
      const table = createTable({
        ...this.getTableOptions(),
        renderFallbackValue: null,
      } as TableOptionsResolved<TRow>);

      // Merge initialState into active state
      // createTable doesn't auto-merge initialState like useReactTable does,
      // so we need to explicitly merge it for features like columnPinning to work
      table.setOptions((prev) => ({
        ...prev,
        state: {
          ...table.initialState,
          ...prev.state,
        },
      }));

      this.tableInstance = table;
    }
    return this.tableInstance;
  }

  /**
   * Get current adapter state
   */
  getState(): AdapterState<TRow> {
    return this.state;
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
    return this.state;
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
    this._pagination.reset();
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
    this._pagination.reset();
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
    this._pagination.reset();
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
    this._pagination.reset();
    void this.fetch();
  }

  // ============================================================================
  // Column Info Methods
  // ============================================================================

  /**
   * Get column info for UI rendering (e.g., column visibility dropdown)
   * Derived from internal column definitions
   * @returns Array of column info objects
   */
  getColumnInfo(): ColumnInfo[] {
    return this.internalColumns.map((col) => ({
      key: col.key,
      header: col.header,
      fields: [...col.fields],
      hideable: col.hideable,
      hiddenByDefault: col.hiddenByDefault,
    }));
  }

  /**
   * Destroy the adapter and clean up resources
   * Call this when unmounting the table to prevent memory leaks
   */
  destroy(): void {
    this.unsubscribeQueryManager?.();
    this.unsubscribePagination?.();
    this.queryManager.destroy();
    this.listeners.clear();
  }
}
