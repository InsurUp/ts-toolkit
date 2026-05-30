/**
 * @fileoverview In-memory fetch function
 * @description Wraps a full-list loader as a `FetchFn` the `BaseTableAdapter`
 * can call: the list is loaded once, then each call filters / sorts / slices it
 * in memory and returns a synthetic `Connection`. `reset()` drops the cached
 * list so the next call re-loads (wired to `invalidate` / forced `refetch`).
 */

import type {
  Connection,
  GetQueryOptions,
  InsurUpGraphQLResult,
  InsurUpResult,
} from '@insurup/sdk';
import type { FetchFn, FetchRequestOptions } from '../types.js';
import { applyFilter, applySort, sliceToConnection } from './engine.js';
import type { InMemoryFilterInput, InMemoryLoadAll, InMemorySortInput } from './types.js';

const DEFAULT_PAGE_SIZE = 20;

/** Query-options shape the in-memory fetch consumes (field key is irrelevant in memory). */
export type InMemoryQueryOptions<TEntity> = GetQueryOptions<
  string,
  InMemoryFilterInput<TEntity>,
  InMemorySortInput<string>
>;

/** A `FetchFn` that also exposes a `reset()` to drop its cached full list. */
export interface InMemoryFetchFn<TEntity, TQueryOptions> extends FetchFn<TEntity, TQueryOptions> {
  /** Drop the cached full list so the next fetch re-loads from the source. */
  reset: () => void;
}

/**
 * Build an in-memory fetch function from a full-list loader.
 *
 * @param loadAll - Loads the complete collection (called at most once per generation)
 * @param options.searchableFields - Fields whose string values back `$search`
 */
export function createInMemoryFetchFn<TEntity>(
  loadAll: InMemoryLoadAll<TEntity>,
  options: { searchableFields: readonly string[] }
): InMemoryFetchFn<TEntity, InMemoryQueryOptions<TEntity>> {
  let cache: Promise<InsurUpResult<TEntity[]>> | null = null;

  const fetchFn = async (
    vars: InMemoryQueryOptions<TEntity>,
    requestOptions?: FetchRequestOptions
  ): Promise<InsurUpGraphQLResult<Connection<TEntity>>> => {
    if (!cache) {
      cache = loadAll(requestOptions);
    }
    const result = await cache;

    if (!result.isSuccess) {
      // Never cache a failure — allow the next fetch to retry the load.
      cache = null;
      return result;
    }

    const filtered = applyFilter(result.data, vars.filter ?? undefined, options.searchableFields);
    const sorted = applySort(filtered, vars.order ?? undefined);
    const data = sliceToConnection(
      sorted,
      vars.first ?? DEFAULT_PAGE_SIZE,
      vars.after ?? undefined
    );

    return { kind: 'success', isSuccess: true, message: 'Success', data };
  };

  const withReset = fetchFn as InMemoryFetchFn<TEntity, InMemoryQueryOptions<TEntity>>;
  withReset.reset = (): void => {
    cache = null;
  };
  return withReset;
}
