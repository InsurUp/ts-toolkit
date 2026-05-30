/**
 * @fileoverview Role Table Factories
 * @description Thin wrappers around the generic in-memory entity-table helpers
 * bound to the `agentRoles.getAgentRoles` SDK call.
 */

import type {
  RoleEntity,
  RoleFieldKey,
  RoleColumnDef,
  RoleRowType,
  RoleTableOptions,
  RoleFilterInput,
} from './types.js';
import {
  createInMemoryEntityTable,
  createInfiniteInMemoryEntityTable,
  type InMemoryEntityFactoryConfig,
} from '../../lib/in-memory/index.js';
import type { TableApi } from '../../lib/factory/index.js';
import type { CursorPaginationManager } from '../../lib/pagination/index.js';

const roleConfig: InMemoryEntityFactoryConfig<RoleEntity> = {
  queryKeyPrefix: 'roles',
  loadAll: (client) => (requestOptions) => client.agentRoles.getAgentRoles(requestOptions),
};

export function createRoleTable<const TColumns extends RoleColumnDef[]>(
  options: RoleTableOptions<TColumns>
): RoleTable<TColumns> {
  return createInMemoryEntityTable<RoleEntity, RoleFieldKey, TColumns, RoleRowType<TColumns>>(
    options,
    roleConfig
  );
}

export function createInfiniteRoleTable<const TColumns extends RoleColumnDef[]>(
  options: RoleTableOptions<TColumns>
): InfiniteRoleTable<TColumns> {
  return createInfiniteInMemoryEntityTable<
    RoleEntity,
    RoleFieldKey,
    TColumns,
    RoleRowType<TColumns>
  >(options, roleConfig);
}

/** Role table type — row narrowed to the fields referenced by the columns. */
export type RoleTable<TColumns extends RoleColumnDef[] = RoleColumnDef[]> = TableApi<
  RoleRowType<TColumns>,
  RoleFilterInput,
  CursorPaginationManager
>;

/** Infinite role table type — same shape as `RoleTable`. */
export type InfiniteRoleTable<TColumns extends RoleColumnDef[] = RoleColumnDef[]> = TableApi<
  RoleRowType<TColumns>,
  RoleFilterInput,
  CursorPaginationManager
>;
