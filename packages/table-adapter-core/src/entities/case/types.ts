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
  QueryCaseModelUnifiedFilterInput,
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
export type {
  QueryCaseModelFilterInput,
  QueryCaseModelSearchInput,
  QueryCaseModelUnifiedFilterInput,
} from '@insurup/sdk';

/** Column definition for case tables */
export type CaseColumnDef = AnyColumnDef<CaseFieldKey>;

export type CaseExtractFields<TColumns extends readonly CaseColumnDef[]> = EntityExtractFields<
  TColumns,
  CaseFieldKey
>;

export type CaseRowType<TColumns extends readonly CaseColumnDef[]> = PickFields<
  QueryCaseModel,
  readonly CaseExtractFields<TColumns>[]
>;

export type CaseFetchFn<
  TRow = QueryCaseModel,
  TFields extends CaseFieldKey[] = CaseFieldKey[],
> = EntityFetchFn<TRow, GetCasesOptions<TFields>>;

export type CaseFilterInput = QueryCaseModelFilterInput;
export type CaseSearchInput = QueryCaseModelSearchInput;
export type CaseUnifiedFilterInput = QueryCaseModelUnifiedFilterInput;

export type CaseTableOptions<TColumns extends CaseColumnDef[]> = EntityTableOptions<
  QueryCaseModel,
  CaseFieldKey,
  TColumns,
  CaseRowType<TColumns>,
  CaseFetchFn<CaseRowType<TColumns>, CaseExtractFields<TColumns>[]>,
  CaseUnifiedFilterInput,
  CursorPaginationOptions
>;
