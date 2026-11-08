/**
 * @fileoverview Admin InsurGateway Platform Catalogue Contracts - Which of the InsurGateway platform's products and
 * companies each catalogue entry is
 * @description Result and body types of the admin panel's `insurance-services/insurgateway-platform/*` endpoints. The
 * product list is read live from the platform's catalog (its Registry).
 */

/**
 * A product of the InsurGateway platform's catalog, as its Registry has it now, with the catalogue product mapped to it
 * and the major the mapping runs.
 *
 * InsurGateway platformu kataloğundaki, Registry'de şu an olduğu haliyle bir ürün; eşleştirilmiş katalog ürünü ve
 * eşleşmenin çalıştırdığı major sürümle.
 */
export interface InsurGatewayPlatformProduct {
  /** The platform's id of the product, such as `turkiye-sigorta-togg-kasko-proposal`. */
  readonly product: string;
  /** The product's highest major in the catalog, which a new mapping runs. */
  readonly major: number;
  /** The platform's id of the product's company, such as `turkiye-sigorta`. */
  readonly company: string;
  /** The platform operation the product implements, such as `kasko-proposal`. */
  readonly operation: string;
  /** The catalogue product mapped to it, or `null`. */
  readonly productId: number | null;
  /**
   * The major the mapping runs, or `null` when none is mapped or the mapping keeps none and runs the highest. One below
   * `major` keeps running until the product is mapped again.
   */
  readonly mappedMajor: number | null;
}

/**
 * A catalogue insurance company mapped to the InsurGateway platform's company, with the platform's credential key of
 * each connection value named otherwise. A value not named goes to the platform under its own key.
 *
 * InsurGateway platformundaki şirketle eşleştirilmiş bir katalog sigorta şirketi ve adı farklı olan her bağlantı
 * değerinin platformdaki kimlik bilgisi anahtarı. Adı geçmeyen değer platforma kendi anahtarıyla gider.
 */
export interface InsurGatewayPlatformInsuranceCompany {
  /** The catalogue insurance company's id. */
  readonly insuranceCompanyId: number;
  /** The platform's id of the company. */
  readonly company: string;
  /** The platform's credential key of each web service connection field named otherwise, by the field's key. */
  readonly connectionFields: Readonly<Record<string, string>>;
  /**
   * The platform's credential key of each robot login value named otherwise, by `username`, `password` or
   * `totpSecret`.
   */
  readonly robotLogin: Readonly<Record<string, string>>;
}

/**
 * Body of `admin.insurGatewayPlatform.mapInsuranceCompany`. The company must be one the platform's catalog has
 * products of; no two values may go under the same credential key.
 *
 * `admin.insurGatewayPlatform.mapInsuranceCompany` gövdesi. Şirket, platform kataloğunda ürünü olan bir şirket
 * olmalıdır; iki değer aynı kimlik bilgisi anahtarına gidemez.
 */
export interface MapInsurGatewayPlatformInsuranceCompanyRequest {
  /** The platform's id of the company, such as `turkiye-sigorta`. */
  readonly company: string;
  /**
   * The platform's credential key of each web service connection field named otherwise, by the field's key; a field
   * not named goes under its own key.
   */
  readonly connectionFields: Readonly<Record<string, string>>;
  /**
   * The platform's credential key of each robot login value named otherwise, by `username`, `password` or
   * `totpSecret`; a value not named goes under its own key.
   */
  readonly robotLogin: Readonly<Record<string, string>>;
}
