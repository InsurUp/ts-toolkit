/**
 * @fileoverview PolicyTransfer Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the policy-transfers SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe policytransfer table adapter.
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
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferFilterInput,
    PolicyTransferSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'policy-transfers',
    clientMethod: (client) => (vars, requestOptions) =>
      client.policies.getPolicyTransfers(vars, requestOptions),
  }) as PolicyTransferTable<TColumns>;
}

/**
 * PolicyTransfer table type — row narrowed to the fields referenced by the columns.
 */
export type PolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  CursorPaginationManager
>;
