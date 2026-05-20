/**
 * @fileoverview Policy Transfer Table Types
 */

import type {
  GetPolicyTransfersOptions,
  PolicyTransferFieldKey,
  QueryPolicyTransfersResult,
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
  QueryPolicyTransfersResultUnifiedFilterInput,
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
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
  QueryPolicyTransfersResultUnifiedFilterInput,
} from '@insurup/sdk';

export type PolicyTransferColumnDef = AnyColumnDef<PolicyTransferFieldKey>;

export type PolicyTransferExtractFields<TColumns extends readonly PolicyTransferColumnDef[]> =
  EntityExtractFields<TColumns, PolicyTransferFieldKey>;

export type PolicyTransferRowType<TColumns extends readonly PolicyTransferColumnDef[]> = PickFields<
  QueryPolicyTransfersResult,
  readonly PolicyTransferExtractFields<TColumns>[]
>;

export type PolicyTransferFetchFn<
  TRow = QueryPolicyTransfersResult,
  TFields extends PolicyTransferFieldKey[] = PolicyTransferFieldKey[],
> = EntityFetchFn<TRow, GetPolicyTransfersOptions<TFields>>;

export type PolicyTransferFilterInput = QueryPolicyTransfersResultFilterInput;
export type PolicyTransferSearchInput = QueryPolicyTransfersResultSearchInput;
export type PolicyTransferUnifiedFilterInput = QueryPolicyTransfersResultUnifiedFilterInput;

export type PolicyTransferTableOptions<TColumns extends PolicyTransferColumnDef[]> =
  EntityTableOptions<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    PolicyTransferFetchFn<PolicyTransferRowType<TColumns>, PolicyTransferExtractFields<TColumns>[]>,
    PolicyTransferUnifiedFilterInput,
    CursorPaginationOptions
  >;
