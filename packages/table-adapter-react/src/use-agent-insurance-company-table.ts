/**
 * @fileoverview React hook for Agent Insurance Company Table — thin wrapper over `useTable`.
 */

import {
  createAgentInsuranceCompanyTable as createAgentInsuranceCompanyTableCore,
  type AgentInsuranceCompanyTable,
  type AgentInsuranceCompanyTableOptions,
  type AgentInsuranceCompanyColumnDef,
  type AgentInsuranceCompanyRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseAgentInsuranceCompanyTableResult<TColumns extends AgentInsuranceCompanyColumnDef[]> =
  UseTableResult<AgentInsuranceCompanyRowType<TColumns>, AgentInsuranceCompanyTable<TColumns>>;

/**
 * React hook for creating and managing a agent insurance company table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(
  options: AgentInsuranceCompanyTableOptions<TColumns>
): UseAgentInsuranceCompanyTableResult<TColumns> {
  return useTable(() => createAgentInsuranceCompanyTableCore(options));
}
