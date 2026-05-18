/**
 * @fileoverview FilePolicyTransfer Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the file-policy-transfers SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe filepolicytransfer table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): FilePolicyTransferTable<TColumns> {
  return createEntityTable<
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
  }) as FilePolicyTransferTable<TColumns>;
}

/**
 * FilePolicyTransfer table type — row narrowed to the fields referenced by the columns.
 */
export type FilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;
