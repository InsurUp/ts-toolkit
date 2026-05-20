/**
 * @fileoverview Policy Table Factories
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
  PolicyUnifiedFilterInput,
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

export function createPolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): PolicyTable<TColumns> {
  return createEntityTable<
    QueryPoliciesResult,
    PolicyFieldKey,
    TColumns,
    PolicyRowType<TColumns>,
    QueryPoliciesResultSortInput,
    PolicyUnifiedFilterInput,
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyConfig);
}

export function createInfinitePolicyTable<const TColumns extends PolicyColumnDef[]>(
  options: PolicyTableOptions<TColumns>
): InfinitePolicyTable<TColumns> {
  return createInfiniteEntityTable<
    QueryPoliciesResult,
    PolicyFieldKey,
    TColumns,
    PolicyRowType<TColumns>,
    QueryPoliciesResultSortInput,
    PolicyUnifiedFilterInput,
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyConfig);
}

export type PolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfinitePolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyUnifiedFilterInput,
  CursorPaginationManager
>;
