/**
 * @fileoverview Admin Insurance Companies Client - Adding companies, company settings and connection fields
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateCompanyConnectionFieldRequest,
  CreateInsuranceCompanyRequest,
  GetCompanyConnectionFieldResult,
  GetCompanyConnectionFieldsResult,
  InsuranceCompany,
  UpdateCompanyConnectionFieldRequest,
  UpdateInsuranceCompanyRequest,
} from '@insurup/contracts';

/**
 * Operations on insurance companies and their connection fields. The company list is read with
 * `insurance.getInsuranceCompanies()`.
 *
 * Sigorta şirketleri ve bağlantı alanları üzerindeki işlemler. Şirket listesi
 * `insurance.getInsuranceCompanies()` ile okunur.
 */
export class InsurUpAdminInsuranceCompaniesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Adds an insurance company to the catalogue and returns it, with no payment options or connection fields yet.
   *
   * Kataloğa bir sigorta şirketi ekler ve onu henüz ödeme seçeneği ve bağlantı alanı olmadan döndürür.
   *
   * @param request The company / Şirket
   */
  async create(
    request: CreateInsuranceCompanyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceCompany>> {
    return this.http.post<InsuranceCompany>(admin.insuranceCompanies.create, request, options);
  }

  /**
   * Updates a company's name, logo, enablement and payment-option rules.
   *
   * Bir şirketin adını, logosunu, etkinliğini ve ödeme seçeneği kurallarını günceller.
   *
   * @param id Insurance company id / Sigorta şirketi kimliği
   * @param request The company's new settings / Şirketin yeni ayarları
   */
  async update(
    id: number,
    request: UpdateInsuranceCompanyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insuranceCompanies.byId.render(id),
      { ...request, id },
      options
    );
  }

  /**
   * A company's connection fields (key, service key and value type only).
   *
   * Bir şirketin bağlantı alanları (yalnızca anahtar, servis anahtarı ve değer türü).
   *
   * @param insuranceCompanyId Insurance company id / Sigorta şirketi kimliği
   */
  async getConnectionFields(
    insuranceCompanyId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCompanyConnectionFieldsResult[]>> {
    return this.http.get<GetCompanyConnectionFieldsResult[]>(
      admin.insuranceCompanies.connectionFields.render(insuranceCompanyId),
      options
    );
  }

  /**
   * One connection field of a company.
   *
   * Bir şirketin tek bir bağlantı alanı.
   *
   * @param insuranceCompanyId Insurance company id / Sigorta şirketi kimliği
   * @param key Connection field key / Bağlantı alanı anahtarı
   */
  async getConnectionField(
    insuranceCompanyId: number,
    key: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCompanyConnectionFieldResult>> {
    return this.http.get<GetCompanyConnectionFieldResult>(
      admin.insuranceCompanies.connectionField.render(insuranceCompanyId, key),
      options
    );
  }

  /**
   * Adds a connection field to a company.
   *
   * Bir şirkete bağlantı alanı ekler.
   *
   * @param insuranceCompanyId Insurance company id / Sigorta şirketi kimliği
   * @param request The new field / Yeni alan
   */
  async createConnectionField(
    insuranceCompanyId: number,
    request: CreateCompanyConnectionFieldRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.insuranceCompanies.connectionFields.render(insuranceCompanyId),
      { ...request, insuranceCompanyId },
      options
    );
  }

  /**
   * Overwrites a connection field of a company.
   *
   * Bir şirketin bağlantı alanının üzerine yazar.
   *
   * @param insuranceCompanyId Insurance company id / Sigorta şirketi kimliği
   * @param key Connection field key / Bağlantı alanı anahtarı
   * @param request The field's new settings / Alanın yeni ayarları
   */
  async updateConnectionField(
    insuranceCompanyId: number,
    key: string,
    request: UpdateCompanyConnectionFieldRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insuranceCompanies.connectionField.render(insuranceCompanyId, key),
      { ...request, key, insuranceCompanyId },
      options
    );
  }

  /**
   * Removes a connection field from a company.
   *
   * Bir şirketten bağlantı alanını kaldırır.
   *
   * @param insuranceCompanyId Insurance company id / Sigorta şirketi kimliği
   * @param key Connection field key / Bağlantı alanı anahtarı
   */
  async deleteConnectionField(
    insuranceCompanyId: number,
    key: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      admin.insuranceCompanies.connectionField.render(insuranceCompanyId, key),
      options
    );
  }
}
