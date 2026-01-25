/**
 * @fileoverview Agent Branch Client - Agent branch management operations
 * @description Provides branch management operations for insurance agents
 */

import type { HttpTransport } from "../client/http.js";
import type { InsurUpResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { agentBranches } from "../core/endpoints.js";
import type {
  CreateAgentBranchRequest,
  UpdateAgentBranchRequest,
  DeleteAgentBranchRequest,
  GetAgentBranchResult,
  GetAllAgentBranchesResult,
} from "@insurup/contracts";

/**
 * Provides branch management operations for insurance agents, enabling the creation and administration
 * of organizational branches within agency structures.
 */
export class InsurUpAgentBranchClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Creates a new agent branch within the agency structure with optional parent branch relationship.
   *
   * Acente yapısı içinde isteğe bağlı üst şube ilişkisi ile yeni bir acente şubesi oluşturur.
   *
   * @param request Branch creation request with name and optional parent
   * @returns Created branch details
   */
  async createAgentBranch(
    request: CreateAgentBranchRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return this.http.post<string>(agentBranches.create, request, options);
  }

  /**
   * Retrieves detailed information about a specific agent branch including its parent relationship.
   *
   * Belirli bir acente şubesi hakkında üst şube ilişkisi dahil detaylı bilgileri getirir.
   *
   * @param id Unique identifier of the agent branch
   * @returns Agent branch details
   */
  async getAgentBranchById(
    id: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetAgentBranchResult>> {
    const endpoint = agentBranches.getById.render(id);
    return this.http.get<GetAgentBranchResult>(endpoint, options);
  }

  /**
   * Retrieves all available agent branches within the current agency, showing the complete branch hierarchy.
   *
   * Mevcut acente içindeki tüm kullanılabilir acente şubelerini getirir ve tam şube hiyerarşisini gösterir.
   *
   * @returns List of all agent branches
   */
  async getAgentBranches(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetAllAgentBranchesResult[]>> {
    return this.http.get<GetAllAgentBranchesResult[]>(
      agentBranches.getAll,
      options,
    );
  }

  /**
   * Updates an existing agent branch's name or parent branch relationship to reflect changing organizational needs.
   *
   * Değişen organizasyonel ihtiyaçları yansıtmak için mevcut bir acente şubesinin adını veya üst şube ilişkisini günceller.
   *
   * @param request Branch update request with modified details
   * @returns Operation result
   */
  async updateAgentBranch(
    request: UpdateAgentBranchRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = agentBranches.update.render(request.id);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Removes an agent branch from the agency structure. The branch must not have any child branches.
   *
   * Acente yapısından bir acente şubesini kaldırır. Şubenin alt şubeleri olmamalıdır.
   *
   * @param request Branch deletion request
   * @returns Operation result
   */
  async deleteAgentBranch(
    request: DeleteAgentBranchRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = agentBranches.delete.render(request.id);
    return this.http.deleteNoContent(endpoint, options);
  }
}
