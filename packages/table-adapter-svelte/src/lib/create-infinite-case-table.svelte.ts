/**
 * @fileoverview Svelte 5 wrapper for Infinite Case Table
 * @description Provides createInfiniteCaseTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createInfiniteCaseTable as createInfiniteCaseTableCore,
  type InfiniteCaseTable,
  type CaseTableOptions,
  type CaseColumnDef,
  type CaseRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite case table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteCaseTableInstance<TColumns extends CaseColumnDef[]> = TableCoreResult<
  CaseRowType<TColumns>,
  InfiniteCaseTable<TColumns>
>;

/**
 * Creates an infinite scroll case table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfiniteCaseTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createInfiniteCaseTable(() => ({
 *   columns: (col) => [col.id(), col.ref(), col.type(), col.status()],
 *   fetch: (options) => client.cases.getCases(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createInfiniteCaseTable<const TColumns extends CaseColumnDef[]>(
  getOptions: () => CaseTableOptions<TColumns>
): InfiniteCaseTableInstance<TColumns> {
  return createTableCore<
    CaseRowType<TColumns>,
    CaseTableOptions<TColumns>,
    InfiniteCaseTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteCaseTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
