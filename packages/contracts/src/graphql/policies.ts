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
  GetQueryOptions,
  StringOperationFilterInput,
  ObjectIdOperationFilterInput,
  IntOperationFilterInput,
  FloatOperationFilterInput,
  BooleanOperationFilterInput,
  UuidOperationFilterInput,
  DateTimeOperationFilterInput,
  LocalDateOperationFilterInput,
  EnumOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
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

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryPoliciesResultFilterInput,
// searching_QueryPoliciesResultFilterInput.

export interface UserReferenceFilterInput {
  and?: UserReferenceFilterInput[] | null;
  or?: UserReferenceFilterInput[] | null;
  id?: UuidOperationFilterInput | null;
  name?: StringOperationFilterInput | null;
  email?: StringOperationFilterInput | null;
  isServiceAccount?: BooleanOperationFilterInput | null;
  userType?: EnumOperationFilterInput<UserType> | null;
}

/**
 * Server policy version type. Filter-only — not exposed on the QueryPoliciesResult
 * output model, but the server allows filtering on it.
 */
export enum PolicyVersionType {
  Initial = 'INITIAL',
  Cancellation = 'CANCELLATION',
  Update = 'UPDATE',
}

export interface QueryPoliciesResultFilterInput {
  and?: QueryPoliciesResultFilterInput[] | null;
  or?: QueryPoliciesResultFilterInput[] | null;
  id?: ObjectIdOperationFilterInput | null;
  insurerCustomerId?: UuidOperationFilterInput | null;
  insuredCustomerId?: UuidOperationFilterInput | null;
  installmentNumber?: IntOperationFilterInput | null;
  productBranch?: EnumOperationFilterInput<ProductBranch> | null;
  netPremium?: FloatOperationFilterInput | null;
  grossPremium?: FloatOperationFilterInput | null;
  commission?: FloatOperationFilterInput | null;
  netPremiumChange?: FloatOperationFilterInput | null;
  grossPremiumChange?: FloatOperationFilterInput | null;
  commissionChange?: FloatOperationFilterInput | null;
  paymentType?: EnumOperationFilterInput<PaymentOption> | null;
  currency?: EnumOperationFilterInput<Currency> | null;
  exchangeRate?: FloatOperationFilterInput | null;
  netPremiumTL?: FloatOperationFilterInput | null;
  grossPremiumTL?: FloatOperationFilterInput | null;
  commissionTL?: FloatOperationFilterInput | null;
  insuranceCompanyProposalNumber?: StringOperationFilterInput | null;
  insuranceCompanyPolicyNumber?: StringOperationFilterInput | null;
  renewalNumber?: IntOperationFilterInput | null;
  endorsementNumber?: IntOperationFilterInput | null;
  endorsementType?: EnumOperationFilterInput<PolicyVersionType> | null;
  updateReasonText?: StringOperationFilterInput | null;
  endorsementTimestamp?: LocalDateOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  startDate?: LocalDateOperationFilterInput | null;
  endDate?: LocalDateOperationFilterInput | null;
  arrangementDate?: LocalDateOperationFilterInput | null;
  insuredCustomerName?: StringOperationFilterInput | null;
  insuredCustomerIdentityNumber?: StringOperationFilterInput | null;
  insuredCustomerTaxNumber?: StringOperationFilterInput | null;
  insuredCustomerType?: EnumOperationFilterInput<CustomerType> | null;
  insuredCustomerCityText?: StringOperationFilterInput | null;
  insuredCustomerCityValue?: StringOperationFilterInput | null;
  insuredCustomerDistrictText?: StringOperationFilterInput | null;
  insuredCustomerDistrictValue?: StringOperationFilterInput | null;
  insuredCustomerBirthDate?: LocalDateOperationFilterInput | null;
  insurerCustomerName?: StringOperationFilterInput | null;
  insurerCustomerIdentityNumber?: StringOperationFilterInput | null;
  insurerCustomerTaxNumber?: StringOperationFilterInput | null;
  insurerCustomerCityText?: StringOperationFilterInput | null;
  insurerCustomerCityValue?: StringOperationFilterInput | null;
  insurerCustomerDistrictText?: StringOperationFilterInput | null;
  insurerCustomerDistrictValue?: StringOperationFilterInput | null;
  insurerCustomerBirthDate?: LocalDateOperationFilterInput | null;
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
  productId?: IntOperationFilterInput | null;
  productName?: StringOperationFilterInput | null;
  insuranceCompanyName?: StringOperationFilterInput | null;
  insuranceCompanyLogo?: StringOperationFilterInput | null;
  state?: EnumOperationFilterInput<PolicyState> | null;
  createdBy?: UserReferenceFilterInput | null;
  representedBy?: UserReferenceFilterInput | null;
  propertyNumber?: IntOperationFilterInput | null;
  daskOldPolicyNumber?: IntOperationFilterInput | null;
  daskPolicyNumber?: StringOperationFilterInput | null;
  vehicleId?: UuidOperationFilterInput | null;
  propertyId?: UuidOperationFilterInput | null;
  channel?: EnumOperationFilterInput<Channel> | null;
  advertisingSource?: StringOperationFilterInput | null;
  advertisingCampaign?: StringOperationFilterInput | null;
  campaign?: StringOperationFilterInput | null;
  agentBranchId?: StringOperationFilterInput | null;
}

export interface QueryPoliciesResultSearchInput {
  and?: QueryPoliciesResultSearchInput[] | null;
  or?: QueryPoliciesResultSearchInput[] | null;
  insuranceCompanyProposalNumber?: SearchStringOperationFilterInput | null;
  insuranceCompanyPolicyNumber?: SearchStringOperationFilterInput | null;
  insuredCustomerName?: SearchStringOperationFilterInput | null;
  insuredCustomerIdentityNumber?: SearchStringOperationFilterInput | null;
  insuredCustomerCityText?: SearchStringOperationFilterInput | null;
  insuredCustomerDistrictText?: SearchStringOperationFilterInput | null;
  insurerCustomerName?: SearchStringOperationFilterInput | null;
  insurerCustomerIdentityNumber?: SearchStringOperationFilterInput | null;
  insurerCustomerCityText?: SearchStringOperationFilterInput | null;
  insurerCustomerDistrictText?: SearchStringOperationFilterInput | null;
  vehiclePlateCode?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialCode?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialNumber?: SearchStringOperationFilterInput | null;
  vehicleModelBrandText?: SearchStringOperationFilterInput | null;
  vehicleModelTypeText?: SearchStringOperationFilterInput | null;
  daskPolicyNumber?: SearchStringOperationFilterInput | null;
}

export type QueryPoliciesResultUnifiedFilterInput = UnifiedFilterInput<
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput
>;

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
  QueryPoliciesResultUnifiedFilterInput,
  QueryPoliciesResultSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
