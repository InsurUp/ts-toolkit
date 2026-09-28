/**
 * @fileoverview Me Client - Operations about the signed-in person
 * @description Agencies, contexts and invitations of the person holding the token
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { me } from '../core/endpoints.js';
import type { MyAgentResult, MyContextsResult, MyInviteResult } from '@insurup/contracts';

/**
 * Operations about the person holding the token rather than about an agency they are acting in.
 * These are the only calls that work before an agency has been selected.
 *
 * Token sahibinin hangi acentede işlem yaptığından bağımsız olarak, kişinin kendisiyle ilgili işlemler.
 * Hiçbir acente seçilmemişken çalışan tek çağrılar bunlardır.
 */
export class InsurUpMeClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Every active internal and agency context linked to the signed-in account.
   *
   * Oturum açan hesaba bağlı tüm aktif iç ve acente bağlamları.
   */
  async getMyContexts(options?: RequestOptions): Promise<InsurUpResult<MyContextsResult>> {
    return this.http.get<MyContextsResult>(me.getMyContexts, options);
  }

  /**
   * The agencies the signed-in person is an active member of. An empty list means they belong to none yet.
   *
   * Oturum açan kişinin aktif üyesi olduğu acenteler. Boş liste, henüz hiçbirine ait olmadığı anlamına gelir.
   */
  async getMyAgents(options?: RequestOptions): Promise<InsurUpResult<MyAgentResult[]>> {
    return this.http.get<MyAgentResult[]>(me.getMyAgents, options);
  }

  /**
   * The invitations waiting for the signed-in person.
   *
   * Oturum açan kişiyi bekleyen davetler.
   */
  async getMyInvites(options?: RequestOptions): Promise<InsurUpResult<MyInviteResult[]>> {
    return this.http.get<MyInviteResult[]>(me.getMyInvites, options);
  }

  /**
   * Accepts an invitation, turning it into a live membership.
   *
   * Bir daveti kabul eder ve daveti gerçek bir üyeliğe dönüştürür.
   */
  async acceptInvite(inviteId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(me.acceptInvite.render(inviteId), undefined, options);
  }

  /**
   * Refuses an invitation.
   *
   * Bir daveti reddeder.
   */
  async declineInvite(inviteId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(me.declineInvite.render(inviteId), undefined, options);
  }

  /**
   * Gives up the caller's own membership in one agency. Refused for the agency's owner.
   *
   * Çağıranın bir acentedeki kendi üyeliğini bırakır. Acente sahibi için reddedilir.
   */
  async leaveAgent(agentId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(me.leaveAgent.render(agentId), undefined, options);
  }
}
