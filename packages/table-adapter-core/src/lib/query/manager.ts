/**
 * @fileoverview Query Manager
 * @description Manages query state using @tanstack/query-core for caching and state management
 */

import { QueryClient, QueryObserver, type QueryObserverResult } from '@tanstack/query-core';
import type { QueryManagerOptions, QueryState } from './types.js';

/**
 * QueryManager - Wraps @tanstack/query-core for framework-agnostic state management
 *
 * **Architecture Note:** Each QueryManager creates its own QueryClient instance.
 * This isolation ensures `destroy()` fully cleans up the cache without affecting
 * other tables, and prevents cross-table cache interference.
 *
 * Provides:
 * - Automatic caching and deduplication (within this table)
 * - Background refetching
 * - Stale-while-revalidate pattern
 * - Subscribe/getSnapshot for useSyncExternalStore integration
 */
export class QueryManager<TData, TVars> {
  private queryClient: QueryClient;
  private observer: QueryObserver<TData, Error, TData, TData, readonly unknown[]>;
  private listeners: Set<() => void> = new Set();
  private currentResult: QueryObserverResult<TData, Error>;
  private cachedQueryState: QueryState<TData>;

  constructor(private options: QueryManagerOptions<TData, TVars>) {
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: options.staleTime ?? 30_000, // 30 seconds default
          gcTime: options.gcTime ?? 5 * 60_000, // 5 minutes default
          refetchOnWindowFocus: false,
          retry: false,
        },
      },
    });

    this.observer = new QueryObserver<TData, Error, TData, TData, readonly unknown[]>(
      this.queryClient,
      {
        queryKey: options.getQueryKey() as readonly unknown[],
        queryFn: (context) => options.queryFn(options.getVariables(), { signal: context.signal }),
        enabled: false, // Manual fetch only
      }
    );

    this.currentResult = this.observer.getCurrentResult();

    // Initialize cached state
    this.cachedQueryState = this.buildQueryState();

    // Subscribe to observer updates
    this.observer.subscribe((result) => {
      this.currentResult = result;
      this.updateCachedState();
      this.notifyListeners();
    });
  }

  /**
   * Trigger a fetch with current query key and variables
   */
  async fetch(): Promise<void> {
    // Update query options with current key and variables
    this.observer.setOptions({
      queryKey: this.options.getQueryKey() as readonly unknown[],
      queryFn: (context) => this.options.queryFn(this.options.getVariables(), { signal: context.signal }),
      enabled: true,
    });

    await this.observer.refetch();
  }

  /**
   * Invalidate cache and refetch
   */
  async invalidate(): Promise<void> {
    await this.queryClient.invalidateQueries({
      queryKey: this.options.getQueryKey() as readonly unknown[],
    });
  }

  /**
   * Force refetch data, bypassing cache staleness
   * @param options - Refetch options
   * @param options.throwOnError - If true, throws errors instead of returning them in state
   */
  async refetch(options?: { throwOnError?: boolean }): Promise<void> {
    await this.observer.refetch({ throwOnError: options?.throwOnError ?? false });
  }

  /**
   * Build a new query state object from current result
   */
  private buildQueryState(): QueryState<TData> {
    return {
      data: this.currentResult.data,
      isLoading: this.currentResult.isLoading,
      isFetching: this.currentResult.isFetching,
      error: this.currentResult.error,
      isError: this.currentResult.isError,
      isSuccess: this.currentResult.isSuccess,
    };
  }

  /**
   * Compare two query states for equality
   */
  private statesEqual(a: QueryState<TData>, b: QueryState<TData>): boolean {
    return (
      a.data === b.data &&
      a.isLoading === b.isLoading &&
      a.isFetching === b.isFetching &&
      a.error === b.error &&
      a.isError === b.isError &&
      a.isSuccess === b.isSuccess
    );
  }

  /**
   * Update cached state only if values have changed
   */
  private updateCachedState(): void {
    const newState = this.buildQueryState();
    if (!this.statesEqual(this.cachedQueryState, newState)) {
      this.cachedQueryState = newState;
    }
  }

  /**
   * Get current query state
   * Returns cached reference to prevent unnecessary re-renders
   */
  getState(): QueryState<TData> {
    return this.cachedQueryState;
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
   * Returns cached reference to prevent unnecessary re-renders
   */
  getSnapshot = (): QueryState<TData> => {
    return this.getState();
  };

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Destroy the query manager and clean up resources
   */
  destroy(): void {
    this.observer.destroy();
    this.queryClient.clear();
    this.listeners.clear();
  }
}
