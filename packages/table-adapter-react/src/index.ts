/**
 * @insurup/table-adapter-react
 *
 * React bindings for @insurup/table-adapter-core.
 * Provides per-entity hooks with automatic lifecycle management.
 *
 * @packageDocumentation
 */

// ============================================================================
// React-specific hooks
// ============================================================================

// Customer
export { useCustomerTable, type UseCustomerTableResult } from './use-customer-table.js';
export {
  useInfiniteCustomerTable,
  type UseInfiniteCustomerTableResult,
} from './use-infinite-customer-table.js';

// Policy
export { usePolicyTable, type UsePolicyTableResult } from './use-policy-table.js';
export {
  useInfinitePolicyTable,
  type UseInfinitePolicyTableResult,
} from './use-infinite-policy-table.js';

// Proposal
export { useProposalTable, type UseProposalTableResult } from './use-proposal-table.js';
export {
  useInfiniteProposalTable,
  type UseInfiniteProposalTableResult,
} from './use-infinite-proposal-table.js';

// Case
export { useCaseTable, type UseCaseTableResult } from './use-case-table.js';
export {
  useInfiniteCaseTable,
  type UseInfiniteCaseTableResult,
} from './use-infinite-case-table.js';

// AgentUser
export { useAgentUserTable, type UseAgentUserTableResult } from './use-agent-user-table.js';
export {
  useInfiniteAgentUserTable,
  type UseInfiniteAgentUserTableResult,
} from './use-infinite-agent-user-table.js';

// PolicyTransfer
export {
  usePolicyTransferTable,
  type UsePolicyTransferTableResult,
} from './use-policy-transfer-table.js';
export {
  useInfinitePolicyTransferTable,
  type UseInfinitePolicyTransferTableResult,
} from './use-infinite-policy-transfer-table.js';

// FilePolicyTransfer
export {
  useFilePolicyTransferTable,
  type UseFilePolicyTransferTableResult,
} from './use-file-policy-transfer-table.js';
export {
  useInfiniteFilePolicyTransferTable,
  type UseInfiniteFilePolicyTransferTableResult,
} from './use-infinite-file-policy-transfer-table.js';

// WebhookDelivery
export {
  useWebhookDeliveryTable,
  type UseWebhookDeliveryTableResult,
} from './use-webhook-delivery-table.js';
export {
  useInfiniteWebhookDeliveryTable,
  type UseInfiniteWebhookDeliveryTableResult,
} from './use-infinite-webhook-delivery-table.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factories
export { createCustomerTable, type CustomerTable } from '@insurup/table-adapter-core';
export {
  createInfiniteCustomerTable,
  type InfiniteCustomerTable,
} from '@insurup/table-adapter-core';
export { createPolicyTable, type PolicyTable } from '@insurup/table-adapter-core';
export { createInfinitePolicyTable, type InfinitePolicyTable } from '@insurup/table-adapter-core';
export { createProposalTable, type ProposalTable } from '@insurup/table-adapter-core';
export {
  createInfiniteProposalTable,
  type InfiniteProposalTable,
} from '@insurup/table-adapter-core';
export { createCaseTable, type CaseTable } from '@insurup/table-adapter-core';
export { createInfiniteCaseTable, type InfiniteCaseTable } from '@insurup/table-adapter-core';
export { createAgentUserTable, type AgentUserTable } from '@insurup/table-adapter-core';
export {
  createInfiniteAgentUserTable,
  type InfiniteAgentUserTable,
} from '@insurup/table-adapter-core';
export { createPolicyTransferTable, type PolicyTransferTable } from '@insurup/table-adapter-core';
export {
  createInfinitePolicyTransferTable,
  type InfinitePolicyTransferTable,
} from '@insurup/table-adapter-core';
export {
  createFilePolicyTransferTable,
  type FilePolicyTransferTable,
} from '@insurup/table-adapter-core';
export {
  createInfiniteFilePolicyTransferTable,
  type InfiniteFilePolicyTransferTable,
} from '@insurup/table-adapter-core';
export { createWebhookDeliveryTable, type WebhookDeliveryTable } from '@insurup/table-adapter-core';
export {
  createInfiniteWebhookDeliveryTable,
  type InfiniteWebhookDeliveryTable,
} from '@insurup/table-adapter-core';

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
