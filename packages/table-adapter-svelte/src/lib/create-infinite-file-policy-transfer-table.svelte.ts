/**
 * @fileoverview Svelte 5 wrapper for Infinite File Policy Transfer Table
 * @description Provides createInfiniteFilePolicyTransferTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createInfiniteFilePolicyTransferTable as createInfiniteFilePolicyTransferTableCore,
  type InfiniteFilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite file policy transfer table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows automatically reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteFilePolicyTransferTableInstance<
  TColumns extends FilePolicyTransferColumnDef[],
> = TableCoreResult<FilePolicyTransferRowType<TColumns>, InfiniteFilePolicyTransferTable<TColumns>>;

/**
 * Creates an infinite scroll file policy transfer table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createInfiniteFilePolicyTransferTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createInfiniteFilePolicyTransferTable(() => ({
 *   columns: (col) => [col.id(), col.fileName(), col.createdAt()],
 *   fetch: (options) => client.policies.getFilePolicyTransfers(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(
  getOptions: () => FilePolicyTransferTableOptions<TColumns>
): InfiniteFilePolicyTransferTableInstance<TColumns> {
  return createTableCore<
    FilePolicyTransferRowType<TColumns>,
    FilePolicyTransferTableOptions<TColumns>,
    InfiniteFilePolicyTransferTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteFilePolicyTransferTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
