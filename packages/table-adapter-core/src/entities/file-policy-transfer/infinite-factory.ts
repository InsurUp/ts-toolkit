/**
 * @fileoverview Infinite File Policy Transfer Table Factory
 * @description Creates type-safe infinite scroll file policy transfer table adapters with builder API
 */

import type {
  FilePolicyTransferFieldKey,
  GetFilePolicyTransfersOptions,
  QueryFilePolicyTransfersResult,
  QueryFilePolicyTransfersResultSortInput,
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
} from '@insurup/sdk';
import type {
  FilePolicyTransferTableOptions,
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi } from '../../lib/factory/types.js';
import {
  getFetchFn,
  createColumnBuilder,
  createInfiniteTableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const filePolicyTransferSortingConverters =
  createSortingConverters<QueryFilePolicyTransfersResultSortInput>();

function buildFilePolicyTransferQueryOptions<TFields extends FilePolicyTransferFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryFilePolicyTransfersResult,
    QueryFilePolicyTransfersResultSortInput,
    QueryFilePolicyTransfersResultFilterInput,
    QueryFilePolicyTransfersResultSearchInput
  >
): GetFilePolicyTransfersOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getFilePolicyTransferFetchFn<TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): FetchFn<
  FilePolicyTransferRowType<TColumns>,
  GetFilePolicyTransfersOptions<FilePolicyTransferExtractFields<TColumns>[]>
> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) =>
      client.policies.getFilePolicyTransfers(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll file policy transfer table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfiniteFilePolicyTransferTable({
 *   columns: (col) => [col.id(), col.fileName(), col.createdAt()],
 *   fetch: (options) => client.policies.getFilePolicyTransfers(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfiniteFilePolicyTransferTable<
  const TColumns extends FilePolicyTransferColumnDef[],
>(options: FilePolicyTransferTableOptions<TColumns>): InfiniteFilePolicyTransferTable<TColumns> {
  type TFields = FilePolicyTransferExtractFields<TColumns>;
  type TRow = FilePolicyTransferRowType<TColumns>;

  const columnBuilder = createColumnBuilder<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey
  >();
  const columns = options.columns(columnBuilder);

  const fetchFn = getFilePolicyTransferFetchFn(options);

  return createInfiniteTableApi<
    QueryFilePolicyTransfersResult,
    TRow,
    GetFilePolicyTransfersOptions<TFields[]>,
    QueryFilePolicyTransfersResultSortInput,
    FilePolicyTransferFilterInput,
    FilePolicyTransferSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildFilePolicyTransferQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: filePolicyTransferSortingConverters,
    queryKeyPrefix: 'file-policy-transfers-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteFilePolicyTransferTable<TColumns>;
}

/**
 * Infinite file policy transfer table type - same interface as FilePolicyTransferTable.
 */
export type InfiniteFilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;
