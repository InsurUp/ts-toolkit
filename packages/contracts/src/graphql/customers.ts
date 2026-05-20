/**
 * @fileoverview Customer GraphQL Types
 * @description Types for querying customers via GraphQL
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
  BooleanOperationFilterInput,
  UuidOperationFilterInput,
  DateTimeOperationFilterInput,
  LocalDateOperationFilterInput,
  EnumOperationFilterInput,
  ListFilterInputType,
  SearchStringOperationFilterInput,
  UnifiedFilterInput,
} from './common.js';
import type { DateTime, DateOnly } from '../common.date.js';

import type { Channel, CustomerType } from '../common.js';
import type {
  ConsentType,
  EducationStatus,
  Gender,
  Job,
  MaritalStatus,
  Nationality,
} from '../customers.js';

// === Output Types ===

export interface CustomerAgentBranchInfo {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
}

/** @meta */
export interface QueryCustomerConsentModel {
  consentType: ConsentType;
  isActive: boolean;
}

/** @meta */
export interface QueryCustomerModel {
  agentBranch?: CustomerAgentBranchInfo | null;
  agentBranchId?: string | null;
  id: string;
  name?: string | null;
  identityNumber?: string | null;
  taxNumber?: string | null;
  type: CustomerType;
  primaryEmail?: string | null;
  primaryPhoneNumber?: string | null;
  primaryPhoneNumberCountryCode?: number | null;
  cityText?: string | null;
  cityValue?: string | null;
  districtText?: string | null;
  districtValue?: string | null;
  createdAt: DateTime;
  birthDate?: DateOnly | null;
  gender?: Gender | null;
  educationStatus?: EducationStatus | null;
  nationality?: Nationality | null;
  maritalStatus?: MaritalStatus | null;
  job?: Job | null;
  passportNumber?: string | null;
  searchScore?: number | null;
  consents: QueryCustomerConsentModel[];
}

// === Filter/Search/Sort Inputs ===
// Hand-declared from server schema: filtering_QueryCustomerModelFilterInput,
// searching_QueryCustomerModelFilterInput. Includes only fields the server
// supports for filtering/searching.

export interface QueryCustomerConsentModelFilterInput {
  and?: QueryCustomerConsentModelFilterInput[] | null;
  or?: QueryCustomerConsentModelFilterInput[] | null;
  consentType?: EnumOperationFilterInput<ConsentType> | null;
  isActive?: BooleanOperationFilterInput | null;
}

export interface QueryCustomerModelFilterInput {
  and?: QueryCustomerModelFilterInput[] | null;
  or?: QueryCustomerModelFilterInput[] | null;
  id?: UuidOperationFilterInput | null;
  name?: StringOperationFilterInput | null;
  identityNumber?: StringOperationFilterInput | null;
  taxNumber?: StringOperationFilterInput | null;
  type?: EnumOperationFilterInput<CustomerType> | null;
  primaryEmail?: StringOperationFilterInput | null;
  primaryPhoneNumber?: StringOperationFilterInput | null;
  primaryPhoneNumberCountryCode?: IntOperationFilterInput | null;
  cityText?: StringOperationFilterInput | null;
  cityValue?: StringOperationFilterInput | null;
  districtText?: StringOperationFilterInput | null;
  districtValue?: StringOperationFilterInput | null;
  createdAt?: DateTimeOperationFilterInput | null;
  creationChannel?: EnumOperationFilterInput<Channel> | null;
  birthDate?: LocalDateOperationFilterInput | null;
  gender?: EnumOperationFilterInput<Gender> | null;
  educationStatus?: EnumOperationFilterInput<EducationStatus> | null;
  nationality?: EnumOperationFilterInput<Nationality> | null;
  maritalStatus?: EnumOperationFilterInput<MaritalStatus> | null;
  job?: EnumOperationFilterInput<Job> | null;
  passportNumber?: StringOperationFilterInput | null;
  agentBranchId?: StringOperationFilterInput | null;
  consents?: ListFilterInputType<QueryCustomerConsentModelFilterInput> | null;
  emailCount?: IntOperationFilterInput | null;
  phoneCount?: IntOperationFilterInput | null;
}

export interface QueryCustomerModelSearchInput {
  and?: QueryCustomerModelSearchInput[] | null;
  or?: QueryCustomerModelSearchInput[] | null;
  name?: SearchStringOperationFilterInput | null;
  identityNumber?: SearchStringOperationFilterInput | null;
  taxNumber?: SearchStringOperationFilterInput | null;
  primaryEmail?: SearchStringOperationFilterInput | null;
  primaryPhoneNumber?: SearchStringOperationFilterInput | null;
  cityText?: SearchStringOperationFilterInput | null;
  districtText?: SearchStringOperationFilterInput | null;
  passportNumber?: SearchStringOperationFilterInput | null;
}

/**
 * Unified filter+search input used by the table adapter. Each field accepts
 * either its filter-ops shape or its search-ops shape tagged with
 * `$search: true`.
 */
export type QueryCustomerModelUnifiedFilterInput = UnifiedFilterInput<
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput
>;

/**
 * Sort input for QueryCustomerModel.
 * Note: Sort fields are explicitly defined as they may differ from model fields.
 */
export interface QueryCustomerModelSortInput {
  name?: SortEnumType | null;
  createdAt?: SortEnumType | null;
  birthDate?: SortEnumType | null;
  searchScore?: SortEnumType | null;
}

// === Connection Types ===

export type CustomersEdge = Edge<QueryCustomerModel>;
export type CustomersConnection<
  TFields extends readonly CustomerFieldKey[] = readonly CustomerFieldKey[],
> = Connection<PickCustomerFields<TFields>>;

// === Select Options ===

/**
 * All available field keys for QueryCustomerModel with nested dot-notation paths.
 * - Primitive fields: "id", "name", etc. (as-is)
 * - Objects/Arrays: ONLY nested paths allowed, e.g. "agentBranch.id", "consents.consentType"
 * - Parent keys alone ("agentBranch", "consents") are NOT allowed
 */
export type CustomerFieldKey = DeepFieldKeys<QueryCustomerModel>;

/**
 * Runtime array of all customer field keys including nested paths.
 */
export const ALL_CUSTOMER_FIELDS = [
  // Primitive fields
  'agentBranchId',
  'id',
  'name',
  'identityNumber',
  'taxNumber',
  'type',
  'primaryEmail',
  'primaryPhoneNumber',
  'primaryPhoneNumberCountryCode',
  'cityText',
  'cityValue',
  'districtText',
  'districtValue',
  'createdAt',
  'birthDate',
  'gender',
  'educationStatus',
  'nationality',
  'maritalStatus',
  'job',
  'passportNumber',
  'searchScore',
  // Nested agentBranch fields
  'agentBranch.id',
  'agentBranch.name',
  'agentBranch.parentId',
  'agentBranch.parentName',
  // Nested consents fields
  'consents.consentType',
  'consents.isActive',
] as const satisfies readonly CustomerFieldKey[];

/**
 * Helper type to pick selected fields from QueryCustomerModel.
 * Uses the generic PickFields utility from common.ts.
 */
export type PickCustomerFields<T extends readonly CustomerFieldKey[]> = PickFields<
  QueryCustomerModel,
  T
>;

/**
 * Type-safe connection result based on selected fields
 */
export interface SelectedCustomersConnection<TFields extends CustomerFieldKey[]> extends Omit<
  CustomersConnection,
  'nodes' | 'edges'
> {
  nodes?: (PickCustomerFields<TFields> | null)[] | null;
  edges?:
    | (Omit<CustomersEdge, 'node'> & {
        node?: PickCustomerFields<TFields> | null;
      })[]
    | null;
}

/**
 * Options for getCustomers query.
 * Extends GetQueryOptions with customer-specific types.
 */
export interface GetCustomersOptions<
  TFields extends CustomerFieldKey[] = CustomerFieldKey[],
> extends GetQueryOptions<
  CustomerFieldKey,
  QueryCustomerModelUnifiedFilterInput,
  QueryCustomerModelSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
