import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { agentSetupRequests } from '../core/endpoints.js';
import type {
  EnterAgentSetupRequestRequest,
  EnterAgentSetupRequestResult,
  CompleteAgentSetupRequestRequest,
} from '@insurup/contracts';

/**
 * Provides agent onboarding and setup operations for new insurance agents joining the InsurUp platform,
 * facilitating the complete registration and configuration process required for business operations.
 *
 * InsurUp platformuna katılan yeni sigorta acenteleri için acente katılım ve kurulum işlemlerini sağlar;
 * iş operasyonları için gereken tam kayıt ve yapılandırma sürecini kolaylaştırır.
 */
export class InsurUpAgentSetupClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Initiates the agent setup process by submitting initial business information and required documentation for platform registration.
   *
   * Platform kaydı için ilk iş bilgilerini ve gerekli dokümantasyonu sunarak acente kurulum sürecini başlatır.
   *
   * @param request Agent setup initiation request with business details / İş detayları ile acente kurulum başlatma talebi
   * @returns Setup process identifier and next steps / Kurulum süreci tanımlayıcısı ve sonraki adımlar
   */
  async enterAgentSetupRequest(
    request: EnterAgentSetupRequestRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<EnterAgentSetupRequestResult>> {
    return this.http.post<EnterAgentSetupRequestResult>(agentSetupRequests.enter, request, options);
  }

  /**
   * Finalizes the agent setup process by confirming all requirements are met and activating the agent's platform access.
   *
   * Tüm gereksinimlerin karşılandığını onaylayarak ve acentenin platform erişimini aktive ederek acente kurulum sürecini sonlandırır.
   *
   * @param request Setup completion request with final confirmations / Son onaylar ile kurulum tamamlama talebi
   * @returns Operation result / İşlem sonucu
   */
  async completeAgentSetupRequest(
    request: CompleteAgentSetupRequestRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(agentSetupRequests.complete, request, options);
  }
}
