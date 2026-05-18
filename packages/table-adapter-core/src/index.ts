/**
 * @insurup/table-adapter-core
 *
 * A framework-agnostic adapter for using @insurup/sdk with TanStack Table.
 * Handles cursor pagination, sorting, caching, and state management.
 *
 * The `@insurup/table-adapter-core/internal` subpath publishes `ITableAdapter`
 * for framework wrappers (currently used by `@insurup/table-adapter-svelte`).
 * Other primitives are not publicly exposed — open an issue if you need one.
 *
 * @example
 * ```typescript
 * import { createCustomerTable } from '@insurup/table-adapter-core';
 * import { DefaultInsurUpClient } from '@insurup/sdk';
 *
 * const client = new DefaultInsurUpClient({ baseUrl, tokenProvider });
 *
 * const customerTable = createCustomerTable({
 *   columns: (col) => [col.id(), col.name('Customer Name')],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * });
 *
 * const state = useSyncExternalStore(customerTable.subscribe, customerTable.getSnapshot);
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Entity Table Factories
// ============================================================================

export {
  createCustomerTable,
  createInfiniteCustomerTable,
  type CustomerTable,
  type InfiniteCustomerTable,
} from './entities/customer/index.js';

export {
  createPolicyTable,
  createInfinitePolicyTable,
  type PolicyTable,
  type InfinitePolicyTable,
} from './entities/policy/index.js';

export {
  createProposalTable,
  createInfiniteProposalTable,
  type ProposalTable,
  type InfiniteProposalTable,
} from './entities/proposal/index.js';

export {
  createCaseTable,
  createInfiniteCaseTable,
  type CaseTable,
  type InfiniteCaseTable,
} from './entities/case/index.js';

export {
  createAgentUserTable,
  createInfiniteAgentUserTable,
  type AgentUserTable,
  type InfiniteAgentUserTable,
} from './entities/agent-user/index.js';

export {
  createPolicyTransferTable,
  createInfinitePolicyTransferTable,
  type PolicyTransferTable,
  type InfinitePolicyTransferTable,
} from './entities/policy-transfer/index.js';

export {
  createFilePolicyTransferTable,
  createInfiniteFilePolicyTransferTable,
  type FilePolicyTransferTable,
  type InfiniteFilePolicyTransferTable,
} from './entities/file-policy-transfer/index.js';

export {
  createWebhookDeliveryTable,
  createInfiniteWebhookDeliveryTable,
  type WebhookDeliveryTable,
  type InfiniteWebhookDeliveryTable,
} from './entities/webhook-delivery/index.js';

// ============================================================================
// Entity-Specific Types
// ============================================================================

export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
} from './entities/customer/index.js';

export type {
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyTableOptions,
  PolicyFetchFn,
  PolicyFilterInput,
  PolicySearchInput,
} from './entities/policy/index.js';

export type {
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
  ProposalFilterInput,
  ProposalSearchInput,
} from './entities/proposal/index.js';

export type {
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
  CaseFilterInput,
  CaseSearchInput,
} from './entities/case/index.js';

export type {
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserTableOptions,
  AgentUserFetchFn,
  AgentUserFilterInput,
  AgentUserSearchInput,
} from './entities/agent-user/index.js';

export type {
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferTableOptions,
  PolicyTransferFetchFn,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
} from './entities/policy-transfer/index.js';

export type {
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferTableOptions,
  FilePolicyTransferFetchFn,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
} from './entities/file-policy-transfer/index.js';

export type {
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryTableOptions,
  WebhookDeliveryFetchFn,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
} from './entities/webhook-delivery/index.js';

// SDK types (Query*, *FieldKey, Get*Options) are NOT re-exported — import them
// directly from `@insurup/sdk` to avoid two import paths for the same symbol.

// ============================================================================
// Consumer-facing public types
// ============================================================================

export type { TableApi, ColumnInfo } from './lib/factory/index.js';

export type { TableOptions, TableError, ErrorCallbacks } from './lib/adapter/index.js';

export type {
  // Column builder types
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  ColumnConfig,
  ComputedColumnConfig,
  // Field extraction
  ExtractFieldFromColumnDef,
  ExtractFieldsFromColumnDefs,
  // State and options
  AdapterState,
  TableAdapterOptionsBase,
  TableAdapterClientModeOptions,
  TableAdapterFetchModeOptions,
  TableAdapterOptions,
  // Generic entity types
  EntityExtractFields,
  EntityRowType,
  EntityFetchFn,
  EntityTableOptions,
  // Type utilities
  FieldValueType,
  DeepFieldKeys,
  Connection,
  PageInfo,
  InsurUpClientOptions,
  InsurUpGraphQLResult,
  PickFields,
  // Fetch types
  FetchFn,
  FetchRequestOptions,
  QueryOptionsBuilder,
  QueryOptionsBuilderArgs,
} from './lib/index.js';

// ============================================================================
// Pagination & Sorting (public-facing helpers + types)
// ============================================================================

export { createCursorPagination, createPaginationManager } from './lib/pagination/index.js';
export type {
  PaginationManager,
  PaginationState,
  CursorPaginationOptions,
  CursorPaginationManager,
  PaginationOptions,
  PaginationManagerFromOptions,
} from './lib/pagination/index.js';

export { createSortingConverters, SortEnumType, SortDirection } from './lib/sorting/index.js';
export type { SortingState, SortingConverters } from './lib/sorting/index.js';

// ============================================================================
// Column builder (for use with custom adapters)
// ============================================================================

export { createColumnBuilder } from './lib/factory/index.js';
export {
  extractFieldsFromColumns,
  createClientFetchFn,
  createFetchFnFromClient,
} from './lib/index.js';
