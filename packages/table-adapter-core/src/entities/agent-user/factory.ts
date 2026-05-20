/**
 * @fileoverview AgentUser Table Factories
 * @description Thin wrappers around the generic entity-table helpers bound to
 * the agent-users SDK call. Both paginated and infinite variants live here.
 */

import type {
  AgentUserFieldKey,
  GetAgentUsersOptions,
  QueryAgentUserResult,
  QueryAgentUserResultSortInput,
} from '@insurup/sdk';
import type {
  AgentUserTableOptions,
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserUnifiedFilterInput,
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

const agentUserConfig: EntityFactoryConfig<GetAgentUsersOptions<AgentUserFieldKey[]>> = {
  queryKeyPrefix: 'agent-users',
  clientMethod: (client) => (vars, requestOptions) =>
    client.agentUsers.getAgentUsers(vars, requestOptions),
};

/**
 * Create a type-safe agent user table adapter.
 * Row type is narrowed to the fields referenced by the columns.
 */
export function createAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): AgentUserTable<TColumns> {
  return createEntityTable<
    QueryAgentUserResult,
    AgentUserFieldKey,
    TColumns,
    AgentUserRowType<TColumns>,
    QueryAgentUserResultSortInput,
    AgentUserUnifiedFilterInput,
    GetAgentUsersOptions<AgentUserExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, agentUserConfig);
}

/**
 * Create an infinite-scroll agent user table adapter.
 * Rows accumulate across page fetches.
 */
export function createInfiniteAgentUserTable<const TColumns extends AgentUserColumnDef[]>(
  options: AgentUserTableOptions<TColumns>
): InfiniteAgentUserTable<TColumns> {
  return createInfiniteEntityTable<
    QueryAgentUserResult,
    AgentUserFieldKey,
    TColumns,
    AgentUserRowType<TColumns>,
    QueryAgentUserResultSortInput,
    AgentUserUnifiedFilterInput,
    GetAgentUsersOptions<AgentUserExtractFields<TColumns>[]>,
    CursorPaginationOptions
  >(options, agentUserConfig);
}

/** AgentUser table type — row narrowed to the fields referenced by the columns. */
export type AgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> = TableApi<
  AgentUserRowType<TColumns>,
  AgentUserUnifiedFilterInput,
  CursorPaginationManager
>;

/** Infinite agent user table type — same shape as `AgentUserTable`. */
export type InfiniteAgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> =
  TableApi<AgentUserRowType<TColumns>, AgentUserUnifiedFilterInput, CursorPaginationManager>;
