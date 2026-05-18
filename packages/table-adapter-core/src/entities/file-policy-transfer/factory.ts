/**
 * @fileoverview File Policy Transfer Table Factory
 * @description Creates type-safe file policy transfer table adapters with builder API and field inference
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
import {
  getFetchFn,
  createColumnBuilder,
  createTableApi,
  type TableApi,
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
    includeTotalCount: params.includeTotalCount,
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
 * Create a type-safe file policy transfer table adapter.
 *
 * @example
 * ```typescript
 * const table = createFilePolicyTransferTable({
 *   columns: (col) => [col.id(), col.fileName(), col.createdAt()],
 *   fetch: (options) => client.policies.getFilePolicyTransfers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createFilePolicyTransferTable<const TColumns extends FilePolicyTransferColumnDef[]>(
  options: FilePolicyTransferTableOptions<TColumns>
): FilePolicyTransferTable<TColumns> {
  type TFields = FilePolicyTransferExtractFields<TColumns>;
  type TRow = FilePolicyTransferRowType<TColumns>;

  const columnBuilder = createColumnBuilder<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey
  >();
  const columns = options.columns(columnBuilder);

  const fetchFn = getFilePolicyTransferFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'file-policy-transfers',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as FilePolicyTransferTable<TColumns>;
}

/**
 * File policy transfer table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type FilePolicyTransferTable<
  TColumns extends FilePolicyTransferColumnDef[] = FilePolicyTransferColumnDef[],
> = TableApi<
  FilePolicyTransferRowType<TColumns>,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  CursorPaginationManager
>;
