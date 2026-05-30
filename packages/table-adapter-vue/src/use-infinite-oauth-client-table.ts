/**
 * @fileoverview Vue composable for Infinite OAuth Client Table — thin wrapper over `useTable`.
 */

import {
  createInfiniteOAuthClientTable as createInfiniteOAuthClientTableCore,
  type InfiniteOAuthClientTable,
  type OAuthClientTableOptions,
  type OAuthClientColumnDef,
  type OAuthClientRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseInfiniteOAuthClientTableResult<TColumns extends OAuthClientColumnDef[]> =
  UseTableResult<OAuthClientRowType<TColumns>, InfiniteOAuthClientTable<TColumns>>;

/**
 * Vue composable for an infinite scroll oauth client table.
 * Rows accumulate across page fetches. See `useTable` for lifecycle details.
 */
export function useInfiniteOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  options: OAuthClientTableOptions<TColumns>
): UseInfiniteOAuthClientTableResult<TColumns> {
  return useTable(() => createInfiniteOAuthClientTableCore(options));
}
