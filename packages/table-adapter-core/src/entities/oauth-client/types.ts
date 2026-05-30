/**
 * @fileoverview OAuth Client Table Types
 * @description Types for the in-memory oauth-client table (REST list resource).
 */

import type { GetOAuthClientsResult, DeepFieldKeys, PickFields } from '@insurup/sdk';
import type { AnyColumnDef, EntityExtractFields } from '../../lib/types.js';
import type { InMemoryFilterInput, InMemoryTableOptions } from '../../lib/in-memory/index.js';

/** The full oauth-client entity (one row of `getOAuthClients`). */
export type OAuthClientEntity = GetOAuthClientsResult;

/** Field key union for oauth-client columns. */
export type OAuthClientFieldKey = DeepFieldKeys<OAuthClientEntity> & string;

/** Column definition for oauth-client tables. */
export type OAuthClientColumnDef = AnyColumnDef<OAuthClientFieldKey>;

/** Extract field keys from oauth-client column definitions. */
export type OAuthClientExtractFields<TColumns extends readonly OAuthClientColumnDef[]> =
  EntityExtractFields<TColumns, OAuthClientFieldKey>;

/** Row type narrowed to the fields referenced by the columns. */
export type OAuthClientRowType<TColumns extends readonly OAuthClientColumnDef[]> = PickFields<
  OAuthClientEntity,
  readonly OAuthClientExtractFields<TColumns>[]
>;

/** Unified in-memory filter input for `setFilter` / `defaultFilter`. */
export type OAuthClientFilterInput = InMemoryFilterInput<OAuthClientEntity>;

/** Options for `createOAuthClientTable` (client mode or fetchAll mode). */
export type OAuthClientTableOptions<TColumns extends OAuthClientColumnDef[]> = InMemoryTableOptions<
  OAuthClientEntity,
  OAuthClientFieldKey,
  TColumns,
  OAuthClientRowType<TColumns>
>;
