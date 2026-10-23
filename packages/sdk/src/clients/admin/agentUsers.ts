/**
 * @fileoverview Admin Agent Users Client - Agency users across agencies
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  MigrateLegacyAgentUsersRequest,
  MigrateLegacyAgentUsersResult,
} from '@insurup/contracts';

/**
 * Operations on agency users across agencies.
 *
 * Acenteler genelinde acente kullanıcıları üzerindeki işlemler.
 */
export class InsurUpAdminAgentUsersClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Migrates the agency users that have no AuthServer account yet, in every agency or only in
   * `request.agentId`, and reports what happened to each user.
   *
   * Henüz AuthServer hesabı olmayan acente kullanıcılarını tüm acentelerde veya yalnızca `request.agentId`
   * acentesinde taşır ve her kullanıcıya ne olduğunu bildirir.
   *
   * @param request The agency to migrate; omit to migrate every agency / Taşınacak acente; tüm acenteler için boş bırakın
   */
  async migrateLegacy(
    request: MigrateLegacyAgentUsersRequest = {},
    options?: RequestOptions
  ): Promise<InsurUpResult<MigrateLegacyAgentUsersResult>> {
    return this.http.post<MigrateLegacyAgentUsersResult>(
      admin.agentUsers.migrateLegacy,
      request,
      options
    );
  }
}
