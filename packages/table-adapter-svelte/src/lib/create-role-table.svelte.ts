/**
 * @fileoverview Svelte 5 wrapper for Role Table
 * @description Provides createRoleTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createRoleTable as createRoleTableCore,
  type RoleTable,
  type RoleTableOptions,
  type RoleColumnDef,
  type RoleRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Role table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type RoleTableInstance<TColumns extends RoleColumnDef[]> = TableCoreResult<
  RoleRowType<TColumns>,
  RoleTable<TColumns>
>;

/**
 * Creates a role table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createRoleTable<const TColumns extends RoleColumnDef[]>(
  getOptions: () => RoleTableOptions<TColumns>
): RoleTableInstance<TColumns> {
  return createTableCore<RoleRowType<TColumns>, RoleTableOptions<TColumns>, RoleTable<TColumns>>({
    getOptions,
    createAdapter: (options) => createRoleTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
