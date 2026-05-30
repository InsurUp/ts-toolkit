/**
 * @fileoverview Agent Branch Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `agentBranches.getAgentBranches` SDK call.
 */

import type {
  AgentBranchEntity,
  AgentBranchFieldKey,
  AgentBranchColumnDef,
  AgentBranchRowType,
  AgentBranchTableOptions,
  AgentBranchFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const agentBranchConfig: InMemoryEntityFactoryConfig<AgentBranchEntity> = {
  queryKeyPrefix: 'agent-branches',
  loadAll: (client) => (requestOptions) => client.agentBranches.getAgentBranches(requestOptions),
};

export function createAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  options: AgentBranchTableOptions<TColumns>
): AgentBranchTable<TColumns> {
  return createInMemoryEntityTable<
    AgentBranchEntity,
    AgentBranchFieldKey,
    TColumns,
    AgentBranchRowType<TColumns>
  >(options, agentBranchConfig);
}

export function createInfiniteAgentBranchTable<const TColumns extends AgentBranchColumnDef[]>(
  options: AgentBranchTableOptions<TColumns>
): InfiniteAgentBranchTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    AgentBranchEntity,
    AgentBranchFieldKey,
    TColumns,
    AgentBranchRowType<TColumns>
  >(options, agentBranchConfig);
}

/** Agent-branch table type — row narrowed to the fields referenced by the columns. */
export type AgentBranchTable<TColumns extends AgentBranchColumnDef[] = AgentBranchColumnDef[]> =
  TableApi<AgentBranchRowType<TColumns>, AgentBranchFilterInput, CursorPaginationManager>;

/** Infinite agent-branch table type — same shape as `AgentBranchTable`. */
export type InfiniteAgentBranchTable<
  TColumns extends AgentBranchColumnDef[] = AgentBranchColumnDef[],
> = TableApi<AgentBranchRowType<TColumns>, AgentBranchFilterInput, CursorPaginationManager>;
