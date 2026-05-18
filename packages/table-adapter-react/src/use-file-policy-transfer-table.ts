/**
 * @fileoverview React hook for FilePolicyTransfer Table — thin wrapper over `useTable`.
 */

import {
  createFilePolicyTransferTable as createFilePolicyTransferTableCore,
  type FilePolicyTransferTable,
  type FilePolicyTransferTableOptions,
  type FilePolicyTransferColumnDef,
  type FilePolicyTransferRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseFilePolicyTransferTableResult<TColumns extends FilePolicyTransferColumnDef[]> =
  UseTableResult<FilePolicyTransferRowType<TColumns>, FilePolicyTransferTable<TColumns>>;

/**
 * React hook for creating and managing a filepolicytransfer table.
 * See `useTable` for the underlying primitive.
 */
export function useFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): UseFilePolicyTransferTableResult<TColumns> {
  return useTable(() => createFilePolicyTransferTableCore(options));
}
