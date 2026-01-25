/**
 * @fileoverview Proposal GraphQL Types
 * @description Types for querying proposals via GraphQL
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
import type { DateTime, DateOnly } from "../common.date.js";

import type { ProductBranch, Channel, CustomerType } from "../common.js";
import type { VehicleFuelType, VehicleUtilizationStyle } from "../common.vehicle.js";
import type { ProposalState } from "../proposals.js";
import type { UserType } from "./policies.js";

// === Output Types ===

export interface ProposalAgentBranchInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
}

export interface ProposalUserReference {
  id: string;
  name: string;
  email?: string | null;
  userType?: UserType | null;
}

export interface QueryProposalsResult {
  agentBranch?: ProposalAgentBranchInfo | null;
  agentBranchId?: string | null;
  id: string;
  productBranch: ProductBranch;
  state: ProposalState;
  insurerCustomerId: string;
  insuredCustomerId: string;
  productsCount: number;
  succeedProductsCount: number;
  createdAt: DateTime;
  agentUserCreatedBy: ProposalUserReference;
  successRate: number;
  insuredCustomerName: string;
  insuredCustomerIdentityNumber?: string | null;
  insuredCustomerTaxNumber?: string | null;
  insuredCustomerType: CustomerType;
  lowestPremium?: number | null;
  highestPremium?: number | null;
  channel: Channel;
  insuredCustomerCityText?: string | null;
  insuredCustomerCityValue?: string | null;
  insuredCustomerDistrictText?: string | null;
  insuredCustomerDistrictValue?: string | null;
  insuredCustomerPhoneNumber?: string | null;
  insuredCustomerPhoneNumberCountryCode?: number | null;
  insuredCustomerEmail?: string | null;
  vehiclePlateCode?: string | null;
  vehiclePlateCity?: number | null;
  vehicleDocumentSerialCode?: string | null;
  vehicleDocumentSerialNumber?: string | null;
  vehicleModelBrandText?: string | null;
  vehicleModelBrandValue?: string | null;
  vehicleModelTypeText?: string | null;
  vehicleModelTypeValue?: string | null;
  vehicleModelYear?: number | null;
  vehicleFuelType?: VehicleFuelType | null;
  utilizationStyle?: VehicleUtilizationStyle | null;
  insuredCustomerBirthDate?: DateOnly | null;
  vehicleId?: string | null;
  propertyId?: string | null;
}

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryProposalsResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryProposalsResultFilterInput =
  ModelFilterInput<QueryProposalsResult>;

/**
 * Search input for QueryProposalsResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryProposalsResultSearchInput =
  ModelSearchInput<QueryProposalsResult>;

/**
 * Sort input for QueryProposalsResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryProposalsResultSortInput {
  createdAt?: SortEnumType | null;
  vehicleModelYear?: SortEnumType | null;
}

// === Connection Types ===

export type ProposalsEdge = Edge<QueryProposalsResult>;
export type ProposalsConnection<
  TFields extends readonly ProposalFieldKey[] = readonly ProposalFieldKey[],
> = Connection<PickProposalFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryProposalsResult with nested dot-notation paths.
 */
export type ProposalFieldKey = DeepFieldKeys<QueryProposalsResult>;

/**
 * Runtime array of all proposal field keys including nested paths.
 */
export const ALL_PROPOSAL_FIELDS = [
  // Primitive fields
  "agentBranchId",
  "id",
  "productBranch",
  "state",
  "insurerCustomerId",
  "insuredCustomerId",
  "productsCount",
  "succeedProductsCount",
  "createdAt",
  "successRate",
  "insuredCustomerName",
  "insuredCustomerIdentityNumber",
  "insuredCustomerTaxNumber",
  "insuredCustomerType",
  "lowestPremium",
  "highestPremium",
  "channel",
  "insuredCustomerCityText",
  "insuredCustomerCityValue",
  "insuredCustomerDistrictText",
  "insuredCustomerDistrictValue",
  "insuredCustomerPhoneNumber",
  "insuredCustomerPhoneNumberCountryCode",
  "insuredCustomerEmail",
  "vehiclePlateCode",
  "vehiclePlateCity",
  "vehicleDocumentSerialCode",
  "vehicleDocumentSerialNumber",
  "vehicleModelBrandText",
  "vehicleModelBrandValue",
  "vehicleModelTypeText",
  "vehicleModelTypeValue",
  "vehicleModelYear",
  "vehicleFuelType",
  "utilizationStyle",
  "insuredCustomerBirthDate",
  "vehicleId",
  "propertyId",
  // Nested agentBranch fields
  "agentBranch.id",
  "agentBranch.name",
  "agentBranch.parentId",
  "agentBranch.parentName",
  // Nested agentUserCreatedBy fields
  "agentUserCreatedBy.id",
  "agentUserCreatedBy.name",
  "agentUserCreatedBy.email",
  "agentUserCreatedBy.userType",
] as const satisfies readonly ProposalFieldKey[];

/**
 * Helper type to pick selected fields from QueryProposalsResult.
 */
export type PickProposalFields<T extends readonly ProposalFieldKey[]> =
  PickFields<QueryProposalsResult, T>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedProposalsConnection<
  TFields extends ProposalFieldKey[],
> extends Omit<ProposalsConnection, "nodes" | "edges"> {
  nodes?: (PickProposalFields<TFields> | null)[] | null;
  edges?:
    | (Omit<ProposalsEdge, "node"> & {
        node?: PickProposalFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getProposals query.
 * Extends GetQueryOptions with proposal-specific types.
 */
export interface GetProposalsOptions<
  TFields extends ProposalFieldKey[] = ProposalFieldKey[],
> extends GetQueryOptions<
  ProposalFieldKey,
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
  QueryProposalsResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
