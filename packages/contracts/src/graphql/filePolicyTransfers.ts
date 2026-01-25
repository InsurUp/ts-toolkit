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
  ModelFilterInput,
  ModelSearchInput,
  GetQueryOptions,
} from "./common.js";
import type { DateTime } from "../common.date.js";
import type { UserType } from "./policies.js";

// === Output Types ===

export interface FilePolicyTransferUserReference {
  id: string;
  name: string;
  email?: string | null;
  userType?: UserType | null;
}

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

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryFilePolicyTransfersResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryFilePolicyTransfersResultFilterInput =
  ModelFilterInput<QueryFilePolicyTransfersResult>;

/**
 * Search input for QueryFilePolicyTransfersResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryFilePolicyTransfersResultSearchInput =
  ModelSearchInput<QueryFilePolicyTransfersResult>;

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
  TFields extends readonly FilePolicyTransferFieldKey[] =
    readonly FilePolicyTransferFieldKey[],
> = Connection<PickFilePolicyTransferFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryFilePolicyTransfersResult with nested dot-notation paths.
 */
export type FilePolicyTransferFieldKey =
  DeepFieldKeys<QueryFilePolicyTransfersResult>;

/**
 * Runtime array of all file policy transfer field keys including nested paths.
 */
export const ALL_FILE_POLICY_TRANSFER_FIELDS = [
  // Primitive fields
  "id",
  "insuranceCompanyId",
  "insuranceCompanyName",
  "insuranceCompanyLogo",
  "fileName",
  "fileUrl",
  "createdAt",
  "totalPolicyCount",
  "completedPolicyCount",
  "failedPolicyCount",
  // Nested createdBy fields
  "createdBy.id",
  "createdBy.name",
  "createdBy.email",
  "createdBy.userType",
] as const satisfies readonly FilePolicyTransferFieldKey[];

/**
 * Helper type to pick selected fields from QueryFilePolicyTransfersResult.
 */
export type PickFilePolicyTransferFields<
  T extends readonly FilePolicyTransferFieldKey[],
> = PickFields<QueryFilePolicyTransfersResult, T>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedFilePolicyTransfersConnection<
  TFields extends FilePolicyTransferFieldKey[],
> extends Omit<FilePolicyTransfersConnection, "nodes" | "edges"> {
  nodes?: (PickFilePolicyTransferFields<TFields> | null)[] | null;
  edges?:
    | (Omit<FilePolicyTransfersEdge, "node"> & {
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
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
  QueryFilePolicyTransfersResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
