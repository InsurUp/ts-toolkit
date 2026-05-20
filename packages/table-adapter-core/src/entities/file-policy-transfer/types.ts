/**
 * @fileoverview File Policy Transfer Table Types
 */

import type {
  GetFilePolicyTransfersOptions,
  FilePolicyTransferFieldKey,
  QueryFilePolicyTransfersResult,
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
  QueryFilePolicyTransfersResultUnifiedFilterInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

export type {
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
  QueryFilePolicyTransfersResultUnifiedFilterInput,
} from '@insurup/sdk';

export type FilePolicyTransferColumnDef = AnyColumnDef<FilePolicyTransferFieldKey>;

export type FilePolicyTransferExtractFields<
  TColumns extends readonly FilePolicyTransferColumnDef[],
> = EntityExtractFields<TColumns, FilePolicyTransferFieldKey>;

export type FilePolicyTransferRowType<TColumns extends readonly FilePolicyTransferColumnDef[]> =
  PickFields<QueryFilePolicyTransfersResult, readonly FilePolicyTransferExtractFields<TColumns>[]>;

export type FilePolicyTransferFetchFn<
  TRow = QueryFilePolicyTransfersResult,
  TFields extends FilePolicyTransferFieldKey[] = FilePolicyTransferFieldKey[],
> = EntityFetchFn<TRow, GetFilePolicyTransfersOptions<TFields>>;

export type FilePolicyTransferFilterInput = QueryFilePolicyTransfersResultFilterInput;
export type FilePolicyTransferSearchInput = QueryFilePolicyTransfersResultSearchInput;
export type FilePolicyTransferUnifiedFilterInput = QueryFilePolicyTransfersResultUnifiedFilterInput;

export type FilePolicyTransferTableOptions<TColumns extends FilePolicyTransferColumnDef[]> =
  EntityTableOptions<
    QueryFilePolicyTransfersResult,
    FilePolicyTransferFieldKey,
    TColumns,
    FilePolicyTransferRowType<TColumns>,
    FilePolicyTransferFetchFn<
      FilePolicyTransferRowType<TColumns>,
      FilePolicyTransferExtractFields<TColumns>[]
    >,
    FilePolicyTransferUnifiedFilterInput,
    CursorPaginationOptions
  >;
