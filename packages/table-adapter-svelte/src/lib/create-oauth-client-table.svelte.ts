/**
 * @fileoverview Svelte 5 wrapper for OAuth Client Table
 * @description Provides createOAuthClientTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createOAuthClientTable as createOAuthClientTableCore,
  type OAuthClientTable,
  type OAuthClientTableOptions,
  type OAuthClientColumnDef,
  type OAuthClientRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * OAuth Client table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type OAuthClientTableInstance<TColumns extends OAuthClientColumnDef[]> = TableCoreResult<
  OAuthClientRowType<TColumns>,
  OAuthClientTable<TColumns>
>;

/**
 * Creates a oauth client table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  getOptions: () => OAuthClientTableOptions<TColumns>
): OAuthClientTableInstance<TColumns> {
  return createTableCore<
    OAuthClientRowType<TColumns>,
    OAuthClientTableOptions<TColumns>,
    OAuthClientTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createOAuthClientTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
