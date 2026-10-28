/**
 * @fileoverview Admin Errors Client - The platform's errors, grouped by fingerprint
 * @description The error groups built from every Error and Fatal log entry: their triage (status, cause,
 * resolution), their timeline and investigations, and whether new ones are investigated by the AI
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  ErrorGroupResult,
  ErrorTrackingSettingsResult,
  InvestigationSummaryResult,
  ListErrorGroupsQuery,
  ListErrorGroupsResult,
  UpdateErrorGroupRequest,
  UpdateErrorTrackingSettingsRequest,
} from '@insurup/contracts';

/**
 * The platform's errors, one group per fingerprint. People set a group's status and write what the error is and how
 * it was fixed; the AI writes those texts only while nobody else has, and never changes the status.
 *
 * Platformun hataları, her parmak izi için bir grup. Grubun durumunu insanlar belirler, hatanın ne olduğunu ve nasıl
 * çözüldüğünü yazar; AI bu metinleri yalnızca başka kimse yazmamışken yazar ve durumu hiç değiştirmez.
 */
export class InsurUpAdminErrorsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * One page of error groups, the latest seen first.
   *
   * Hata gruplarının bir sayfası, en son görülenden başlayarak.
   */
  async list(
    query?: ListErrorGroupsQuery,
    options?: RequestOptions
  ): Promise<InsurUpResult<ListErrorGroupsResult>> {
    return this.http.get<ListErrorGroupsResult>(admin.errors.list.render(query), options);
  }

  /**
   * One error group with its texts, its timeline and its investigations.
   *
   * Tek bir hata grubu; metinleri, zaman çizelgesi ve incelemeleriyle birlikte.
   *
   * @param errorGroupId The group / Grup
   */
  async get(
    errorGroupId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<ErrorGroupResult>> {
    return this.http.get<ErrorGroupResult>(admin.errors.group.render(errorGroupId), options);
  }

  /**
   * Changes a group's status, cause or resolution; what is left out stays, an empty text clears it.
   *
   * Bir grubun durumunu, nedenini veya çözümünü değiştirir; gönderilmeyen alan aynı kalır, boş metin onu temizler.
   *
   * @param errorGroupId The group / Grup
   * @returns The changed group / Değiştirilen grup
   */
  async update(
    errorGroupId: string,
    request: UpdateErrorGroupRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ErrorGroupResult>> {
    return this.http.patch<ErrorGroupResult>(
      admin.errors.group.render(errorGroupId),
      request,
      options
    );
  }

  /**
   * Asks the AI to investigate a group now, whatever the project-wide switch says.
   *
   * AI'dan bir grubu, proje genelindeki anahtar ne derse desin, şimdi incelemesini ister.
   *
   * @param errorGroupId The group / Grup
   * @returns The investigation started / Başlatılan inceleme
   */
  async investigate(
    errorGroupId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<InvestigationSummaryResult>> {
    return this.http.post<InvestigationSummaryResult>(
      admin.errors.investigate.render(errorGroupId),
      {},
      options
    );
  }

  /**
   * Whether new errors are investigated by the AI, and how many at most.
   *
   * Yeni hataların AI tarafından incelenip incelenmediği ve en fazla kaç tane.
   */
  async getSettings(options?: RequestOptions): Promise<InsurUpResult<ErrorTrackingSettingsResult>> {
    return this.http.get<ErrorTrackingSettingsResult>(admin.errors.settings, options);
  }

  /**
   * Turns the investigation of new errors on or off and sets its limits.
   *
   * Yeni hataların incelenmesini açar veya kapatır ve sınırlarını belirler.
   */
  async updateSettings(
    request: UpdateErrorTrackingSettingsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ErrorTrackingSettingsResult>> {
    return this.http.put<ErrorTrackingSettingsResult>(admin.errors.settings, request, options);
  }
}
