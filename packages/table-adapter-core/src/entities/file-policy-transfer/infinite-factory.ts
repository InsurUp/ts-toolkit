/**
 * @fileoverview Infinite FilePolicyTransfer Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the file-policy-transfers SDK call.
 */

import type {
  FilePolicyTransferFieldKey,
  GetFilePolicyTransfersOptions,
  QueryFilePolicyTransfersResult,
  QueryFilePolicyTransfersResultSortInput,
} from '@insurup/sdk';
import type {
  FilePolicyTransferTableOptions,
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
} from './types.js';
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll filepolicytransfer table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(options: FilePolicyTransferTableOptions<TColumns>): InfiniteFilePolicyTransferTable<TColumns> {
  return createInfiniteEntityTable<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey,
    TColumns,
    FilePolicyTransferRowType<TColumns>,
    GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>,
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferFilterInput,
    FilePolicyTransferSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'file-policy-transfers',
    clientMethod: (client) => (vars, requestOptions) =>
      client.policies.getFilePolicyTransfers(vars, requestOptions),
  }) as InfiniteFilePolicyTransferTable<TColumns>;
}

/**
 * Infinite filepolicytransfer table type — same shape as `FilePolicyTransferTable`.
 */
export type InfiniteFilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;
