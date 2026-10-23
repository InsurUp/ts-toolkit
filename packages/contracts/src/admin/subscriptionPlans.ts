/**
 * @fileoverview Admin subscription plan contracts - The plan catalogue, its modules and features
 * @description Request/result types of `subscription-plans` and the module/feature sets plans and agent
 * subscriptions carry
 */

import type { ProductBranch } from '../common.js';

/**
 * A sellable capability module bound to an agent subscription. An agent's effective modules are its
 * subscription's module override when set, otherwise its plan's modules. Core capabilities (dashboard,
 * settings, user and role management, profile) are not modules and are always available.
 *
 * Acente aboneliğine bağlı satılabilir yetenek modülü. Bir acentenin efektif modülleri, varsa
 * aboneliğindeki modül override'ı, yoksa planının modülleridir. Çekirdek yetenekler (pano, ayarlar,
 * kullanıcı ve rol yönetimi, profil) modül değildir ve her zaman açıktır.
 */
export enum Module {
  /** Cases (talepler). */
  Case = 'CASE',
  /** Customers. A set holding Proposal or Policy must also hold Customer. */
  Customer = 'CUSTOMER',
  /** OAuth clients. */
  OAuth = 'OAUTH',
  /** Policies. */
  Policy = 'POLICY',
  /** Proposals. */
  Proposal = 'PROPOSAL',
  /** Templates. */
  Template = 'TEMPLATE',
  /** Webhooks. */
  Webhook = 'WEBHOOK',
  /** The AI assistant. */
  Assistant = 'ASSISTANT',
}

/**
 * A sellable fine-grained feature bound to an agent subscription. A feature gates a single behaviour
 * inside a module rather than a whole capability area.
 *
 * Acente aboneliğine bağlı satılabilir ince taneli özellik. Bir özellik, bütün bir yetenek alanı yerine
 * modül içindeki tek bir davranışı sınırlar.
 */
export enum Feature {
  /** Business-to-consumer (B2C) sales. */
  B2C = 'B2C',
  /** Automated case communication. */
  CaseCommunicationAutomation = 'CASE_COMMUNICATION_AUTOMATION',
  /** Case priority rules. */
  CasePriority = 'CASE_PRIORITY',
  /** Call center. */
  Callcenter = 'CALLCENTER',
  /** The agency's own SMS provider. */
  CustomSmsProvider = 'CUSTOM_SMS_PROVIDER',
  /** The agency's own e-mail provider. */
  CustomEmailProvider = 'CUSTOM_EMAIL_PROVIDER',
  /** The agency's own 3-D Secure provider. */
  ThreeDSecureProvider = 'THREE_D_SECURE_PROVIDER',
  /** İYS (message permission system) integration. */
  Iys = 'IYS',
  /** Automatic case representative assignments. */
  AutoCaseRepresentativeAssignments = 'AUTO_CASE_REPRESENTATIVE_ASSIGNMENTS',
  /** Data masking. */
  DataMasking = 'DATA_MASKING',
  /** Table export. */
  TableExport = 'TABLE_EXPORT',
  /** Policy transfer. */
  Transfer = 'TRANSFER',
}

/**
 * A subscription plan of the admin-managed catalogue: its prices, default limits, and the modules,
 * features and insurance branches agents on it can use.
 *
 * Yönetici tarafından yönetilen katalogdaki bir abonelik planı: fiyatları, varsayılan limitleri ve bu
 * plandaki acentelerin kullanabileceği modüller, özellikler ve sigorta branşları.
 */
export interface SubscriptionPlan {
  /** Stable small-integer plan id that agent subscriptions reference. */
  readonly id: number;
  /** Display name, resolved for the request language (`Accept-Language`); the raw key when untranslated. */
  readonly name: string;
  /** Resource key whose per-language values hold the display name. */
  readonly nameResourceKey: string;
  /** Display description, resolved for the request language; null when the plan has none. */
  readonly description: string | null;
  /** Resource key whose per-language values hold the description; null when none is set. */
  readonly descriptionResourceKey: string | null;
  /** Default cap on agent users; null means unlimited. */
  readonly userLimit: number | null;
  /** Default cap on connected insurance companies; null means unlimited. */
  readonly insuranceCompanyLimit: number | null;
  /** Monthly proposal quota; null means unlimited. */
  readonly proposalLimit: number | null;
  /** Monthly purchased-proposal quota; null means unlimited. */
  readonly purchaseProposalLimit: number | null;
  /** Fixed monthly base price, net of VAT. */
  readonly basePrice: number;
  /** Monthly price per licensed user, net of VAT. */
  readonly pricePerUser: number;
  /** Monthly price per connected insurance company, net of VAT. */
  readonly pricePerInsuranceCompany: number;
  /** Modules included in the plan. */
  readonly modules: readonly Module[];
  /** Features included in the plan. */
  readonly features: readonly Feature[];
  /** Insurance branches agents on the plan can create proposals in. */
  readonly supportedBranches: readonly ProductBranch[];
}

/**
 * Replaces a subscription plan's definition in full: every field takes the value sent, so an omitted
 * optional limit becomes unlimited. Changes reach agents within the entitlement cache window (≤ 60 s).
 *
 * Bir abonelik planının tanımını bütünüyle değiştirir: her alan gönderilen değeri alır, bu yüzden
 * gönderilmeyen isteğe bağlı bir limit sınırsız olur. Değişiklikler yetki önbelleği penceresi içinde
 * (≤ 60 sn) acentelere yansır.
 */
export interface UpdateSubscriptionPlanRequest {
  /** Resource key whose per-language values hold the display name (e.g. `subscription-plans.freemium.name`). */
  readonly nameResourceKey: string;
  /** Resource key whose per-language values hold the description; null or omitted sets none. */
  readonly descriptionResourceKey?: string | null;
  /** Fixed monthly base price, net of VAT. */
  readonly basePrice: number;
  /** Monthly price per licensed user, net of VAT. */
  readonly pricePerUser: number;
  /** Monthly price per connected insurance company, net of VAT. */
  readonly pricePerInsuranceCompany: number;
  /** Modules included in the plan; a set holding Proposal or Policy must also hold Customer. */
  readonly modules: readonly Module[];
  /** Features included in the plan. */
  readonly features: readonly Feature[];
  /** Insurance branches agents on the plan can create proposals in. */
  readonly supportedBranches: readonly ProductBranch[];
  /** Default cap on agent users; null or omitted means unlimited. */
  readonly userLimit?: number | null;
  /** Default cap on connected insurance companies; null or omitted means unlimited. */
  readonly insuranceCompanyLimit?: number | null;
  /** Monthly proposal quota; null or omitted means unlimited. */
  readonly proposalLimit?: number | null;
  /** Monthly purchased-proposal quota; null or omitted means unlimited. */
  readonly purchaseProposalLimit?: number | null;
}

/**
 * Creates a subscription plan in the admin-managed catalogue under an id the administrator chooses.
 *
 * Yönetici tarafından yönetilen katalogda, yöneticinin seçtiği kimlikle bir abonelik planı oluşturur.
 */
export interface CreateSubscriptionPlanRequest extends UpdateSubscriptionPlanRequest {
  /** Stable small-integer id of the new plan; unique across the catalogue. */
  readonly id: number;
}
