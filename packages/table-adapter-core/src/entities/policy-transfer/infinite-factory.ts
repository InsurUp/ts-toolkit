/**
 * @fileoverview Infinite PolicyTransfer Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the policy-transfers SDK call.
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
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll policytransfer table adapter.
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
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'policy-transfers',
    clientMethod: (client) => (vars, requestOptions) =>
      client.policies.getPolicyTransfers(vars, requestOptions),
  }) as InfinitePolicyTransferTable<TColumns>;
}

/**
 * Infinite policytransfer table type — same shape as `PolicyTransferTable`.
 */
export type InfinitePolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;
