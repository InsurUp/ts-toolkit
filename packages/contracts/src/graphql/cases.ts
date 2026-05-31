/**
 * @fileoverview Case GraphQL Types
 * @description Types for querying cases via GraphQL
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
  UuidOperationFilterInput,
  DateTimeOperationFilterInput,
  LocalDateOperationFilterInput,
  EnumOperationFilterInput,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime, DateOnly } from '../common.date.js';

import type { ProductBranch, Channel, CustomerType, AssetType } from '../common.js';
import type { VehicleFuelType, VehicleUtilizationStyle } from '../common.vehicle.js';
import type {
  PropertyDamageStatus,
  PropertyStructure,
  PropertyUtilizationStyle,
  PropertyOwnershipType,
} from '../common.property.js';
import type {
  CaseType,
  CaseStatus,
  CaseMainState,
  CaseSubState,
  SaleOpportunityCaseSubType,
  CancelCaseSubType,
  EndorsementCaseSubType,
  ComplaintCaseSubType,
} from '../cases.js';
import type { Job } from '../customers.js';
import type { UserType } from './policies.js';

// === Output Types ===

export interface CaseAgentBranchInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
}

export interface PriorityRuleHit {
  label: string;
  description: string;
  ruleName?: string | null;
  score: number;
}

/** @meta */
export interface QueryCaseModel {
  agentBranch?: CaseAgentBranchInfo | null;
  agentBranchId?: string | null;
  id: string;
  ref: string;
  type: CaseType;
  status: CaseStatus;
  cancelSubType?: CancelCaseSubType | null;
  saleOpportunitySubType?: SaleOpportunityCaseSubType | null;
  endorsementSubType?: EndorsementCaseSubType | null;
  complaintSubType?: ComplaintCaseSubType | null;
  mainState: CaseMainState;
  subState: CaseSubState;
  productBranch?: ProductBranch | null;
  channel?: Channel | null;
  createdAt: DateTime;
  createdByName: string;
  createdById: string;
  createdByEmail?: string | null;
  createdByType?: UserType | null;
  representedByName?: string | null;
  representedById?: string | null;
  representedByEmail?: string | null;
  representedByType?: UserType | null;
  policyEndDate?: DateOnly | null;
  assetType?: AssetType | null;
  assetId?: string | null;
  sourceCaseId?: string | null;
  policyCount: number;
  proposalCount: number;
  lastProposalDate?: DateTime | null;
  lastPolicyDate?: DateTime | null;
  lastUpdateDate?: DateTime | null;
  lastUpdatedByName?: string | null;
  lastUpdatedById?: string | null;
  lastUpdatedByEmail?: string | null;
  lastUpdatedByType?: UserType | null;
  priorityScore?: number | null;
  priorityRuleHits?: PriorityRuleHit[] | null;
  customerId?: string | null;
  customerName?: string | null;
  customerType?: CustomerType | null;
  customerIdentity?: string | null;
  customerCityText?: string | null;
  customerCityValue?: string | null;
  customerDistrictText?: string | null;
  customerDistrictValue?: string | null;
  customerPrimaryPhoneNumber?: string | null;
  customerPrimaryPhoneCountryCode?: number | null;
  customerPrimaryEmail?: string | null;
  customerBirthDate?: DateOnly | null;
  customerPassportNumber?: string | null;
  customerJob?: Job | null;
  vehiclePlateCode?: string | null;
  vehiclePlateCity?: number | null;
  vehicleModelBrandText?: string | null;
  vehicleModelBrandValue?: string | null;
  vehicleModelTypeText?: string | null;
  vehicleModelTypeValue?: string | null;
  vehicleModelYear?: number | null;
  vehicleUtilizationStyle?: VehicleUtilizationStyle | null;
  vehicleEngineNumber?: string | null;
  vehicleChassisNumber?: string | null;
  vehicleRegistrationDate?: DateOnly | null;
  vehicleFuelType?: VehicleFuelType | null;
  vehicleSeatNumber?: number | null;
  vehicleDocumentSerialCode?: string | null;
  vehicleDocumentSerialNumber?: string | null;
  propertyNumber?: number | null;
  propertySquareMeter?: number | null;
  propertyConstructionYear?: number | null;
  propertyDamageStatus?: PropertyDamageStatus | null;
  propertyFloorNumber?: number | null;
  propertyStructure?: PropertyStructure | null;
  propertyUtilizationStyle?: PropertyUtilizationStyle | null;
  propertyOwnershipType?: PropertyOwnershipType | null;
  propertyDaskPolicyNumber?: string | null;
  advertisingSource?: string | null;
  advertisingCampaign?: string | null;
  searchScore?: number | null;
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryCaseModelFilterInput,
// searching_QueryCaseModelFilterInput.

export interface QueryCaseModelFilterInput {
  and?: QueryCaseModelFilterInput[] | null;
  or?: QueryCaseModelFilterInput[] | null;
  id?: StringOperationFilterInput | null;
  ref?: StringOperationFilterInput | null;
  type?: EnumOperationFilterInput<CaseType> | null;
  status?: EnumOperationFilterInput<CaseStatus> | null;
  cancelSubType?: EnumOperationFilterInput<CancelCaseSubType> | null;
  saleOpportunitySubType?: EnumOperationFilterInput<SaleOpportunityCaseSubType> | null;
  endorsementSubType?: EnumOperationFilterInput<EndorsementCaseSubType> | null;
  complaintSubType?: EnumOperationFilterInput<ComplaintCaseSubType> | null;
  mainState?: EnumOperationFilterInput<CaseMainState> | null;
  subState?: EnumOperationFilterInput<CaseSubState> | null;
  productBranch?: EnumOperationFilterInput<ProductBranch> | null;
  channel?: EnumOperationFilterInput<Channel> | null;
  createdAt?: DateTimeOperationFilterInput | null;
  createdByName?: StringOperationFilterInput | null;
  createdById?: UuidOperationFilterInput | null;
  createdByEmail?: StringOperationFilterInput | null;
  createdByType?: EnumOperationFilterInput<UserType> | null;
  representedByName?: StringOperationFilterInput | null;
  representedById?: UuidOperationFilterInput | null;
  representedByEmail?: StringOperationFilterInput | null;
  representedByType?: EnumOperationFilterInput<UserType> | null;
  policyEndDate?: LocalDateOperationFilterInput | null;
  assetType?: EnumOperationFilterInput<AssetType> | null;
  assetId?: UuidOperationFilterInput | null;
  sourceCaseId?: StringOperationFilterInput | null;
  policyCount?: IntOperationFilterInput | null;
  proposalCount?: IntOperationFilterInput | null;
  lastProposalDate?: DateTimeOperationFilterInput | null;
  lastPolicyDate?: DateTimeOperationFilterInput | null;
  lastUpdateDate?: DateTimeOperationFilterInput | null;
  lastUpdatedByName?: StringOperationFilterInput | null;
  lastUpdatedById?: UuidOperationFilterInput | null;
  lastUpdatedByEmail?: StringOperationFilterInput | null;
  lastUpdatedByType?: EnumOperationFilterInput<UserType> | null;
  priorityScore?: IntOperationFilterInput | null;
  customerId?: UuidOperationFilterInput | null;
  customerName?: StringOperationFilterInput | null;
  customerType?: EnumOperationFilterInput<CustomerType> | null;
  customerIdentity?: StringOperationFilterInput | null;
  customerCityText?: StringOperationFilterInput | null;
  customerCityValue?: StringOperationFilterInput | null;
  customerDistrictText?: StringOperationFilterInput | null;
  customerDistrictValue?: StringOperationFilterInput | null;
  customerPrimaryPhoneNumber?: StringOperationFilterInput | null;
  customerPrimaryPhoneCountryCode?: IntOperationFilterInput | null;
  customerPrimaryEmail?: StringOperationFilterInput | null;
  customerBirthDate?: LocalDateOperationFilterInput | null;
  customerPassportNumber?: StringOperationFilterInput | null;
  customerJob?: EnumOperationFilterInput<Job> | null;
  vehiclePlateCode?: StringOperationFilterInput | null;
  vehiclePlateCity?: IntOperationFilterInput | null;
  vehicleModelBrandText?: StringOperationFilterInput | null;
  vehicleModelBrandValue?: StringOperationFilterInput | null;
  vehicleModelTypeText?: StringOperationFilterInput | null;
  vehicleModelTypeValue?: StringOperationFilterInput | null;
  vehicleModelYear?: IntOperationFilterInput | null;
  vehicleUtilizationStyle?: EnumOperationFilterInput<VehicleUtilizationStyle> | null;
  vehicleEngineNumber?: StringOperationFilterInput | null;
  vehicleChassisNumber?: StringOperationFilterInput | null;
  vehicleRegistrationDate?: LocalDateOperationFilterInput | null;
  vehicleFuelType?: EnumOperationFilterInput<VehicleFuelType> | null;
  vehicleSeatNumber?: IntOperationFilterInput | null;
  vehicleDocumentSerialCode?: StringOperationFilterInput | null;
  vehicleDocumentSerialNumber?: StringOperationFilterInput | null;
  propertyNumber?: IntOperationFilterInput | null;
  propertySquareMeter?: IntOperationFilterInput | null;
  propertyConstructionYear?: IntOperationFilterInput | null;
  propertyDamageStatus?: EnumOperationFilterInput<PropertyDamageStatus> | null;
  propertyFloorNumber?: IntOperationFilterInput | null;
  propertyStructure?: EnumOperationFilterInput<PropertyStructure> | null;
  propertyUtilizationStyle?: EnumOperationFilterInput<PropertyUtilizationStyle> | null;
  propertyOwnershipType?: EnumOperationFilterInput<PropertyOwnershipType> | null;
  propertyDaskPolicyNumber?: StringOperationFilterInput | null;
  advertisingSource?: StringOperationFilterInput | null;
  advertisingCampaign?: StringOperationFilterInput | null;
  agentBranchId?: StringOperationFilterInput | null;
}

export interface QueryCaseModelSearchInput {
  and?: QueryCaseModelSearchInput[] | null;
  or?: QueryCaseModelSearchInput[] | null;
  ref?: SearchStringOperationFilterInput | null;
  createdByName?: SearchStringOperationFilterInput | null;
  representedByName?: SearchStringOperationFilterInput | null;
  customerName?: SearchStringOperationFilterInput | null;
  customerIdentity?: SearchStringOperationFilterInput | null;
  customerCityText?: SearchStringOperationFilterInput | null;
  customerDistrictText?: SearchStringOperationFilterInput | null;
  customerPrimaryPhoneNumber?: SearchStringOperationFilterInput | null;
  customerPrimaryEmail?: SearchStringOperationFilterInput | null;
  vehiclePlateCode?: SearchStringOperationFilterInput | null;
  vehicleModelBrandText?: SearchStringOperationFilterInput | null;
  vehicleModelTypeText?: SearchStringOperationFilterInput | null;
  vehicleEngineNumber?: SearchStringOperationFilterInput | null;
  vehicleChassisNumber?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialCode?: SearchStringOperationFilterInput | null;
  vehicleDocumentSerialNumber?: SearchStringOperationFilterInput | null;
  propertyDaskPolicyNumber?: SearchStringOperationFilterInput | null;
}

export type QueryCaseModelUnifiedFilterInput = UnifiedFilterInput<
  QueryCaseModelFilterInput,
  QueryCaseModelSearchInput
>;

/**
 * Sort input for QueryCaseModel.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryCaseModelSortInput {
  createdAt?: SortEnumType | null;
  policyEndDate?: SortEnumType | null;
  policyCount?: SortEnumType | null;
  proposalCount?: SortEnumType | null;
  lastProposalDate?: SortEnumType | null;
  lastPolicyDate?: SortEnumType | null;
  lastUpdateDate?: SortEnumType | null;
  priorityScore?: SortEnumType | null;
  customerBirthDate?: SortEnumType | null;
  vehicleModelYear?: SortEnumType | null;
  vehicleRegistrationDate?: SortEnumType | null;
  propertyConstructionYear?: SortEnumType | null;
  searchScore?: SortEnumType | null;
}

// === Connection Types ===

export type CasesEdge = Edge<QueryCaseModel>;
export type CasesConnection<TFields extends readonly CaseFieldKey[] = readonly CaseFieldKey[]> =
  Connection<PickCaseFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryCaseModel with nested dot-notation paths.
 */
export type CaseFieldKey = DeepFieldKeys<QueryCaseModel>;

/**
 * Runtime array of all case field keys including nested paths.
 */
export const ALL_CASE_FIELDS = [
  // Primitive fields
  'agentBranchId',
  'id',
  'ref',
  'type',
  'status',
  'cancelSubType',
  'saleOpportunitySubType',
  'endorsementSubType',
  'complaintSubType',
  'mainState',
  'subState',
  'productBranch',
  'channel',
  'createdAt',
  'createdByName',
  'createdById',
  'createdByEmail',
  'createdByType',
  'representedByName',
  'representedById',
  'representedByEmail',
  'representedByType',
  'policyEndDate',
  'assetType',
  'assetId',
  'sourceCaseId',
  'policyCount',
  'proposalCount',
  'lastProposalDate',
  'lastPolicyDate',
  'lastUpdateDate',
  'lastUpdatedByName',
  'lastUpdatedById',
  'lastUpdatedByEmail',
  'lastUpdatedByType',
  'priorityScore',
  'customerId',
  'customerName',
  'customerType',
  'customerIdentity',
  'customerCityText',
  'customerCityValue',
  'customerDistrictText',
  'customerDistrictValue',
  'customerPrimaryPhoneNumber',
  'customerPrimaryPhoneCountryCode',
  'customerPrimaryEmail',
  'customerBirthDate',
  'customerPassportNumber',
  'customerJob',
  'vehiclePlateCode',
  'vehiclePlateCity',
  'vehicleModelBrandText',
  'vehicleModelBrandValue',
  'vehicleModelTypeText',
  'vehicleModelTypeValue',
  'vehicleModelYear',
  'vehicleUtilizationStyle',
  'vehicleEngineNumber',
  'vehicleChassisNumber',
  'vehicleRegistrationDate',
  'vehicleFuelType',
  'vehicleSeatNumber',
  'vehicleDocumentSerialCode',
  'vehicleDocumentSerialNumber',
  'propertyNumber',
  'propertySquareMeter',
  'propertyConstructionYear',
  'propertyDamageStatus',
  'propertyFloorNumber',
  'propertyStructure',
  'propertyUtilizationStyle',
  'propertyOwnershipType',
  'propertyDaskPolicyNumber',
  'advertisingSource',
  'advertisingCampaign',
  'searchScore',
  // Nested agentBranch fields
  'agentBranch.id',
  'agentBranch.name',
  'agentBranch.parentId',
  'agentBranch.parentName',
  // Nested priorityRuleHits fields
  'priorityRuleHits.label',
  'priorityRuleHits.description',
  'priorityRuleHits.ruleName',
  'priorityRuleHits.score',
] as const satisfies readonly CaseFieldKey[];

/**
 * Helper type to pick selected fields from QueryCaseModel.
 */
export type PickCaseFields<T extends readonly CaseFieldKey[]> = PickFields<QueryCaseModel, T>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedCasesConnection<TFields extends CaseFieldKey[]> extends Omit<
  CasesConnection,
  'nodes' | 'edges'
> {
  nodes?: (PickCaseFields<TFields> | null)[] | null;
  edges?:
    | (Omit<CasesEdge, 'node'> & {
        node?: PickCaseFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getCases query.
 * Extends GetQueryOptions with case-specific types.
 */
export interface GetCasesOptions<
  TFields extends CaseFieldKey[] = CaseFieldKey[],
> extends GetQueryOptions<CaseFieldKey, QueryCaseModelUnifiedFilterInput, QueryCaseModelSortInput> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
