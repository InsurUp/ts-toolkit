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
  GetQueryOptions,
  StringOperationFilterInput,
  BooleanOperationFilterInput,
  UuidOperationFilterInput,
  DateTimeOperationFilterInput,
  EnumOperationFilterInput,
  StringListOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime } from '../common.date.js';
import type { AgentUserState } from '../agents.js';

// === Output Types ===

/** @meta */
export interface QueryAgentUserResult {
  id: string;
  authUserId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  state: AgentUserState;
  createdAt: DateTime;
  updatedAt?: DateTime | null;
  createdById: string;
  updatedById?: string | null;
  createdByName: string;
  updatedByName?: string | null;
  roles: string[];
  agentBranchIds: string[];
  isServiceAccount: boolean;
  serviceAccountName?: string | null;
  searchScore?: number | null;
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryAgentUserResultFilterInput,
// searching_QueryAgentUserResultFilterInput.

export interface QueryAgentUserResultFilterInput {
  and?: QueryAgentUserResultFilterInput[] | null;
  or?: QueryAgentUserResultFilterInput[] | null;
  id?: UuidOperationFilterInput | null;
  authUserId?: UuidOperationFilterInput | null;
  firstName?: StringOperationFilterInput | null;
  lastName?: StringOperationFilterInput | null;
  email?: StringOperationFilterInput | null;
  state?: EnumOperationFilterInput<AgentUserState> | null;
  createdAt?: DateTimeOperationFilterInput | null;
  updatedAt?: DateTimeOperationFilterInput | null;
  createdById?: UuidOperationFilterInput | null;
  updatedById?: UuidOperationFilterInput | null;
  agentBranchIds?: StringListOperationFilterInput | null;
  isServiceAccount?: BooleanOperationFilterInput | null;
  serviceAccountName?: StringOperationFilterInput | null;
}

export interface QueryAgentUserResultSearchInput {
  and?: QueryAgentUserResultSearchInput[] | null;
  or?: QueryAgentUserResultSearchInput[] | null;
  firstName?: SearchStringOperationFilterInput | null;
  lastName?: SearchStringOperationFilterInput | null;
  email?: SearchStringOperationFilterInput | null;
}

export type QueryAgentUserResultUnifiedFilterInput = UnifiedFilterInput<
  QueryAgentUserResultFilterInput,
  QueryAgentUserResultSearchInput
>;

/**
 * Sort input for QueryAgentUserResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryAgentUserResultSortInput {
  createdAt?: SortEnumType | null;
  updatedAt?: SortEnumType | null;
  searchScore?: SortEnumType | null;
}

// === Connection Types ===

export type AgentUsersEdge = Edge<QueryAgentUserResult>;
export type AgentUsersConnection<
  TFields extends readonly AgentUserFieldKey[] = readonly AgentUserFieldKey[],
> = Connection<PickAgentUserFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryAgentUserResult.
 */
export type AgentUserFieldKey = DeepFieldKeys<QueryAgentUserResult>;

/**
 * Runtime array of all agent user field keys.
 */
export const ALL_AGENT_USER_FIELDS = [
  'id',
  'authUserId',
  'firstName',
  'lastName',
  'email',
  'state',
  'createdAt',
  'updatedAt',
  'createdById',
  'updatedById',
  'createdByName',
  'updatedByName',
  'roles',
  'agentBranchIds',
  'isServiceAccount',
  'serviceAccountName',
  'searchScore',
] as const satisfies readonly AgentUserFieldKey[];

/**
 * Helper type to pick selected fields from QueryAgentUserResult.
 */
export type PickAgentUserFields<T extends readonly AgentUserFieldKey[]> = PickFields<
  QueryAgentUserResult,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedAgentUsersConnection<TFields extends AgentUserFieldKey[]> extends Omit<
  AgentUsersConnection,
  'nodes' | 'edges'
> {
  nodes?: (PickAgentUserFields<TFields> | null)[] | null;
  edges?:
    | (Omit<AgentUsersEdge, 'node'> & {
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
  QueryAgentUserResultUnifiedFilterInput,
  QueryAgentUserResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
