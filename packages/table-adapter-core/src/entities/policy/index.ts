/**
 * @fileoverview Policy Entity Exports
 */

export { createPolicyTable, type PolicyTable } from './factory.js';
export { createInfinitePolicyTable, type InfinitePolicyTable } from './infinite-factory.js';

export type {
  PolicyColumnDef,
  PolicyRowType,
  PolicyExtractFields,
  PolicyTableOptions,
  PolicyFetchFn,
  PolicyFilterInput,
  PolicySearchInput,
  // Re-export SDK types for convenience
  QueryPoliciesResultFilterInput,
  QueryPoliciesResultSearchInput,
} from './types.js';
