/**
 * @fileoverview Agent User Table Types
 * @description Type definitions for the agent user table adapter
 */

import type {
  GetAgentUsersOptions,
  AgentUserFieldKey,
  QueryAgentUserResult,
  QueryAgentUserResultFilterInput,
  QueryAgentUserResultSearchInput,
  QueryAgentUserResultUnifiedFilterInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

// Re-export filter and search types for convenience
export type {
  QueryAgentUserResultFilterInput,
  QueryAgentUserResultSearchInput,
  QueryAgentUserResultUnifiedFilterInput,
} from '@insurup/sdk';

/**
 * Column definition for agent user tables
 */
export type AgentUserColumnDef = AnyColumnDef<AgentUserFieldKey>;

/**
 * Extract fields from agent user column definitions
 * @template TColumns - The column definitions array
 */
export type AgentUserExtractFields<TColumns extends readonly AgentUserColumnDef[]> =
  EntityExtractFields<TColumns, AgentUserFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type AgentUserRowType<TColumns extends readonly AgentUserColumnDef[]> = PickFields<
  QueryAgentUserResult,
  readonly AgentUserExtractFields<TColumns>[]
>;

/**
 * Fetch function type for agent user queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type AgentUserFetchFn<
  TRow = QueryAgentUserResult,
  TFields extends AgentUserFieldKey[] = AgentUserFieldKey[],
> = EntityFetchFn<TRow, GetAgentUsersOptions<TFields>>;

/**
 * Filter input type for agent user queries
 */
export type AgentUserFilterInput = QueryAgentUserResultFilterInput;

/**
 * Search input type for agent user queries
 */
export type AgentUserSearchInput = QueryAgentUserResultSearchInput;

/**
 * Unified filter input for the table adapter's `setFilter` / `defaultFilter`.
 */
export type AgentUserUnifiedFilterInput = QueryAgentUserResultUnifiedFilterInput;

/**
 * Options for createAgentUserTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type AgentUserTableOptions<TColumns extends AgentUserColumnDef[]> = EntityTableOptions<
  QueryAgentUserResult,
  AgentUserFieldKey,
  TColumns,
  AgentUserRowType<TColumns>,
  AgentUserFetchFn<AgentUserRowType<TColumns>, AgentUserExtractFields<TColumns>[]>,
  AgentUserUnifiedFilterInput,
  CursorPaginationOptions
>;
