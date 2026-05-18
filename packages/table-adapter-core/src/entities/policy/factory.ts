/**
 * @fileoverview Policy Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the policies SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

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
    GetPoliciesOptions<PolicyExtractFields<TColumns>[]>,
    QueryPoliciesResultSortInput,
    PolicyFilterInput,
    PolicySearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'policies',
    clientMethod: (client) => (vars, requestOptions) =>
      client.policies.getPolicies(vars, requestOptions),
  }) as PolicyTable<TColumns>;
}

/**
 * Policy table type — row narrowed to the fields referenced by the columns.
 */
export type PolicyTable<TColumns extends PolicyColumnDef[] = PolicyColumnDef[]> = TableApi<
  PolicyRowType<TColumns>,
  PolicyFilterInput,
  PolicySearchInput,
  CursorPaginationManager
>;
