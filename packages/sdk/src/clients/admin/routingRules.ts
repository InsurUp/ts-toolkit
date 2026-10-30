/**
 * @fileoverview Admin Routing Rules Client - Which insurance service provider each operation goes to
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateRoutingRuleRequest,
  RoutingRule,
  UpdateRoutingRuleRequest,
} from '@insurup/contracts';

/**
 * The routing rules that pick the insurance service provider of each operation: one default per operation, plus rules
 * scoped by product, company (and branch) and agents.
 *
 * Her işlemin sigorta servis sağlayıcısını seçen yönlendirme kuralları: işlem başına bir varsayılan, ayrıca ürün,
 * şirket (ve branş) ve acenteye göre kapsamlanmış kurallar.
 */
export class InsurUpAdminRoutingRulesClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Every routing rule, the operations' defaults included.
   *
   * Tüm yönlendirme kuralları, işlemlerin varsayılanları dahil.
   */
  async getAll(options?: RequestOptions): Promise<InsurUpResult<RoutingRule[]>> {
    return this.http.get<RoutingRule[]>(admin.routingRules.all, options);
  }

  /**
   * Adds a rule and returns it. Refused when another rule of the operation has the same scope, or the provider can't
   * run the operation.
   *
   * Bir kural ekler ve onu döndürür. İşlemin aynı kapsamda başka bir kuralı varsa ya da sağlayıcı işlemi
   * çalıştıramıyorsa reddedilir.
   *
   * @param request The rule / Kural
   */
  async create(
    request: CreateRoutingRuleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<RoutingRule>> {
    return this.http.post<RoutingRule>(admin.routingRules.all, request, options);
  }

  /**
   * Changes a rule's scope and provider and returns it; its operation stays.
   *
   * Bir kuralın kapsamını ve sağlayıcısını değiştirir ve onu döndürür; işlemi aynı kalır.
   *
   * @param id Rule id / Kural kimliği
   * @param request The rule's new scope and provider / Kuralın yeni kapsamı ve sağlayıcısı
   */
  async update(
    id: string,
    request: UpdateRoutingRuleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<RoutingRule>> {
    return this.http.put<RoutingRule>(
      admin.routingRules.byId.render(id),
      { ...request, id },
      options
    );
  }

  /**
   * Deletes a rule. An operation's default rule can't be deleted, only given another provider.
   *
   * Bir kuralı siler. Bir işlemin varsayılan kuralı silinemez, yalnızca sağlayıcısı değiştirilebilir.
   *
   * @param id Rule id / Kural kimliği
   */
  async delete(id: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.routingRules.byId.render(id), options);
  }
}
