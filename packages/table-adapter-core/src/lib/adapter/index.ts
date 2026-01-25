/**
 * @fileoverview Adapter Module Exports
 */

export { BaseTableAdapter } from './base-adapter.js';
export type {
  AdapterState,
  TableOptions,
  BaseTableAdapterOptions,
  TableError,
  ErrorCallbacks,
} from './types.js';
export {
  schemaToInternalColumns,
  extractFieldsFromInternalColumns,
  internalColumnsToColumnDefs,
  createTableError,
  isRetryable,
} from './utils.js';
