/**
 * @fileoverview Entities Module Exports
 * @description Entity-specific table adapters
 */

// Customer entity
export { createCustomerTable, type CustomerTable } from './customer/index.js';
export type {
  CustomerColumnDef,
  CustomerRowType,
  CustomerExtractFields,
  CustomerTableOptions,
  CustomerFetchFn,
} from './customer/index.js';

// Policy entity
export { createPolicyTable, type PolicyTable } from './policy/index.js';
export type {
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyTableOptions,
  PolicyFetchFn,
} from './policy/index.js';

// Proposal entity
export { createProposalTable, type ProposalTable } from './proposal/index.js';
export type {
  ProposalColumnDef,
  ProposalRowType,
  ProposalExtractFields,
  ProposalTableOptions,
  ProposalFetchFn,
} from './proposal/index.js';

// Case entity
export { createCaseTable, type CaseTable } from './case/index.js';
export type {
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
} from './case/index.js';

// AgentUser entity
export { createAgentUserTable, type AgentUserTable } from './agent-user/index.js';
export type {
  AgentUserColumnDef,
  AgentUserRowType,
  AgentUserExtractFields,
  AgentUserTableOptions,
  AgentUserFetchFn,
} from './agent-user/index.js';

// PolicyTransfer entity
export { createPolicyTransferTable, type PolicyTransferTable } from './policy-transfer/index.js';
export type {
  PolicyTransferColumnDef,
  PolicyTransferRowType,
  PolicyTransferExtractFields,
  PolicyTransferTableOptions,
  PolicyTransferFetchFn,
} from './policy-transfer/index.js';

// FilePolicyTransfer entity
export {
  createFilePolicyTransferTable,
  type FilePolicyTransferTable,
} from './file-policy-transfer/index.js';
export type {
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferTableOptions,
  FilePolicyTransferFetchFn,
} from './file-policy-transfer/index.js';

// WebhookDelivery entity
export { createWebhookDeliveryTable, type WebhookDeliveryTable } from './webhook-delivery/index.js';
export type {
  WebhookDeliveryColumnDef,
  WebhookDeliveryRowType,
  WebhookDeliveryExtractFields,
  WebhookDeliveryTableOptions,
  WebhookDeliveryFetchFn,
} from './webhook-delivery/index.js';
