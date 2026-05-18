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
  ModelFilterInput,
  ModelSearchInput,
  GetQueryOptions,
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

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryPolicyTransfersResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryPolicyTransfersResultFilterInput = ModelFilterInput<QueryPolicyTransfersResult>;

/**
 * Search input for QueryPolicyTransfersResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryPolicyTransfersResultSearchInput = ModelSearchInput<QueryPolicyTransfersResult>;

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
  QueryPolicyTransfersResultFilterInput,
  QueryPolicyTransfersResultSearchInput,
  QueryPolicyTransfersResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
