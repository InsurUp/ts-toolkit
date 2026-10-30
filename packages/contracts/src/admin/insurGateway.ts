/**
 * @fileoverview Admin InsurGateway Catalogue Contracts - Which of InsurGateway's products and companies each catalogue
 * entry is
 * @description Result types of the admin panel's `insurance-services/insurgateway/*` endpoints. The lists are read live
 * from InsurGateway.
 */

import type { InsuranceProductType, ProductBranch } from '../common.js';

/**
 * A product InsurGateway sells now, with the catalogue product mapped to it and the catalogue insurance company mapped
 * to its InsurGateway company, if any.
 *
 * InsurGateway'in şu an sattığı bir ürün; varsa onunla eşleştirilmiş katalog ürünü ve InsurGateway şirketiyle
 * eşleştirilmiş katalog sigorta şirketi.
 */
export interface InsurGatewayProduct {
  /** InsurGateway's id of the product. */
  readonly insurGatewayProductId: number;
  /** InsurGateway's name of the product. */
  readonly name: string;
  /** InsurGateway's id of the product's insurance company. */
  readonly insurGatewayCompanyId: number;
  /** The branch the product is in. */
  readonly productBranch: ProductBranch;
  /** The insurance company's own code for the product, or `null`. */
  readonly code: string | null;
  /** Web service or robot. */
  readonly type: InsuranceProductType;
  /** The catalogue product mapped to it, or `null`. */
  readonly productId: number | null;
  /** The catalogue insurance company mapped to its InsurGateway company, or `null`. */
  readonly insuranceCompanyId: number | null;
}

/**
 * An insurance company InsurGateway has now, with the catalogue insurance company mapped to it, if any.
 *
 * InsurGateway'de şu an bulunan bir sigorta şirketi ve varsa onunla eşleştirilmiş katalog sigorta şirketi.
 */
export interface InsurGatewayInsuranceCompany {
  /** InsurGateway's id of the company. */
  readonly insurGatewayCompanyId: number;
  /** InsurGateway's name of the company. */
  readonly name: string;
  /** The catalogue insurance company mapped to it, or `null`. */
  readonly insuranceCompanyId: number | null;
}
