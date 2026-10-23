/**
 * @fileoverview Admin Roles Contracts - Admin panel roles and their permissions
 * @description TypeScript contracts for the `admin-panel-roles/*` endpoints
 */

/**
 * One admin panel role in the role list.
 *
 * Rol listesindeki bir admin panel rolü.
 */
export interface GetAdminPanelRolesResult {
  /** Role id. */
  readonly id: string;
  /** Role name; users are assigned roles by this name. */
  readonly name: string;
  /** Permissions the role grants, such as `users:read`. */
  readonly permissions: readonly string[];
}

/**
 * One admin panel role.
 *
 * Tek bir admin panel rolü.
 */
export interface GetAdminPanelRoleByIdResult {
  /** Role id. */
  readonly id: string;
  /** Role name; users are assigned roles by this name. */
  readonly name: string;
  /** Permissions the role grants, such as `users:read`. */
  readonly permissions: readonly string[];
}

/**
 * Creates an admin panel role.
 *
 * Bir admin panel rolü oluşturur.
 */
export interface CreateAdminPanelRoleRequest {
  /** Name of the new role. */
  readonly roleName: string;
  /** Permissions the role grants, such as `users:read`. Defaults to none. */
  readonly permissions?: readonly string[];
}

/**
 * Replaces an admin panel role's name and permissions. The role id travels as the method's own parameter.
 *
 * Bir admin panel rolünün adını ve izinlerini değiştirir. Rol id'si metodun kendi parametresidir.
 */
export interface UpdateAdminPanelRoleRequest {
  /** New role name. */
  readonly name: string;
  /** Permissions the role should grant; replaces the current ones. */
  readonly permissions: readonly string[];
}
