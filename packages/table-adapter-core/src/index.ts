/**
 * @insurup/tanstack-table-adapter
 *
 * A framework-agnostic adapter for using @insurup/sdk with TanStack Table.
 * Handles cursor pagination, sorting, caching, and state management.
 *
 * @example
 * ```typescript
 * import { createCustomerTable } from '@insurup/tanstack-table-adapter'
 * import { DefaultInsurUpClient } from '@insurup/sdk'
 *
 * const client = new DefaultInsurUpClient({ baseUrl, tokenProvider })
 *
 * const customerTable = createCustomerTable({
 *   columns: col => [
 *     col.id(),
 *     col.name('Customer Name'),
 *     col.type({ header: 'Type', render: v => v === 'Individual' ? '👤' : '🏢' }),
 *     col.computed({
 *       uses: ['cityText', 'districtText'] as const,
 *       header: 'Location',
 *       render: row => `${row.cityText}, ${row.districtText}`
 *     })
 *   ],
 *   fetch: (options) => client.customers.getCustomers(options),
 *   pagination: { type: 'cursor', pageSize: 10 },
 * })
 *
 * // state.rows[0] only has: id, name, type, cityText, districtText ✅
 * const state = useSyncExternalStore(customerTable.subscribe, customerTable.getSnapshot)
 * ```
 *
 * @packageDocumentation
 */

// ============================================================================
// Entity Table Factories
// ============================================================================

// Customer entity - Pagination mode
export { createCustomerTable, type CustomerTable } from './entities/customer/index.js';

// Customer entity - Infinite scroll mode
export {
  createInfiniteCustomerTable,
  type InfiniteCustomerTable,
} from './entities/customer/index.js';

// Policy entity - Pagination mode
export { createPolicyTable, type PolicyTable } from './entities/policy/index.js';

// Policy entity - Infinite scroll mode
export { createInfinitePolicyTable, type InfinitePolicyTable } from './entities/policy/index.js';

// Proposal entity - Pagination mode
export { createProposalTable, type ProposalTable } from './entities/proposal/index.js';

// Proposal entity - Infinite scroll mode
export {
  createInfiniteProposalTable,
  type InfiniteProposalTable,
} from './entities/proposal/index.js';

// Case entity - Pagination mode
export { createCaseTable, type CaseTable } from './entities/case/index.js';

// Case entity - Infinite scroll mode
export { createInfiniteCaseTable, type InfiniteCaseTable } from './entities/case/index.js';

// AgentUser entity - Pagination mode
export { createAgentUserTable, type AgentUserTable } from './entities/agent-user/index.js';

// AgentUser entity - Infinite scroll mode
export {
  createInfiniteAgentUserTable,
  type InfiniteAgentUserTable,
} from './entities/agent-user/index.js';

// PolicyTransfer entity - Pagination mode
export {
  createPolicyTransferTable,
  type PolicyTransferTable,
} from './entities/policy-transfer/index.js';

// PolicyTransfer entity - Infinite scroll mode
export {
  createInfinitePolicyTransferTable,
  type InfinitePolicyTransferTable,
} from './entities/policy-transfer/index.js';

// FilePolicyTransfer entity - Pagination mode
export {
  createFilePolicyTransferTable,
  type FilePolicyTransferTable,
} from './entities/file-policy-transfer/index.js';

// FilePolicyTransfer entity - Infinite scroll mode
export {
  createInfiniteFilePolicyTransferTable,
  type InfiniteFilePolicyTransferTable,
} from './entities/file-policy-transfer/index.js';

// Webhook Delivery entity - Pagination mode
export {
  createWebhookDeliveryTable,
  type WebhookDeliveryTable,
} from './entities/webhook-delivery/index.js';

// Webhook Delivery entity - Infinite scroll mode
export {
  createInfiniteWebhookDeliveryTable,
  type InfiniteWebhookDeliveryTable,
} from './entities/webhook-delivery/index.js';

// ============================================================================
// Entity-Specific Types
// ============================================================================

// Customer types
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
} from './entities/customer/index.js';

// Policy types
export type {
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyTableOptions,
  PolicyFetchFn,
  PolicyFilterInput,
  PolicySearchInput,
} from './entities/policy/index.js';

// Proposal types
export type {
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
  ProposalFilterInput,
  ProposalSearchInput,
} from './entities/proposal/index.js';

// Case types
export type {
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
  CaseFilterInput,
  CaseSearchInput,
} from './entities/case/index.js';

// AgentUser types
export type {
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserTableOptions,
  AgentUserFetchFn,
  AgentUserFilterInput,
  AgentUserSearchInput,
} from './entities/agent-user/index.js';

// PolicyTransfer types
export type {
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferTableOptions,
  PolicyTransferFetchFn,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
} from './entities/policy-transfer/index.js';

// FilePolicyTransfer types
export type {
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferTableOptions,
  FilePolicyTransferFetchFn,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
} from './entities/file-policy-transfer/index.js';

// Webhook Delivery types
export type {
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryTableOptions,
  WebhookDeliveryFetchFn,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
} from './entities/webhook-delivery/index.js';

// Re-export SDK types for convenience
export type { GetCustomersOptions, CustomerFieldKey, QueryCustomerModel } from '@insurup/sdk';
export type { GetPoliciesOptions, PolicyFieldKey, QueryPoliciesResult } from '@insurup/sdk';
export type { GetProposalsOptions, ProposalFieldKey, QueryProposalsResult } from '@insurup/sdk';
export type { GetCasesOptions, CaseFieldKey, QueryCaseModel } from '@insurup/sdk';
export type { GetAgentUsersOptions, AgentUserFieldKey, QueryAgentUserResult } from '@insurup/sdk';
export type {
  GetPolicyTransfersOptions,
  PolicyTransferFieldKey,
  QueryPolicyTransfersResult,
} from '@insurup/sdk';
export type {
  GetFilePolicyTransfersOptions,
  FilePolicyTransferFieldKey,
  QueryFilePolicyTransfersResult,
} from '@insurup/sdk';
export type {
  GetWebhookDeliveriesOptions,
  WebhookDeliveryFieldKey,
  QueryWebhookDeliveryResult,
} from '@insurup/sdk';

// ============================================================================
// Base Adapter (for advanced usage)
// ============================================================================

export {
  BaseTableAdapter,
  InfiniteTableAdapter,
  type BaseTableAdapterOptions,
  type TableOptions,
  type TableError,
  type ErrorCallbacks,
  type ITableAdapter,
} from './lib/adapter/index.js';

// ============================================================================
// Query Manager (for advanced usage)
// ============================================================================

export { QueryManager } from './lib/query/index.js';
export type { QueryManagerOptions, QueryState, QueryFnContext } from './lib/query/index.js';

// ============================================================================
// Core Utilities (for creating custom entity table factories)
// ============================================================================

export {
  createSortingConverters,
  createClientFetchFn,
  createFetchFnFromClient,
  createTableApi,
  extractFieldsFromColumns,
} from './lib/index.js';

export type { TableApi, TableApiConfig, ColumnInfo } from './lib/factory/index.js';

// ============================================================================
// Shared Types
// ============================================================================

export type {
  // Builder types
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  // Field extraction
  ExtractFieldFromColumnDef,
  ExtractFieldsFromColumnDefs,
  // Column types
  ColumnConfig,
  ComputedColumnConfig,
  // State and options
  AdapterState,
  TableAdapterOptionsBase,
  TableAdapterClientModeOptions,
  TableAdapterFetchModeOptions,
  TableAdapterOptions,
  // Generic entity types (for creating new entity adapters)
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
// Pagination & Sorting
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

export type { SortingState, SortingConverters } from './lib/sorting/index.js';
export { SortEnumType, SortDirection } from './lib/sorting/index.js';
