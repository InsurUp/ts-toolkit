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

export { createCustomerTable } from './create-customer-table.svelte.js';
export type { CustomerTableInstance } from './create-customer-table.svelte.js';
export { createInfiniteCustomerTable } from './create-infinite-customer-table.svelte.js';
export type { InfiniteCustomerTableInstance } from './create-infinite-customer-table.svelte.js';

export { createPolicyTable } from './create-policy-table.svelte.js';
export type { PolicyTableInstance } from './create-policy-table.svelte.js';
export { createInfinitePolicyTable } from './create-infinite-policy-table.svelte.js';
export type { InfinitePolicyTableInstance } from './create-infinite-policy-table.svelte.js';

export { createProposalTable } from './create-proposal-table.svelte.js';
export type { ProposalTableInstance } from './create-proposal-table.svelte.js';
export { createInfiniteProposalTable } from './create-infinite-proposal-table.svelte.js';
export type { InfiniteProposalTableInstance } from './create-infinite-proposal-table.svelte.js';

export { createCaseTable } from './create-case-table.svelte.js';
export type { CaseTableInstance } from './create-case-table.svelte.js';
export { createInfiniteCaseTable } from './create-infinite-case-table.svelte.js';
export type { InfiniteCaseTableInstance } from './create-infinite-case-table.svelte.js';

export { createAgentUserTable } from './create-agent-user-table.svelte.js';
export type { AgentUserTableInstance } from './create-agent-user-table.svelte.js';
export { createInfiniteAgentUserTable } from './create-infinite-agent-user-table.svelte.js';
export type { InfiniteAgentUserTableInstance } from './create-infinite-agent-user-table.svelte.js';

export { createPolicyTransferTable } from './create-policy-transfer-table.svelte.js';
export type { PolicyTransferTableInstance } from './create-policy-transfer-table.svelte.js';
export { createInfinitePolicyTransferTable } from './create-infinite-policy-transfer-table.svelte.js';
export type { InfinitePolicyTransferTableInstance } from './create-infinite-policy-transfer-table.svelte.js';

export { createFilePolicyTransferTable } from './create-file-policy-transfer-table.svelte.js';
export type { FilePolicyTransferTableInstance } from './create-file-policy-transfer-table.svelte.js';
export { createInfiniteFilePolicyTransferTable } from './create-infinite-file-policy-transfer-table.svelte.js';
export type { InfiniteFilePolicyTransferTableInstance } from './create-infinite-file-policy-transfer-table.svelte.js';

export { createWebhookDeliveryTable } from './create-webhook-delivery-table.svelte.js';
export type { WebhookDeliveryTableInstance } from './create-webhook-delivery-table.svelte.js';
export { createInfiniteWebhookDeliveryTable } from './create-infinite-webhook-delivery-table.svelte.js';
export type { InfiniteWebhookDeliveryTableInstance } from './create-infinite-webhook-delivery-table.svelte.js';

export type { TableCoreResult } from './internal/create-table-core.svelte.js';

// ============================================================================
// Re-export public surface from core
// ============================================================================

export * from '@insurup/table-adapter-core';
