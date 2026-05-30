/**
 * @fileoverview Coverage Group Table Types
 * @description Types for the in-memory coverage-group table (REST list resource).
 */

import type { GetCoverageGroupsResultItem, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full coverage-group entity (one row of `getAllCoverageGroups`). */
export type CoverageGroupEntity = GetCoverageGroupsResultItem;

/** Field key union for coverage-group columns. */
export type CoverageGroupFieldKey = DeepFieldKeys<CoverageGroupEntity> & string;

/** Column definition for coverage-group tables. */
export type CoverageGroupColumnDef = AnyColumnDef<CoverageGroupFieldKey>;

/** Extract field keys from coverage-group column definitions. */
export type CoverageGroupExtractFields<TColumns extends readonly CoverageGroupColumnDef[]> =
  EntityExtractFields<TColumns, CoverageGroupFieldKey>;

/** Row type narrowed to the fields referenced by the columns. */
export type CoverageGroupRowType<TColumns extends readonly CoverageGroupColumnDef[]> = PickFields<
  CoverageGroupEntity,
  readonly CoverageGroupExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type CoverageGroupFilterInput = InMemoryFilterInput<CoverageGroupEntity>;

/** Options for `createCoverageGroupTable` (client mode or fetchAll mode). */
export type CoverageGroupTableOptions<TColumns extends CoverageGroupColumnDef[]> =
  InMemoryTableOptions<
    CoverageGroupEntity,
    CoverageGroupFieldKey,
    TColumns,
    CoverageGroupRowType<TColumns>
  >;
