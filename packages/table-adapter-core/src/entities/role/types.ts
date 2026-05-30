/**
 * @fileoverview Role Table Types
 * @description Types for the in-memory role table (REST list resource: `agentRoles.getAgentRoles`).
 */

import type { GetAllAgentRolesResult, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full role entity (one row of `getAgentRoles`). */
export type RoleEntity = GetAllAgentRolesResult;

/** Field key union for role columns. */
export type RoleFieldKey = DeepFieldKeys<RoleEntity> & string;

/** Column definition for role tables. */
export type RoleColumnDef = AnyColumnDef<RoleFieldKey>;

/** Extract field keys from role column definitions. */
export type RoleExtractFields<TColumns extends readonly RoleColumnDef[]> = EntityExtractFields<
  TColumns,
  RoleFieldKey
>;

/** Row type narrowed to the fields referenced by the columns. */
export type RoleRowType<TColumns extends readonly RoleColumnDef[]> = PickFields<
  RoleEntity,
  readonly RoleExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type RoleFilterInput = InMemoryFilterInput<RoleEntity>;

/** Options for `createRoleTable` (client mode or fetchAll mode). */
export type RoleTableOptions<TColumns extends RoleColumnDef[]> = InMemoryTableOptions<
  RoleEntity,
  RoleFieldKey,
  TColumns,
  RoleRowType<TColumns>
>;
