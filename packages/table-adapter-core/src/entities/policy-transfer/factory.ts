/**
 * @fileoverview PolicyTransfer Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the policy-transfers SDK call. Both paginated and infinite variants live here.
 */

import type {
  PolicyTransferFieldKey,
  GetPolicyTransfersOptions,
  QueryPolicyTransfersResult,
  QueryPolicyTransfersResultSortInput,
} from '@insurup/sdk';
import type {
  PolicyTransferTableOptions,
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
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

const policyTransferConfig: EntityFactoryConfig<
  GetPolicyTransfersOptions<PolicyTransferFieldKey[]>
> = {
  queryKeyPrefix: 'policy-transfers',
  clientMethod: (client) => (vars, requestOptions) =>
    client.policies.getPolicyTransfers(vars, requestOptions),
};

/**
 * Create a type-safe policy transfer table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createPolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): PolicyTransferTable<TColumns> {
  return createEntityTable<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyTransferConfig);
}

/**
 * Create an infinite-scroll policy transfer table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): InfinitePolicyTransferTable<TColumns> {
  return createInfiniteEntityTable<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyTransferConfig);
}

/** PolicyTransfer table type — row narrowed to the fields referenced by the columns. */
export type PolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;

/** Infinite policy transfer table type — same shape as `PolicyTransferTable`. */
export type InfinitePolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;
