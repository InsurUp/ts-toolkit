/**
 * @fileoverview Proposal Table Types
 * @description Type definitions for the proposal table adapter
 */

import type {
  GetProposalsOptions,
  ProposalFieldKey,
  QueryProposalsResult,
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
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
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
} from '@insurup/sdk';

/**
 * Column definition for proposal tables
 */
export type ProposalColumnDef = AnyColumnDef<ProposalFieldKey>;

/**
 * Extract fields from proposal column definitions
 * @template TColumns - The column definitions array
 */
export type ProposalExtractFields<TColumns extends readonly ProposalColumnDef[]> =
  EntityExtractFields<TColumns, ProposalFieldKey>;

/**
 * Row type derived from column definitions using SDK's PickFields
 * @template TColumns - The column definitions array
 */
export type ProposalRowType<TColumns extends readonly ProposalColumnDef[]> = PickFields<
  QueryProposalsResult,
  readonly ProposalExtractFields<TColumns>[]
>;

/**
 * Fetch function type for proposal queries
 * @template TRow - The row type with selected fields
 * @template TFields - The field keys array type
 */
export type ProposalFetchFn<
  TRow = QueryProposalsResult,
  TFields extends ProposalFieldKey[] = ProposalFieldKey[],
> = EntityFetchFn<TRow, GetProposalsOptions<TFields>>;

/**
 * Filter input type for proposal queries
 */
export type ProposalFilterInput = QueryProposalsResultFilterInput;

/**
 * Search input type for proposal queries
 */
export type ProposalSearchInput = QueryProposalsResultSearchInput;

/**
 * Options for createProposalTable (client mode or fetch mode)
 * @template TColumns - The column definitions (inferred from callback)
 */
export type ProposalTableOptions<TColumns extends ProposalColumnDef[]> = EntityTableOptions<
  QueryProposalsResult,
  ProposalFieldKey,
  TColumns,
  ProposalRowType<TColumns>,
  ProposalFetchFn<ProposalRowType<TColumns>, ProposalExtractFields<TColumns>[]>,
  ProposalFilterInput,
  ProposalSearchInput,
  CursorPaginationOptions
>;
