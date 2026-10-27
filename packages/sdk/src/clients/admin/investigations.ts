/**
 * @fileoverview Admin Investigations Client - What the AI found when it looked into an alert or an error
 * @description The investigations started for firing alerts, for new or returning error groups and by admins, with
 * the investigator's report
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  InvestigationResult,
  ListInvestigationsQuery,
  ListInvestigationsResult,
} from '@insurup/contracts';

/**
 * The AI's investigations of alerts and errors. Reading them needs the `investigations:read` permission.
 *
 * AI'ın alarm ve hata incelemeleri. Okumak `investigations:read` yetkisi gerektirir.
 */
export class InsurUpAdminInvestigationsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * One page of investigations, newest first, optionally only one rule's, notification's or error group's.
   *
   * İncelemelerin bir sayfası, en yeniden başlayarak; isteğe bağlı olarak yalnızca bir kuralın, bildirimin veya
   * hata grubunun.
   */
  async list(
    query?: ListInvestigationsQuery,
    options?: RequestOptions
  ): Promise<InsurUpResult<ListInvestigationsResult>> {
    return this.http.get<ListInvestigationsResult>(
      admin.investigations.list.render(query),
      options
    );
  }

  /**
   * One investigation with the investigator's report.
   *
   * Tek bir inceleme ve araştırmacının raporu.
   *
   * @param investigationId The investigation / İnceleme
   */
  async get(
    investigationId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<InvestigationResult>> {
    return this.http.get<InvestigationResult>(
      admin.investigations.investigation.render(investigationId),
      options
    );
  }
}
