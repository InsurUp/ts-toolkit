import type { HttpTransport } from "../client/http.js";
import type { InsurUpResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { agentRoles } from "../core/endpoints.js";
import type {
  CreateAgentRoleRequest,
  UpdateAgentRoleRequest,
  DeleteAgentRoleRequest,
  GetAgentRoleByIdResult,
  GetAllAgentRolesResult,
} from "@insurup/contracts";

/**
 * Provides role management operations for insurance agents, enabling the creation and administration
 * of role-based access control within agency hierarchies and permission structures.
 *
 * Sigorta acenteleri için rol yönetimi işlemlerini sağlar; acente hiyerarşileri ve izin yapıları
 * içinde rol tabanlı erişim kontrolünün oluşturulması ve yönetimini mümkün kılar.
 */
export class InsurUpAgentRoleClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Creates a new agent role with specified permissions and access levels for use within the agency structure.
   *
   * Acente yapısı içinde kullanım için belirtilen izinler ve erişim seviyeleri ile yeni bir acente rolü oluşturur.
   *
   * @param request Role creation request with permissions and configurations / İzinler ve yapılandırmalar ile rol oluşturma talebi
   * @returns Operation result / İşlem sonucu
   */
  async createAgentRole(
    request: CreateAgentRoleRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(agentRoles.create, request, options);
  }

  /**
   * Retrieves detailed information about a specific agent role including its permissions and access configurations.
   *
   * Belirli bir acente rolü hakkında izinleri ve erişim yapılandırmaları dahil detaylı bilgileri getirir.
   *
   * @param id Unique identifier of the agent role / Acente rolünün benzersiz tanımlayıcısı
   * @returns Agent role details / Acente rolü detayları
   */
  async getAgentRoleById(
    id: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetAgentRoleByIdResult>> {
    const endpoint = agentRoles.getById.render(id);
    return this.http.get<GetAgentRoleByIdResult>(endpoint, options);
  }

  /**
   * Retrieves all available agent roles within the current agency, showing the complete role hierarchy and permissions structure.
   *
   * Mevcut acente içindeki tüm kullanılabilir acente rollerini getirir ve tam rol hiyerarşisi ile izin yapısını gösterir.
   *
   * @returns List of all agent roles / Tüm acente rolleri listesi
   */
  async getAgentRoles(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetAllAgentRolesResult[]>> {
    return this.http.get<GetAllAgentRolesResult[]>(agentRoles.getAll, options);
  }

  /**
   * Updates an existing agent role's permissions, access levels, or configuration settings to reflect changing organizational needs.
   *
   * Değişen organizasyonel ihtiyaçları yansıtmak için mevcut bir acente rolünün izinlerini, erişim seviyelerini veya yapılandırma ayarlarını günceller.
   *
   * @param request Role update request with modified permissions / Değiştirilmiş izinlerle rol güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateAgentRole(
    request: UpdateAgentRoleRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = agentRoles.update.render(request.id);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Removes an agent role from the agency structure, ensuring proper cleanup of associated permissions and user assignments.
   *
   * Acente yapısından bir acente rolünü kaldırır ve ilişkili izinlerin ve kullanıcı atamalarının düzgün temizlenmesini sağlar.
   *
   * @param request Role deletion request / Rol silme talebi
   * @returns Operation result / İşlem sonucu
   */
  async deleteAgentRole(
    request: DeleteAgentRoleRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = agentRoles.delete.render(request.id);
    return this.http.deleteNoContent(endpoint, options);
  }
}
