/**
 * @fileoverview Admin Insurance Companies Contracts - Company settings and connection fields
 * @description Request/result types of the admin panel's `insurance-companies/*` endpoints. The company
 * list itself is `InsuranceCompany`, read with `insurance.getInsuranceCompanies()`.
 */

import type { InsuranceCompanyPaymentOption } from '../insurance.js';

/**
 * Body of `admin.insuranceCompanies.update`. The company comes from the method's `id` argument, which
 * the SDK also writes into the body.
 *
 * `admin.insuranceCompanies.update` gövdesi. Şirket, metodun `id` argümanından gelir; SDK onu gövdeye de
 * yazar.
 */
export interface UpdateInsuranceCompanyRequest {
  /** Display name of the company. */
  readonly name: string;
  /** Logo URL, or `null` for none. */
  readonly logo: string | null;
  /** Whether the company is offered at all. */
  readonly enabled: boolean;
  /**
   * Every payment-option rule of the company; replaces the stored list. Required: a body without it is
   * rejected rather than clearing the rules. At most one `branches: null` rule per payment option, and the
   * branch lists of one payment option must not overlap.
   */
  readonly paymentOptions: readonly InsuranceCompanyPaymentOption[];
}

/**
 * Where a connection field's value comes from.
 *
 * Bağlantı alanının değerinin nereden geldiği.
 */
export enum InsuranceCompanyConnectionFieldValueType {
  /** Each agency enters its own value. */
  AgentBased = 'AGENT_BASED',
  /** One value, set here, is used for every agency. */
  Constant = 'CONSTANT',
}

/**
 * What a connection field is used for.
 *
 * Bağlantı alanının ne için kullanıldığı.
 */
export enum InsuranceCompanyConnectionFieldPurpose {
  /** A connection parameter or credential sent to the company's service. */
  Connection = 'CONNECTION',
  /** A key used to encrypt card data for the company. */
  CreditCardEncryption = 'CREDIT_CARD_ENCRYPTION',
  /** The agency's number at the company. */
  AgentNumber = 'AGENT_NUMBER',
}

/**
 * One connection field of an insurance company, as the list returns it (only the key, the service key and
 * the value type; read one field for the rest).
 *
 * Listede dönen haliyle bir sigorta şirketinin bağlantı alanı (yalnızca anahtar, servis anahtarı ve değer
 * türü; geri kalanı için tek alan okunur).
 */
export interface GetCompanyConnectionFieldsResult {
  /** Key of the field, unique within the company. */
  readonly key: string;
  /** Key InsurGateway expects for the field. */
  readonly insuranceServicesKey: string;
  /** Where the field's value comes from. */
  readonly valueType: InsuranceCompanyConnectionFieldValueType;
}

/**
 * One connection field of an insurance company. `purpose` and `hidden` are missing from servers released before
 * they were added (core #1762); an update overwrites both, so an edit form must ask for them when they are.
 *
 * Bir sigorta şirketinin tek bir bağlantı alanı. `purpose` ve `hidden`, eklenmeden önce yayınlanmış sunucularda
 * (core #1762) yoktur; güncelleme ikisinin de üzerine yazdığından düzenleme formu bu durumda onları sormalıdır.
 */
export interface GetCompanyConnectionFieldResult {
  /** Key of the field, unique within the company. */
  readonly key: string;
  /** Key InsurGateway expects for the field. */
  readonly insuranceServicesKey: string;
  /** Where the field's value comes from. */
  readonly valueType: InsuranceCompanyConnectionFieldValueType;
  /** Resource key of the field's label. */
  readonly labelResourceKey: string;
  /** Resource key of the field's help text, or `null`. */
  readonly descriptionResourceKey: string | null;
  /** The constant value (or the default for agency-entered fields), or `null`. */
  readonly value: string | null;
  /** Display order; lower comes first. */
  readonly order: number;
  /** What the field is used for; missing from servers before core #1762. */
  readonly purpose?: InsuranceCompanyConnectionFieldPurpose;
  /** Whether the field is hidden from agencies; missing from servers before core #1762. */
  readonly hidden?: boolean;
}

/**
 * Body of `admin.insuranceCompanies.createConnectionField`. The company comes from the method's
 * `insuranceCompanyId` argument, which the SDK also writes into the body.
 *
 * `admin.insuranceCompanies.createConnectionField` gövdesi. Şirket, metodun `insuranceCompanyId`
 * argümanından gelir; SDK onu gövdeye de yazar.
 */
export interface CreateCompanyConnectionFieldRequest {
  /** Key of the field, unique within the company. */
  readonly key: string;
  /** Key InsurGateway expects for the field. */
  readonly insuranceServicesKey: string;
  /** Where the field's value comes from. */
  readonly valueType: InsuranceCompanyConnectionFieldValueType;
  /** What the field is used for. */
  readonly purpose: InsuranceCompanyConnectionFieldPurpose;
  /** Resource key of the field's label. */
  readonly labelResourceKey: string;
  /** Display order; lower comes first. */
  readonly order: number;
  /** Resource key of the field's help text. */
  readonly descriptionResourceKey?: string | null;
  /** The constant value, or the default for agency-entered fields. */
  readonly value?: string | null;
  /** Whether the field is hidden from agencies. Defaults to `false`. */
  readonly hidden?: boolean;
}

/**
 * Body of `admin.insuranceCompanies.updateConnectionField`. The company and the field key come from the
 * method's arguments, which the SDK also writes into the body. Every property overwrites the stored one
 * (an omitted description or value becomes `null`, an omitted `hidden` becomes `false`), so this type
 * requires them.
 *
 * `admin.insuranceCompanies.updateConnectionField` gövdesi. Şirket ve alan anahtarı metodun
 * argümanlarından gelir; SDK bunları gövdeye de yazar. Her özellik kayıtlı olanın üzerine yazılır; bu
 * yüzden açıklama, değer ve `hidden` zorunludur.
 */
export interface UpdateCompanyConnectionFieldRequest {
  /** Key InsurGateway expects for the field. */
  readonly insuranceServicesKey: string;
  /** Where the field's value comes from. */
  readonly valueType: InsuranceCompanyConnectionFieldValueType;
  /** What the field is used for. */
  readonly purpose: InsuranceCompanyConnectionFieldPurpose;
  /** Resource key of the field's label. */
  readonly labelResourceKey: string;
  /** Display order; lower comes first. */
  readonly order: number;
  /** Resource key of the field's help text, or `null`. */
  readonly descriptionResourceKey: string | null;
  /** The constant value (or the default for agency-entered fields), or `null`. */
  readonly value: string | null;
  /** Whether the field is hidden from agencies. */
  readonly hidden: boolean;
}
