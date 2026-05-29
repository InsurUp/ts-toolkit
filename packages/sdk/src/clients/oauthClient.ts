import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { oauthClients } from '../core/endpoints.js';
import type {
  CreateOAuthClientRequest,
  CreateOAuthClientResult,
  GetOAuthClientByIdResult,
  GetOAuthClientsResult,
  UpdateOAuthClientRequest,
} from '@insurup/contracts';

/**
 * Provides OAuth client management operations for listing, retrieving, creating, updating,
 * and deleting OAuth clients registered for the current agent within the InsurUp platform.
 *
 * InsurUp platformu içinde mevcut acente için kayıtlı OAuth istemcilerini listeleme, getirme,
 * oluşturma, güncelleme ve silme işlemlerini sağlar.
 */
export class InsurUpOAuthClientClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Retrieves summary information for all OAuth clients registered for the current agent.
   *
   * Mevcut acente için kayıtlı tüm OAuth istemcilerinin özet bilgilerini getirir.
   *
   * @returns List of OAuth client summaries / OAuth istemci özetleri listesi
   */
  async getOAuthClients(options?: RequestOptions): Promise<InsurUpResult<GetOAuthClientsResult[]>> {
    return this.http.get<GetOAuthClientsResult[]>(oauthClients.getAll, options);
  }

  /**
   * Retrieves detailed information about a specific OAuth client, including its redirect URIs,
   * grant types, and scopes.
   *
   * Belirli bir OAuth istemcisi hakkında yönlendirme URI'leri, yetkilendirme türleri ve
   * kapsamları dahil detaylı bilgileri getirir.
   *
   * @param id Module entity ID of the OAuth client / OAuth istemcisinin modül varlık kimlik numarası
   * @returns OAuth client details / OAuth istemci detayları
   */
  async getOAuthClientById(
    id: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetOAuthClientByIdResult>> {
    const endpoint = oauthClients.getById.render(id);
    return this.http.get<GetOAuthClientByIdResult>(endpoint, options);
  }

  /**
   * Creates a new OAuth client with the specified type, grant types, scopes, and redirect URIs.
   *
   * Belirtilen tür, yetkilendirme türleri, kapsamlar ve yönlendirme URI'leri ile yeni bir
   * OAuth istemcisi oluşturur.
   *
   * @param request OAuth client creation request / OAuth istemcisi oluşturma talebi
   * @returns Created OAuth client identifiers / Oluşturulan OAuth istemcisi tanımlayıcıları
   */
  async createOAuthClient(
    request: CreateOAuthClientRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateOAuthClientResult>> {
    return this.http.post<CreateOAuthClientResult>(oauthClients.create, request, options);
  }

  /**
   * Updates an existing OAuth client. Only the fields provided in the request are applied;
   * omitted fields are left unchanged, so redirect URIs can be updated without clobbering
   * other settings.
   *
   * Mevcut bir OAuth istemcisini günceller. Yalnızca istekte sağlanan alanlar uygulanır;
   * atlanan alanlar değiştirilmeden bırakılır, böylece yönlendirme URI'leri diğer ayarlar
   * bozulmadan güncellenebilir.
   *
   * @param request OAuth client update request with the target id / Hedef kimlik içeren OAuth istemcisi güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateOAuthClient(
    request: UpdateOAuthClientRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const endpoint = oauthClients.update.render(request.id);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Permanently removes an OAuth client, revoking its ability to authenticate against the platform.
   *
   * Bir OAuth istemcisini kalıcı olarak kaldırır ve platforma karşı kimlik doğrulama yeteneğini iptal eder.
   *
   * @param id Module entity ID of the OAuth client to delete / Silinecek OAuth istemcisinin modül varlık kimlik numarası
   * @returns Operation result / İşlem sonucu
   */
  async deleteOAuthClient(id: string, options?: RequestOptions): Promise<InsurUpResult> {
    const endpoint = oauthClients.delete.render(id);
    return this.http.deleteNoContent(endpoint, options);
  }
}
