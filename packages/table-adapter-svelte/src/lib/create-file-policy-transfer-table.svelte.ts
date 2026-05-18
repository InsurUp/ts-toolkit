/**
 * @fileoverview Svelte 5 wrapper for File Policy Transfer Table
 * @description Provides createFilePolicyTransferTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createFilePolicyTransferTable as createFilePolicyTransferTableCore,
  type FilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * File policy transfer table instance for Svelte 5 with fine-grained reactive state.
 *
 * @template TColumns - The column definitions type
 */
export type FilePolicyTransferTableInstance<TColumns extends FilePolicyTransferColumnDef[]> =
  TableCoreResult<FilePolicyTransferRowType<TColumns>, FilePolicyTransferTable<TColumns>>;

/**
 * Creates a file policy transfer table for Svelte 5 with fine-grained reactive state.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component (e.g., in a plain `.ts` file or at module level)
 * will cause memory leaks as the internal `$effect` cleanup will never run.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 * import { onDestroy } from 'svelte';
 * import { createFilePolicyTransferTable } from '@insurup/table-adapter-svelte';
 *
 * const ct = createFilePolicyTransferTable(() => ({
 *   columns: (col) => [col.id(), col.fileName(), col.createdAt()],
 *   fetch: (options) => client.policies.getFilePolicyTransfers(options),
 *   autoFetch: true,
 * }));
 *
 * onDestroy(() => ct.destroy());
 * </script>
 * ```
 */
export function createFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  getOptions: () => FilePolicyTransferTableOptions<TColumns>
): FilePolicyTransferTableInstance<TColumns> {
  return createTableCore<
    FilePolicyTransferRowType<TColumns>,
    FilePolicyTransferTableOptions<TColumns>,
    FilePolicyTransferTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createFilePolicyTransferTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
