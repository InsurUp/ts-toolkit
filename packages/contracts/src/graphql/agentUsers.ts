/**
 * @fileoverview Agent User GraphQL Types
 * @description Types for querying agent users via GraphQL
 */

import type {
  Connection,
  Edge,
  SortEnumType,
  DeepFieldKeys,
  PickFields,
  ModelFilterInput,
  ModelSearchInput,
  GetQueryOptions,
} from "./common.js";
import type { DateTime } from "../common.date.js";
import type { AgentUserState } from "../agents.js";

// === Output Types ===

export interface AgentUserRoleInfo {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface AgentUserBranchInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
  level: number;
  hierarchy: string;
}

/** @meta */
export interface QueryAgentUserResult {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber?: string | null;
  phoneNumberCountryCode?: number | null;
  state: AgentUserState;
  createdAt?: DateTime | null;
  lastLoginAt?: DateTime | null;
  roles?: AgentUserRoleInfo[] | null;
  branches?: AgentUserBranchInfo[] | null;
}

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryAgentUserResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryAgentUserResultFilterInput =
  ModelFilterInput<QueryAgentUserResult>;

/**
 * Search input for QueryAgentUserResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryAgentUserResultSearchInput =
  ModelSearchInput<QueryAgentUserResult>;

/**
 * Sort input for QueryAgentUserResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryAgentUserResultSortInput {
  email?: SortEnumType | null;
  firstName?: SortEnumType | null;
  lastName?: SortEnumType | null;
  name?: SortEnumType | null;
  state?: SortEnumType | null;
  createdAt?: SortEnumType | null;
  lastLoginAt?: SortEnumType | null;
}

// === Connection Types ===

export type AgentUsersEdge = Edge<QueryAgentUserResult>;
export type AgentUsersConnection<
  TFields extends readonly AgentUserFieldKey[] = readonly AgentUserFieldKey[],
> = Connection<PickAgentUserFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryAgentUserResult with nested dot-notation paths.
 */
export type AgentUserFieldKey = DeepFieldKeys<QueryAgentUserResult>;

/**
 * Runtime array of all agent user field keys including nested paths.
 */
export const ALL_AGENT_USER_FIELDS = [
  // Primitive fields
  "id",
  "email",
  "firstName",
  "lastName",
  "name",
  "phoneNumber",
  "phoneNumberCountryCode",
  "state",
  "createdAt",
  "lastLoginAt",
  // Nested roles fields
  "roles.id",
  "roles.name",
  "roles.isAdmin",
  // Nested branches fields
  "branches.id",
  "branches.name",
  "branches.parentId",
  "branches.parentName",
  "branches.level",
  "branches.hierarchy",
] as const satisfies readonly AgentUserFieldKey[];

/**
 * Helper type to pick selected fields from QueryAgentUserResult.
 */
export type PickAgentUserFields<T extends readonly AgentUserFieldKey[]> =
  PickFields<QueryAgentUserResult, T>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedAgentUsersConnection<
  TFields extends AgentUserFieldKey[],
> extends Omit<AgentUsersConnection, "nodes" | "edges"> {
  nodes?: (PickAgentUserFields<TFields> | null)[] | null;
  edges?:
    | (Omit<AgentUsersEdge, "node"> & {
        node?: PickAgentUserFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getAgentUsers query.
 * Extends GetQueryOptions with agent user-specific types.
 */
export interface GetAgentUsersOptions<
  TFields extends AgentUserFieldKey[] = AgentUserFieldKey[],
> extends GetQueryOptions<
  AgentUserFieldKey,
  QueryAgentUserResultFilterInput,
  QueryAgentUserResultSearchInput,
  QueryAgentUserResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
