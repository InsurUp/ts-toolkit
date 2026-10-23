/**
 * @fileoverview Admin Roles Client - Admin panel roles and their permissions
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateAdminPanelRoleRequest,
  GetAdminPanelRoleByIdResult,
  GetAdminPanelRolesResult,
  UpdateAdminPanelRoleRequest,
} from '@insurup/contracts';

/**
 * Operations on admin panel roles and the permissions they grant.
 *
 * Admin panel rolleri ve verdikleri izinler üzerindeki işlemler.
 */
export class InsurUpAdminRolesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Every admin panel role.
   *
   * Tüm admin panel rolleri.
   */
  async getAll(options?: RequestOptions): Promise<InsurUpResult<GetAdminPanelRolesResult[]>> {
    return this.http.get<GetAdminPanelRolesResult[]>(admin.roles.getAll, options);
  }

  /**
   * One admin panel role.
   *
   * Tek bir admin panel rolü.
   *
   * @param id Role id / Rol id'si
   */
  async getById(
    id: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAdminPanelRoleByIdResult>> {
    return this.http.get<GetAdminPanelRoleByIdResult>(admin.roles.byId.render(id), options);
  }

  /**
   * Creates an admin panel role.
   *
   * Bir admin panel rolü oluşturur.
   */
  async create(
    request: CreateAdminPanelRoleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.roles.create, request, options);
  }

  /**
   * Replaces an admin panel role's name and permissions.
   *
   * Bir admin panel rolünün adını ve izinlerini değiştirir.
   *
   * @param id Role id / Rol id'si
   */
  async update(
    id: string,
    request: UpdateAdminPanelRoleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(admin.roles.byId.render(id), { ...request, id }, options);
  }

  /**
   * Deletes an admin panel role.
   *
   * Bir admin panel rolünü siler.
   *
   * @param id Role id / Rol id'si
   */
  async delete(id: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.roles.byId.render(id), options);
  }
}
