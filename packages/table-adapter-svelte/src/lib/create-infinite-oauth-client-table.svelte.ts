/**
 * @fileoverview Svelte 5 wrapper for Infinite OAuth Client Table
 * @description Provides createInfiniteOAuthClientTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createOAuthClientTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteOAuthClientTable as createInfiniteOAuthClientTableCore,
  type InfiniteOAuthClientTable,
  type OAuthClientTableOptions,
  type OAuthClientColumnDef,
  type OAuthClientRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite oauth client table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteOAuthClientTableInstance<TColumns extends OAuthClientColumnDef[]> =
  TableCoreResult<OAuthClientRowType<TColumns>, InfiniteOAuthClientTable<TColumns>>;

/**
 * Creates an infinite scroll oauth client table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createOAuthClientTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  getOptions: () => OAuthClientTableOptions<TColumns>
): InfiniteOAuthClientTableInstance<TColumns> {
  return createTableCore<
    OAuthClientRowType<TColumns>,
    OAuthClientTableOptions<TColumns>,
    InfiniteOAuthClientTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteOAuthClientTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
