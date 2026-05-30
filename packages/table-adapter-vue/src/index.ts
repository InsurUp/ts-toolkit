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
export {
  useInfiniteCustomerTable,
  type UseInfiniteCustomerTableResult,
} from './use-infinite-customer-table.js';

export { usePolicyTable, type UsePolicyTableResult } from './use-policy-table.js';
export {
  useInfinitePolicyTable,
  type UseInfinitePolicyTableResult,
} from './use-infinite-policy-table.js';

export { useProposalTable, type UseProposalTableResult } from './use-proposal-table.js';
export {
  useInfiniteProposalTable,
  type UseInfiniteProposalTableResult,
} from './use-infinite-proposal-table.js';

export { useCaseTable, type UseCaseTableResult } from './use-case-table.js';
export {
  useInfiniteCaseTable,
  type UseInfiniteCaseTableResult,
} from './use-infinite-case-table.js';

export { useAgentUserTable, type UseAgentUserTableResult } from './use-agent-user-table.js';
export {
  useInfiniteAgentUserTable,
  type UseInfiniteAgentUserTableResult,
} from './use-infinite-agent-user-table.js';

export {
  usePolicyTransferTable,
  type UsePolicyTransferTableResult,
} from './use-policy-transfer-table.js';
export {
  useInfinitePolicyTransferTable,
  type UseInfinitePolicyTransferTableResult,
} from './use-infinite-policy-transfer-table.js';

export {
  useFilePolicyTransferTable,
  type UseFilePolicyTransferTableResult,
} from './use-file-policy-transfer-table.js';
export {
  useInfiniteFilePolicyTransferTable,
  type UseInfiniteFilePolicyTransferTableResult,
} from './use-infinite-file-policy-transfer-table.js';

export {
  useWebhookDeliveryTable,
  type UseWebhookDeliveryTableResult,
} from './use-webhook-delivery-table.js';
export {
  useInfiniteWebhookDeliveryTable,
  type UseInfiniteWebhookDeliveryTableResult,
} from './use-infinite-webhook-delivery-table.js';

// In-memory entity composables (REST list resources)

export { useRoleTable, type UseRoleTableResult } from './use-role-table.js';
export {
  useInfiniteRoleTable,
  type UseInfiniteRoleTableResult,
} from './use-infinite-role-table.js';

export { useAgentBranchTable, type UseAgentBranchTableResult } from './use-agent-branch-table.js';
export {
  useInfiniteAgentBranchTable,
  type UseInfiniteAgentBranchTableResult,
} from './use-infinite-agent-branch-table.js';

export {
  useCoverageGroupTable,
  type UseCoverageGroupTableResult,
} from './use-coverage-group-table.js';
export {
  useInfiniteCoverageGroupTable,
  type UseInfiniteCoverageGroupTableResult,
} from './use-infinite-coverage-group-table.js';

export {
  useAgentInsuranceCompanyTable,
  type UseAgentInsuranceCompanyTableResult,
} from './use-agent-insurance-company-table.js';
export {
  useInfiniteAgentInsuranceCompanyTable,
  type UseInfiniteAgentInsuranceCompanyTableResult,
} from './use-infinite-agent-insurance-company-table.js';

export { useOAuthClientTable, type UseOAuthClientTableResult } from './use-oauth-client-table.js';
export {
  useInfiniteOAuthClientTable,
  type UseInfiniteOAuthClientTableResult,
} from './use-infinite-oauth-client-table.js';

export {
  useAgentTemplateTable,
  type UseAgentTemplateTableResult,
} from './use-agent-template-table.js';
export {
  useInfiniteAgentTemplateTable,
  type UseInfiniteAgentTemplateTableResult,
} from './use-infinite-agent-template-table.js';

// ============================================================================
// Re-export public surface from core
// ============================================================================

export * from '@insurup/table-adapter-core';
