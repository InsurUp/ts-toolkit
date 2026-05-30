/**
 * @fileoverview Agent Template Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `templates.getAllTemplates` SDK call.
 */

import type {
  AgentTemplateEntity,
  AgentTemplateFieldKey,
  AgentTemplateColumnDef,
  AgentTemplateRowType,
  AgentTemplateTableOptions,
  AgentTemplateFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const agentTemplateConfig: InMemoryEntityFactoryConfig<AgentTemplateEntity> = {
  queryKeyPrefix: 'agent-templates',
  loadAll: (client) => (requestOptions) => client.templates.getAllTemplates(requestOptions),
};

export function createAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  options: AgentTemplateTableOptions<TColumns>
): AgentTemplateTable<TColumns> {
  return createInMemoryEntityTable<
    AgentTemplateEntity,
    AgentTemplateFieldKey,
    TColumns,
    AgentTemplateRowType<TColumns>
  >(options, agentTemplateConfig);
}

export function createInfiniteAgentTemplateTable<const TColumns extends AgentTemplateColumnDef[]>(
  options: AgentTemplateTableOptions<TColumns>
): InfiniteAgentTemplateTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    AgentTemplateEntity,
    AgentTemplateFieldKey,
    TColumns,
    AgentTemplateRowType<TColumns>
  >(options, agentTemplateConfig);
}

/** Agent-template table type — row narrowed to the fields referenced by the columns. */
export type AgentTemplateTable<
  TColumns extends AgentTemplateColumnDef[] = AgentTemplateColumnDef[],
> = TableApi<AgentTemplateRowType<TColumns>, AgentTemplateFilterInput, CursorPaginationManager>;

/** Infinite agent-template table type — same shape as `AgentTemplateTable`. */
export type InfiniteAgentTemplateTable<
  TColumns extends AgentTemplateColumnDef[] = AgentTemplateColumnDef[],
> = TableApi<AgentTemplateRowType<TColumns>, AgentTemplateFilterInput, CursorPaginationManager>;
