/**
 * @fileoverview Admin Subscription Plans Client - The subscription plan catalogue
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateSubscriptionPlanRequest,
  SubscriptionPlan,
  UpdateSubscriptionPlanRequest,
} from '@insurup/contracts';

/**
 * The subscription plan catalogue: the plans agencies subscribe to, with their prices, limits, modules,
 * features and insurance branches.
 *
 * Abonelik planı kataloğu: acentelerin abone olduğu planlar; fiyatları, limitleri, modülleri, özellikleri
 * ve sigorta branşlarıyla.
 */
export class InsurUpAdminSubscriptionPlansClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Lists every subscription plan, names localized for the request language. The endpoint is public
   * and cached for up to five minutes.
   *
   * Tüm abonelik planlarını, adları istek diline göre yerelleştirilmiş olarak listeler. Uç nokta herkese
   * açıktır ve en fazla beş dakika önbelleğe alınır.
   */
  async getAll(options?: RequestOptions): Promise<InsurUpResult<SubscriptionPlan[]>> {
    return this.http.get<SubscriptionPlan[]>(admin.subscriptionPlans.getAll, options);
  }

  /**
   * Reads one subscription plan, uncached.
   *
   * Tek bir abonelik planını önbelleksiz okur.
   *
   * @param subscriptionPlanId Plan id / Plan kimliği
   */
  async getById(
    subscriptionPlanId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<SubscriptionPlan>> {
    return this.http.get<SubscriptionPlan>(
      admin.subscriptionPlans.byId.render(subscriptionPlanId),
      options
    );
  }

  /**
   * Creates a subscription plan under the id the request names.
   *
   * İstekte verilen kimlikle bir abonelik planı oluşturur.
   *
   * @param request The plan definition / Plan tanımı
   * @returns The created plan's id / Oluşturulan planın kimliği
   */
  async create(
    request: CreateSubscriptionPlanRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<number>> {
    return this.http.post<number>(admin.subscriptionPlans.create, request, options);
  }

  /**
   * Replaces a subscription plan's definition in full; agencies see the change within about a minute.
   *
   * Bir abonelik planının tanımını bütünüyle değiştirir; acenteler değişikliği yaklaşık bir dakika içinde
   * görür.
   *
   * @param subscriptionPlanId Plan id / Plan kimliği
   * @param request The new plan definition / Yeni plan tanımı
   */
  async update(
    subscriptionPlanId: number,
    request: UpdateSubscriptionPlanRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.subscriptionPlans.byId.render(subscriptionPlanId),
      request,
      options
    );
  }
}
