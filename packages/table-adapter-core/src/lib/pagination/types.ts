/**
 * @fileoverview Pagination Types
 * @description Types for pagination state management with support for multiple strategies
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
 * Options for cursor pagination strategy
 */
export interface CursorPaginationOptions {
  /** Pagination strategy type */
  type: 'cursor';
  /** Number of items per page (default: 20) */
  pageSize?: number;
}

// Future: OffsetPaginationOptions with type: 'offset'

/**
 * Union of all pagination strategy options
 * Currently only cursor pagination is supported
 */
export type PaginationOptions = CursorPaginationOptions;

/**
 * Map pagination options to the corresponding manager type
 * Used for type inference in adapters and factories
 */
export type PaginationManagerFromOptions<T extends PaginationOptions> =
  T extends CursorPaginationOptions ? CursorPaginationManager : PaginationManager; // fallback for future types

/**
 * Base pagination manager interface
 * Common API for all pagination strategies (cursor, offset, etc.)
 */
export interface PaginationManager {
  /** Get the current pagination state */
  getState(): PaginationState;
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
  /** Subscribe to state changes */
  subscribe(listener: () => void): () => void;
}

/**
 * Cursor pagination manager interface
 * Extends base PaginationManager with cursor-specific methods for GraphQL connections
 */
export interface CursorPaginationManager extends PaginationManager {
  /** Update cursor history with new page info (call after each successful fetch) */
  update(pageInfo: PageInfo): void;
}
