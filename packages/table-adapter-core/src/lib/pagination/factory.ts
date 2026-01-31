/**
 * @fileoverview Pagination Factory
 * @description Factory function for creating pagination managers based on options type
 */

import { createCursorPagination } from './cursor.js';
import type { PaginationOptions, PaginationManagerFromOptions } from './types.js';

/**
 * Create a pagination manager based on the provided options
 *
 * This factory function creates the appropriate pagination manager type
 * based on the `type` discriminator in the options.
 *
 * @template T - The pagination options type (must extend PaginationOptions)
 * @param options - Pagination configuration options
 * @returns The appropriate pagination manager instance
 *
 * @example
 * ```typescript
 * // Creates CursorPaginationManager
 * const cursorPagination = createPaginationManager({ type: 'cursor', pageSize: 20 });
 *
 * // Future: Creates OffsetPaginationManager
 * // const offsetPagination = createPaginationManager({ type: 'offset', pageSize: 20 });
 * ```
 */
export function createPaginationManager<T extends PaginationOptions>(
  options: T
): PaginationManagerFromOptions<T> {
  switch (options.type) {
    case 'cursor':
      return createCursorPagination(options) as PaginationManagerFromOptions<T>;
    // Future: case 'offset': return createOffsetPagination(options) as PaginationManagerFromOptions<T>;
    default:
      // This should never happen with proper typing, but provides runtime safety
      throw new Error(`Unknown pagination type: ${(options as { type: string }).type}`);
  }
}
