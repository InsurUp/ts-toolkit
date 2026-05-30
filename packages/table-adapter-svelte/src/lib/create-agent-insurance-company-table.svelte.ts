/**
 * @fileoverview Svelte 5 wrapper for Agent Insurance Company Table
 * @description Provides createAgentInsuranceCompanyTable with fine-grained reactive state using Svelte 5 runes
 */

import {
  createAgentInsuranceCompanyTable as createAgentInsuranceCompanyTableCore,
  type AgentInsuranceCompanyTable,
  type AgentInsuranceCompanyTableOptions,
  type AgentInsuranceCompanyColumnDef,
  type AgentInsuranceCompanyRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Agent Insurance Company table instance for Svelte 5 with fine-grained reactive state.
 *
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 *
 * @template TColumns - The column definitions type
 */
export type AgentInsuranceCompanyTableInstance<TColumns extends AgentInsuranceCompanyColumnDef[]> =
  TableCoreResult<AgentInsuranceCompanyRowType<TColumns>, AgentInsuranceCompanyTable<TColumns>>;

/**
 * Creates a agent insurance company table for Svelte 5 with fine-grained reactive state.
 *
 * Accepts a getter function for options to enable reactive tableOptions.
 *
 * **Important**: This function must be called within a Svelte component context.
 * Calling it outside a component will leak as the internal `$effect` cleanup never runs.
 */
export function createAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(
  getOptions: () => AgentInsuranceCompanyTableOptions<TColumns>
): AgentInsuranceCompanyTableInstance<TColumns> {
  return createTableCore<
    AgentInsuranceCompanyRowType<TColumns>,
    AgentInsuranceCompanyTableOptions<TColumns>,
    AgentInsuranceCompanyTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createAgentInsuranceCompanyTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
