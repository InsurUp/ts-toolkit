/**
 * @fileoverview Role Entity Exports
 */

export {
  createRoleTable,
  createInfiniteRoleTable,
  type RoleTable,
  type InfiniteRoleTable,
} from './factory.js';

export type {
  RoleEntity,
  RoleColumnDef,
  RoleRowType,
  RoleExtractFields,
  RoleTableOptions,
  RoleFilterInput,
} from './types.js';
