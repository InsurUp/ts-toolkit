/**
 * @fileoverview Admin Agent Setup Client - Agency setup requests (onboarding invites)
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin, agentSetupRequests } from '../../core/endpoints.js';
import type {
  CreateAgentSetupRequestRequest,
  CreateAgentSetupRequestResult,
  GetAgentSetupRequestByIdResult,
  GetAllAgentSetupRequestsRequest,
  GetAllAgentSetupRequestsResult,
} from '@insurup/contracts';

/**
 * Agency setup requests: the single-use invites a new agency completes to get its account.
 *
 * Acente kurulum talepleri: yeni bir acentenin hesabını almak için tamamladığı tek kullanımlık davetler.
 */
export class InsurUpAdminAgentSetupClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Creates a setup request and e-mails its link to the agency.
   *
   * Bir kurulum talebi oluşturur ve bağlantısını acenteye e-postayla gönderir.
   *
   * @param request Label, validity, e-mail, plan and payment mode / Etiket, geçerlilik, e-posta, plan ve ödeme modu
   * @returns The request id, invite code and setup link / Talep kimliği, davet kodu ve kurulum bağlantısı
   */
  async create(
    request: CreateAgentSetupRequestRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateAgentSetupRequestResult>> {
    return this.http.post<CreateAgentSetupRequestResult>(
      agentSetupRequests.create,
      request,
      options
    );
  }

  /**
   * Lists the setup requests, newest first, one page at a time.
   *
   * Kurulum taleplerini en yeni önce, sayfa sayfa listeler.
   *
   * @param query Page (1-based, default 1) and page size (1–100, default 10) / Sayfa ve sayfa boyutu
   */
  async getAll(
    query?: GetAllAgentSetupRequestsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAllAgentSetupRequestsResult>> {
    return this.http.get<GetAllAgentSetupRequestsResult>(
      admin.agentSetup.getAll.render(query),
      options
    );
  }

  /**
   * Reads one setup request.
   *
   * Tek bir kurulum talebini okur.
   *
   * @param id Setup request id / Kurulum talebi kimliği
   */
  async getById(
    id: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentSetupRequestByIdResult>> {
    return this.http.get<GetAgentSetupRequestByIdResult>(
      agentSetupRequests.getAgentSetupRequestById.render(id),
      options
    );
  }

  /**
   * Disables a setup request, so its invite can no longer be used.
   *
   * Bir kurulum talebini devre dışı bırakır; daveti artık kullanılamaz.
   *
   * @param id Setup request id / Kurulum talebi kimliği
   */
  async disable(id: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.patchNoContent(
      agentSetupRequests.disableAgentSetupRequest.render(id),
      { id },
      options
    );
  }
}
