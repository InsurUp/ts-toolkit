/**
 * @fileoverview Infinite Policy Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the policies SDK call.
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
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

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
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    QueryPoliciesResultSortInput,
    PolicyFilterInput,
    PolicySearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'policies',
    clientMethod: (client) => (vars, requestOptions) =>
      client.policies.getPolicies(vars, requestOptions),
  }) as InfinitePolicyTable<TColumns>;
}

/**
 * Infinite policy table type — same shape as `PolicyTable`.
 */
export type InfinitePolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;
