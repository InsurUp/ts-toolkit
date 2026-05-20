/**
 * @fileoverview File Policy Transfer GraphQL Types
 * @description Types for querying file policy transfers via GraphQL
 */

import type {
  Connection,
  Edge,
  SortEnumType,
  DeepFieldKeys,
  PickFields,
  GetQueryOptions,
  StringOperationFilterInput,
  IntOperationFilterInput,
  DateTimeOperationFilterInput,
  EnumOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime } from '../common.date.js';
import type { UserType } from './policies.js';

/**
 * Source type for file policy transfers. Filter-only — not exposed on the model
 * output type, but supported by the server filter input.
 */
export enum FilePolicyTransferSourceType {
  InsuranceCompany = 'INSURANCE_COMPANY',
  Polisoft = 'POLISOFT',
  Bentas = 'BENTAS',
}

// === Output Types ===

export interface FilePolicyTransferUserReference {
  id: string;
  name: string;
  email?: string | null;
  userType?: UserType | null;
}

/** @meta */
export interface QueryFilePolicyTransfersResult {
  id: string;
  insuranceCompanyId: number;
  insuranceCompanyName?: string | null;
  insuranceCompanyLogo?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createdAt: DateTime;
  createdBy: FilePolicyTransferUserReference;
  totalPolicyCount?: number | null;
  completedPolicyCount?: number | null;
  failedPolicyCount?: number | null;
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryFilePolicyTransfersResultFilterInput,
// searching_QueryFilePolicyTransfersResultFilterInput.

export interface QueryFilePolicyTransfersResultFilterInput {
  and?: QueryFilePolicyTransfersResultFilterInput[] | null;
  or?: QueryFilePolicyTransfersResultFilterInput[] | null;
  id?: StringOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  sourceType?: EnumOperationFilterInput<FilePolicyTransferSourceType> | null;
  insuranceCompanyName?: StringOperationFilterInput | null;
  insuranceCompanyLogo?: StringOperationFilterInput | null;
  insuranceCompanyId?: IntOperationFilterInput | null;
  fileName?: StringOperationFilterInput | null;
  succeededPolicyCount?: IntOperationFilterInput | null;
  failedPolicyCount?: IntOperationFilterInput | null;
  skippedPolicyCount?: IntOperationFilterInput | null;
  totalPolicyCount?: IntOperationFilterInput | null;
}

export interface QueryFilePolicyTransfersResultSearchInput {
  and?: QueryFilePolicyTransfersResultSearchInput[] | null;
  or?: QueryFilePolicyTransfersResultSearchInput[] | null;
  fileName?: SearchStringOperationFilterInput | null;
}

export type QueryFilePolicyTransfersResultUnifiedFilterInput = UnifiedFilterInput<
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput
>;

/**
 * Sort input for QueryFilePolicyTransfersResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryFilePolicyTransfersResultSortInput {
  createdAt?: SortEnumType | null;
  insuranceCompanyId?: SortEnumType | null;
  totalPolicyCount?: SortEnumType | null;
  completedPolicyCount?: SortEnumType | null;
  failedPolicyCount?: SortEnumType | null;
}

// === Connection Types ===

export type FilePolicyTransfersEdge = Edge<QueryFilePolicyTransfersResult>;
export type FilePolicyTransfersConnection<
  TFields extends readonly FilePolicyTransferFieldKey[] = readonly FilePolicyTransferFieldKey[],
> = Connection<PickFilePolicyTransferFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryFilePolicyTransfersResult with nested dot-notation paths.
 */
export type FilePolicyTransferFieldKey = DeepFieldKeys<QueryFilePolicyTransfersResult>;

/**
 * Runtime array of all file policy transfer field keys including nested paths.
 */
export const ALL_FILE_POLICY_TRANSFER_FIELDS = [
  // Primitive fields
  'id',
  'insuranceCompanyId',
  'insuranceCompanyName',
  'insuranceCompanyLogo',
  'fileName',
  'fileUrl',
  'createdAt',
  'totalPolicyCount',
  'completedPolicyCount',
  'failedPolicyCount',
  // Nested createdBy fields
  'createdBy.id',
  'createdBy.name',
  'createdBy.email',
  'createdBy.userType',
] as const satisfies readonly FilePolicyTransferFieldKey[];

/**
 * Helper type to pick selected fields from QueryFilePolicyTransfersResult.
 */
export type PickFilePolicyTransferFields<T extends readonly FilePolicyTransferFieldKey[]> =
  PickFields<QueryFilePolicyTransfersResult, T>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedFilePolicyTransfersConnection<
  TFields extends FilePolicyTransferFieldKey[],
> extends Omit<FilePolicyTransfersConnection, 'nodes' | 'edges'> {
  nodes?: (PickFilePolicyTransferFields<TFields> | null)[] | null;
  edges?:
    | (Omit<FilePolicyTransfersEdge, 'node'> & {
        node?: PickFilePolicyTransferFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getFilePolicyTransfers query.
 * Extends GetQueryOptions with file policy transfer-specific types.
 */
export interface GetFilePolicyTransfersOptions<
  TFields extends FilePolicyTransferFieldKey[] = FilePolicyTransferFieldKey[],
> extends GetQueryOptions<
  FilePolicyTransferFieldKey,
  QueryFilePolicyTransfersResultUnifiedFilterInput,
  QueryFilePolicyTransfersResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
