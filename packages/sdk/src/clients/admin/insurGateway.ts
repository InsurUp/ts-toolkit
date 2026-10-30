/**
 * @fileoverview Admin InsurGateway Client - Mapping the catalogue's products and companies to InsurGateway's
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type { InsurGatewayInsuranceCompany, InsurGatewayProduct } from '@insurup/contracts';

/**
 * Which of InsurGateway's products and insurance companies each catalogue product and company is. InsurGateway quotes
 * and sells only the catalogue products mapped to one of its products.
 *
 * Her katalog ürününün ve şirketinin InsurGateway'deki hangi ürün ve şirket olduğu. InsurGateway yalnızca kendi
 * ürünlerinden biriyle eşleştirilmiş katalog ürünleri için teklif verir ve satar.
 */
export class InsurUpAdminInsurGatewayClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * The products InsurGateway sells now, read live from InsurGateway, each with the catalogue product mapped to it.
   *
   * InsurGateway'in şu an sattığı ürünler; InsurGateway'den canlı okunur, her biri eşleştirilmiş katalog ürünüyle.
   */
  async getProducts(options?: RequestOptions): Promise<InsurUpResult<InsurGatewayProduct[]>> {
    return this.http.get<InsurGatewayProduct[]>(admin.insurGateway.products, options);
  }

  /**
   * The insurance companies InsurGateway has now, read live from InsurGateway, each with the catalogue company mapped
   * to it.
   *
   * InsurGateway'de şu an bulunan sigorta şirketleri; InsurGateway'den canlı okunur, her biri eşleştirilmiş katalog
   * şirketiyle.
   */
  async getInsuranceCompanies(
    options?: RequestOptions
  ): Promise<InsurUpResult<InsurGatewayInsuranceCompany[]>> {
    return this.http.get<InsurGatewayInsuranceCompany[]>(
      admin.insurGateway.insuranceCompanies,
      options
    );
  }

  /**
   * Maps a catalogue product to one of InsurGateway's products, or moves its mapping there. The product's company must
   * be mapped to the InsurGateway company the InsurGateway product belongs to, and no other product may be mapped to
   * that InsurGateway product.
   *
   * Bir katalog ürününü InsurGateway'deki bir ürünle eşleştirir ya da eşleşmesini oraya taşır. Ürünün şirketi,
   * InsurGateway ürününün ait olduğu InsurGateway şirketiyle eşleştirilmiş olmalı ve o InsurGateway ürünüyle başka
   * ürün eşleştirilmemiş olmalıdır.
   *
   * @param productId Catalogue product id / Katalog ürün kimliği
   * @param insurGatewayProductId InsurGateway's id of the product / Ürünün InsurGateway kimliği
   */
  async mapProduct(
    productId: number,
    insurGatewayProductId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insurGateway.productMapping.render(productId),
      { productId, insurGatewayProductId },
      options
    );
  }

  /**
   * Removes a catalogue product's InsurGateway mapping, and with it InsurGateway's record of the product, its
   * proposal conditions included. InsurGateway no longer quotes it.
   *
   * Bir katalog ürününün InsurGateway eşleşmesini ve onunla birlikte InsurGateway'in ürün kaydını (teklif koşulları
   * dahil) kaldırır. InsurGateway artık ürün için teklif vermez.
   *
   * @param productId Catalogue product id / Katalog ürün kimliği
   */
  async unmapProduct(productId: number, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.insurGateway.productMapping.render(productId), options);
  }

  /**
   * Maps a catalogue insurance company to one of InsurGateway's companies, or moves its mapping there. A company
   * mapped for the first time has no connection fields on InsurGateway's side yet: save each of them again to name its
   * InsurGateway field.
   *
   * Bir katalog sigorta şirketini InsurGateway'deki bir şirketle eşleştirir ya da eşleşmesini oraya taşır. İlk kez
   * eşleştirilen şirketin InsurGateway tarafında henüz bağlantı alanı yoktur: her birinin InsurGateway alanını
   * belirtmek için alanları yeniden kaydedin.
   *
   * @param insuranceCompanyId Catalogue insurance company id / Katalog sigorta şirketi kimliği
   * @param insurGatewayCompanyId InsurGateway's id of the company / Şirketin InsurGateway kimliği
   */
  async mapInsuranceCompany(
    insuranceCompanyId: number,
    insurGatewayCompanyId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insurGateway.insuranceCompanyMapping.render(insuranceCompanyId),
      { insuranceCompanyId, insurGatewayCompanyId },
      options
    );
  }
}
