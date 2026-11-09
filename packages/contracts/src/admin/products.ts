/**
 * @fileoverview Admin Products Contracts - The catalogue's products, their installment options and proposal conditions
 * @description Request/result types of the admin panel's `products/*` endpoints. The product list itself
 * is `InsuranceProduct`, read with `insurance.getAllProducts()`.
 */

import type { InsuranceProductType, PaymentOption, ProductBranch } from '../common.js';

/**
 * Body of `admin.products.create`: a product added to the catalogue by hand. Its insurance company, branch and type
 * are fixed once it is created. Until it is mapped to a provider's product (`admin.insurGateway.mapProduct`), no
 * provider quotes or sells it.
 *
 * `admin.products.create` gövdesi: kataloğa elle eklenen ürün. Sigorta şirketi, branşı ve tipi oluşturulunca
 * değişmez. Bir sağlayıcının ürünüyle eşleştirilene kadar (`admin.insurGateway.mapProduct`) hiçbir sağlayıcı teklif
 * vermez, satmaz.
 */
export interface CreateInsuranceProductRequest {
  /** The id to give it; omitted, the next free id from 100000 up. */
  readonly id?: number | null;
  /** Display name of the product. */
  readonly name: string;
  /** The catalogue insurance company the product belongs to. */
  readonly insuranceCompanyId: number;
  /** The branch the product is in. */
  readonly productBranch: ProductBranch;
  /** Web service or robot. */
  readonly type: InsuranceProductType;
  /** Whether agencies can quote and sell it. Defaults to `false`. */
  readonly enabled?: boolean;
  /** The insurance company's own code for the product, or `null`. */
  readonly code?: string | null;
}

/**
 * Body of `admin.products.update`. Only the name and the code change: a product's insurance company, branch and type
 * are fixed when it is created. The product comes from the method's `productId` argument, which the SDK also writes
 * into the body.
 *
 * `admin.products.update` gövdesi. Yalnızca ad ve kod değişir: ürünün sigorta şirketi, branşı ve tipi oluşturulurken
 * belirlenir. Ürün, metodun `productId` argümanından gelir; SDK onu gövdeye de yazar.
 */
export interface UpdateInsuranceProductRequest {
  /** Display name of the product. */
  readonly name: string;
  /** The insurance company's own code for the product, or `null` for none. */
  readonly code?: string | null;
}

/**
 * An installment plan a product offers: how many installments, paid with which payment option.
 *
 * Bir ürünün sunduğu taksit seçeneği: kaç taksit, hangi ödeme seçeneğiyle.
 */
export interface ProductInstallmentOption {
  /** Product the option belongs to. */
  readonly productId: number;
  /** Number of installments (1 = single payment). */
  readonly installmentNumber: number;
  /** Payment option the installments are paid with. */
  readonly paymentType: PaymentOption;
}

/**
 * Body of `admin.products.createInstallmentOption`. The product comes from the method's `productId`
 * argument, which the SDK also writes into the body.
 *
 * `admin.products.createInstallmentOption` gövdesi. Ürün, metodun `productId` argümanından gelir; SDK onu
 * gövdeye de yazar.
 */
export interface CreateProductInstallmentOptionRequest {
  /** Number of installments (1 = single payment). */
  readonly installmentNumber: number;
  /** Payment option the installments are paid with. */
  readonly paymentType: PaymentOption;
}

/**
 * How a proposal condition compares the InsurGateway value with the configured one. Sent and returned as
 * a number.
 *
 * Teklif koşulunun InsurGateway değerini yapılandırılan değerle nasıl karşılaştırdığı. Sayı olarak
 * gönderilir ve döner.
 */
export enum ProductProposalConditionOperator {
  Equals = 1,
  NotEquals = 2,
}

/**
 * A rule evaluated while a proposal is created for the product: it compares a value InsurGateway collected
 * under `key` with `value`.
 *
 * Ürün için teklif oluşturulurken değerlendirilen kural: InsurGateway'in `key` altında topladığı değeri
 * `value` ile karşılaştırır.
 */
export interface ProductProposalCondition {
  /** Numeric InsurGateway key the condition reads. */
  readonly key: number;
  /** How the collected value is compared with `value`. */
  readonly operator: ProductProposalConditionOperator;
  /** Value to compare with; `null` checks only that the key is present. */
  readonly value: string | null;
}

/**
 * Body of `admin.products.replaceProposalConditions`: the complete set of conditions the product keeps.
 * The product comes from the method's `productId` argument, which the SDK also writes into the body.
 *
 * `admin.products.replaceProposalConditions` gövdesi: ürünün tutacağı koşulların tamamı. Ürün, metodun
 * `productId` argümanından gelir; SDK onu gövdeye de yazar.
 */
export interface ReplaceProductProposalConditionsRequest {
  /** Every condition the product keeps; conditions left out are removed. */
  readonly conditions: readonly ProductProposalCondition[];
}
