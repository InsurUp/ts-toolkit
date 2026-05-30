/**
 * @fileoverview Svelte 5 wrapper for Infinite Agent Insurance Company Table
 * @description Provides createInfiniteAgentInsuranceCompanyTable with fine-grained reactive state using Svelte 5 runes.
 *
 * Unlike createAgentInsuranceCompanyTable which replaces rows on each page, this wrapper
 * accumulates rows across page fetches for infinite scroll behavior.
 */

import {
  createInfiniteAgentInsuranceCompanyTable as createInfiniteAgentInsuranceCompanyTableCore,
  type InfiniteAgentInsuranceCompanyTable,
  type AgentInsuranceCompanyTableOptions,
  type AgentInsuranceCompanyColumnDef,
  type AgentInsuranceCompanyRowType,
} from '@insurup/table-adapter-core';
import { createTableCore, type TableCoreResult } from './internal/index.js';

/**
 * Infinite agent insurance company table instance for Svelte 5 with fine-grained reactive state.
 *
 * Rows are accumulated across page fetches - `rows` contains ALL loaded rows,
 * not just the current page. Rows reset when filters, search, or sorting change.
 *
 * @template TColumns - The column definitions type
 */
export type InfiniteAgentInsuranceCompanyTableInstance<
  TColumns extends AgentInsuranceCompanyColumnDef[],
> = TableCoreResult<
  AgentInsuranceCompanyRowType<TColumns>,
  InfiniteAgentInsuranceCompanyTable<TColumns>
>;

/**
 * Creates an infinite scroll agent insurance company table for Svelte 5 with fine-grained reactive state.
 *
 * Unlike createAgentInsuranceCompanyTable which replaces rows on each page, this function
 * accumulates rows across page fetches for infinite scroll behavior.
 *
 * **Important**: This function must be called within a Svelte component context.
 */
export function createInfiniteAgentInsuranceCompanyTable<
  const TColumns extends AgentInsuranceCompanyColumnDef[],
>(
  getOptions: () => AgentInsuranceCompanyTableOptions<TColumns>
): InfiniteAgentInsuranceCompanyTableInstance<TColumns> {
  return createTableCore<
    AgentInsuranceCompanyRowType<TColumns>,
    AgentInsuranceCompanyTableOptions<TColumns>,
    InfiniteAgentInsuranceCompanyTable<TColumns>
  >({
    getOptions,
    createAdapter: (options) => createInfiniteAgentInsuranceCompanyTableCore(options),
    getTableOptionsState: (options) => options.tableOptions?.state,
  });
}
