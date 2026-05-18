/**
 * @fileoverview Svelte 5 wrapper for Case Table
 * @description Provides createCaseTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createCaseTable as createCaseTableCore,
  type CaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Case table instance for Svelte 5 with fine-grained reactive state.
 *
 * @template TColumns - The column definitions type
 */
export type CaseTableInstance<TColumns extends CaseColumnDef[]> = TableCoreResult<
  CaseRowType<TColumns>,
  CaseTable<TColumns>
>;

/**
 * Creates a case table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createCaseTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createCaseTable(() => ({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createCaseTable<const TColumns extends CaseColumnDef[]>(
  getOptions: () => CaseTableOptions<TColumns>
): CaseTableInstance<TColumns> {
  return createTableCore<CaseRowType<TColumns>, CaseTableOptions<TColumns>, CaseTable<TColumns>>({
    getOptions,
    createAdapter: (options) => createCaseTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
