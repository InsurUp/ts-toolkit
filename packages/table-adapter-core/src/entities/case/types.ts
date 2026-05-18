/**
 * @fileoverview Case Table Types
 * @description Type definitions for the case table adapter
 */

import type {
  GetCasesOptions,
  CaseFieldKey,
  QueryCaseModel,
  QueryCaseModelFilterInput,
  QueryCaseModelSearchInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

// Re-export filter and search types for convenience
export type { QueryCaseModelFilterInput, QueryCaseModelSearchInput } from '@insurup/sdk';

/**
 * Column definition for case tables
 */
export type CaseColumnDef = AnyColumnDef<CaseFieldKey>;

/**
 * Extract fields from case column definitions
 * @template TColumns - The column definitions array
 */
export type CaseExtractFields<TColumns extends readonly CaseColumnDef[]> = EntityExtractFields<
  TColumns,
  CaseFieldKey
>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type CaseRowType<TColumns extends readonly CaseColumnDef[]> = PickFields<
  QueryCaseModel,
  readonly CaseExtractFields<TColumns>[]
>;

/**
 * Fetch function type for case queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type CaseFetchFn<
  TRow = QueryCaseModel,
  TFields extends CaseFieldKey[] = CaseFieldKey[],
> = EntityFetchFn<TRow, GetCasesOptions<TFields>>;

/**
 * Filter input type for case queries
 */
export type CaseFilterInput = QueryCaseModelFilterInput;

/**
 * Search input type for case queries
 */
export type CaseSearchInput = QueryCaseModelSearchInput;

/**
 * Options for createCaseTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type CaseTableOptions<TColumns extends CaseColumnDef[]> = EntityTableOptions<
  QueryCaseModel,
  CaseFieldKey,
  TColumns,
  CaseRowType<TColumns>,
  CaseFetchFn<CaseRowType<TColumns>, CaseExtractFields<TColumns>[]>,
  CaseFilterInput,
  CaseSearchInput,
  CursorPaginationOptions
>;
