/**
 * @fileoverview Admin Invites Client - The signed-in person's admin panel invitations and membership
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type { MyAdminPanelInviteResult } from '@insurup/contracts';

/**
 * The signed-in person's admin panel invitations and membership. These calls act on the person holding the
 * token, so they work before the person is an admin panel user.
 *
 * Oturum açan kişinin admin panel davetleri ve üyeliği. Bu çağrılar token sahibi kişi üzerinde çalışır; bu
 * nedenle kişi henüz admin panel kullanıcısı değilken de çalışır.
 */
export class InsurUpAdminInvitesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * The admin panel invitations waiting for the signed-in person.
   *
   * Oturum açan kişiyi bekleyen admin panel davetleri.
   */
  async getMine(options?: RequestOptions): Promise<InsurUpResult<MyAdminPanelInviteResult[]>> {
    return this.http.get<MyAdminPanelInviteResult[]>(admin.invites.getMine, options);
  }

  /**
   * Accepts an admin panel invitation, making the signed-in person an admin panel user.
   *
   * Bir admin panel davetini kabul eder ve oturum açan kişiyi admin panel kullanıcısı yapar.
   *
   * @param inviteId Invitation id / Davet id'si
   */
  async accept(inviteId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.invites.accept.render(inviteId), undefined, options);
  }

  /**
   * Refuses an admin panel invitation.
   *
   * Bir admin panel davetini reddeder.
   *
   * @param inviteId Invitation id / Davet id'si
   */
  async decline(inviteId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.invites.decline.render(inviteId), undefined, options);
  }

  /**
   * Gives up the signed-in person's own admin panel membership.
   *
   * Oturum açan kişinin kendi admin panel üyeliğini bırakır.
   */
  async leave(options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.invites.leave, undefined, options);
  }
}
