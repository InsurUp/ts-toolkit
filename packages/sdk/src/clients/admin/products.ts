/**
 * @fileoverview Admin Products Client - The catalogue's products: adding, renaming, enablement, sync, installment
 * options and proposal conditions
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CreateInsuranceProductRequest,
  CreateProductInstallmentOptionRequest,
  InsuranceProduct,
  ProductInstallmentOption,
  ProductProposalCondition,
  ReplaceProductProposalConditionsRequest,
  UpdateInsuranceProductRequest,
} from '@insurup/contracts';

/**
 * Operations on the catalogue's insurance products. The product list is read with `insurance.getAllProducts()`.
 *
 * Kataloğun sigorta ürünleri üzerindeki işlemler. Ürün listesi `insurance.getAllProducts()` ile okunur.
 */
export class InsurUpAdminProductsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Adds a product to the catalogue and returns it. Its insurance company, branch and type are fixed from then on, and
   * no provider quotes it until it is mapped to one of the provider's products.
   *
   * Kataloğa bir ürün ekler ve onu döndürür. Sigorta şirketi, branşı ve tipi bundan sonra değişmez; bir sağlayıcının
   * ürünüyle eşleştirilene kadar hiçbir sağlayıcı teklif vermez.
   *
   * @param request The product / Ürün
   */
  async create(
    request: CreateInsuranceProductRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceProduct>> {
    return this.http.post<InsuranceProduct>(admin.products.create, request, options);
  }

  /**
   * Renames a product or changes its code; the providers it is mapped to get the change.
   *
   * Bir ürünün adını veya kodunu değiştirir; eşleştirildiği sağlayıcılar değişikliği alır.
   *
   * @param productId Product id / Ürün kimliği
   * @param request The new name and code / Yeni ad ve kod
   */
  async update(
    productId: number,
    request: UpdateInsuranceProductRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.products.byId.render(productId),
      { ...request, productId },
      options
    );
  }

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
   * Has every provider bring its own data about the catalogue up to date now, such as InsurGateway's robot products.
   * The catalogue itself changes only through `create`, `update` and the enablement calls: a sync never adds a product.
   *
   * Her sağlayıcının katalog hakkındaki kendi verisini (InsurGateway'in robot ürünleri gibi) hemen güncellemesini
   * sağlar. Kataloğun kendisi yalnızca `create`, `update` ve etkinleştirme çağrılarıyla değişir: senkronizasyon ürün
   * eklemez.
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
