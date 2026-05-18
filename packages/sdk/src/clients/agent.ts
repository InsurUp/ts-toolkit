import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { agents } from '../core/endpoints.js';
import type {
  GetCurrentAgentResult,
  UpdateCurrentAgentRequest,
  GetMyAgentInsuranceCompaniesResult,
  GetAgentInsuranceCompanyBranchesResult,
  GetAgentInsuranceCompanyConnectionResult,
  AddInsuranceCompanyToAgentRequest,
  UpdateAgentInsuranceCompanyConnectionRequest,
  UpdateAgentInsuranceCompanyBranchesRequest,
  ReSyncAgentInsuranceCompanyWithInsuranceRequest,
  GetB2CConfigFieldsResult,
  UpdateB2CConfigFieldsRequest,
} from '@insurup/contracts';
import { b2c } from '../core/endpoints.js';

/**
 * Provides agent management operations for the InsurUp platform, enabling agents to manage their profile,
 * insurance company connections, and business relationships within the insurance ecosystem.
 *
 * InsurUp platformunda acente yönetimi işlemlerini sağlar; acentelerin profilerini, sigorta şirketi
 * bağlantılarını ve sigorta ekosistemi içindeki iş ilişkilerini yönetmelerine olanak tanır.
 */
export class InsurUpAgentClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Retrieves the current agent's profile information including business details and configuration settings.
   *
   * Mevcut acentenin iş detayları ve yapılandırma ayarları dahil profil bilgilerini getirir.
   *
   * @returns Agent profile information / Acente profil bilgileri
   */
  async getCurrentAgent(options?: RequestOptions): Promise<InsurUpResult<GetCurrentAgentResult>> {
    return this.http.get<GetCurrentAgentResult>(agents.getCurrentAgent, options);
  }

  /**
   * Updates the current agent's profile information such as business details, contact information, and operational preferences.
   *
   * Mevcut acentenin iş detayları, iletişim bilgileri ve operasyonel tercihleri gibi profil bilgilerini günceller.
   *
   * @param request Agent profile update data / Acente profil güncelleme verileri
   * @returns Operation result / İşlem sonucu
   */
  async updateCurrentAgent(
    request: UpdateCurrentAgentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(agents.updateCurrentAgent, request, options);
  }

  /**
   * Retrieves all insurance companies that the current agent is affiliated with or has authorization to work with.
   *
   * Mevcut acentenin bağlı olduğu veya çalışma yetkisine sahip olduğu tüm sigorta şirketlerini getirir.
   *
   * @returns List of agent's insurance companies / Acentenin sigorta şirketleri listesi
   */
  async getAgentInsuranceCompaniesAsync(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetMyAgentInsuranceCompaniesResult[]>> {
    return this.http.get<GetMyAgentInsuranceCompaniesResult[]>(
      agents.insuranceCompanies.getMyInsuranceCompanies,
      options
    );
  }

  /**
   * Retrieves the available product branches (Kasko, TSS, IMM, DASK, etc.) for a specific insurance company that the agent can offer.
   *
   * Acentenin sunabileceği belirli bir sigorta şirketi için mevcut ürün dallarını (Kasko, TSS, İMM, DASK, vb.) getirir.
   *
   * @param agentInsuranceCompanyId Insurance company relationship identifier / Sigorta şirketi ilişki tanımlayıcısı
   * @returns Available product branches / Mevcut ürün dalları
   */
  async getAgentInsuranceCompanyBranchesAsync(
    agentInsuranceCompanyId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentInsuranceCompanyBranchesResult[]>> {
    const endpoint = agents.insuranceCompanies.getBranches.render(agentInsuranceCompanyId);
    return this.http.get<GetAgentInsuranceCompanyBranchesResult[]>(endpoint, options);
  }

  /**
   * Retrieves the technical connection configuration and credentials for integrating with a specific insurance company's systems.
   *
   * Belirli bir sigorta şirketinin sistemleri ile entegrasyon için teknik bağlantı yapılandırması ve kimlik bilgilerini getirir.
   *
   * @param agentInsuranceCompanyId Insurance company relationship identifier / Sigorta şirketi ilişki tanımlayıcısı
   * @returns Connection configuration details / Bağlantı yapılandırma detayları
   */
  async getAgentInsuranceCompanyConnectionAsync(
    agentInsuranceCompanyId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAgentInsuranceCompanyConnectionResult>> {
    const endpoint = agents.insuranceCompanies.getConnection.render(agentInsuranceCompanyId);
    return this.http.get<GetAgentInsuranceCompanyConnectionResult>(endpoint, options);
  }

  /**
   * Establishes a new business relationship between the agent and an insurance company, enabling the agent to offer that company's products.
   *
   * Acente ile sigorta şirketi arasında yeni bir iş ilişkisi kurar ve acentenin o şirketin ürünlerini sunmasına olanak tanır.
   *
   * @param request Insurance company association request / Sigorta şirketi ilişkilendirme talebi
   * @returns Operation result / İşlem sonucu
   */
  async addAgentInsuranceCompany(
    request: AddInsuranceCompanyToAgentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      agents.insuranceCompanies.addInsuranceCompanyToAgent,
      request,
      options
    );
  }

  /**
   * Removes the business relationship between the agent and an insurance company, terminating the agent's ability to offer that company's products.
   *
   * Acente ile sigorta şirketi arasındaki iş ilişkisini kaldırır ve acentenin o şirketin ürünlerini sunma yeteneğini sonlandırır.
   *
   * @param agentInsuranceCompanyId Insurance company relationship identifier to remove / Kaldırılacak sigorta şirketi ilişki tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async removeAgentInsuranceCompany(
    agentInsuranceCompanyId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agents.insuranceCompanies.remove.render(agentInsuranceCompanyId);
    return this.http.deleteNoContent(endpoint, options);
  }

  /**
   * Updates the technical connection settings and credentials for integrating with an insurance company's API or systems.
   *
   * Bir sigorta şirketinin API'si veya sistemleri ile entegrasyon için teknik bağlantı ayarları ve kimlik bilgilerini günceller.
   *
   * @param request Connection configuration update request / Bağlantı yapılandırma güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateAgentInsuranceCompanyConnection(
    request: UpdateAgentInsuranceCompanyConnectionRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agents.insuranceCompanies.updateConnection.render(
      request.agentInsuranceCompanyId
    );
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Updates which product branches (Kasko, TSS, IMM, DASK, etc.) the agent is authorized to offer for a specific insurance company.
   *
   * Acentenin belirli bir sigorta şirketi için hangi ürün dallarını (Kasko, TSS, İMM, DASK, vb.) sunma yetkisine sahip olduğunu günceller.
   *
   * @param request Branch authorization update request / Şube yetkilendirme güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateAgentInsuranceCompanyBranches(
    request: UpdateAgentInsuranceCompanyBranchesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agents.insuranceCompanies.updateBranches.render(
      request.agentInsuranceCompanyId
    );
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Re-synchronizes the agent's configuration and authorizations with the insurance company's systems to ensure data consistency and updated permissions.
   *
   * Veri tutarlılığını ve güncellenmiş izinleri sağlamak için acentenin yapılandırması ve yetkilendirmelerini sigorta şirketinin sistemleri ile yeniden senkronize eder.
   *
   * @param request Re-synchronization request details / Yeniden senkronizasyon talep detayları
   * @returns Operation result / İşlem sonucu
   */
  async reSyncAgentInsuranceCompanyWithInsurance(
    request: ReSyncAgentInsuranceCompanyWithInsuranceRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = agents.insuranceCompanies.reSyncAgentInsuranceCompanyWithInsurance.render(
      request.agentInsuranceCompanyId
    );
    return this.http.postNoContent(endpoint, request, options);
  }

  /**
   * Retrieves all B2C configuration fields that define the customizable settings and parameters for the agent's customer-facing interface.
   *
   * Acentenin müşteriye yönelik arayüzü için özelleştirilebilir ayarları ve parametreleri tanımlayan tüm B2C yapılandırma alanlarını getirir.
   *
   * @returns List of B2C configuration fields
   */
  async getB2CConfigFields(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetB2CConfigFieldsResult>> {
    return this.http.get<GetB2CConfigFieldsResult>(b2c.configFields.getAll, options);
  }

  /**
   * Updates all B2C configuration fields at once, allowing agents to customize their customer-facing interface settings and branding parameters.
   *
   * Tüm B2C yapılandırma alanlarını bir kerede günceller, acentelerin müşteriye yönelik arayüz ayarlarını ve marka parametrelerini özelleştirmelerine olanak tanır.
   *
   * @param request B2C configuration fields update data
   * @returns Operation result
   */
  async updateB2CConfigFields(
    request: UpdateB2CConfigFieldsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(b2c.configFields.updateAll, request, options);
  }
}
