/**
 * @fileoverview In-memory table types
 * @description Types for tables backed by a plain REST list endpoint. Filtering,
 * search, sorting and pagination run in memory over a single `getAll()` fetch,
 * so these replace the SDK-provided `Query*UnifiedFilterInput` / `*SortInput`
 * types used by the GraphQL-backed entities.
 */

import type {
  SortEnumType,
  InsurUpClientOptions,
  InsurUpResult,
  DefaultInsurUpClient,
  DeepFieldKeys,
} from '@insurup/sdk';
import type { AnyColumnDef, FetchRequestOptions, TableAdapterOptionsBase } from '../types.js';
import type { CursorPaginationOptions } from '../pagination/types.js';

/**
 * Per-field predicate operators, all evaluated in memory.
 * Omitted operators are ignored; multiple operators on one field are AND-ed.
 *
 * @template V - The field value type
 */
export interface FieldPredicate<V> {
  /** Strict equality (`===`, with Date-aware comparison). */
  eq?: V;
  /** Strict inequality. */
  ne?: V;
  /** Membership — the value equals one of the candidates. */
  in?: readonly V[];
  /** Case-insensitive substring match (string fields only). */
  contains?: string;
  /** Greater than (numbers, dates / ISO date strings, or strings). */
  gt?: V;
  /** Greater than or equal. */
  gte?: V;
  /** Less than. */
  lt?: V;
  /** Less than or equal. */
  lte?: V;
}

/**
 * Unified in-memory filter input: an optional global `$search` plus optional
 * per-field predicates. All present conditions are AND-ed.
 *
 * @template TEntity - The full row entity type
 */
export type InMemoryFilterInput<TEntity> = {
  /** Case-insensitive substring matched across the searchable (string) fields. */
  $search?: string;
} & {
  [K in keyof TEntity]?: FieldPredicate<NonNullable<TEntity[K]>>;
};

/**
 * Sort input shape produced by `createSortingConverters` (`{ field: 'ASC' | 'DESC' }`).
 * Kept internal to the in-memory pipeline — it is not part of the public table API.
 *
 * @template TFieldKey - The entity's field key union
 */
export type InMemorySortInput<TFieldKey extends string> = Partial<Record<TFieldKey, SortEnumType>>;

/**
 * Loads the full collection for an entity from the SDK (or a custom source).
 *
 * @template TEntity - The full row entity type
 */
export type InMemoryLoadAll<TEntity> = (
  requestOptions?: FetchRequestOptions
) => Promise<InsurUpResult<TEntity[]>>;

/**
 * Describes how a specific in-memory entity wires to the SDK.
 *
 * @template TEntity - The full row entity type
 */
export interface InMemoryEntityFactoryConfig<TEntity> {
  /** Query key prefix for cache isolation (e.g. `'roles'`). */
  queryKeyPrefix: string;
  /** Resolves the SDK list method that loads the full collection. */
  loadAll: (client: DefaultInsurUpClient) => InMemoryLoadAll<TEntity>;
  /**
   * Field keys whose string values participate in `$search`. Defaults to the
   * fields referenced by the table's columns (non-string values never match).
   */
  searchableFields?: readonly string[];
}

/**
 * Data source for an in-memory table: SDK client config, or a custom loader
 * returning the full list (e.g. wrapping an existing client instance).
 *
 * @template TEntity - The full row entity type
 */
export type InMemoryDataSource<TEntity> =
  | { client: InsurUpClientOptions; fetchAll?: never }
  | { fetchAll: InMemoryLoadAll<TEntity>; client?: never };

/**
 * Options for the in-memory entity table factories.
 *
 * Same shape as the GraphQL entity options (columns/pagination/defaultFilter/…)
 * but the data source is a list loader (`client` or `fetchAll`) instead of a
 * connection fetch, and pagination is always cursor-style.
 *
 * @template TEntity - The full row entity type
 * @template TFieldKey - The entity's field key union
 * @template TColumns - The column definitions array (inferred)
 * @template TRow - The row type narrowed to the selected fields
 */
export type InMemoryTableOptions<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
> = TableAdapterOptionsBase<
  TEntity,
  TFieldKey,
  TColumns,
  TRow,
  InMemoryFilterInput<TEntity>,
  CursorPaginationOptions
> &
  InMemoryDataSource<TEntity>;
