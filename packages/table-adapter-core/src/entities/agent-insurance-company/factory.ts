/**
 * @fileoverview Agent Insurance Company Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `agents.getAgentInsuranceCompaniesAsync` SDK call.
 */

import type {
  AgentInsuranceCompanyEntity,
  AgentInsuranceCompanyFieldKey,
  AgentInsuranceCompanyColumnDef,
  AgentInsuranceCompanyRowType,
  AgentInsuranceCompanyTableOptions,
  AgentInsuranceCompanyFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const agentInsuranceCompanyConfig: InMemoryEntityFactoryConfig<AgentInsuranceCompanyEntity> = {
  queryKeyPrefix: 'agent-insurance-companies',
  loadAll: (client) => (requestOptions) =>
    client.agents.getAgentInsuranceCompaniesAsync(requestOptions),
};

export function createAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(options: AgentInsuranceCompanyTableOptions<TColumns>): AgentInsuranceCompanyTable<TColumns> {
  return createInMemoryEntityTable<
    AgentInsuranceCompanyEntity,
    AgentInsuranceCompanyFieldKey,
    TColumns,
    AgentInsuranceCompanyRowType<TColumns>
  >(options, agentInsuranceCompanyConfig);
}

export function createInfiniteAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(
  options: AgentInsuranceCompanyTableOptions<TColumns>
): InfiniteAgentInsuranceCompanyTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    AgentInsuranceCompanyEntity,
    AgentInsuranceCompanyFieldKey,
    TColumns,
    AgentInsuranceCompanyRowType<TColumns>
  >(options, agentInsuranceCompanyConfig);
}

/** Agent-insurance-company table type — row narrowed to the columns' fields. */
export type AgentInsuranceCompanyTable<
  TColumns extends AgentInsuranceCompanyColumnDef[] = AgentInsuranceCompanyColumnDef[],
> = TableApi<
  AgentInsuranceCompanyRowType<TColumns>,
  AgentInsuranceCompanyFilterInput,
  CursorPaginationManager
>;

/** Infinite agent-insurance-company table type — same shape. */
export type InfiniteAgentInsuranceCompanyTable<
  TColumns extends AgentInsuranceCompanyColumnDef[] = AgentInsuranceCompanyColumnDef[],
> = TableApi<
  AgentInsuranceCompanyRowType<TColumns>,
  AgentInsuranceCompanyFilterInput,
  CursorPaginationManager
>;
