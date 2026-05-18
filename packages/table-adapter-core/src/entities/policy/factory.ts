/**
 * @fileoverview Policy Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the policies SDK call. Both paginated and infinite variants live here.
 */

import type {
  PolicyFieldKey,
  GetPoliciesOptions,
  QueryPoliciesResult,
  QueryPoliciesResultSortInput,
} from '@insurup/sdk';
import type {
  PolicyTableOptions,
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyFilterInput,
  PolicySearchInput,
} from './types.js';
import {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
  type TableApi,
} from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const policyConfig: EntityFactoryConfig<GetPoliciesOptions<PolicyFieldKey[]>> = {
  queryKeyPrefix: 'policies',
  clientMethod: (client) => (vars, requestOptions) =>
    client.policies.getPolicies(vars, requestOptions),
};

/**
 * Create a type-safe policy table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createPolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): PolicyTable<TColumns> {
  return createEntityTable<
    QueryPoliciesResult,
    PolicyFieldKey,
    TColumns,
    PolicyRowType<TColumns>,
    QueryPoliciesResultSortInput,
    PolicyFilterInput,
    PolicySearchInput,
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyConfig);
}

/**
 * Create an infinite-scroll policy table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): InfinitePolicyTable<TColumns> {
  return createInfiniteEntityTable<
    QueryPoliciesResult,
    PolicyFieldKey,
    TColumns,
    PolicyRowType<TColumns>,
    QueryPoliciesResultSortInput,
    PolicyFilterInput,
    PolicySearchInput,
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyConfig);
}

/** Policy table type — row narrowed to the fields referenced by the columns. */
export type PolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;

/** Infinite policy table type — same shape as `PolicyTable`. */
export type InfinitePolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;
