/**
 * @fileoverview Svelte 5 wrapper for Infinite Coverage Group Table
 * @description Provides createInfiniteCoverageGroupTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createCoverageGroupTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteCoverageGroupTable as createInfiniteCoverageGroupTableCore,
  type InfiniteCoverageGroupTable,
  type CoverageGroupTableOptions,
  type CoverageGroupColumnDef,
  type CoverageGroupRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite coverage group table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteCoverageGroupTableInstance<TColumns extends CoverageGroupColumnDef[]> =
  TableCoreResult<CoverageGroupRowType<TColumns>, InfiniteCoverageGroupTable<TColumns>>;

/**
 * Creates an infinite scroll coverage group table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createCoverageGroupTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  getOptions: () => CoverageGroupTableOptions<TColumns>
): InfiniteCoverageGroupTableInstance<TColumns> {
  return createTableCore<
    CoverageGroupRowType<TColumns>,
    CoverageGroupTableOptions<TColumns>,
    InfiniteCoverageGroupTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteCoverageGroupTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
