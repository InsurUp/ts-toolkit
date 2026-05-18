/**
 * @insurup/table-adapter-vue
 *
 * Vue bindings for @insurup/table-adapter-core.
 * Provides per-entity composables with automatic lifecycle management.
 *
 * @packageDocumentation
 */

// ============================================================================
// Vue-specific composables
// ============================================================================

export { useCustomerTable, type UseCustomerTableResult } from './use-customer-table.js';
export { usePolicyTable, type UsePolicyTableResult } from './use-policy-table.js';
export { useProposalTable, type UseProposalTableResult } from './use-proposal-table.js';
export { useCaseTable, type UseCaseTableResult } from './use-case-table.js';
export { useAgentUserTable, type UseAgentUserTableResult } from './use-agent-user-table.js';
export {
  usePolicyTransferTable,
  type UsePolicyTransferTableResult,
} from './use-policy-transfer-table.js';
export {
  useFilePolicyTransferTable,
  type UseFilePolicyTransferTableResult,
} from './use-file-policy-transfer-table.js';
export {
  useWebhookDeliveryTable,
  type UseWebhookDeliveryTableResult,
} from './use-webhook-delivery-table.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factories
export { createCustomerTable, type CustomerTable } from '@insurup/table-adapter-core';
export { createPolicyTable, type PolicyTable } from '@insurup/table-adapter-core';
export { createProposalTable, type ProposalTable } from '@insurup/table-adapter-core';
export { createCaseTable, type CaseTable } from '@insurup/table-adapter-core';
export { createAgentUserTable, type AgentUserTable } from '@insurup/table-adapter-core';
export { createPolicyTransferTable, type PolicyTransferTable } from '@insurup/table-adapter-core';
export {
  createFilePolicyTransferTable,
  type FilePolicyTransferTable,
} from '@insurup/table-adapter-core';
export { createWebhookDeliveryTable, type WebhookDeliveryTable } from '@insurup/table-adapter-core';

// Entity types
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
  CustomerFilterInput,
  CustomerSearchInput,
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyTableOptions,
  PolicyFetchFn,
  PolicyFilterInput,
  PolicySearchInput,
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
  ProposalFilterInput,
  ProposalSearchInput,
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
  CaseFilterInput,
  CaseSearchInput,
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserTableOptions,
  AgentUserFetchFn,
  AgentUserFilterInput,
  AgentUserSearchInput,
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferTableOptions,
  PolicyTransferFetchFn,
  PolicyTransferFilterInput,
  PolicyTransferSearchInput,
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferTableOptions,
  FilePolicyTransferFetchFn,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryTableOptions,
  WebhookDeliveryFetchFn,
  WebhookDeliveryFilterInput,
  WebhookDeliverySearchInput,
} from '@insurup/table-adapter-core';

// Adapter types
export type {
  AdapterState,
  TableOptions,
  TableError,
  ErrorCallbacks,
} from '@insurup/table-adapter-core';

// Column builder types
export type {
  ColumnBuilder,
  ColumnDefinitionFn,
  AnyColumnDef,
  FieldColumnDef,
  ComputedColumnDef,
  ColumnDef,
  ColumnConfig,
  ComputedColumnConfig,
} from '@insurup/table-adapter-core';

// SDK re-exports
export type {
  GetCustomersOptions,
  CustomerFieldKey,
  QueryCustomerModel,
  GetPoliciesOptions,
  PolicyFieldKey,
  QueryPoliciesResult,
  GetProposalsOptions,
  ProposalFieldKey,
  QueryProposalsResult,
  GetCasesOptions,
  CaseFieldKey,
  QueryCaseModel,
  GetAgentUsersOptions,
  AgentUserFieldKey,
  QueryAgentUserResult,
  GetPolicyTransfersOptions,
  PolicyTransferFieldKey,
  QueryPolicyTransfersResult,
  GetFilePolicyTransfersOptions,
  FilePolicyTransferFieldKey,
  QueryFilePolicyTransfersResult,
  GetWebhookDeliveriesOptions,
  WebhookDeliveryFieldKey,
  QueryWebhookDeliveryResult,
} from '@insurup/table-adapter-core';
