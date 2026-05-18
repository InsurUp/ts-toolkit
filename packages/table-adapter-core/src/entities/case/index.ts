/**
 * @fileoverview Case Entity Exports
 */

export {
  createCaseTable,
  createInfiniteCaseTable,
  type CaseTable,
  type InfiniteCaseTable,
} from './factory.js';

export type {
  CaseColumnDef,
  CaseRowType,
  CaseExtractFields,
  CaseTableOptions,
  CaseFetchFn,
  CaseFilterInput,
  CaseSearchInput,
} from './types.js';
