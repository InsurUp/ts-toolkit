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
  GetQueryOptions,
  StringOperationFilterInput,
  ObjectIdOperationFilterInput,
  IntOperationFilterInput,
  FloatOperationFilterInput,
  UuidOperationFilterInput,
  DateTimeOperationFilterInput,
  LocalDateOperationFilterInput,
  EnumOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime, DateOnly } from '../common.date.js';

import type { ProductBranch, Channel, CustomerType } from '../common.js';
import type { VehicleFuelType, VehicleUtilizationStyle } from '../common.vehicle.js';
import type { ProposalState } from '../proposals.js';
import type { UserReferenceFilterInput, UserType } from './policies.js';

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

/** @meta */
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

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryProposalsResultFilterInput,
// searching_QueryProposalsResultFilterInput.

export interface QueryProposalsResultFilterInput {
  and?: QueryProposalsResultFilterInput[] | null;
  or?: QueryProposalsResultFilterInput[] | null;
  id?: ObjectIdOperationFilterInput | null;
  productBranch?: EnumOperationFilterInput<ProductBranch> | null;
  state?: EnumOperationFilterInput<ProposalState> | null;
  insurerCustomerId?: UuidOperationFilterInput | null;
  insuredCustomerId?: UuidOperationFilterInput | null;
  productsCount?: IntOperationFilterInput | null;
  succeedProductsCount?: IntOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  agentUserCreatedBy?: UserReferenceFilterInput | null;
  successRate?: FloatOperationFilterInput | null;
  insuredCustomerName?: StringOperationFilterInput | null;
  insuredCustomerIdentityNumber?: StringOperationFilterInput | null;
  insuredCustomerTaxNumber?: StringOperationFilterInput | null;
  insuredCustomerType?: EnumOperationFilterInput<CustomerType> | null;
  lowestPremium?: FloatOperationFilterInput | null;
  highestPremium?: FloatOperationFilterInput | null;
  channel?: EnumOperationFilterInput<Channel> | null;
  insuredCustomerCityText?: StringOperationFilterInput | null;
  insuredCustomerCityValue?: StringOperationFilterInput | null;
  insuredCustomerDistrictText?: StringOperationFilterInput | null;
  insuredCustomerDistrictValue?: StringOperationFilterInput | null;
  insuredCustomerPhoneNumber?: StringOperationFilterInput | null;
  insuredCustomerPhoneNumberCountryCode?: IntOperationFilterInput | null;
  insuredCustomerEmail?: StringOperationFilterInput | null;
  vehiclePlateCode?: StringOperationFilterInput | null;
  vehiclePlateCity?: IntOperationFilterInput | null;
  vehicleDocumentSerialCode?: StringOperationFilterInput | null;
  vehicleDocumentSerialNumber?: StringOperationFilterInput | null;
  vehicleModelBrandText?: StringOperationFilterInput | null;
  vehicleModelBrandValue?: StringOperationFilterInput | null;
  vehicleModelTypeText?: StringOperationFilterInput | null;
  vehicleModelTypeValue?: StringOperationFilterInput | null;
  vehicleModelYear?: IntOperationFilterInput | null;
  vehicleFuelType?: EnumOperationFilterInput<VehicleFuelType> | null;
  utilizationStyle?: EnumOperationFilterInput<VehicleUtilizationStyle> | null;
  insuredCustomerBirthDate?: LocalDateOperationFilterInput | null;
  vehicleId?: UuidOperationFilterInput | null;
  propertyId?: UuidOperationFilterInput | null;
  agentBranchId?: StringOperationFilterInput | null;
}

export interface QueryProposalsResultSearchInput {
  and?: QueryProposalsResultSearchInput[] | null;
  or?: QueryProposalsResultSearchInput[] | null;
  insuredCustomerName?: SearchStringOperationFilterInput | null;
  insuredCustomerIdentityNumber?: SearchStringOperationFilterInput | null;
  insuredCustomerTaxNumber?: SearchStringOperationFilterInput | null;
  insuredCustomerCityText?: SearchStringOperationFilterInput | null;
  insuredCustomerDistrictText?: SearchStringOperationFilterInput | null;
  insuredCustomerPhoneNumber?: SearchStringOperationFilterInput | null;
  insuredCustomerEmail?: SearchStringOperationFilterInput | null;
  vehiclePlateCode?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialCode?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialNumber?: SearchStringOperationFilterInput | null;
  vehicleModelBrandText?: SearchStringOperationFilterInput | null;
  vehicleModelTypeText?: SearchStringOperationFilterInput | null;
}

export type QueryProposalsResultUnifiedFilterInput = UnifiedFilterInput<
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput
>;

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
  'agentBranchId',
  'id',
  'productBranch',
  'state',
  'insurerCustomerId',
  'insuredCustomerId',
  'productsCount',
  'succeedProductsCount',
  'createdAt',
  'successRate',
  'insuredCustomerName',
  'insuredCustomerIdentityNumber',
  'insuredCustomerTaxNumber',
  'insuredCustomerType',
  'lowestPremium',
  'highestPremium',
  'channel',
  'insuredCustomerCityText',
  'insuredCustomerCityValue',
  'insuredCustomerDistrictText',
  'insuredCustomerDistrictValue',
  'insuredCustomerPhoneNumber',
  'insuredCustomerPhoneNumberCountryCode',
  'insuredCustomerEmail',
  'vehiclePlateCode',
  'vehiclePlateCity',
  'vehicleDocumentSerialCode',
  'vehicleDocumentSerialNumber',
  'vehicleModelBrandText',
  'vehicleModelBrandValue',
  'vehicleModelTypeText',
  'vehicleModelTypeValue',
  'vehicleModelYear',
  'vehicleFuelType',
  'utilizationStyle',
  'insuredCustomerBirthDate',
  'vehicleId',
  'propertyId',
  // Nested agentBranch fields
  'agentBranch.id',
  'agentBranch.name',
  'agentBranch.parentId',
  'agentBranch.parentName',
  // Nested agentUserCreatedBy fields
  'agentUserCreatedBy.id',
  'agentUserCreatedBy.name',
  'agentUserCreatedBy.email',
  'agentUserCreatedBy.userType',
] as const satisfies readonly ProposalFieldKey[];

/**
 * Helper type to pick selected fields from QueryProposalsResult.
 */
export type PickProposalFields<T extends readonly ProposalFieldKey[]> = PickFields<
  QueryProposalsResult,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedProposalsConnection<TFields extends ProposalFieldKey[]> extends Omit<
  ProposalsConnection,
  'nodes' | 'edges'
> {
  nodes?: (PickProposalFields<TFields> | null)[] | null;
  edges?:
    | (Omit<ProposalsEdge, 'node'> & {
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
  QueryProposalsResultUnifiedFilterInput,
  QueryProposalsResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
