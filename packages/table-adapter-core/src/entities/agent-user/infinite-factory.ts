/**
 * @fileoverview Infinite Agent User Table Factory
 * @description Creates type-safe infinite scroll agent user table adapters with builder API
 */

import type {
  AgentUserFieldKey,
  GetAgentUsersOptions,
  QueryAgentUserResult,
  QueryAgentUserResultSortInput,
  QueryAgentUserResultFilterInput,
  QueryAgentUserResultSearchInput,
} from '@insurup/sdk';
import type {
  AgentUserTableOptions,
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserFilterInput,
  AgentUserSearchInput,
} from './types.js';
import type { QueryOptionsBuilderArgs, FetchFn } from '../../lib/types.js';
import type { TableApi } from '../../lib/factory/types.js';
import {
  getFetchFn,
  createColumnBuilder,
  createInfiniteTableApi,
} from '../../lib/factory/index.js';
import { createSortingConverters } from '../../lib/sorting/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

const agentUserSortingConverters = createSortingConverters<QueryAgentUserResultSortInput>();

function buildAgentUserQueryOptions<TFields extends AgentUserFieldKey[]>(
  params: QueryOptionsBuilderArgs<
    QueryAgentUserResult,
    QueryAgentUserResultSortInput,
    QueryAgentUserResultFilterInput,
    QueryAgentUserResultSearchInput
  >
): GetAgentUsersOptions<TFields> {
  return {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select as TFields,
    filter: params.filter,
    search: params.search,
  };
}

function getAgentUserFetchFn<TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): FetchFn<AgentUserRowType<TColumns>, GetAgentUsersOptions<AgentUserExtractFields<TColumns>[]>> {
  return getFetchFn(
    options,
    (client) => (vars, requestOptions) => client.agentUsers.getAgentUsers(vars, requestOptions)
  );
}

/**
 * Create an infinite scroll agent user table adapter.
 *
 * @example
 * ```typescript
 * const table = createInfiniteAgentUserTable({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   pagination: { type: 'cursor', pageSize: 50 },
 *   autoFetch: true,
 * })
 * ```
 */
export function createInfiniteAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): InfiniteAgentUserTable<TColumns> {
  type TFields = AgentUserExtractFields<TColumns>;
  type TRow = AgentUserRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryAgentUserResult, AgentUserFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getAgentUserFetchFn(options);

  return createInfiniteTableApi<
    QueryAgentUserResult,
    TRow,
    GetAgentUsersOptions<TFields[]>,
    QueryAgentUserResultSortInput,
    AgentUserFilterInput,
    AgentUserSearchInput,
    CursorPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: buildAgentUserQueryOptions,
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: agentUserSortingConverters,
    queryKeyPrefix: 'agent-users-infinite',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  }) as InfiniteAgentUserTable<TColumns>;
}

/**
 * Infinite agent user table type - same interface as AgentUserTable.
 */
export type InfiniteAgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> =
  TableApi<
    AgentUserRowType<TColumns>,
    AgentUserFilterInput,
    AgentUserSearchInput,
    CursorPaginationManager
  >;
