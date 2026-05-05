/**
 * @fileoverview Query Types
 * @description Types for query state management
 */

/**
 * Context passed to queryFn for cancellation support
 */
export interface QueryFnContext {
  /** AbortSignal for request cancellation */
  signal: AbortSignal;
}

/**
 * Options for creating a QueryManager
 */
export interface QueryManagerOptions<TData, TVars> {
  /** Function to fetch data (receives signal for cancellation) */
  queryFn: (vars: TVars, context: QueryFnContext) => Promise<TData>;
  /** Function to get the current query key */
  getQueryKey: () => unknown[];
  /** Function to get the current variables */
  getVariables: () => TVars;
  /** Time until data is considered stale (ms) */
  staleTime?: number;
  /** Time until inactive data is garbage collected (ms) */
  gcTime?: number;
  /**
   * When true, serves the previous query's data as `placeholderData` while a new
   * query (different key) is in flight. Prevents UI from flashing to an empty
   * state during sort/page/filter/search transitions.
   *
   * Implemented via TanStack Query's `placeholderData: keepPreviousData`.
   * @default false
   */
  keepPreviousData?: boolean;
}

/**
 * Query state returned by getState()
 */
export interface QueryState<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  isError: boolean;
  isSuccess: boolean;
}
