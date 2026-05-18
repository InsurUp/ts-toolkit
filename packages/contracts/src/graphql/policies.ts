/**
 * @fileoverview Policy GraphQL Types
 * @description Types for querying policies via GraphQL
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
} from './common.js';
import type { DateTime, DateOnly } from '../common.date.js';

import type {
  ProductBranch,
  Currency,
  PaymentOption,
  PolicyState,
  Channel,
  CustomerType,
} from '../common.js';
import type { VehicleFuelType } from '../common.vehicle.js';

// === Output Types ===

export interface PolicyAgentBranchInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
}

export interface PolicyUserReference {
  id: string;
  name: string;
  email?: string | null;
  userType?: UserType | null;
}

export enum UserType {
  None = 'NONE',
  AdminPanel = 'ADMIN_PANEL',
  Agent = 'AGENT',
  Customer = 'CUSTOMER',
}

/** @meta */
export interface QueryPoliciesResult {
  agentBranch?: PolicyAgentBranchInfo | null;
  agentBranchId?: string | null;
  id: string;
  insurerCustomerId: string;
  insuredCustomerId: string;
  installmentNumber?: number | null;
  productBranch: ProductBranch;
  netPremium?: number | null;
  grossPremium?: number | null;
  commission?: number | null;
  paymentType: PaymentOption;
  currency: Currency;
  insuranceCompanyProposalNumber: string;
  insuranceCompanyPolicyNumber: string;
  createdAt: DateTime;
  startDate: DateOnly;
  endDate: DateOnly;
  arrangementDate?: DateOnly | null;
  insuredCustomerName?: string | null;
  insuredCustomerIdentityNumber?: string | null;
  insuredCustomerTaxNumber?: string | null;
  insuredCustomerType: CustomerType;
  insuredCustomerCityText?: string | null;
  insuredCustomerCityValue?: string | null;
  insuredCustomerDistrictText?: string | null;
  insuredCustomerDistrictValue?: string | null;
  insuredCustomerBirthDate?: DateOnly | null;
  insurerCustomerName?: string | null;
  insurerCustomerIdentityNumber?: string | null;
  insurerCustomerTaxNumber?: string | null;
  insurerCustomerCityText?: string | null;
  insurerCustomerCityValue?: string | null;
  insurerCustomerDistrictText?: string | null;
  insurerCustomerDistrictValue?: string | null;
  insurerCustomerBirthDate?: DateOnly | null;
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
  productId?: number | null;
  productName?: string | null;
  insuranceCompanyId: number;
  insuranceCompanyName: string;
  insuranceCompanyLogo?: string | null;
  state: PolicyState;
  createdBy: PolicyUserReference;
  representedBy?: PolicyUserReference | null;
  propertyNumber?: number | null;
  daskOldPolicyNumber?: number | null;
  daskPolicyNumber?: string | null;
  vehicleId?: string | null;
  propertyId?: string | null;
  channel: Channel;
  campaign?: string | null;
}

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryPoliciesResult.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryPoliciesResultFilterInput = ModelFilterInput<QueryPoliciesResult>;

/**
 * Search input for QueryPoliciesResult.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryPoliciesResultSearchInput = ModelSearchInput<QueryPoliciesResult>;

/**
 * Sort input for QueryPoliciesResult.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryPoliciesResultSortInput {
  netPremium?: SortEnumType | null;
  grossPremium?: SortEnumType | null;
  createdAt?: SortEnumType | null;
  startDate?: SortEnumType | null;
  endDate?: SortEnumType | null;
  arrangementDate?: SortEnumType | null;
  vehicleModelYear?: SortEnumType | null;
}

// === Connection Types ===

export type PoliciesEdge = Edge<QueryPoliciesResult>;
export type PoliciesConnection<
  TFields extends readonly PolicyFieldKey[] = readonly PolicyFieldKey[],
> = Connection<PickPolicyFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryPoliciesResult with nested dot-notation paths.
 */
export type PolicyFieldKey = DeepFieldKeys<QueryPoliciesResult>;

/**
 * Runtime array of all policy field keys including nested paths.
 */
export const ALL_POLICY_FIELDS = [
  // Primitive fields
  'agentBranchId',
  'id',
  'insurerCustomerId',
  'insuredCustomerId',
  'installmentNumber',
  'productBranch',
  'netPremium',
  'grossPremium',
  'commission',
  'paymentType',
  'currency',
  'insuranceCompanyProposalNumber',
  'insuranceCompanyPolicyNumber',
  'createdAt',
  'startDate',
  'endDate',
  'arrangementDate',
  'insuredCustomerName',
  'insuredCustomerIdentityNumber',
  'insuredCustomerTaxNumber',
  'insuredCustomerType',
  'insuredCustomerCityText',
  'insuredCustomerCityValue',
  'insuredCustomerDistrictText',
  'insuredCustomerDistrictValue',
  'insuredCustomerBirthDate',
  'insurerCustomerName',
  'insurerCustomerIdentityNumber',
  'insurerCustomerTaxNumber',
  'insurerCustomerCityText',
  'insurerCustomerCityValue',
  'insurerCustomerDistrictText',
  'insurerCustomerDistrictValue',
  'insurerCustomerBirthDate',
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
  'productId',
  'productName',
  'insuranceCompanyId',
  'insuranceCompanyName',
  'insuranceCompanyLogo',
  'state',
  'propertyNumber',
  'daskOldPolicyNumber',
  'daskPolicyNumber',
  'vehicleId',
  'propertyId',
  'channel',
  'campaign',
  // Nested agentBranch fields
  'agentBranch.id',
  'agentBranch.name',
  'agentBranch.parentId',
  'agentBranch.parentName',
  // Nested createdBy fields
  'createdBy.id',
  'createdBy.name',
  'createdBy.email',
  'createdBy.userType',
  // Nested representedBy fields
  'representedBy.id',
  'representedBy.name',
  'representedBy.email',
  'representedBy.userType',
] as const satisfies readonly PolicyFieldKey[];

/**
 * Helper type to pick selected fields from QueryPoliciesResult.
 */
export type PickPolicyFields<T extends readonly PolicyFieldKey[]> = PickFields<
  QueryPoliciesResult,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedPoliciesConnection<TFields extends PolicyFieldKey[]> extends Omit<
  PoliciesConnection,
  'nodes' | 'edges'
> {
  nodes?: (PickPolicyFields<TFields> | null)[] | null;
  edges?:
    | (Omit<PoliciesEdge, 'node'> & {
        node?: PickPolicyFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getPolicies query.
 * Extends GetQueryOptions with policy-specific types.
 */
export interface GetPoliciesOptions<
  TFields extends PolicyFieldKey[] = PolicyFieldKey[],
> extends GetQueryOptions<
  PolicyFieldKey,
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
  QueryPoliciesResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
