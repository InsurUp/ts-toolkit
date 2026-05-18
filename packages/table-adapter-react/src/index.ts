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
// Re-export public surface from core
// ============================================================================

export * from '@insurup/table-adapter-core';
