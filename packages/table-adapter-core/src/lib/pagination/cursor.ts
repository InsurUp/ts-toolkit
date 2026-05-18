/**
 * @fileoverview Cursor Pagination Manager
 * @description Stateful manager for cursor-based pagination
 */

import type { PaginationState, PageInfo, CursorPaginationManager } from './types.js';

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_MAX_CURSOR_HISTORY = 500;

/**
 * Create a cursor pagination manager
 *
 * Manages cursor-based pagination state for GraphQL connections.
 * Stores cursor history to enable backward navigation.
 *
 * @example
 * ```typescript
 * const pagination = createCursorPagination({ pageSize: 20 })
 *
 * // Initial fetch
 * const variables = { first: pagination.getState().pageSize }
 * const result = await fetchData(variables)
 * pagination.update(result.pageInfo)
 *
 * // Next page
 * if (pagination.canGoNext()) {
 *   pagination.next()
 *   // Fetch again with new state
 * }
 * ```
 *
 * @param options - Configuration options
 * @returns CursorPaginationManager instance
 */
export function createCursorPagination(
  options: { pageSize?: number } = {}
): CursorPaginationManager {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

  // Internal state
  let currentPageIndex = 0;
  let currentPageSize = pageSize;
  let hasNextPage = false;

  // Cursor history: maps pageIndex to the cursor needed to fetch that page
  // Page 0 has no entry (undefined cursor)
  // Page 1 needs the endCursor from page 0, etc.
  const cursorHistory = new Map<number, string>();

  // Subscription listeners for state changes
  const listeners = new Set<() => void>();

  /**
   * Notify all listeners of state change
   */
  function notifyListeners(): void {
    listeners.forEach((listener) => listener());
  }

  /**
   * Subscribe to state changes
   * @param listener - Callback to invoke when state changes
   * @returns Unsubscribe function
   */
  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /**
   * Get the current pagination state
   */
  function getState(): PaginationState {
    return {
      pageIndex: currentPageIndex,
      pageSize: currentPageSize,
      cursor: cursorHistory.get(currentPageIndex),
    };
  }

  /**
   * Trim cursor history to prevent unbounded growth
   * Keeps entries within a sliding window around the current page
   */
  function trimCursorHistory(): void {
    if (cursorHistory.size <= DEFAULT_MAX_CURSOR_HISTORY) {
      return;
    }

    // Keep entries within a window around current page
    const halfWindow = DEFAULT_MAX_CURSOR_HISTORY / 2;
    const minKeep = Math.max(0, currentPageIndex - halfWindow);
    const maxKeep = currentPageIndex + halfWindow;

    for (const pageIndex of cursorHistory.keys()) {
      if (pageIndex < minKeep || pageIndex > maxKeep) {
        // Always keep page 0 (null cursor for first page)
        if (pageIndex !== 0) {
          cursorHistory.delete(pageIndex);
        }
      }
    }
  }

  /**
   * Update pagination state with response page info
   * Must be called after each successful fetch
   */
  function update(pageInfo: PageInfo): void {
    hasNextPage = pageInfo.hasNextPage;
    // Note: hasPreviousPage from server is not used since we track it locally via pageIndex

    // Store the cursor for the next page
    if (pageInfo.endCursor) {
      cursorHistory.set(currentPageIndex + 1, pageInfo.endCursor);
    }

    // Trim cursor history to prevent unbounded growth
    trimCursorHistory();
    notifyListeners();
  }

  /**
   * Navigate to the next page
   */
  function next(): PaginationState {
    if (hasNextPage) {
      currentPageIndex++;
      notifyListeners();
    }
    return getState();
  }

  /**
   * Navigate to the previous page
   */
  function previous(): PaginationState {
    if (currentPageIndex > 0) {
      currentPageIndex--;
      notifyListeners();
    }
    return getState();
  }

  /**
   * Check if next page is available
   */
  function canGoNext(): boolean {
    return hasNextPage;
  }

  /**
   * Check if previous page is available
   */
  function canGoPrevious(): boolean {
    return currentPageIndex > 0;
  }

  /**
   * Reset to initial state
   * Call when filters or sorting changes
   */
  function reset(): PaginationState {
    currentPageIndex = 0;
    hasNextPage = false;
    cursorHistory.clear();
    // Page 0 has no cursor (undefined), so no need to set an entry
    notifyListeners();
    return getState();
  }

  /**
   * Change page size and reset to first page
   * @param size - New page size (must be greater than 0)
   * @throws Error if size is not greater than 0
   */
  function setPageSize(size: number): PaginationState {
    if (size <= 0) {
      throw new Error('pageSize must be greater than 0');
    }
    currentPageSize = size;
    // reset() will call notifyListeners()
    return reset();
  }

  return {
    getState,
    update,
    next,
    previous,
    canGoNext,
    canGoPrevious,
    reset,
    setPageSize,
    subscribe,
  };
}
