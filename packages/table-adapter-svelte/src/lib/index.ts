/**
 * @insurup/table-adapter-svelte
 *
 * Svelte bindings for @insurup/table-adapter-core.
 * Provides per-entity creators using Svelte 5 runes for fine-grained reactive state.
 *
 * @packageDocumentation
 */

// ============================================================================
// Svelte-specific exports
// ============================================================================

// Customer
export { createCustomerTable } from './create-customer-table.svelte.js';
export type { CustomerTableInstance } from './create-customer-table.svelte.js';
export { createInfiniteCustomerTable } from './create-infinite-customer-table.svelte.js';
export type { InfiniteCustomerTableInstance } from './create-infinite-customer-table.svelte.js';

// Policy
export { createPolicyTable } from './create-policy-table.svelte.js';
export type { PolicyTableInstance } from './create-policy-table.svelte.js';
export { createInfinitePolicyTable } from './create-infinite-policy-table.svelte.js';
export type { InfinitePolicyTableInstance } from './create-infinite-policy-table.svelte.js';

// Proposal
export { createProposalTable } from './create-proposal-table.svelte.js';
export type { ProposalTableInstance } from './create-proposal-table.svelte.js';
export { createInfiniteProposalTable } from './create-infinite-proposal-table.svelte.js';
export type { InfiniteProposalTableInstance } from './create-infinite-proposal-table.svelte.js';

// Case
export { createCaseTable } from './create-case-table.svelte.js';
export type { CaseTableInstance } from './create-case-table.svelte.js';
export { createInfiniteCaseTable } from './create-infinite-case-table.svelte.js';
export type { InfiniteCaseTableInstance } from './create-infinite-case-table.svelte.js';

// AgentUser
export { createAgentUserTable } from './create-agent-user-table.svelte.js';
export type { AgentUserTableInstance } from './create-agent-user-table.svelte.js';
export { createInfiniteAgentUserTable } from './create-infinite-agent-user-table.svelte.js';
export type { InfiniteAgentUserTableInstance } from './create-infinite-agent-user-table.svelte.js';

// PolicyTransfer
export { createPolicyTransferTable } from './create-policy-transfer-table.svelte.js';
export type { PolicyTransferTableInstance } from './create-policy-transfer-table.svelte.js';
export { createInfinitePolicyTransferTable } from './create-infinite-policy-transfer-table.svelte.js';
export type { InfinitePolicyTransferTableInstance } from './create-infinite-policy-transfer-table.svelte.js';

// FilePolicyTransfer
export { createFilePolicyTransferTable } from './create-file-policy-transfer-table.svelte.js';
export type { FilePolicyTransferTableInstance } from './create-file-policy-transfer-table.svelte.js';
export { createInfiniteFilePolicyTransferTable } from './create-infinite-file-policy-transfer-table.svelte.js';
export type { InfiniteFilePolicyTransferTableInstance } from './create-infinite-file-policy-transfer-table.svelte.js';

// WebhookDelivery
export { createWebhookDeliveryTable } from './create-webhook-delivery-table.svelte.js';
export type { WebhookDeliveryTableInstance } from './create-webhook-delivery-table.svelte.js';
export { createInfiniteWebhookDeliveryTable } from './create-infinite-webhook-delivery-table.svelte.js';
export type { InfiniteWebhookDeliveryTableInstance } from './create-infinite-webhook-delivery-table.svelte.js';

export type { TableCoreResult } from './internal/create-table-core.svelte.js';

// ============================================================================
// Re-export everything from core for convenience
// ============================================================================

// Core factories (aliased to *Core to avoid collisions with Svelte wrappers)
export { createCustomerTable as createCustomerTableCore } from '@insurup/table-adapter-core';
export type { CustomerTable } from '@insurup/table-adapter-core';
export { createInfiniteCustomerTable as createInfiniteCustomerTableCore } from '@insurup/table-adapter-core';
export type { InfiniteCustomerTable } from '@insurup/table-adapter-core';

export { createPolicyTable as createPolicyTableCore } from '@insurup/table-adapter-core';
export type { PolicyTable } from '@insurup/table-adapter-core';
export { createInfinitePolicyTable as createInfinitePolicyTableCore } from '@insurup/table-adapter-core';
export type { InfinitePolicyTable } from '@insurup/table-adapter-core';

export { createProposalTable as createProposalTableCore } from '@insurup/table-adapter-core';
export type { ProposalTable } from '@insurup/table-adapter-core';
export { createInfiniteProposalTable as createInfiniteProposalTableCore } from '@insurup/table-adapter-core';
export type { InfiniteProposalTable } from '@insurup/table-adapter-core';

export { createCaseTable as createCaseTableCore } from '@insurup/table-adapter-core';
export type { CaseTable } from '@insurup/table-adapter-core';
export { createInfiniteCaseTable as createInfiniteCaseTableCore } from '@insurup/table-adapter-core';
export type { InfiniteCaseTable } from '@insurup/table-adapter-core';

export { createAgentUserTable as createAgentUserTableCore } from '@insurup/table-adapter-core';
export type { AgentUserTable } from '@insurup/table-adapter-core';
export { createInfiniteAgentUserTable as createInfiniteAgentUserTableCore } from '@insurup/table-adapter-core';
export type { InfiniteAgentUserTable } from '@insurup/table-adapter-core';

export { createPolicyTransferTable as createPolicyTransferTableCore } from '@insurup/table-adapter-core';
export type { PolicyTransferTable } from '@insurup/table-adapter-core';
export { createInfinitePolicyTransferTable as createInfinitePolicyTransferTableCore } from '@insurup/table-adapter-core';
export type { InfinitePolicyTransferTable } from '@insurup/table-adapter-core';

export { createFilePolicyTransferTable as createFilePolicyTransferTableCore } from '@insurup/table-adapter-core';
export type { FilePolicyTransferTable } from '@insurup/table-adapter-core';
export { createInfiniteFilePolicyTransferTable as createInfiniteFilePolicyTransferTableCore } from '@insurup/table-adapter-core';
export type { InfiniteFilePolicyTransferTable } from '@insurup/table-adapter-core';

export { createWebhookDeliveryTable as createWebhookDeliveryTableCore } from '@insurup/table-adapter-core';
export type { WebhookDeliveryTable } from '@insurup/table-adapter-core';
export { createInfiniteWebhookDeliveryTable as createInfiniteWebhookDeliveryTableCore } from '@insurup/table-adapter-core';
export type { InfiniteWebhookDeliveryTable } from '@insurup/table-adapter-core';

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
  ColumnInfo,
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
