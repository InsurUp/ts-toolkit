/**
 * @fileoverview Vue composable for Infinite FilePolicyTransfer Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteFilePolicyTransferTable as createInfiniteFilePolicyTransferTableCore,
  type InfiniteFilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteFilePolicyTransferTableResult<
  TColumns extends FilePolicyTransferColumnDef[],
> = UseTableResult<FilePolicyTransferRowType<TColumns>, InfiniteFilePolicyTransferTable<TColumns>>;

/**
 * Vue composable for an infinite scroll filepolicytransfer table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(
  options: FilePolicyTransferTableOptions<TColumns>
): UseInfiniteFilePolicyTransferTableResult<TColumns> {
  return useTable(() => createInfiniteFilePolicyTransferTableCore(options));
}
