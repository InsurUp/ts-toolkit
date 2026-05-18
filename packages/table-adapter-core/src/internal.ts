/**
 * @insurup/table-adapter-core/internal
 *
 * Advanced primitives for library extensions and custom entity factories.
 * Not covered by the main package's semver contract — APIs may change without
 * a major version bump.
 *
 * Import this entry only if you are:
 *   - Building your own per-entity table factory (use `createEntityTable`)
 *   - Wrapping an alternative adapter (use `createTableApiFromAdapter`)
 *   - Working below the `TableApi` shape directly (use `BaseTableAdapter`
 *     or `InfiniteTableAdapter`)
 *
 * For consumer-facing imports, use `@insurup/table-adapter-core` instead.
 */

// ============================================================================
// Adapter classes + interface
// ============================================================================

export {
  BaseTableAdapter,
  InfiniteTableAdapter,
  type BaseTableAdapterOptions,
  type ITableAdapter,
} from './lib/adapter/index.js';

// ============================================================================
// Query manager
// ============================================================================

export { QueryManager } from './lib/query/index.js';
export type { QueryManagerOptions, QueryState, QueryFnContext } from './lib/query/index.js';

// ============================================================================
// Generic factories (for writing your own per-entity factory)
// ============================================================================

export {
  createTableApi,
  createInfiniteTableApi,
  createTableApiFromAdapter,
  createEntityTable,
  createInfiniteEntityTable,
  type TableApiConfig,
  type EntityFactoryConfig,
} from './lib/factory/index.js';
export type { BaseEntityQueryOptions } from './lib/factory/create-entity-table.js';
