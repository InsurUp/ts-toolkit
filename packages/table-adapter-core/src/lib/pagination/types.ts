/**
 * @fileoverview Pagination Types
 * @description Types for cursor-based pagination state management
 */

import type { PageInfo } from '@insurup/sdk';

// Re-export SDK type (eliminate duplication)
export type { PageInfo } from '@insurup/sdk';

/**
 * Current pagination state
 */
export interface PaginationState {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Number of items per page */
  pageSize: number;
  /** Cursor for the current page (undefined for first page) */
  cursor: string | undefined;
}

/**
 * Options for creating a cursor pagination manager
 */
export interface CursorPaginationOptions {
  /** Number of items per page (default: 20) */
  pageSize?: number;
}

/**
 * Cursor pagination manager interface
 */
export interface CursorPaginationManager {
  /** Get the current pagination state */
  getState(): PaginationState;
  /** Update cursor history with new page info (call after each successful fetch) */
  update(pageInfo: PageInfo): void;
  /** Navigate to the next page */
  next(): PaginationState;
  /** Navigate to the previous page */
  previous(): PaginationState;
  /** Check if next page navigation is available */
  canGoNext(): boolean;
  /** Check if previous page navigation is available */
  canGoPrevious(): boolean;
  /** Reset pagination to initial state */
  reset(): PaginationState;
  /** Change page size and reset to first page */
  setPageSize(size: number): PaginationState;
}
