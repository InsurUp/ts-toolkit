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

import type { DefaultInsurUpClient, GetQueryOptions } from '@insurup/sdk';
import type {
  QueryOptionsBuilderArgs,
  FetchRequestOptions,
  AnyColumnDef,
  DeepFieldKeys,
} from '../types.js';
import type { EntityTableOptions, EntityFetchFn } from '../types.js';
import type { PaginationOptions, PaginationManagerFromOptions } from '../pagination/types.js';
import type { TableApi, TableApiConfig } from './types.js';
import { createSortingConverters } from '../sorting/index.js';
import { createColumnBuilder, getFetchFn, createTableApi } from './utils.js';
import { createInfiniteTableApi } from './infinite-table-api.js';

/**
 * Config describing how a specific entity wires to the SDK.
 *
 * @template TQueryOptions - The SDK's per-entity query-options type (e.g. `GetPoliciesOptions<TFields>`)
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
 *
 * Every per-entity `Get*Options<TFields>` in `@insurup/contracts/graphql/*`
 * extends `GetQueryOptions<TFieldKey, TFilter, TSearch, TSort>` from the same
 * file, so we constrain `TQueryOptions` on that upstream interface. The
 * single `as TQueryOptions` cast at the end covers the per-entity branding
 * of `select` (`TFields` rather than wide `string[]`).
 */
function buildEntityQueryOptions<
  TEntity,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TQueryOptions extends GetQueryOptions<string, TFilterInput, TSearchInput, TSortInput>,
>(
  params: QueryOptionsBuilderArgs<TEntity, TSortInput, TFilterInput, TSearchInput>,
  includeTotalCount: boolean
): TQueryOptions {
  const base: GetQueryOptions<string, TFilterInput, TSearchInput, TSortInput> = {
    first: params.first,
    after: params.after,
    order: params.order,
    select: params.select,
    filter: params.filter,
    search: params.search,
  };
  if (includeTotalCount) {
    base.includeTotalCount = params.includeTotalCount;
  }
  return base as TQueryOptions;
}

/**
 * Shared body of `createEntityTable` and `createInfiniteEntityTable`.
 * Builds the columns, fetch function, and `TableApiConfig`, then delegates
 * to the supplied `apiFactory` (paginated or infinite).
 */
function buildEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TQueryOptions extends GetQueryOptions<string, TFilterInput, TSearchInput, TSortInput>,
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
  config: EntityFactoryConfig<TQueryOptions>,
  apiFactory: (
    apiConfig: TableApiConfig<
      TEntity,
      TRow,
      TQueryOptions,
      TSortInput,
      TFilterInput,
      TSearchInput,
      TPaginationOptions
    >
  ) => TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>>,
  queryKeyPrefix: string,
  includeTotalCount: boolean
): TableApi<TRow, TFilterInput, TSearchInput, PaginationManagerFromOptions<TPaginationOptions>> {
  const columnBuilder = createColumnBuilder<TEntity, TFieldKey>();
  const columns = options.columns(columnBuilder);
  const fetchFn = getFetchFn<TRow, TQueryOptions>(options, config.clientMethod);

  return apiFactory({
    fetchFn,
    buildQueryOptions: (params) =>
      buildEntityQueryOptions<TEntity, TSortInput, TFilterInput, TSearchInput, TQueryOptions>(
        params,
        includeTotalCount
      ),
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    defaultSearch: options.defaultSearch,
    sortingConverters: createSortingConverters<TSortInput>(),
    queryKeyPrefix,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    splitTotalCount: includeTotalCount ? options.splitTotalCount : undefined,
    keepPreviousData: options.keepPreviousData,
  });
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
 *   return createEntityTable<...>(options, {
 *     queryKeyPrefix: 'policies',
 *     clientMethod: (c) => (v, o) => c.policies.getPolicies(v, o),
 *   });
 * }
 * ```
 */
export function createEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
  TSortInput,
  TFilterInput,
  TSearchInput,
  TQueryOptions extends GetQueryOptions<string, TFilterInput, TSearchInput, TSortInput>,
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
  return buildEntityTable(options, config, createTableApi, config.queryKeyPrefix, true);
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
  TSortInput,
  TFilterInput,
  TSearchInput,
  TQueryOptions extends GetQueryOptions<string, TFilterInput, TSearchInput, TSortInput>,
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
  return buildEntityTable(
    options,
    config,
    createInfiniteTableApi,
    `${config.queryKeyPrefix}-infinite`,
    false
  );
}
