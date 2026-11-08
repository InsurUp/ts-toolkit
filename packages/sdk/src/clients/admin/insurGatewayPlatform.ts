/**
 * @fileoverview Admin InsurGateway Platform Client - Mapping the catalogue's products and companies to the InsurGateway
 * platform's
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  InsurGatewayPlatformInsuranceCompany,
  InsurGatewayPlatformProduct,
  MapInsurGatewayPlatformInsuranceCompanyRequest,
} from '@insurup/contracts';

/**
 * Which of the InsurGateway platform's products and companies each catalogue product and company is. The platform
 * quotes only the catalogue products mapped to one of its products, once a routing rule sends them to
 * `INSUR_GATEWAY_PLATFORM`.
 *
 * Her katalog ürününün ve şirketinin InsurGateway platformundaki hangi ürün ve şirket olduğu. Platform yalnızca kendi
 * ürünlerinden biriyle eşleştirilmiş katalog ürünleri için, bir yönlendirme kuralı onları `INSUR_GATEWAY_PLATFORM`'a
 * gönderdiğinde teklif alır.
 */
export class InsurUpAdminInsurGatewayPlatformClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * The platform's products of every branch InsurUp quotes, read live from its catalog, each with the catalogue product
   * mapped to it and the major the mapping runs.
   *
   * InsurUp'ın teklif aldığı her branştaki platform ürünleri; kataloğundan canlı okunur, her biri eşleştirilmiş katalog
   * ürünü ve eşleşmenin çalıştırdığı major sürümle.
   */
  async getProducts(
    options?: RequestOptions
  ): Promise<InsurUpResult<InsurGatewayPlatformProduct[]>> {
    return this.http.get<InsurGatewayPlatformProduct[]>(
      admin.insurGatewayPlatform.products,
      options
    );
  }

  /**
   * The catalogue insurance companies mapped to the platform, each with the platform's keys of its connection values.
   *
   * Platformla eşleştirilmiş katalog sigorta şirketleri; her biri bağlantı değerlerinin platformdaki anahtarlarıyla.
   */
  async getInsuranceCompanies(
    options?: RequestOptions
  ): Promise<InsurUpResult<InsurGatewayPlatformInsuranceCompany[]>> {
    return this.http.get<InsurGatewayPlatformInsuranceCompany[]>(
      admin.insurGatewayPlatform.insuranceCompanies,
      options
    );
  }

  /**
   * Maps a catalogue product to one of the platform's products at a major, or moves its mapping there. The mapping
   * keeps the major, the product's highest when none is given, until the product is mapped again. The two must be of
   * the same branch, the product's company must be mapped to the platform product's company, and no other product may
   * be mapped to that platform product.
   *
   * Bir katalog ürününü platformun bir ürünüyle bir major sürümde eşleştirir ya da eşleşmesini oraya taşır. Eşleşme
   * major sürümü, verilmezse ürünün en yüksek major sürümünü, ürün yeniden eşleştirilene kadar tutar. İkisi aynı
   * branşta olmalı, ürünün şirketi platform ürününün şirketiyle eşleştirilmiş olmalı ve o platform ürünüyle başka ürün
   * eşleştirilmemiş olmalıdır.
   *
   * @param productId Catalogue product id / Katalog ürün kimliği
   * @param product The platform's id of the product / Ürünün platformdaki kimliği
   * @param major The major to run, which the catalog must have; omitted: its highest now / Çalıştırılacak major sürüm,
   * katalogda olmalı; verilmezse şu anki en yüksek
   */
  async mapProduct(
    productId: number,
    product: string,
    major?: number | null,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insurGatewayPlatform.productMapping.render(productId),
      { productId, product, major: major ?? null },
      options
    );
  }

  /**
   * Removes a catalogue product's platform mapping: the platform no longer quotes it.
   *
   * Bir katalog ürününün platform eşleşmesini kaldırır: platform artık ürün için teklif almaz.
   *
   * @param productId Catalogue product id / Katalog ürün kimliği
   */
  async unmapProduct(productId: number, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      admin.insurGatewayPlatform.productMapping.render(productId),
      options
    );
  }

  /**
   * Maps a catalogue insurance company to the platform's company, or changes its mapping. An agent's connection gives
   * its values to the platform under their own keys, but for those renamed here: a web service connection's fields by
   * `connectionFields`, a robot connection's login by `robotLogin`.
   *
   * Bir katalog sigorta şirketini platformdaki şirketle eşleştirir ya da eşleşmesini değiştirir. Acente bağlantısındaki
   * değerler platforma kendi anahtarlarıyla gider; burada yeniden adlandırılanlar hariç.
   *
   * @param insuranceCompanyId Catalogue insurance company id / Katalog sigorta şirketi kimliği
   * @param request The platform company and the renamed keys / Platform şirketi ve yeniden adlandırılan anahtarlar
   */
  async mapInsuranceCompany(
    insuranceCompanyId: number,
    request: MapInsurGatewayPlatformInsuranceCompanyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      admin.insurGatewayPlatform.insuranceCompanyMapping.render(insuranceCompanyId),
      { insuranceCompanyId, ...request },
      options
    );
  }

  /**
   * Removes a catalogue insurance company's platform mapping. Refused (ResourceInvalidState) while any of the company's
   * products is still mapped to the platform: unmap them first.
   *
   * Bir katalog sigorta şirketinin platform eşleşmesini kaldırır. Şirketin platformla eşleştirilmiş ürünü varken
   * reddedilir: önce onların eşleşmesini kaldırın.
   *
   * @param insuranceCompanyId Catalogue insurance company id / Katalog sigorta şirketi kimliği
   */
  async unmapInsuranceCompany(
    insuranceCompanyId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(
      admin.insurGatewayPlatform.insuranceCompanyMapping.render(insuranceCompanyId),
      options
    );
  }
}
