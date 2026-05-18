/**
 * @fileoverview AgentUser Table Factory
 * @description Thin wrapper around `createEntityTable` bound to the agent-users SDK call.
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
import { createEntityTable, type TableApi } from '../../lib/factory/index.js';
import type {
  CursorPaginationManager,
  CursorPaginationOptions,
} from '../../lib/pagination/index.js';

/**
 * Create a type-safe agentuser table adapter.
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
    GetAgentUsersOptions<AgentUserExtractFields<TColumns>[]>,
    QueryAgentUserResultSortInput,
    AgentUserFilterInput,
    AgentUserSearchInput,
    CursorPaginationOptions
  >(options, {
    queryKeyPrefix: 'agent-users',
    clientMethod: (client) => (vars, requestOptions) =>
      client.agentUsers.getAgentUsers(vars, requestOptions),
  }) as AgentUserTable<TColumns>;
}

/**
 * AgentUser table type — row narrowed to the fields referenced by the columns.
 */
export type AgentUserTable<TColumns extends AgentUserColumnDef[] = AgentUserColumnDef[]> = TableApi<
  AgentUserRowType<TColumns>,
  AgentUserFilterInput,
  AgentUserSearchInput,
  CursorPaginationManager
>;
