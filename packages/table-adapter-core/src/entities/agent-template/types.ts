/**
 * @fileoverview Agent Template Table Types
 * @description Types for the in-memory agent-template table (REST list resource:
 * `templates.getAllTemplates` — document / email content templates).
 */

import type { QueryTemplatesResult, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full agent-template entity (one row of `getAllTemplates`). */
export type AgentTemplateEntity = QueryTemplatesResult;

/** Field key union for agent-template columns. */
export type AgentTemplateFieldKey = DeepFieldKeys<AgentTemplateEntity> & string;

/** Column definition for agent-template tables. */
export type AgentTemplateColumnDef = AnyColumnDef<AgentTemplateFieldKey>;

/** Extract field keys from agent-template column definitions. */
export type AgentTemplateExtractFields<TColumns extends readonly AgentTemplateColumnDef[]> =
  EntityExtractFields<TColumns, AgentTemplateFieldKey>;

/** Row type narrowed to the fields referenced by the columns. */
export type AgentTemplateRowType<TColumns extends readonly AgentTemplateColumnDef[]> = PickFields<
  AgentTemplateEntity,
  readonly AgentTemplateExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type AgentTemplateFilterInput = InMemoryFilterInput<AgentTemplateEntity>;

/** Options for `createAgentTemplateTable` (client mode or fetchAll mode). */
export type AgentTemplateTableOptions<TColumns extends AgentTemplateColumnDef[]> =
  InMemoryTableOptions<
    AgentTemplateEntity,
    AgentTemplateFieldKey,
    TColumns,
    AgentTemplateRowType<TColumns>
  >;
