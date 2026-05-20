/**
 * @fileoverview PolicyTransfer Table Factories
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
  PolicyTransferUnifiedFilterInput,
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

export function createPolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): PolicyTransferTable<TColumns> {
  return createEntityTable<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferUnifiedFilterInput,
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyTransferConfig);
}

export function createInfinitePolicyTransferTable<const TColumns extends PolicyTransferColumnDef[]>(
  options: PolicyTransferTableOptions<TColumns>
): InfinitePolicyTransferTable<TColumns> {
  return createInfiniteEntityTable<
    QueryPolicyTransfersResult,
    PolicyTransferFieldKey,
    TColumns,
    PolicyTransferRowType<TColumns>,
    QueryPolicyTransfersResultSortInput,
    PolicyTransferUnifiedFilterInput,
    GetPolicyTransfersOptions<PolicyTransferExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, policyTransferConfig);
}

export type PolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferUnifiedFilterInput,
  CursorPaginationManager
>;

export type InfinitePolicyTransferTable<
  TColumns extends PolicyTransferColumnDef[] = PolicyTransferColumnDef[],
> = TableApi<
  PolicyTransferRowType<TColumns>,
  PolicyTransferUnifiedFilterInput,
  CursorPaginationManager
>;
