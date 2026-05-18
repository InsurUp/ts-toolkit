/**
 * @fileoverview File Policy Transfer Entity Exports
 */

export { createFilePolicyTransferTable, type FilePolicyTransferTable } from './factory.js';
export {
  createInfiniteFilePolicyTransferTable,
  type InfiniteFilePolicyTransferTable,
} from './infinite-factory.js';

export type {
  FilePolicyTransferColumnDef,
  FilePolicyTransferRowType,
  FilePolicyTransferExtractFields,
  FilePolicyTransferTableOptions,
  FilePolicyTransferFetchFn,
  FilePolicyTransferFilterInput,
  FilePolicyTransferSearchInput,
  // Re-export SDK types for convenience
  QueryFilePolicyTransfersResultFilterInput,
  QueryFilePolicyTransfersResultSearchInput,
} from './types.js';
