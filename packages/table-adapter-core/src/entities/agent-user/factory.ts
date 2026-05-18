/**
 * @fileoverview Agent User Table Factory
 * @description Creates type-safe agent user table adapters with builder API and field inference
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
import {
  getFetchFn,
  createColumnBuilder,
  createTableApi,
  type TableApi,
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
    includeTotalCount: params.includeTotalCount,
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
 * Create a type-safe agent user table adapter.
 *
 * @example
 * ```typescript
 * const table = createAgentUserTable({
 *   columns: (col) => [col.id(), col.email(), col.name()],
 *   fetch: (options) => client.agentUsers.getAgentUsers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 * ```
 */
export function createAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): AgentUserTable<TColumns> {
  type TFields = AgentUserExtractFields<TColumns>;
  type TRow = AgentUserRowType<TColumns>;

  const columnBuilder = createColumnBuilder<QueryAgentUserResult, AgentUserFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getAgentUserFetchFn(options);

  return createTableApi<
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
    queryKeyPrefix: 'agent-users',
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  }) as AgentUserTable<TColumns>;
}

/**
 * Agent user table type - row type is inferred from column definitions.
 * @template TColumns - The column definitions
 */
export type AgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> = TableApi<
  AgentUserRowType<TColumns>,
  AgentUserFilterInput,
  AgentUserSearchInput,
  CursorPaginationManager
>;
