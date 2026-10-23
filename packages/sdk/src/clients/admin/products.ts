/**
 * @fileoverview Admin Products Client - Insurance product enablement, sync, installment options and proposal conditions
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateProductInstallmentOptionRequest,
  ProductInstallmentOption,
  ProductProposalCondition,
  ReplaceProductProposalConditionsRequest,
} from '@insurup/contracts';

/**
 * Operations on insurance products. The product list is read with `insurance.getAllProducts()`.
 *
 * Sigorta ürünleri üzerindeki işlemler. Ürün listesi `insurance.getAllProducts()` ile okunur.
 */
export class InsurUpAdminProductsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Enables a product, so agencies can quote and sell it again.
   *
   * Bir ürünü etkinleştirir; acenteler yeniden teklif alıp satabilir.
   *
   * @param productId Product id / Ürün kimliği
   */
  async enable(productId: number, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.products.enable.render(productId), { productId }, options);
  }

  /**
   * Disables a product, so no new proposals or policies use it. Existing policies are kept.
   *
   * Bir ürünü devre dışı bırakır; yeni teklif ve poliçelerde kullanılmaz. Mevcut poliçeler korunur.
   *
   * @param productId Product id / Ürün kimliği
   */
  async disable(productId: number, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.products.disable.render(productId),
      { productId },
      options
    );
  }

  /**
   * Pulls the product catalog from InsurGateway and updates the stored products.
   *
   * Ürün kataloğunu InsurGateway'den çeker ve kayıtlı ürünleri günceller.
   */
  async sync(options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.postNoContent(admin.products.sync, undefined, options);
  }

  /**
   * The installment options a product offers.
   *
   * Bir ürünün sunduğu taksit seçenekleri.
   *
   * @param productId Product id / Ürün kimliği
   */
  async getInstallmentOptions(
    productId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<ProductInstallmentOption[]>> {
    return this.http.get<ProductInstallmentOption[]>(
      admin.products.installmentOptions.render(productId),
      options
    );
  }

  /**
   * Adds an installment option to a product.
   *
   * Bir ürüne taksit seçeneği ekler.
   *
   * @param productId Product id / Ürün kimliği
   * @param request Installment count and payment option / Taksit sayısı ve ödeme seçeneği
   */
  async createInstallmentOption(
    productId: number,
    request: CreateProductInstallmentOptionRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      admin.products.installmentOptions.render(productId),
      { ...request, productId },
      options
    );
  }

  /**
   * Removes a product's installment option.
   *
   * Bir ürünün taksit seçeneğini kaldırır.
   *
   * @param productId Product id / Ürün kimliği
   * @param installmentNumber Installment count of the option to remove / Kaldırılacak seçeneğin taksit sayısı
   */
  async deleteInstallmentOption(
    productId: number,
    installmentNumber: number,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      admin.products.installmentOption.render(productId, installmentNumber),
      options
    );
  }

  /**
   * The proposal conditions configured for a product.
   *
   * Bir ürün için yapılandırılmış teklif koşulları.
   *
   * @param productId Product id / Ürün kimliği
   */
  async getProposalConditions(
    productId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<ProductProposalCondition[]>> {
    return this.http.get<ProductProposalCondition[]>(
      admin.products.proposalConditions.render(productId),
      options
    );
  }

  /**
   * Replaces every proposal condition of a product and returns the stored set.
   *
   * Bir ürünün tüm teklif koşullarını değiştirir ve kaydedilen kümeyi döndürür.
   *
   * @param productId Product id / Ürün kimliği
   * @param request The complete condition set / Koşulların tamamı
   */
  async replaceProposalConditions(
    productId: number,
    request: ReplaceProductProposalConditionsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ProductProposalCondition[]>> {
    return this.http.put<ProductProposalCondition[]>(
      admin.products.proposalConditions.render(productId),
      { ...request, productId },
      options
    );
  }
}
