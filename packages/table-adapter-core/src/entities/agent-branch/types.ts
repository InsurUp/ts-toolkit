/**
 * @fileoverview Agent Branch Table Types
 * @description Types for the in-memory agent-branch table (REST list resource).
 */

import type { GetAllAgentBranchesResult, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full agent-branch entity (one row of `getAgentBranches`). */
export type AgentBranchEntity = GetAllAgentBranchesResult;

/** Field key union for agent-branch columns. */
export type AgentBranchFieldKey = DeepFieldKeys<AgentBranchEntity> & string;

/** Column definition for agent-branch tables. */
export type AgentBranchColumnDef = AnyColumnDef<AgentBranchFieldKey>;

/** Extract field keys from agent-branch column definitions. */
export type AgentBranchExtractFields<TColumns extends readonly AgentBranchColumnDef[]> =
  EntityExtractFields<TColumns, AgentBranchFieldKey>;

/** Row type narrowed to the fields referenced by the columns. */
export type AgentBranchRowType<TColumns extends readonly AgentBranchColumnDef[]> = PickFields<
  AgentBranchEntity,
  readonly AgentBranchExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type AgentBranchFilterInput = InMemoryFilterInput<AgentBranchEntity>;

/** Options for `createAgentBranchTable` (client mode or fetchAll mode). */
export type AgentBranchTableOptions<TColumns extends AgentBranchColumnDef[]> = InMemoryTableOptions<
  AgentBranchEntity,
  AgentBranchFieldKey,
  TColumns,
  AgentBranchRowType<TColumns>
>;
