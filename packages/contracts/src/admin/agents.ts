/**
 * @fileoverview Admin agent contracts - Agency listing, activation, subscriptions and billing
 * @description Request/result types of the admin `agents/*` endpoints: the agency list, the subscription
 * override, and each agency's billing agreement, payments, invoices and activity timeline
 */

import type { InsuranceSyncState, PhoneNumber, RobotMode } from '../agents.js';
import type { ProductBranch, UserReference } from '../common.js';
import type { Feature, Module } from './subscriptionPlans.js';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * How an agent's subscription is charged.
 *
 * Bir acentenin aboneliğinin nasıl tahsil edildiği.
 */
export enum BillingMode {
  /** Charges are recorded manually; no recurring enrollment. */
  Manual = 'MANUAL',
  /** Enrolled in a recurring plan that charges the saved card automatically. */
  Auto = 'AUTO',
}

/**
 * Lifecycle status of an agent's billing subscription.
 *
 * Bir acentenin faturalama aboneliğinin yaşam döngüsü durumu.
 */
export enum SubscriptionStatus {
  /** Active and in good standing. */
  Active = 'ACTIVE',
  /** A charge failed; the subscription is in dunning and awaits recovery. */
  PastDue = 'PAST_DUE',
  /** Canceled (parked on the free plan). */
  Canceled = 'CANCELED',
}

/**
 * What a billing payment was for.
 *
 * Bir faturalama ödemesinin ne için olduğu.
 */
export enum PaymentType {
  /** The first payment taken during agent onboarding. */
  Onboarding = 'ONBOARDING',
  /** A provider-managed recurring subscription charge. */
  Recurring = 'RECURRING',
  /** A one-off proration charged when the agent upgrades its subscription. */
  Upgrade = 'UPGRADE',
  /** An offline payment recorded by an administrator. */
  Manual = 'MANUAL',
  /** The charge taken when a manually billed agent enrolls in automatic billing. */
  EnableAuto = 'ENABLE_AUTO',
  /** An agent-initiated checkout for one monthly cycle of a manually billed subscription. */
  ManualCharge = 'MANUAL_CHARGE',
}

/**
 * Lifecycle status of a payment.
 *
 * Bir ödemenin yaşam döngüsü durumu.
 */
export enum PaymentStatus {
  /** Awaiting settlement. */
  Pending = 'PENDING',
  /** Settled successfully. */
  Succeeded = 'SUCCEEDED',
  /** The charge failed. */
  Failed = 'FAILED',
  /** The charge was canceled. */
  Canceled = 'CANCELED',
  /** The outcome could not be determined; a stored payment never settles on this value. */
  Unknown = 'UNKNOWN',
}

/**
 * Where a payment's invoice is on its way from "payment settled" to "legal e-document issued".
 *
 * Bir ödemenin faturasının, ödeme tamamlandıktan yasal e-belge kesilene kadar hangi aşamada olduğu.
 */
export enum InvoiceStatus {
  /** Recorded; nothing sent to the invoicing provider yet. */
  Pending = 'PENDING',
  /** Parked: the agency's invoice header is incomplete (see `invoiceMissingBuyerDetail`). */
  CustomerDataMissing = 'CUSTOMER_DATA_MISSING',
  /** The buyer exists at the provider; the sales invoice is next. */
  CustomerResolved = 'CUSTOMER_RESOLVED',
  /** A draft sales invoice exists at the provider; the legal e-document is next. */
  SalesInvoiceCreated = 'SALES_INVOICE_CREATED',
  /** Stopped at the draft on purpose: legalisation is switched off in this environment. */
  AwaitingLegalization = 'AWAITING_LEGALIZATION',
  /** The e-document was requested from the provider and is being processed. */
  DocumentRequested = 'DOCUMENT_REQUESTED',
  /** The legal e-document exists. */
  Issued = 'ISSUED',
  /** The last attempt failed; retried by the daily job or on request. */
  Failed = 'FAILED',
  /** An invoice issued outside the platform was attached by an administrator. */
  ManuallyRecorded = 'MANUALLY_RECORDED',
}

/**
 * The kind of legal electronic invoice document (GİB e-belge).
 *
 * Yasal elektronik fatura belgesinin (GİB e-belge) türü.
 */
export enum EDocumentType {
  /** e-Fatura: exchanged between two registered e-invoice taxpayers. */
  EInvoice = 'E_INVOICE',
  /** e-Arşiv: issued when the buyer is not a registered e-invoice taxpayer. */
  EArchive = 'E_ARCHIVE',
}

/**
 * A buyer detail a parked invoice waits for. The backend enum has no string converter, so it is sent
 * as its integer value.
 *
 * Bekletilen bir faturanın beklediği alıcı bilgisi. Backend enum'unda string dönüştürücü olmadığından
 * tamsayı değeriyle gönderilir.
 */
export enum InvoiceBuyerDetail {
  /** The tax number. */
  TaxNumber = 0,
  /** The tax office. */
  TaxOffice = 1,
  /** The billing address. */
  BillingAddress = 2,
}

/**
 * Why a switch to automatic billing stopped after its payment settled. The backend enum has no string
 * converter, so it is sent as its integer value.
 *
 * Otomatik ödemeye geçişin, ödemesi alındıktan sonra neden tamamlanamadığı. Backend enum'unda string
 * dönüştürücü olmadığından tamsayı değeriyle gönderilir.
 */
export enum AutoPaymentSetupFailureReason {
  /** The card was charged but not saved. */
  CardNotSaved = 0,
  /** The agency has no e-mail address for the recurring plan. */
  EmailMissing = 1,
  /** The payment provider rejected the recurring plan. */
  ProviderRejected = 2,
}

/**
 * What an entry of a subscription's activity timeline records.
 *
 * Bir aboneliğin aktivite geçmişindeki bir kaydın ne anlattığı.
 */
export enum SubscriptionActivityAction {
  /** Automatic billing was enabled with a saved card. */
  AutoPaymentEnabled = 'AUTO_PAYMENT_ENABLED',
  /** Automatic billing was turned off and the saved card removed. */
  AutoPaymentDisabled = 'AUTO_PAYMENT_DISABLED',
  /** The enable-automatic-billing payment settled but automatic billing could not be enabled. */
  AutoPaymentSetupFailed = 'AUTO_PAYMENT_SETUP_FAILED',
  /** A plan change was scheduled for the next billing cycle. */
  PlanChangeScheduled = 'PLAN_CHANGE_SCHEDULED',
  /** The plan (or the provisioned counts) changed. */
  PlanChanged = 'PLAN_CHANGED',
  /** An administrator switched the billing mode. */
  BillingModeChanged = 'BILLING_MODE_CHANGED',
  /** A charge could not be collected and the subscription went past due. */
  PaymentFailed = 'PAYMENT_FAILED',
  /** The past-due notice was e-mailed. */
  PastDueNoticeSent = 'PAST_DUE_NOTICE_SENT',
  /** The past-due notice was skipped: the agency has no e-mail address. */
  PastDueNoticeSkipped = 'PAST_DUE_NOTICE_SKIPPED',
  /** The subscription was parked on the free plan after the grace window elapsed. */
  Demoted = 'DEMOTED',
  /** The demotion notice was e-mailed. */
  DemotionNoticeSent = 'DEMOTION_NOTICE_SENT',
  /** The demotion notice was skipped: the agency has no e-mail address. */
  DemotionNoticeSkipped = 'DEMOTION_NOTICE_SKIPPED',
  /** A payment settled the debt and the subscription returned to good standing. */
  Recovered = 'RECOVERED',
  /** A parked subscription was bought back and returned to its previous plan. */
  Reactivated = 'REACTIVATED',
  /** An issued invoice was e-mailed to the agency. */
  InvoiceEmailSent = 'INVOICE_EMAIL_SENT',
}

// ============================================================================
// AGENT LIST AND SUBSCRIPTION
// ============================================================================

/**
 * Paging of `GET agents` (1-based page).
 *
 * `GET agents` sayfalaması (1 tabanlı sayfa).
 */
export interface GetAllAgentsRequest {
  /** 1-based page number; defaults to 1. */
  readonly page?: number;
  /** Page size; defaults to 20. */
  readonly pageSize?: number;
}

/**
 * An agency's subscription as the agency list shows it: the plan and the per-agent overrides.
 *
 * Acente listesinde görünen haliyle bir acentenin aboneliği: plan ve acente bazlı override'lar.
 */
export interface Subscription {
  /** The subscription plan id. */
  readonly subscriptionPlanId: number;
  /** Billing anchor day of month (1–31); null when the agency has no billing agreement. */
  readonly dayOfMonth: number | null;
  /** User-seat override; null inherits the plan default. */
  readonly userLimit: number | null;
  /** Insurance-company override; null inherits the plan default. */
  readonly insuranceCompanyLimit: number | null;
  /** Module override; null inherits the plan's modules. */
  readonly modules: readonly Module[] | null;
  /** Feature override; null inherits the plan's features. */
  readonly features: readonly Feature[] | null;
  /** Supported-branch override; null inherits the plan's branches. */
  readonly supportedBranches: readonly ProductBranch[] | null;
}

/**
 * One agency of the admin agency list.
 *
 * Yönetici acente listesindeki bir acente.
 */
export interface AdminAgent {
  /** Agent id. */
  readonly id: string;
  /** Agency name. */
  readonly name: string;
  /** Agency plate (levha) number; null when unknown. */
  readonly plateNo: string | null;
  /** Whether the agency is disabled (its users cannot sign in). */
  readonly disabled: boolean;
  /** Agency e-mail address; null when none. */
  readonly email: string | null;
  /** The agency's subscription; null when it has none. */
  readonly subscription: Subscription | null;
  /** Monthly price, net of VAT. */
  readonly monthlyPrice: number;
  /** Tax number. */
  readonly taxNumber: string;
  /** Phone number; null when none. */
  readonly phoneNumber: PhoneNumber | null;
  /** State of the agency's insurance-company synchronization. */
  readonly insuranceSyncState: InsuranceSyncState;
  /** Robotic process automation mode. */
  readonly robotMode: RobotMode;
}

/**
 * A page of the admin agency list.
 *
 * Yönetici acente listesinin bir sayfası.
 */
export interface GetAllAgentsResult {
  /** The agencies on this page. */
  readonly agents: readonly AdminAgent[];
  /** Total number of agencies. */
  readonly totalCount: number;
  /** 1-based page number. */
  readonly page: number;
  /** Page size. */
  readonly pageSize: number;
}

/**
 * Sets an agency's subscription plan, billing anchor day and per-agent overrides. Each override replaces
 * the plan's value in full; null or omitted inherits the plan.
 *
 * Bir acentenin abonelik planını, faturalama gününü ve acente bazlı override'larını ayarlar. Her override
 * plandaki değeri bütünüyle değiştirir; null veya gönderilmemesi planınkini devralır.
 */
export interface UpdateAgentSubscriptionRequest {
  /** The subscription plan id. */
  readonly subscriptionPlanId: number;
  /** Billing anchor day of month (1–31). */
  readonly dayOfMonth: number;
  /** User-seat override; null or omitted inherits the plan default. */
  readonly userLimit?: number | null;
  /** Insurance-company override; null or omitted inherits the plan default. */
  readonly insuranceCompanyLimit?: number | null;
  /** Module override; null or omitted inherits the plan's modules, an empty array grants none. */
  readonly modules?: readonly Module[] | null;
  /** Feature override; null or omitted inherits the plan's features, an empty array grants none. */
  readonly features?: readonly Feature[] | null;
  /** Branch override; null or omitted inherits the plan's branches, an empty array grants none. */
  readonly supportedBranches?: readonly ProductBranch[] | null;
}

// ============================================================================
// BILLING SUMMARY
// ============================================================================

/**
 * One amount stated three ways: net of VAT, the VAT on it, and the gross the customer pays
 * (`net + vat === gross`).
 *
 * Tek bir tutarın üç hali: KDV hariç, üzerindeki KDV ve müşterinin ödediği KDV dahil toplam.
 */
export interface PriceBreakdown {
  /** The amount before VAT, in major currency units. */
  readonly net: number;
  /** The VAT rate, as a fraction (0.20 = 20%). */
  readonly vatRate: number;
  /** The VAT on `net`, rounded to two decimals. */
  readonly vat: number;
  /** The amount paid: `net + vat`. */
  readonly gross: number;
}

/**
 * Why the agency's last switch to automatic billing stopped after its payment settled: the card was
 * charged but the recurring plan was not created, so the subscription stayed on manual billing.
 *
 * Acentenin son otomatik ödemeye geçişinin, ödemesi alındıktan sonra neden durduğu: kart tahsil edildi
 * ama tekrarlı ödeme talimatı oluşturulmadı, abonelik manuel faturalandırmada kaldı.
 */
export interface AutoPaymentSetupFailure {
  /** The enable-automatic-billing payment the setup stopped after. */
  readonly paymentId: string;
  /** What stopped the setup (integer on the wire). */
  readonly reason: AutoPaymentSetupFailureReason;
  /** When the setup stopped (ISO-8601). */
  readonly failedAt: string;
  /** Whether the setup can be finished with the saved card without charging again. */
  readonly canRetry: boolean;
}

/**
 * One agency's billing agreement: the plan and limits, how it is billed, the price (in force, admin-set
 * and plan formula), the next charge date, dunning, the saved card and the status.
 *
 * Bir acentenin faturalama sözleşmesi: plan ve limitler, nasıl faturalandığı, fiyat (geçerli, yönetici
 * tarafından belirlenen ve plan formülü), sonraki tahsilat tarihi, gecikme, kayıtlı kart ve durum.
 */
export interface GetAgentBillingSummaryResult {
  /** Whether the agency has a billing agreement; false shows the Freemium defaults. */
  readonly hasAgreement: boolean;
  /** The current subscription plan id. */
  readonly subscriptionPlanId: number;
  /** Localized name of the current plan. */
  readonly planName: string;
  /** Provisioned user-seat count; null inherits the plan default (unlimited when the plan has none). */
  readonly userLimit: number | null;
  /** Provisioned insurance-company count; null inherits the plan default (unlimited when the plan has none). */
  readonly insuranceCompanyLimit: number | null;
  /** Billing anchor day of month (1–31); null when the agency has no agreement. */
  readonly dayOfMonth: number | null;
  /** How the subscription is charged. */
  readonly billingMode: BillingMode;
  /** The monthly price in force, net of VAT. */
  readonly monthlyAmount: number;
  /** The monthly charge: `monthlyAmount` with VAT added; its gross is what each cycle collects. */
  readonly monthlyCharge: PriceBreakdown;
  /** ISO currency code. */
  readonly currency: string;
  /** Admin-agreed monthly price, net of VAT; null when the plan formula applies. */
  readonly monthlyAmountOverride: number | null;
  /** What the plan formula charges for the agreement's plan and counts, net of VAT. */
  readonly planMonthlyAmount: number;
  /** Next expected charge date (ISO-8601); null when the agency has no agreement. */
  readonly nextBillingDate: string | null;
  /** Date (ISO-8601) a past-due agreement must be settled by; null unless in dunning. */
  readonly graceDeadline: string | null;
  /** Masked saved card (e.g. `****1234`); null when none. */
  readonly maskedPan: string | null;
  /** Lifecycle status. */
  readonly status: SubscriptionStatus;
  /** Recovery charge of a parked agreement, VAT included; null unless parked. */
  readonly reactivationAmount: number | null;
  /** The recovery charge with its net / VAT split; null when none. */
  readonly reactivationCharge: PriceBreakdown | null;
  /** Why the last automatic-payment setup stopped; null when there is none. */
  readonly autoPaymentSetupFailure: AutoPaymentSetupFailure | null;
}

// ============================================================================
// PAYMENTS AND INVOICES
// ============================================================================

/**
 * Paging of an agency's payment history (1-based page).
 *
 * Bir acentenin ödeme geçmişinin sayfalaması (1 tabanlı sayfa).
 */
export interface GetAgentPaymentsRequest {
  /** 1-based page number; defaults to 1. */
  readonly page?: number;
  /** Page size; defaults to 20. */
  readonly pageSize?: number;
}

/**
 * One payment-history record with its invoice state.
 *
 * Fatura durumuyla birlikte bir ödeme geçmişi kaydı.
 */
export interface PaymentResult {
  /** Payment record id. */
  readonly id: string;
  /** What the payment was for. */
  readonly type: PaymentType;
  /** The amount charged, VAT included, in major currency units. */
  readonly amount: number;
  /** The VAT-exclusive part of `amount`. */
  readonly netAmount: number;
  /** The VAT part of `amount`. */
  readonly vatAmount: number;
  /** The VAT rate of the split, as a fraction (0.20 = 20%). */
  readonly vatRate: number;
  /** ISO currency code. */
  readonly currency: string;
  /** Lifecycle status. */
  readonly status: PaymentStatus;
  /** When the record was created (ISO-8601). */
  readonly createdAt: string;
  /** When the charge succeeded (ISO-8601); null until then. */
  readonly paidAt: string | null;
  /** Failure reason; null unless the payment failed. */
  readonly failureReason: string | null;
  /** Admin note of a manual (offline) payment; null otherwise. */
  readonly note: string | null;
  /** Legal invoice number once issued or recorded; null otherwise. */
  readonly invoiceNumber: string | null;
  /** Invoice status; null when no invoice exists for the payment yet. */
  readonly invoiceStatus: InvoiceStatus | null;
  /** Invoice document type once known; null otherwise. */
  readonly invoiceDocumentType: EDocumentType | null;
  /** Buyer detail a parked invoice waits for (integer on the wire); null unless `CUSTOMER_DATA_MISSING`. */
  readonly invoiceMissingBuyerDetail: InvoiceBuyerDetail | null;
  /** Whether the invoice PDF is stored and can be downloaded. */
  readonly hasInvoicePdf: boolean;
}

/**
 * A page of an agency's payment history, newest first.
 *
 * Bir acentenin ödeme geçmişinin bir sayfası, en yeni önce.
 */
export interface GetAgentPaymentsResult {
  /** The payments on this page, newest first. */
  readonly items: readonly PaymentResult[];
  /** Total number of payments. */
  readonly totalCount: number;
  /** 1-based page number. */
  readonly page: number;
  /** Page size. */
  readonly pageSize: number;
}

/**
 * Records an already-settled offline (manual) payment against an agency. Never charges a card.
 *
 * Bir acenteye, tahsil edilmiş çevrim dışı (manuel) bir ödeme kaydeder. Karttan tahsilat yapmaz.
 */
export interface RecordAgentManualPaymentRequest {
  /** The amount paid, in major currency units. */
  readonly amount: number;
  /** When the payment was received (ISO-8601); null or omitted means now. */
  readonly paymentDate?: string | null;
  /** Free-text note, e.g. the bank reference. */
  readonly note?: string | null;
  /**
   * Whether the record settles the current cycle and moves the next billing date a month forward
   * (recovering a past-due agreement); false stores a history-only entry. Defaults to true.
   */
  readonly advanceBillingCycle?: boolean;
}

/**
 * Sets an agency's billing mode. Switching to automatic billing needs a saved card; switching to manual
 * stops the provider-managed recurring plan.
 *
 * Bir acentenin faturalama modunu ayarlar. Otomatik faturalamaya geçiş kayıtlı kart gerektirir; manuele
 * geçiş sağlayıcıdaki tekrarlı ödeme talimatını durdurur.
 */
export interface SetAgentBillingModeRequest {
  /** The billing mode to set. */
  readonly billingMode: BillingMode;
}

/**
 * Sets the monthly price agreed with an agency, replacing the plan formula, or clears it. The price holds
 * through later plan and count changes until cleared.
 *
 * Acenteyle anlaşılan aylık fiyatı plan formülünün yerine ayarlar veya temizler. Fiyat, temizlenene kadar
 * sonraki plan ve sayı değişikliklerinde korunur.
 */
export interface SetAgentPriceOverrideRequest {
  /**
   * Agreed monthly price, net of VAT, with at most two decimals; null or omitted returns the agency to
   * the plan price. Zero is accepted only on manual billing.
   */
  readonly monthlyAmount?: number | null;
}

/**
 * Records an invoice issued outside the platform against one of an agency's settled payments. Sent as
 * `multipart/form-data`; the optional PDF (at most 5 MB) is stored for the agency to download.
 *
 * Platform dışında kesilmiş bir faturayı acentenin tahsil edilmiş bir ödemesine kaydeder.
 * `multipart/form-data` olarak gönderilir; isteğe bağlı PDF (en fazla 5 MB) acentenin indirmesi için saklanır.
 */
export interface AttachAgentPaymentManualInvoiceRequest {
  /** The legal invoice number printed on the document. */
  readonly invoiceNumber: string;
  /** The invoice date printed on the document (yyyy-MM-dd). */
  readonly issuedAt: string;
  /** Whether the document is an e-Fatura or an e-Arşiv. */
  readonly documentType: EDocumentType;
  /** Free-text note, e.g. where the document was issued. */
  readonly note?: string | null;
  /** The invoice PDF; its content must start with `%PDF-`. */
  readonly file?: Blob | null;
  /** File name sent with `file`, ending in `.pdf`; a `File` keeps its own name when omitted. */
  readonly fileName?: string;
}

/**
 * A short-lived download link to an invoice PDF.
 *
 * Bir fatura PDF'ine kısa ömürlü indirme bağlantısı.
 */
export interface GetAgentPaymentInvoicePdfResult {
  /** Presigned download URL, valid for a few minutes. */
  readonly url: string;
}

// ============================================================================
// ACTIVITY TIMELINE
// ============================================================================

/**
 * Paging of an agency's subscription activity timeline (1-based page).
 *
 * Bir acentenin abonelik aktivite geçmişinin sayfalaması (1 tabanlı sayfa).
 */
export interface GetAgentBillingActivitiesRequest {
  /** 1-based page number; defaults to 1. */
  readonly page?: number;
  /** Page size; defaults to 20. */
  readonly pageSize?: number;
}

/**
 * The `$type` discriminator of a subscription activity entry.
 *
 * Bir abonelik aktivite kaydının `$type` ayracı.
 */
export type SubscriptionActivityResultType =
  | 'auto-payment-enabled'
  | 'auto-payment-disabled'
  | 'auto-payment-setup-failed'
  | 'plan-change-scheduled'
  | 'plan-changed'
  | 'billing-mode-changed'
  | 'payment-failed'
  | 'dunning-notice'
  | 'demoted'
  | 'recovered'
  | 'reactivated'
  | 'invoice-email-sent';

/**
 * Fields every subscription activity entry carries.
 */
interface SubscriptionActivityResultBase {
  /** The concrete entry type. */
  readonly $type: SubscriptionActivityResultType;
  /** What the entry records. */
  readonly action: SubscriptionActivityAction;
  /** When it happened (ISO-8601, UTC). */
  readonly createdAt: string;
  /** Who did it: the agent user, the administrator or the system principal. */
  readonly createdBy: UserReference;
}

/**
 * Automatic billing was enabled.
 *
 * Otomatik ödeme etkinleştirildi.
 */
export interface AutoPaymentEnabledActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'auto-payment-enabled';
  /** Masked number of the enrolled card; null when unknown. */
  readonly maskedPan: string | null;
}

/**
 * Automatic billing was turned off and the saved card removed.
 *
 * Otomatik ödeme kapatıldı ve kayıtlı kart silindi.
 */
export interface AutoPaymentDisabledActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'auto-payment-disabled';
}

/**
 * The enable-automatic-billing payment settled but nothing could be enrolled from it.
 *
 * Otomatik ödemeye geçiş ödemesi alındı ama talimat oluşturulamadı.
 */
export interface AutoPaymentSetupFailedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'auto-payment-setup-failed';
  /** Why the setup stopped (integer on the wire). */
  readonly reason: AutoPaymentSetupFailureReason;
}

/**
 * A plan change was scheduled for the next billing cycle.
 *
 * Bir sonraki faturalama dönemi için plan değişikliği planlandı.
 */
export interface PlanChangeScheduledActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'plan-change-scheduled';
  /** The plan until the change applies. */
  readonly fromPlanId: number;
  /** The plan the agreement moves to. */
  readonly toPlanId: number;
  /** When the change applies (ISO-8601). */
  readonly applyAt: string;
}

/**
 * The plan (or the provisioned counts on it) changed.
 *
 * Plan (veya plandaki sayılar) değişti.
 */
export interface PlanChangedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'plan-changed';
  /** The plan before the change. */
  readonly fromPlanId: number;
  /** The plan after the change (the same id when only the counts changed). */
  readonly toPlanId: number;
}

/**
 * An administrator switched the billing mode.
 *
 * Bir yönetici faturalama modunu değiştirdi.
 */
export interface BillingModeChangedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'billing-mode-changed';
  /** The billing mode before the change. */
  readonly fromMode: BillingMode;
  /** The billing mode after the change. */
  readonly toMode: BillingMode;
}

/**
 * A charge could not be collected and the subscription went past due.
 *
 * Bir tahsilat yapılamadı ve abonelik gecikmeye düştü.
 */
export interface PaymentFailedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'payment-failed';
  /** The amount that could not be collected, VAT included. */
  readonly amount: number;
  /** ISO currency code. */
  readonly currency: string;
  /** When the dunning grace window ends (ISO-8601). */
  readonly graceDeadline: string;
}

/**
 * A dunning notice was e-mailed, or skipped when there was no address.
 *
 * Bir gecikme bildirimi e-postayla gönderildi ya da adres olmadığı için atlandı.
 */
export interface DunningNoticeActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'dunning-notice';
  /** The address the notice went to; null when it was skipped. */
  readonly recipient: string | null;
}

/**
 * The subscription was parked on the free plan after the dunning grace window elapsed.
 *
 * Gecikme süresi dolduktan sonra abonelik ücretsiz plana alındı.
 */
export interface DemotedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'demoted';
  /** The plan the agreement was demoted from. */
  readonly fromPlanId: number;
}

/**
 * A payment settled the debt and the past-due subscription returned to good standing.
 *
 * Bir ödeme borcu kapattı ve geciken abonelik normale döndü.
 */
export interface RecoveredActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'recovered';
  /** The amount that settled the debt, VAT included. */
  readonly amount: number;
  /** ISO currency code. */
  readonly currency: string;
}

/**
 * A parked subscription was bought back and returned to its previous plan.
 *
 * Ücretsiz plana alınmış abonelik geri satın alındı ve önceki planına döndü.
 */
export interface ReactivatedActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'reactivated';
  /** The plan the agreement returned to. */
  readonly planId: number;
}

/**
 * An issued invoice was e-mailed to the agency.
 *
 * Kesilen fatura acenteye e-postayla gönderildi.
 */
export interface InvoiceEmailSentActivityResult extends SubscriptionActivityResultBase {
  /** Entry type discriminator. */
  readonly $type: 'invoice-email-sent';
  /** The legal invoice number. */
  readonly invoiceNumber: string;
  /** The address the invoice went to. */
  readonly recipient: string;
}

/**
 * One entry of a subscription's activity timeline. The `$type` discriminator narrows to the concrete
 * entry, whose extra fields carry its detail.
 *
 * Bir aboneliğin aktivite geçmişindeki bir kayıt. `$type` ayracı, ek alanları ayrıntıyı taşıyan somut
 * kayda daraltır.
 */
export type SubscriptionActivityResult =
  | AutoPaymentEnabledActivityResult
  | AutoPaymentDisabledActivityResult
  | AutoPaymentSetupFailedActivityResult
  | PlanChangeScheduledActivityResult
  | PlanChangedActivityResult
  | BillingModeChangedActivityResult
  | PaymentFailedActivityResult
  | DunningNoticeActivityResult
  | DemotedActivityResult
  | RecoveredActivityResult
  | ReactivatedActivityResult
  | InvoiceEmailSentActivityResult;

/**
 * A page of an agency's subscription activity timeline, newest first.
 *
 * Bir acentenin abonelik aktivite geçmişinin bir sayfası, en yeni önce.
 */
export interface GetAgentBillingActivitiesResult {
  /** The entries on this page, newest first. */
  readonly items: readonly SubscriptionActivityResult[];
  /** Total number of entries. */
  readonly totalCount: number;
  /** 1-based page number. */
  readonly page: number;
  /** Page size. */
  readonly pageSize: number;
}
