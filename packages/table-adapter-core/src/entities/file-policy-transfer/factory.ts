/**
 * @fileoverview FilePolicyTransfer Table Factories
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
  FilePolicyTransferUnifiedFilterInput,
} from './types.js';
import {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
  type TableApi,
} from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const filePolicyTransferConfig: EntityFactoryConfig<
  GetFilePolicyTransfersOptions<FilePolicyTransferFieldKey[]>
> = {
  queryKeyPrefix: 'file-policy-transfers',
  clientMethod: (client) => (vars, requestOptions) =>
    client.policies.getFilePolicyTransfers(vars, requestOptions),
};

export function createFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): FilePolicyTransferTable<TColumns> {
  return createEntityTable<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey,
    TColumns,
    FilePolicyTransferRowType<TColumns>,
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferUnifiedFilterInput,
    GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, filePolicyTransferConfig);
}

export function createInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(options: FilePolicyTransferTableOptions<TColumns>): InfiniteFilePolicyTransferTable<TColumns> {
  return createInfiniteEntityTable<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey,
    TColumns,
    FilePolicyTransferRowType<TColumns>,
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferUnifiedFilterInput,
    GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, filePolicyTransferConfig);
}

export type FilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfiniteFilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferUnifiedFilterInput,
  CursorPaginationManager
>;
