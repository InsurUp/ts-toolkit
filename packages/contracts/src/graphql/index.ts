/**
 * @fileoverview GraphQL Contract Types Index
 * @description Re-exports all GraphQL-related types
 */

export * from "./common.js";
export * from "./customers.js";
export * from "./policies.js";
export * from "./proposals.js";
export * from "./cases.js";
export * from "./agentUsers.js";
export * from "./policyTransfers.js";
export * from "./filePolicyTransfers.js";
export * from "./webhookDeliveries.js";

// Generated meta (auto-generated, gitignored source, included in dist)
export { QueryCustomerModelMeta, QueryCustomerConsentModelMeta } from "./customers.meta.js";
export { QueryCaseModelMeta } from "./cases.meta.js";
export { QueryPoliciesResultMeta } from "./policies.meta.js";
export { QueryProposalsResultMeta } from "./proposals.meta.js";
export { QueryAgentUserResultMeta } from "./agentUsers.meta.js";
export { QueryWebhookDeliveryResultMeta } from "./webhookDeliveries.meta.js";
export { QueryPolicyTransfersResultMeta } from "./policyTransfers.meta.js";
export { QueryFilePolicyTransfersResultMeta } from "./filePolicyTransfers.meta.js";

// Registry & lookup
export { getModelMeta } from "./registry.meta.js";
export type { ModelName } from "./registry.meta.js";
