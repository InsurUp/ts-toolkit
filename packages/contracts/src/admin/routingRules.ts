/**
 * @fileoverview Admin Routing Rules Contracts - Which insurance service provider each operation goes to
 * @description Request/result types of the admin panel's `insurance-services/routing-rules` endpoints.
 */

import type { ProductBranch } from '../common.js';

/**
 * What a routing rule routes. Proposals and policy documents are routed per product, policy transfers per company,
 * the lookups and lists once per call.
 *
 * Bir yönlendirme kuralının yönlendirdiği işlem. Teklifler ve poliçe dokümanları ürün başına, poliçe aktarımları
 * şirket başına, sorgular ve listeler çağrı başına yönlendirilir.
 */
export enum InsuranceOperation {
  /**
   * Proposals, per product; the product's coverage choices follow it. Purchases and proposal documents go to the
   * provider that quoted the product, not by this rule.
   * Ürün başına teklifler; ürünün teminat seçenekleri de bunu izler.
   */
  Proposal = 'PROPOSAL',
  /**
   * Policy and receipt documents of policies InsurUp did not issue, per product.
   * InsurUp'ın kesmediği poliçelerin poliçe ve makbuz dokümanları, ürün başına.
   */
  PolicyDocument = 'POLICY_DOCUMENT',
  /**
   * Fetching policies from insurance companies and reading their policy files, per company.
   * Sigorta şirketlerinden poliçe çekme ve poliçe dosyalarını okuma, şirket başına.
   */
  PolicyTransfer = 'POLICY_TRANSFER',
  /**
   * Looking a customer up by identity or tax number.
   * Kimlik veya vergi numarasıyla müşteri sorgulama.
   */
  CustomerLookup = 'CUSTOMER_LOOKUP',
  /**
   * Looking a vehicle up by plate and registration.
   * Plaka ve ruhsatla araç sorgulama.
   */
  VehicleLookup = 'VEHICLE_LOOKUP',
  /**
   * The vehicle brand and model lists.
   * Araç marka ve model listeleri.
   */
  VehicleParameters = 'VEHICLE_PARAMETERS',
  /**
   * Resolving a property by its UAVT number and reading the addresses a company holds for a customer.
   * UAVT numarasıyla konut çözme ve müşterinin şirketteki adreslerini okuma.
   */
  AddressLookup = 'ADDRESS_LOOKUP',
  /**
   * The city, district, town, neighbourhood, street, building and apartment lists.
   * İl, ilçe, belde, mahalle, sokak, bina ve daire listeleri.
   */
  AddressParameters = 'ADDRESS_PARAMETERS',
  /**
   * Looking up an earlier DASK policy.
   * Önceki DASK poliçesini sorgulama.
   */
  DaskOldPolicy = 'DASK_OLD_POLICY',
}

/**
 * A system InsurUp reaches insurance companies through. Routing rules pick one for each product and each lookup.
 *
 * InsurUp'ın sigorta şirketlerine ulaştığı sistem. Yönlendirme kuralları her ürün ve her sorgu için birini seçer.
 */
export enum InsuranceServiceProvider {
  /**
   * The legacy InsurGateway aggregator.
   * Eski InsurGateway.
   */
  InsurGateway = 'INSUR_GATEWAY',
}

/**
 * A routing rule: the provider an operation goes to for the calls the rule applies to. Of the rules that apply to a
 * call, the most specific wins: a product over a company, a company over a branch, a branch over agents only; naming
 * agents over not. When no rule applies, the call goes to InsurGateway.
 *
 * Bir yönlendirme kuralı: bir işlemin, kuralın kapsadığı çağrılarda gittiği sağlayıcı. Bir çağrıya uyan kurallardan en
 * özeli kazanır: ürün şirketten, şirket branştan, branş yalnız acenteden; acente adlandıran adlandırmayandan. Hiçbir
 * kural uymazsa çağrı InsurGateway'e gider.
 */
export interface RoutingRule {
  /** The rule's id. */
  readonly id: string;
  /** The operation the rule routes. */
  readonly operation: InsuranceOperation;
  /** The catalogue insurance company the rule applies to; `null` for every one. */
  readonly insuranceCompanyId: number | null;
  /** The branch the rule applies to; `null` for every one. */
  readonly productBranch: ProductBranch | null;
  /** The catalogue product the rule applies to; `null` for every one. */
  readonly productId: number | null;
  /** The agents the rule applies to; empty for every agent. */
  readonly agentIds: readonly string[];
  /** The provider the rule routes to. */
  readonly provider: InsuranceServiceProvider;
  /** For an operation run against an insurance company, such as a lookup, the company it is run against. */
  readonly executionInsuranceCompanyId: number | null;
  /** Whether the rule has no scope: the operation's default, which can be changed but not deleted. */
  readonly isDefault: boolean;
}

/**
 * Body of `admin.routingRules.create`. Refused when another rule of the operation has the same scope, or the provider
 * can't run the operation.
 *
 * `admin.routingRules.create` gövdesi. İşlemin aynı kapsamda başka bir kuralı varsa ya da sağlayıcı işlemi
 * çalıştıramıyorsa reddedilir.
 */
export interface CreateRoutingRuleRequest {
  /** The operation the rule routes. */
  readonly operation: InsuranceOperation;
  /** The catalogue insurance company the rule applies to; omitted or `null` for every one. */
  readonly insuranceCompanyId?: number | null;
  /** The branch the rule applies to; omitted or `null` for every one. */
  readonly productBranch?: ProductBranch | null;
  /** The catalogue product the rule applies to; omitted or `null` for every one. */
  readonly productId?: number | null;
  /** The agents the rule applies to; omitted or empty for every agent. */
  readonly agentIds?: readonly string[];
  /** The provider the rule routes to. */
  readonly provider: InsuranceServiceProvider;
  /** For an operation run against an insurance company, such as a lookup, the company it is run against. */
  readonly executionInsuranceCompanyId?: number | null;
}

/**
 * Body of `admin.routingRules.update`: the rule's new scope and provider; its operation stays, and an operation's
 * default rule keeps having no scope. Every property overwrites the stored one. The rule comes from the method's `id`
 * argument, which the SDK also writes into the body.
 *
 * `admin.routingRules.update` gövdesi: kuralın yeni kapsamı ve sağlayıcısı; işlemi aynı kalır, işlemin varsayılan
 * kuralı kapsamsız kalır. Her özellik kayıtlı olanın üzerine yazılır. Kural, metodun `id` argümanından gelir; SDK onu
 * gövdeye de yazar.
 */
export interface UpdateRoutingRuleRequest {
  /** The catalogue insurance company the rule applies to; omitted or `null` for every one. */
  readonly insuranceCompanyId?: number | null;
  /** The branch the rule applies to; omitted or `null` for every one. */
  readonly productBranch?: ProductBranch | null;
  /** The catalogue product the rule applies to; omitted or `null` for every one. */
  readonly productId?: number | null;
  /** The agents the rule applies to; omitted or empty for every agent. */
  readonly agentIds?: readonly string[];
  /** The provider the rule routes to. */
  readonly provider: InsuranceServiceProvider;
  /** For an operation run against an insurance company, such as a lookup, the company it is run against. */
  readonly executionInsuranceCompanyId?: number | null;
}
