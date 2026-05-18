/**
 * @fileoverview Factory Module Exports
 */

export {
  createClientFetchFn,
  createFetchFnFromClient,
  getFetchFn,
  createColumnBuilder,
  createTableApi,
} from './utils.js';

export { createInfiniteTableApi } from './infinite-table-api.js';
export { createTableApiFromAdapter } from './create-table-api-from-adapter.js';
export {
  createEntityTable,
  createInfiniteEntityTable,
  type EntityFactoryConfig,
} from './create-entity-table.js';

export type { TableApiConfig, TableApi, ColumnInfo } from './types.js';
