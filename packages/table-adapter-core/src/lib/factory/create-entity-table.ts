/**
 * @fileoverview Generic entity-table factories.
 *
 * Every per-entity factory (`createCustomerTable`, `createPolicyTable`, …)
 * collapses into a thin call to `createEntityTable` or `createInfiniteEntityTable`.
 * The varying parts are exactly:
 *   - the SDK client method (e.g. `client.policies.getPolicies`)
 *   - the queryKey prefix (`'policies'`)
 *   - the entity-specific generic types
 *
 * The fixed parts — column builder, query-options passthrough, sorting
 * converters, error pipeline — live here, once.
 */

import type { DefaultInsurUpClient } from '@insurup/sdk';
import type {
  QueryOptionsBuilderArgs,
  FetchRequestOptions,
  AnyColumnDef,
  DeepFieldKeys,
} from '../types.js';
import type { EntityTableOptions, EntityFetchFn } from '../types.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/types.js';
import type { TableApi } from './types.js';
import { createSortingConverters } from '../sorting/index.js';
import { createColumnBuilder, getFetchFn, createTableApi } from './utils.js';
import { createInfiniteTableApi } from './infinite-table-api.js';

/**
 * Config describing how a specific entity wires to the SDK.
 *
 * @template TQueryOptions - The SDK's per-entity query-options type (e.g. `GetPoliciesOptions<TFields>`)
 * @template TRow - The row type with selected fields
 */
export interface EntityFactoryConfig<TQueryOptions> {
  /** Query key prefix for cache isolation (e.g. `'policies'`). Will be paired with `-infinite` for infinite variants. */
  queryKeyPrefix: string;
  /**
   * Resolves the SDK client method that fetches this entity's connection.
   * Return type is widened to `Promise<unknown>` so SDK's per-entity
   * `*Connection` types (structurally compatible with `Connection<TRow>`)
   * flow through without a cast at the caller's site. The narrowing happens
   * once inside `getFetchFn`.
   */
  clientMethod: (
    client: DefaultInsurUpClient
  ) => (vars: TQueryOptions, requestOptions?: FetchRequestOptions) => Promise<unknown>;
}

/**
 * Build the standard query-options object passed to every SDK list method.
 * The shape is uniform across entities; only the narrow return type varies,
 * which is satisfied by the generic `TQueryOptions`.
 *
 * The `as unknown as TQueryOptions` cast localises the narrowing-by-construction
 * gap to this single site — previously duplicated across every entity factory.
 */
function buildEntityQueryOptions<TEntity, TSortInput, TFilterInput, TSearchInput, TQueryOptions>(
  params: QueryOptionsBuilderArgs<TEntity, TSortInput, TFilterInput, TSearchInput>,
  includeTotalCount: boolean
): TQueryOptions {
  const result: Record<string, unknown> = {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select,
    filter: params.filter,
    search: params.search,
  };
  if (includeTotalCount) {
    result.includeTotalCount = params.includeTotalCount;
  }
  return result as unknown as TQueryOptions;
}

/**
 * Create a paginated entity table.
 *
 * Used as the body of every per-entity `create*Table` factory.
 *
 * @example
 * ```ts
 * export function createPolicyTable<const TC extends PolicyColumnDef[]>(
 *   options: PolicyTableOptions<TC>
 * ): PolicyTable<TC> {
 *   return createEntityTable<
 *     QueryPoliciesResult, PolicyFieldKey, TC,
 *     PolicyRowType<TC>, GetPoliciesOptions<PolicyExtractFields<TC>[]>,
 *     QueryPoliciesResultSortInput, PolicyFilterInput, PolicySearchInput,
 *     CursorPaginationOptions
 *   >(options, {
 *     queryKeyPrefix: 'policies',
 *     clientMethod: (c) => (v, o) => c.policies.getPolicies(v, o),
 *   }) as PolicyTable<TC>;
 * }
 * ```
 */
export function createEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
>(
  options: EntityTableOptions<
    TEntity,
    TFieldKey,
    TColumns,
    TRow,
    EntityFetchFn<TRow, TQueryOptions>,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >,
  config: EntityFactoryConfig<TQueryOptions>
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  const columnBuilder = createColumnBuilder<TEntity, TFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getFetchFn<TRow, TQueryOptions>(options, config.clientMethod);

  return createTableApi<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: (params) =>
      buildEntityQueryOptions<TEntity, TSortInput, TFilterInput, TSearchInput, TQueryOptions>(
        params,
        true
      ),
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: createSortingConverters<TSortInput>(),
    queryKeyPrefix: config.queryKeyPrefix,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: options.splitTotalCount,
    keepPreviousData: options.keepPreviousData,
  });
}

/**
 * Create an infinite-scroll entity table.
 *
 * Same as `createEntityTable` but instantiates an `InfiniteTableAdapter`
 * (rows accumulate across page fetches) and uses a `-infinite` query-key suffix.
 */
export function createInfiniteEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TQueryOptions,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TPaginationOptions extends PaginationOptions,
>(
  options: EntityTableOptions<
    TEntity,
    TFieldKey,
    TColumns,
    TRow,
    EntityFetchFn<TRow, TQueryOptions>,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >,
  config: EntityFactoryConfig<TQueryOptions>
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  const columnBuilder = createColumnBuilder<TEntity, TFieldKey>();
  const columns = options.columns(columnBuilder);

  const fetchFn = getFetchFn<TRow, TQueryOptions>(options, config.clientMethod);

  return createInfiniteTableApi<
    TEntity,
    TRow,
    TQueryOptions,
    TSortInput,
    TFilterInput,
    TSearchInput,
    TPaginationOptions
  >({
    fetchFn,
    buildQueryOptions: (params) =>
      buildEntityQueryOptions<TEntity, TSortInput, TFilterInput, TSearchInput, TQueryOptions>(
        params,
        false
      ),
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: createSortingConverters<TSortInput>(),
    queryKeyPrefix: `${config.queryKeyPrefix}-infinite`,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  });
}
