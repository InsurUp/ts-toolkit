/**
 * @fileoverview Generic in-memory entity-table factories.
 *
 * Mirror of `create-entity-table.ts` for resources that have no GraphQL
 * connection: instead of a server fetch, the full list is loaded once and a
 * synthetic `Connection` is produced in memory (filter / search / sort /
 * paginate), then fed to the unchanged `BaseTableAdapter` / `InfiniteTableAdapter`.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import type { DeepFieldKeys } from '@insurup/sdk';
import type { AnyColumnDef, FetchFn } from '../types.js';
import {
  createColumnBuilder,
  createTableApi,
  createInfiniteTableApi,
  type TableApi,
  type TableApiConfig,
} from '../factory/index.js';
import { createSortingConverters } from '../sorting/index.js';
import type { CursorPaginationManager, CursorPaginationOptions } from '../pagination/index.js';
import { createInMemoryFetchFn, type InMemoryQueryOptions } from './fetch.js';
import type {
  InMemoryDataSource,
  InMemoryEntityFactoryConfig,
  InMemoryFilterInput,
  InMemoryLoadAll,
  InMemorySortInput,
  InMemoryTableOptions,
} from './types.js';

/** Resolve the full-list loader from a custom `fetchAll` or an SDK `client`. */
function resolveLoadAll<TEntity>(
  source: InMemoryDataSource<TEntity>,
  loadAllFromClient: (client: DefaultInsurUpClient) => InMemoryLoadAll<TEntity>
): InMemoryLoadAll<TEntity> {
  if ('fetchAll' in source && source.fetchAll) {
    return source.fetchAll;
  }
  if ('client' in source && source.client) {
    return loadAllFromClient(new DefaultInsurUpClient(source.client));
  }
  throw new Error('createInMemoryEntityTable requires either a `client` or a `fetchAll` source.');
}

/** Default `$search` targets: every field referenced by the columns. */
function deriveSearchableFields(columns: readonly AnyColumnDef<string>[]): string[] {
  const fields = new Set<string>();
  for (const column of columns) {
    for (const field of column.fields) {
      fields.add(field);
    }
  }
  return [...fields];
}

/**
 * Wrap a table API so `invalidate()` and forced `refetch()` drop the cached
 * full list (re-pulling from the source); page / sort / filter changes keep
 * using the in-memory cache. Prototype delegation preserves the underlying
 * API's lazy `columns` / `pagination` getters.
 */
function withRawCacheReset<TRow, TFilter, TPagination extends CursorPaginationManager>(
  api: TableApi<TRow, TFilter, TPagination>,
  reset: () => void
): TableApi<TRow, TFilter, TPagination> {
  const wrapped = Object.create(api) as TableApi<TRow, TFilter, TPagination>;
  return Object.assign(wrapped, {
    invalidate: async (): Promise<void> => {
      reset();
      await api.invalidate();
    },
    refetch: async (options?: { force?: boolean }): Promise<void> => {
      if (options?.force) reset();
      await api.refetch(options);
    },
  });
}

/** Shared body of the paginated and infinite in-memory factories. */
function buildInMemoryTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
>(
  options: InMemoryTableOptions<TEntity, TFieldKey, TColumns, TRow>,
  config: InMemoryEntityFactoryConfig<TEntity>,
  infinite: boolean
): TableApi<TRow, InMemoryFilterInput<TEntity>, CursorPaginationManager> {
  const columns = options.columns(createColumnBuilder<TEntity, TFieldKey>());
  const loadAll = resolveLoadAll<TEntity>(options, config.loadAll);
  const searchableFields = config.searchableFields ?? deriveSearchableFields(columns);
  const fetchFn = createInMemoryFetchFn<TEntity>(loadAll, { searchableFields });

  const apiConfig: TableApiConfig<
    TEntity,
    TRow,
    InMemoryQueryOptions<TEntity>,
    InMemorySortInput<string>,
    InMemoryFilterInput<TEntity>,
    CursorPaginationOptions
  > = {
    // The synthetic fetch produces `Connection<TEntity>`; the row type is the
    // selected-field narrowing of the entity, so we widen at this boundary
    // exactly like the GraphQL path does for its per-entity connection types.
    fetchFn: fetchFn as unknown as FetchFn<TRow, InMemoryQueryOptions<TEntity>>,
    buildQueryOptions: (params) => ({
      first: params.first,
      after: params.after ?? null,
      order: params.order ?? null,
      select: params.select,
      filter: params.filter ?? null,
      includeTotalCount: params.includeTotalCount,
    }),
    columns,
    pagination: options.pagination,
    defaultFilter: options.defaultFilter,
    sortingConverters: createSortingConverters<InMemorySortInput<string>>(),
    queryKeyPrefix: infinite ? `${config.queryKeyPrefix}-infinite` : config.queryKeyPrefix,
    staleTime: options.staleTime,
    gcTime: options.gcTime,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSettled: options.onSettled,
    tableOptions: options.tableOptions,
    autoFetch: options.autoFetch,
    keepPreviousData: options.keepPreviousData,
  };

  const api = infinite ? createInfiniteTableApi(apiConfig) : createTableApi(apiConfig);
  return withRawCacheReset(api, fetchFn.reset);
}

/**
 * Create a paginated in-memory table. Used as the body of every per-entity
 * `create*Table` factory for a non-GraphQL list resource.
 */
export function createInMemoryEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
>(
  options: InMemoryTableOptions<TEntity, TFieldKey, TColumns, TRow>,
  config: InMemoryEntityFactoryConfig<TEntity>
): TableApi<TRow, InMemoryFilterInput<TEntity>, CursorPaginationManager> {
  return buildInMemoryTable(options, config, false);
}

/**
 * Create an infinite-scroll in-memory table (rows accumulate across pages),
 * using a `-infinite` query-key suffix.
 */
export function createInfiniteInMemoryEntityTable<
  TEntity,
  TFieldKey extends DeepFieldKeys<TEntity>,
  TColumns extends AnyColumnDef<TFieldKey & string>[],
  TRow,
>(
  options: InMemoryTableOptions<TEntity, TFieldKey, TColumns, TRow>,
  config: InMemoryEntityFactoryConfig<TEntity>
): TableApi<TRow, InMemoryFilterInput<TEntity>, CursorPaginationManager> {
  return buildInMemoryTable(options, config, true);
}
