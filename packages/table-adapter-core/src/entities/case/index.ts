/**
 * @fileoverview Case Entity Exports
 */

export { createCaseTable, type CaseTable } from './factory.js';
export { createInfiniteCaseTable, type InfiniteCaseTable } from './infinite-factory.js';

export type {
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
  CaseFilterInput,
  CaseSearchInput,
  // Re-export SDK types for convenience
  QueryCaseModelFilterInput,
  QueryCaseModelSearchInput,
} from './types.js';
