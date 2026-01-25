/**
 * @fileoverview Template Client - Template management operations
 * @description Provides template management operations for the InsurUp platform
 */

import type { HttpTransport } from "../client/http.js";
import type { InsurUpResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { templates } from "../core/endpoints.js";
import type {
  GetTemplateDefinitionsResult,
  QueryTemplatesResult,
  GetTemplateByKeyResult,
  UpdateTemplateRequest,
  DeleteTemplateRequest,
} from "@insurup/contracts";

/**
 * Provides template management operations for the InsurUp platform, enabling agents to retrieve and update
 * document templates, email templates, and other content templates used in insurance workflows.
 */
export class InsurUpTemplateClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Retrieves all template definitions with their JSON schemas and metadata.
   * These definitions describe the structure and data models for all template types available in the system.
   * Only accessible by admin panel users and agent users with appropriate permissions.
   *
   * Tüm şablon tanımlarını JSON şemaları ve meta verileriyle getirir.
   * Bu tanımlar, sistemde mevcut tüm şablon türleri için yapı ve veri modellerini açıklar.
   * Sadece yönetici panel kullanıcıları ve uygun izinlere sahip acente kullanıcıları tarafından erişilebilir.
   *
   * @returns List of all template definitions
   */
  async getTemplateDefinitions(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetTemplateDefinitionsResult[]>> {
    return this.http.get<GetTemplateDefinitionsResult[]>(
      templates.getDefinitions,
      options,
    );
  }

  /**
   * Retrieves all available templates in the system with their metadata and content.
   * Only accessible by admin panel users and agent users with appropriate permissions.
   *
   * Sistemdeki tüm kullanılabilir şablonları meta verileri ve içerikleriyle getirir.
   * Sadece yönetici panel kullanıcıları ve uygun izinlere sahip acente kullanıcıları tarafından erişilebilir.
   *
   * @returns List of all templates with their details
   */
  async getAllTemplates(
    options?: RequestOptions,
  ): Promise<InsurUpResult<QueryTemplatesResult[]>> {
    return this.http.get<QueryTemplatesResult[]>(templates.getAll, options);
  }

  /**
   * Retrieves a specific template by its unique key for a particular language.
   * Returns the complete template including content and JSON schema for data validation.
   *
   * Belirli bir dil için benzersiz anahtarına göre belirli bir şablonu getirir.
   * Veri doğrulama için içerik ve JSON şeması dahil tam şablonu döndürür.
   *
   * @param key Unique identifier key of the template
   * @param languageId Language identifier for template localization
   * @returns Complete template information
   */
  async getTemplateByKey(
    key: string,
    languageId: number,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetTemplateByKeyResult>> {
    const endpoint = `${templates.getByKey.render(key)}?languageId=${languageId}`;
    return this.http.get<GetTemplateByKeyResult>(endpoint, options);
  }

  /**
   * Updates an existing template with new content, name, description, and localization settings.
   * Allows administrators to maintain and modify templates used throughout the insurance platform.
   *
   * Mevcut bir şablonu yeni içerik, ad, açıklama ve yerelleştirme ayarlarıyla günceller.
   * Yöneticilerin sigorta platformu boyunca kullanılan şablonları sürdürmesine ve değiştirmesine olanak tanır.
   *
   * @param request Template update request with new content and metadata
   * @returns Operation result
   */
  async updateTemplate(
    request: UpdateTemplateRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = templates.update.render(request.key);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Deletes a template owned by the current agent user.
   * Only agent users can delete templates they own. Templates with null AgentId or different AgentId cannot be deleted.
   *
   * Mevcut acente kullanıcısına ait bir şablonu siler.
   * Sadece acente kullanıcıları kendi şablonlarını silebilir. Null AgentId'ye sahip veya farklı AgentId'ye sahip şablonlar silinemez.
   *
   * @param request Template delete request with key and language ID
   * @returns Operation result
   */
  async deleteTemplate(
    request: DeleteTemplateRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = `${templates.delete.render(request.key)}?languageId=${request.languageId}`;
    return this.http.deleteNoContent(endpoint, options);
  }
}
