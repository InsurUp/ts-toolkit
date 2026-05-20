/**
 * @fileoverview Policy Transfer GraphQL Types
 * @description Types for querying policy transfers via GraphQL
 */

import type {
  Connection,
  Edge,
  SortEnumType,
  DeepFieldKeys,
  PickFields,
  GetQueryOptions,
  StringOperationFilterInput,
  IntOperationFilterInput,
  DateTimeOperationFilterInput,
  LocalDateOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime } from '../common.date.js';

// === Output Types ===

/** @meta */
export interface QueryPolicyTransfersResult {
  id: string;
  startDate?: DateTime | null;
  endDate?: DateTime | null;
  insuranceCompanyCount: number;
  policyTransferTriggerCount: number;
  policyCount: number;
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryPolicyTransfersResultFilterInput,
// searching_QueryPolicyTransfersResultFilterInput. Note that the server filter input
// references fields (succeededPolicyCount / failedPolicyCount / skippedPolicyCount,
// LocalDate-typed startDate/endDate) that are not part of the output model — they
// are filter-only.

export interface QueryPolicyTransfersResultFilterInput {
  and?: QueryPolicyTransfersResultFilterInput[] | null;
  or?: QueryPolicyTransfersResultFilterInput[] | null;
  id?: StringOperationFilterInput | null;
  startDate?: LocalDateOperationFilterInput | null;
  endDate?: LocalDateOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  succeededPolicyCount?: IntOperationFilterInput | null;
  failedPolicyCount?: IntOperationFilterInput | null;
  skippedPolicyCount?: IntOperationFilterInput | null;
}

export interface QueryPolicyTransfersResultSearchInput {
  and?: QueryPolicyTransfersResultSearchInput[] | null;
  or?: QueryPolicyTransfersResultSearchInput[] | null;
  id?: SearchStringOperationFilterInput | null;
  startDate?: LocalDateOperationFilterInput | null;
  endDate?: LocalDateOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  succeededPolicyCount?: IntOperationFilterInput | null;
  failedPolicyCount?: IntOperationFilterInput | null;
  skippedPolicyCount?: IntOperationFilterInput | null;
}

export type QueryPolicyTransfersResultUnifiedFilterInput = UnifiedFilterInput<
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput
>;

/**
 * Sort input for QueryPolicyTransfersResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryPolicyTransfersResultSortInput {
  startDate?: SortEnumType | null;
  endDate?: SortEnumType | null;
  insuranceCompanyCount?: SortEnumType | null;
  policyTransferTriggerCount?: SortEnumType | null;
  policyCount?: SortEnumType | null;
}

// === Connection Types ===

export type PolicyTransfersEdge = Edge<QueryPolicyTransfersResult>;
export type PolicyTransfersConnection<
  TFields extends readonly PolicyTransferFieldKey[] = readonly PolicyTransferFieldKey[],
> = Connection<PickPolicyTransferFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryPolicyTransfersResult.
 */
export type PolicyTransferFieldKey = DeepFieldKeys<QueryPolicyTransfersResult>;

/**
 * Runtime array of all policy transfer field keys.
 */
export const ALL_POLICY_TRANSFER_FIELDS = [
  'id',
  'startDate',
  'endDate',
  'insuranceCompanyCount',
  'policyTransferTriggerCount',
  'policyCount',
] as const satisfies readonly PolicyTransferFieldKey[];

/**
 * Helper type to pick selected fields from QueryPolicyTransfersResult.
 */
export type PickPolicyTransferFields<T extends readonly PolicyTransferFieldKey[]> = PickFields<
  QueryPolicyTransfersResult,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedPolicyTransfersConnection<
  TFields extends PolicyTransferFieldKey[],
> extends Omit<PolicyTransfersConnection, 'nodes' | 'edges'> {
  nodes?: (PickPolicyTransferFields<TFields> | null)[] | null;
  edges?:
    | (Omit<PolicyTransfersEdge, 'node'> & {
        node?: PickPolicyTransferFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getPolicyTransfers query.
 * Extends GetQueryOptions with policy transfer-specific types.
 */
export interface GetPolicyTransfersOptions<
  TFields extends PolicyTransferFieldKey[] = PolicyTransferFieldKey[],
> extends GetQueryOptions<
  PolicyTransferFieldKey,
  QueryPolicyTransfersResultUnifiedFilterInput,
  QueryPolicyTransfersResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
