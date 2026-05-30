/**
 * @fileoverview React hook for OAuth Client Table — thin wrapper over `useTable`.
 */

import {
  createOAuthClientTable as createOAuthClientTableCore,
  type OAuthClientTable,
  type OAuthClientTableOptions,
  type OAuthClientColumnDef,
  type OAuthClientRowType,
} from '@insurup/table-adapter-core';
import { useTable, type UseTableResult } from './use-table.js';

export type UseOAuthClientTableResult<TColumns extends OAuthClientColumnDef[]> = UseTableResult<
  OAuthClientRowType<TColumns>,
  OAuthClientTable<TColumns>
>;

/**
 * React hook for creating and managing a oauth client table.
 * Data is loaded once and filtered/searched/sorted/paginated in memory.
 * See `useTable` for the underlying primitive.
 */
export function useOAuthClientTable<const TColumns extends OAuthClientColumnDef[]>(
  options: OAuthClientTableOptions<TColumns>
): UseOAuthClientTableResult<TColumns> {
  return useTable(() => createOAuthClientTableCore(options));
}
