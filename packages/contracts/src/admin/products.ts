/**
 * @fileoverview Admin Products Contracts - Installment options and proposal conditions of insurance products
 * @description Request/result types of the admin panel's `products/*` endpoints. The product list itself
 * is `InsuranceProduct`, read with `insurance.getAllProducts()`.
 */

import type { PaymentOption } from '../common.js';

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
