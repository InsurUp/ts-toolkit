/**
 * @fileoverview In-memory module exports
 */

export { createInMemoryEntityTable, createInfiniteInMemoryEntityTable } from './factory.js';
export { createInMemoryFetchFn, type InMemoryFetchFn, type InMemoryQueryOptions } from './fetch.js';
export { applyFilter, applySort, sliceToConnection, getByPath } from './engine.js';
export type {
  FieldPredicate,
  InMemoryFilterInput,
  InMemorySortInput,
  InMemoryTableOptions,
  InMemoryEntityFactoryConfig,
  InMemoryDataSource,
  InMemoryLoadAll,
} from './types.js';
