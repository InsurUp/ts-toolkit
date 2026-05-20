/**
 * @fileoverview Policy Table Types
 */

import type {
  GetPoliciesOptions,
  PolicyFieldKey,
  QueryPoliciesResult,
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
  QueryPoliciesResultUnifiedFilterInput,
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
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
  QueryPoliciesResultUnifiedFilterInput,
} from '@insurup/sdk';

export type PolicyColumnDef = AnyColumnDef<PolicyFieldKey>;

export type PolicyExtractFields<TColumns extends readonly PolicyColumnDef[]> = EntityExtractFields<
  TColumns,
  PolicyFieldKey
>;

export type PolicyRowType<TColumns extends readonly PolicyColumnDef[]> = PickFields<
  QueryPoliciesResult,
  readonly PolicyExtractFields<TColumns>[]
>;

export type PolicyFetchFn<
  TRow = QueryPoliciesResult,
  TFields extends PolicyFieldKey[] = PolicyFieldKey[],
> = EntityFetchFn<TRow, GetPoliciesOptions<TFields>>;

export type PolicyFilterInput = QueryPoliciesResultFilterInput;
export type PolicySearchInput = QueryPoliciesResultSearchInput;
export type PolicyUnifiedFilterInput = QueryPoliciesResultUnifiedFilterInput;

export type PolicyTableOptions<TColumns extends PolicyColumnDef[]> = EntityTableOptions<
  QueryPoliciesResult,
  PolicyFieldKey,
  TColumns,
  PolicyRowType<TColumns>,
  PolicyFetchFn<PolicyRowType<TColumns>, PolicyExtractFields<TColumns>[]>,
  PolicyUnifiedFilterInput,
  CursorPaginationOptions
>;
