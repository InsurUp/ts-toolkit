/**
 * @fileoverview FilePolicyTransfer Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the file-policy-transfers SDK call. Both paginated and infinite variants live here.
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

type FilePolicyTransferConfig = EntityFactoryConfig<
  GetFilePolicyTransfersOptions<FilePolicyTransferFieldKey[]>
>;

const filePolicyTransferConfig: FilePolicyTransferConfig = {
  queryKeyPrefix: 'file-policy-transfers',
  clientMethod: (client) => (vars, requestOptions) =>
    client.policies.getFilePolicyTransfers(vars, requestOptions),
};

/**
 * Create a type-safe file policy transfer table adapter.
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
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferFilterInput,
    FilePolicyTransferSearchInput,
    GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, filePolicyTransferConfig);
}

/**
 * Create an infinite-scroll file policy transfer table adapter.
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
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferFilterInput,
    FilePolicyTransferSearchInput,
    GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, filePolicyTransferConfig);
}

/** FilePolicyTransfer table type — row narrowed to the fields referenced by the columns. */
export type FilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;

/** Infinite file policy transfer table type — same shape as `FilePolicyTransferTable`. */
export type InfiniteFilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;
