/**
 * @fileoverview Adapter Module Exports
 */

export { BaseTableAdapter } from './base-adapter.js';
export { InfiniteTableAdapter } from './infinite-adapter/index.js';
export type {
  AdapterState,
  TableOptions,
  BaseTableAdapterOptions,
  TableError,
  ErrorCallbacks,
  ColumnInfo,
  ITableAdapter,
} from './types.js';
export {
  schemaToColumnDefs,
  extractFieldsFromColumns,
  columnsToTanStackColumnDefs,
  createTableError,
  isRetryable,
} from './utils.js';
