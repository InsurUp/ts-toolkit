/**
 * @fileoverview Policy Table Types
 * @description Type definitions for the policy table adapter
 */

import type {
  GetPoliciesOptions,
  PolicyFieldKey,
  QueryPoliciesResult,
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
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
export type { QueryPoliciesResultFilterInput, QueryPoliciesResultSearchInput } from '@insurup/sdk';

/**
 * Column definition for policy tables
 */
export type PolicyColumnDef = AnyColumnDef<PolicyFieldKey>;

/**
 * Extract fields from policy column definitions
 * @template TColumns - The column definitions array
 */
export type PolicyExtractFields<TColumns extends readonly PolicyColumnDef[]> = EntityExtractFields<
  TColumns,
  PolicyFieldKey
>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type PolicyRowType<TColumns extends readonly PolicyColumnDef[]> = PickFields<
  QueryPoliciesResult,
  readonly PolicyExtractFields<TColumns>[]
>;

/**
 * Fetch function type for policy queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type PolicyFetchFn<
  TRow = QueryPoliciesResult,
  TFields extends PolicyFieldKey[] = PolicyFieldKey[],
> = EntityFetchFn<TRow, GetPoliciesOptions<TFields>>;

/**
 * Filter input type for policy queries
 */
export type PolicyFilterInput = QueryPoliciesResultFilterInput;

/**
 * Search input type for policy queries
 */
export type PolicySearchInput = QueryPoliciesResultSearchInput;

/**
 * Options for createPolicyTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type PolicyTableOptions<TColumns extends PolicyColumnDef[]> = EntityTableOptions<
  QueryPoliciesResult,
  PolicyFieldKey,
  TColumns,
  PolicyRowType<TColumns>,
  PolicyFetchFn<PolicyRowType<TColumns>, PolicyExtractFields<TColumns>[]>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationOptions
>;
