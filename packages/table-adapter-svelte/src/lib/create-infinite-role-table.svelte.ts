/**
 * @fileoverview Svelte 5 wrapper for Infinite Role Table
 * @description Provides createInfiniteRoleTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createRoleTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteRoleTable as createInfiniteRoleTableCore,
  type InfiniteRoleTable,
  type RoleTableOptions,
  type RoleColumnDef,
  type RoleRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite role table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteRoleTableInstance<TColumns extends RoleColumnDef[]> = TableCoreResult<
  RoleRowType<TColumns>,
  InfiniteRoleTable<TColumns>
>;

/**
 * Creates an infinite scroll role table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createRoleTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteRoleTable<const TColumns extends RoleColumnDef[]>(
  getOptions: () => RoleTableOptions<TColumns>
): InfiniteRoleTableInstance<TColumns> {
  return createTableCore<
    RoleRowType<TColumns>,
    RoleTableOptions<TColumns>,
    InfiniteRoleTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteRoleTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
