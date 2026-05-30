/**
 * @fileoverview Vue composable for Infinite Agent Insurance Company Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteAgentInsuranceCompanyTable as createInfiniteAgentInsuranceCompanyTableCore,
  type InfiniteAgentInsuranceCompanyTable,
  type AgentInsuranceCompanyTableOptions,
  type AgentInsuranceCompanyColumnDef,
  type AgentInsuranceCompanyRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteAgentInsuranceCompanyTableResult<
  TColumns extends AgentInsuranceCompanyColumnDef[],
> = UseTableResult<
  AgentInsuranceCompanyRowType<TColumns>,
  InfiniteAgentInsuranceCompanyTable<TColumns>
>;

/**
 * Vue composable for an infinite scroll agent insurance company table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(
  options: AgentInsuranceCompanyTableOptions<TColumns>
): UseInfiniteAgentInsuranceCompanyTableResult<TColumns> {
  return useTable(() => createInfiniteAgentInsuranceCompanyTableCore(options));
}
