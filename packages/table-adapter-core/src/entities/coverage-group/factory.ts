/**
 * @fileoverview Coverage Group Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `coverage.getAllCoverageGroups` SDK call.
 */

import type {
  CoverageGroupEntity,
  CoverageGroupFieldKey,
  CoverageGroupColumnDef,
  CoverageGroupRowType,
  CoverageGroupTableOptions,
  CoverageGroupFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const coverageGroupConfig: InMemoryEntityFactoryConfig<CoverageGroupEntity> = {
  queryKeyPrefix: 'coverage-groups',
  loadAll: (client) => (requestOptions) => client.coverage.getAllCoverageGroups(requestOptions),
};

export function createCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  options: CoverageGroupTableOptions<TColumns>
): CoverageGroupTable<TColumns> {
  return createInMemoryEntityTable<
    CoverageGroupEntity,
    CoverageGroupFieldKey,
    TColumns,
    CoverageGroupRowType<TColumns>
  >(options, coverageGroupConfig);
}

export function createInfiniteCoverageGroupTable<const TColumns extends CoverageGroupColumnDef[]>(
  options: CoverageGroupTableOptions<TColumns>
): InfiniteCoverageGroupTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    CoverageGroupEntity,
    CoverageGroupFieldKey,
    TColumns,
    CoverageGroupRowType<TColumns>
  >(options, coverageGroupConfig);
}

/** Coverage-group table type — row narrowed to the fields referenced by the columns. */
export type CoverageGroupTable<
  TColumns extends CoverageGroupColumnDef[] = CoverageGroupColumnDef[],
> = TableApi<CoverageGroupRowType<TColumns>, CoverageGroupFilterInput, CursorPaginationManager>;

/** Infinite coverage-group table type — same shape as `CoverageGroupTable`. */
export type InfiniteCoverageGroupTable<
  TColumns extends CoverageGroupColumnDef[] = CoverageGroupColumnDef[],
> = TableApi<CoverageGroupRowType<TColumns>, CoverageGroupFilterInput, CursorPaginationManager>;
