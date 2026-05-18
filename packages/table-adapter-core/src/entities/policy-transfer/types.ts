/**
 * @fileoverview Policy Transfer Table Types
 * @description Type definitions for the policy transfer table adapter
 */

import type {
  GetPolicyTransfersOptions,
  PolicyTransferFieldKey,
  QueryPolicyTransfersResult,
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
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
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
} from '@insurup/sdk';

/**
 * Column definition for policy transfer tables
 */
export type PolicyTransferColumnDef = AnyColumnDef<PolicyTransferFieldKey>;

/**
 * Extract fields from policy transfer column definitions
 * @template TColumns - The column definitions array
 */
export type PolicyTransferExtractFields<TColumns extends readonly PolicyTransferColumnDef[]> =
  EntityExtractFields<TColumns, PolicyTransferFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type PolicyTransferRowType<TColumns extends readonly PolicyTransferColumnDef[]> = PickFields<
  QueryPolicyTransfersResult,
  readonly PolicyTransferExtractFields<TColumns>[]
>;

/**
 * Fetch function type for policy transfer queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type PolicyTransferFetchFn<
  TRow = QueryPolicyTransfersResult,
  TFields extends PolicyTransferFieldKey[] = PolicyTransferFieldKey[],
> = EntityFetchFn<TRow, GetPolicyTransfersOptions<TFields>>;

/**
 * Filter input type for policy transfer queries
 */
export type PolicyTransferFilterInput = QueryPolicyTransfersResultFilterInput;

/**
 * Search input type for policy transfer queries
 */
export type PolicyTransferSearchInput = QueryPolicyTransfersResultSearchInput;

/**
 * Options for createPolicyTransferTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type PolicyTransferTableOptions<TColumns extends PolicyTransferColumnDef[]> =
  EntityTableOptions<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    PolicyTransferFetchFn<PolicyTransferRowType<TColumns>, PolicyTransferExtractFields<TColumns>[]>,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    CursorPaginationOptions
  >;
