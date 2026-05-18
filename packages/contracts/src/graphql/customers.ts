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
  ModelFilterInput,
  ModelSearchInput,
  GetQueryOptions,
} from './common.js';
import type { DateTime, DateOnly } from '../common.date.js';

import type { CustomerType } from '../common.js';
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

// === Filter/Search/Sort Inputs (auto-generated from model) ===

/**
 * Filter input for QueryCustomerModel.
 * Auto-generated from model fields using ModelFilterInput.
 */
export type QueryCustomerModelFilterInput = ModelFilterInput<QueryCustomerModel>;

/**
 * Search input for QueryCustomerModel.
 * Auto-generated from model fields using ModelSearchInput.
 */
export type QueryCustomerModelSearchInput = ModelSearchInput<QueryCustomerModel>;

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
  QueryCustomerModelFilterInput,
  QueryCustomerModelSearchInput,
  QueryCustomerModelSortInput
> {
  /** Fields to select from the query. If not provided, all fields are returned. */
  select?: TFields;
}
