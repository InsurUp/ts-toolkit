/**
 * @fileoverview File Policy Transfer Table Types
 * @description Type definitions for the file policy transfer table adapter
 */

import type {
  GetFilePolicyTransfersOptions,
  FilePolicyTransferFieldKey,
  QueryFilePolicyTransfersResult,
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

// Re-export filter and search types for convenience
export type {
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
} from '@insurup/sdk';

/**
 * Column definition for file policy transfer tables
 */
export type FilePolicyTransferColumnDef = AnyColumnDef<FilePolicyTransferFieldKey>;

/**
 * Extract fields from file policy transfer column definitions
 * @template TColumns - The column definitions array
 */
export type FilePolicyTransferExtractFields<
  TColumns extends readonly FilePolicyTransferColumnDef[],
> = EntityExtractFields<TColumns, FilePolicyTransferFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type FilePolicyTransferRowType<TColumns extends readonly FilePolicyTransferColumnDef[]> =
  PickFields<QueryFilePolicyTransfersResult, readonly FilePolicyTransferExtractFields<TColumns>[]>;

/**
 * Fetch function type for file policy transfer queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type FilePolicyTransferFetchFn<
  TRow = QueryFilePolicyTransfersResult,
  TFields extends FilePolicyTransferFieldKey[] = FilePolicyTransferFieldKey[],
> = EntityFetchFn<TRow, GetFilePolicyTransfersOptions<TFields>>;

/**
 * Filter input type for file policy transfer queries
 */
export type FilePolicyTransferFilterInput = QueryFilePolicyTransfersResultFilterInput;

/**
 * Search input type for file policy transfer queries
 */
export type FilePolicyTransferSearchInput = QueryFilePolicyTransfersResultSearchInput;

/**
 * Options for createFilePolicyTransferTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
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
    FilePolicyTransferFilterInput,
    FilePolicyTransferSearchInput,
    CursorPaginationOptions
  >;
