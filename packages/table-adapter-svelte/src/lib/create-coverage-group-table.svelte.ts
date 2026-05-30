/**
 * @fileoverview Svelte 5 wrapper for Coverage Group Table
 * @description Provides createCoverageGroupTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createCoverageGroupTable as createCoverageGroupTableCore,
  type CoverageGroupTable,
  type CoverageGroupTableOptions,
  type CoverageGroupColumnDef,
  type CoverageGroupRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Coverage Group table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type CoverageGroupTableInstance<TColumns extends CoverageGroupColumnDef[]> = TableCoreResult<
  CoverageGroupRowType<TColumns>,
  CoverageGroupTable<TColumns>
>;

/**
 * Creates a coverage group table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  getOptions: () => CoverageGroupTableOptions<TColumns>
): CoverageGroupTableInstance<TColumns> {
  return createTableCore<
    CoverageGroupRowType<TColumns>,
    CoverageGroupTableOptions<TColumns>,
    CoverageGroupTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createCoverageGroupTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
