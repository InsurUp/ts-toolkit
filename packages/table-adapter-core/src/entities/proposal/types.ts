/**
 * @fileoverview Proposal Table Types
 */

import type {
  GetProposalsOptions,
  ProposalFieldKey,
  QueryProposalsResult,
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
  QueryProposalsResultUnifiedFilterInput,
  PickFields,
} from '@insurup/sdk';
import type {
  AnyColumnDef,
  EntityExtractFields,
  EntityFetchFn,
  EntityTableOptions,
} from '../../lib/types.js';
import type { CursorPaginationOptions } from '../../lib/pagination/types.js';

export type {
  QueryProposalsResultFilterInput,
  QueryProposalsResultSearchInput,
  QueryProposalsResultUnifiedFilterInput,
} from '@insurup/sdk';

export type ProposalColumnDef = AnyColumnDef<ProposalFieldKey>;

export type ProposalExtractFields<TColumns extends readonly ProposalColumnDef[]> =
  EntityExtractFields<TColumns, ProposalFieldKey>;

export type ProposalRowType<TColumns extends readonly ProposalColumnDef[]> = PickFields<
  QueryProposalsResult,
  readonly ProposalExtractFields<TColumns>[]
>;

export type ProposalFetchFn<
  TRow = QueryProposalsResult,
  TFields extends ProposalFieldKey[] = ProposalFieldKey[],
> = EntityFetchFn<TRow, GetProposalsOptions<TFields>>;

export type ProposalFilterInput = QueryProposalsResultFilterInput;
export type ProposalSearchInput = QueryProposalsResultSearchInput;
export type ProposalUnifiedFilterInput = QueryProposalsResultUnifiedFilterInput;

export type ProposalTableOptions<TColumns extends ProposalColumnDef[]> = EntityTableOptions<
  QueryProposalsResult,
  ProposalFieldKey,
  TColumns,
  ProposalRowType<TColumns>,
  ProposalFetchFn<ProposalRowType<TColumns>, ProposalExtractFields<TColumns>[]>,
  ProposalUnifiedFilterInput,
  CursorPaginationOptions
>;
