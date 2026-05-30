/**
 * @fileoverview OAuth Client Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `oauthClients.getOAuthClients` SDK call.
 */

import type {
  OAuthClientEntity,
  OAuthClientFieldKey,
  OAuthClientColumnDef,
  OAuthClientRowType,
  OAuthClientTableOptions,
  OAuthClientFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const oauthClientConfig: InMemoryEntityFactoryConfig<OAuthClientEntity> = {
  queryKeyPrefix: 'oauth-clients',
  loadAll: (client) => (requestOptions) => client.oauthClients.getOAuthClients(requestOptions),
};

export function createOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  options: OAuthClientTableOptions<TColumns>
): OAuthClientTable<TColumns> {
  return createInMemoryEntityTable<
    OAuthClientEntity,
    OAuthClientFieldKey,
    TColumns,
    OAuthClientRowType<TColumns>
  >(options, oauthClientConfig);
}

export function createInfiniteOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  options: OAuthClientTableOptions<TColumns>
): InfiniteOAuthClientTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    OAuthClientEntity,
    OAuthClientFieldKey,
    TColumns,
    OAuthClientRowType<TColumns>
  >(options, oauthClientConfig);
}

/** OAuth-client table type — row narrowed to the fields referenced by the columns. */
export type OAuthClientTable<TColumns extends OAuthClientColumnDef[] = OAuthClientColumnDef[]> =
  TableApi<OAuthClientRowType<TColumns>, OAuthClientFilterInput, CursorPaginationManager>;

/** Infinite oauth-client table type — same shape as `OAuthClientTable`. */
export type InfiniteOAuthClientTable<
  TColumns extends OAuthClientColumnDef[] = OAuthClientColumnDef[],
> = TableApi<OAuthClientRowType<TColumns>, OAuthClientFilterInput, CursorPaginationManager>;
