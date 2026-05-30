/**
 * @fileoverview Agent Insurance Company Table Types
 * @description Types for the in-memory agent-insurance-company table
 * (REST list resource: `agents.getAgentInsuranceCompaniesAsync`).
 */

import type { GetMyAgentInsuranceCompaniesResult, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full agent-insurance-company entity. */
export type AgentInsuranceCompanyEntity = GetMyAgentInsuranceCompaniesResult;

/** Field key union for agent-insurance-company columns. */
export type AgentInsuranceCompanyFieldKey = DeepFieldKeys<AgentInsuranceCompanyEntity> & string;

/** Column definition for agent-insurance-company tables. */
export type AgentInsuranceCompanyColumnDef = AnyColumnDef<AgentInsuranceCompanyFieldKey>;

/** Extract field keys from agent-insurance-company column definitions. */
export type AgentInsuranceCompanyExtractFields<
  TColumns extends readonly AgentInsuranceCompanyColumnDef[],
> = EntityExtractFields<TColumns, AgentInsuranceCompanyFieldKey>;

/** Row type narrowed to the fields referenced by the columns. */
export type AgentInsuranceCompanyRowType<
  TColumns extends readonly AgentInsuranceCompanyColumnDef[],
> = PickFields<
  AgentInsuranceCompanyEntity,
  readonly AgentInsuranceCompanyExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type AgentInsuranceCompanyFilterInput = InMemoryFilterInput<AgentInsuranceCompanyEntity>;

/** Options for `createAgentInsuranceCompanyTable` (client mode or fetchAll mode). */
export type AgentInsuranceCompanyTableOptions<TColumns extends AgentInsuranceCompanyColumnDef[]> =
  InMemoryTableOptions<
    AgentInsuranceCompanyEntity,
    AgentInsuranceCompanyFieldKey,
    TColumns,
    AgentInsuranceCompanyRowType<TColumns>
  >;
