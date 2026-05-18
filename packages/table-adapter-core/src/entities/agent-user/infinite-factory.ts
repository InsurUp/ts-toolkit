/**
 * @fileoverview Infinite AgentUser Table Factory
 * @description Thin wrapper around `createInfiniteEntityTable` bound to the agent-users SDK call.
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
  AgentUserFilterInput,
  AgentUserSearchInput,
} from './types.js';
import { createInfiniteEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create an infinite-scroll agentuser table adapter.
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
    GetAgentUsersOptions<AgentUserExtractFields<TColumns>[]>,
    QueryAgentUserResultSortInput,
    AgentUserFilterInput,
    AgentUserSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'agent-users',
    clientMethod: (client) => (vars, requestOptions) =>
      client.agentUsers.getAgentUsers(vars, requestOptions),
  }) as InfiniteAgentUserTable<TColumns>;
}

/**
 * Infinite agentuser table type — same shape as `AgentUserTable`.
 */
export type InfiniteAgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> =
  TableApi<
    AgentUserRowType<TColumns>,
    AgentUserFilterInput,
    AgentUserSearchInput,
    CursorPaginationManager
  >;
