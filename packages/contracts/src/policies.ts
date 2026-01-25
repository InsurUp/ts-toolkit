/**
 * @fileoverview Policy Management Contracts - Request and response types for policy operations
 * @description Comprehensive policy management operations for handling active insurance policies,
 * document generation, customer communications, representative assignments, and policy transfer processes
 */

import type {
  ProductBranch,
  Currency,
  PaymentOption,
  PolicyState,
  Channel,
  UserReference,
  Coverage,
  ProposalSnapshotVehicle,
  ProposalSnapshotProperty,
} from "./common.js";
import type { CustomerPhoneNumber } from "./common.js";
import type { ProposalSnapshotCustomer } from "./proposals.js";

// ============================================================================
// POLICY SNAPSHOT TYPES
// ============================================================================

/**
 * Union type for all insurance policy snapshots in the system.
 * Represents a complete snapshot of an insurance policy at a specific point in time.
 *
 * Sistemdeki tüm sigorta poliçesi anlık görüntüleri için birleşim türü.
 * Belirli bir zaman noktasında bir sigorta poliçesinin tam anlık görüntüsünü temsil eder.
 */
export type PolicySnapshot =
  // Health and Life Insurance
  | ({ readonly productBranch: ProductBranch.Tss } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.GrupHayat } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Saglik } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.FerdiKaza } & PolicySnapshotBase)
  // Vehicle Insurance
  | ({
      readonly productBranch: ProductBranch.Kasko;
      readonly vehicle: PolicySnapshotVehicle;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Trafik;
      readonly vehicle: PolicySnapshotVehicle;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Imm;
      readonly vehicle: PolicySnapshotVehicle;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.YesilKart;
      readonly vehicle: PolicySnapshotVehicle;
    } & PolicySnapshotBase)
  // Property Insurance
  | ({
      readonly productBranch: ProductBranch.Konut;
      readonly property: PolicySnapshotProperty;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Dask;
      readonly property: PolicySnapshotProperty;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.IsyeriYangin;
      readonly property: PolicySnapshotProperty;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.IlkAtesKonut;
      readonly property: PolicySnapshotProperty;
    } & PolicySnapshotBase)
  // Specialty Insurance
  | ({
      readonly productBranch: ProductBranch.Pet;
      readonly pet: PolicySnapshotPet;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.ElektronikCihaz;
      readonly electronicDevice: PolicySnapshotElectronicDevice;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.AkilliTelefon;
    } & PolicySnapshotBase)
  // Travel and Protection
  | ({ readonly productBranch: ProductBranch.Seyahat } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.KartKimlikKoruma;
    } & PolicySnapshotBase)
  // Liability Insurance
  | ({
      readonly productBranch: ProductBranch.UcuncuSahisMaliSorumluluk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.OzelGuvenlikMaliSorumluluk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.TehlikeliMaddelerMaliSorumluluk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.MeslekiSorumluluk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.IsverenMaliMesuliyet;
    } & PolicySnapshotBase)
  // Commercial and Industrial
  | ({ readonly productBranch: ProductBranch.Bes } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.InsaatAllRisk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.LeasingAllRisk;
    } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.MontajAllRisk;
    } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Nakliyat } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.YatGemiGezintiTeknesi;
    } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Tarim } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Alacak } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Muhendislik } & PolicySnapshotBase)
  | ({
      readonly productBranch: ProductBranch.HukuksalKoruma;
    } & PolicySnapshotBase)
  | ({ readonly productBranch: ProductBranch.Kefalet } & PolicySnapshotBase);

type PolicySnapshotBase = {
  readonly insurerCustomer: PolicySnapshotCustomer;
  readonly insuredCustomer: PolicySnapshotCustomer;
  readonly isInsuredCustomerSameAsInsurerCustomer: boolean;
};

// Policy snapshot object types - reusing proposal snapshot types for now
// These should be identical or very similar to their proposal counterparts
type PolicySnapshotVehicle = ProposalSnapshotVehicle;
type PolicySnapshotProperty = ProposalSnapshotProperty;
type PolicySnapshotCustomer = ProposalSnapshotCustomer;

// Policy snapshot object types for specialty insurance
// These are currently empty placeholder classes in the C# codebase
type PolicySnapshotPet = Record<string, never>;
type PolicySnapshotElectronicDevice = Record<string, never>;

// ============================================================================
// POLICY DETAIL CONTRACTS
// ============================================================================

/**
 * Request to retrieve detailed information about a specific insurance policy.
 * Used to fetch comprehensive policy data including coverage, terms, customer information, and status.
 *
 * Belirli bir sigorta poliçesi hakkında ayrıntılı bilgi almak için istek.
 * Teminat, şartlar, müşteri bilgileri ve durum dahil olmak üzere kapsamlı poliçe verilerini getirmek için kullanılır.
 */
export interface GetPolicyDetailRequest {
  /**
   * The unique identifier of the insurance policy for which detailed information is requested.
   *
   * Ayrıntılı bilgisi istenen sigorta poliçesinin benzersiz tanımlayıcısı.
   */
  readonly policyId: string;
}

/**
 * Comprehensive response containing detailed information about an insurance policy.
 * Returns complete policy data including coverage, customer information, payment details, and status.
 *
 * Bir sigorta poliçesi hakkında ayrıntılı bilgileri içeren kapsamlı yanıt.
 * Teminat, müşteri bilgileri, ödeme detayları ve durum dahil olmak üzere eksiksiz poliçe verilerini döndürür.
 */
export interface GetPolicyDetailResult {
  /**
   * The unique identifier of the policy.
   *
   * Poliçenin benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * The unique identifier of the customer who owns the policy (policyholder).
   *
   * Poliçeye sahip olan müşterinin benzersiz tanımlayıcısı (poliçe sahibi).
   */
  readonly insurerCustomerId: string;

  /**
   * The unique identifier of the customer who is covered by the policy.
   *
   * Poliçe tarafından kapsanan müşterinin benzersiz tanımlayıcısı.
   */
  readonly insuredCustomerId: string;

  /**
   * The unique identifier of the original proposal that led to this policy.
   *
   * Bu poliçeye yol açan orijinal teklifin benzersiz tanımlayıcısı.
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the specific product configuration used in the proposal.
   *
   * Teklifte kullanılan belirli ürün konfigürasyonunun benzersiz tanımlayıcısı.
   */
  readonly proposalProductId: string;

  /**
   * The identifier of the insurance product.
   *
   * Sigorta ürününün tanımlayıcısı.
   */
  readonly productId: number;

  /**
   * The identifier of the insurance company providing the coverage.
   *
   * Teminatı sağlayan sigorta şirketinin tanımlayıcısı.
   */
  readonly insuranceCompanyId: number;

  /**
   * The number of installments for premium payment, if applicable.
   *
   * Varsa, prim ödemesi için taksit sayısı.
   */
  readonly installmentNumber: number | null;

  /**
   * The insurance product branch classification.
   *
   * Sigorta ürün dalı sınıflandırması.
   */
  readonly productBranch: ProductBranch;

  /**
   * The net premium amount before taxes and fees.
   *
   * Vergi ve ücretler öncesi net prim tutarı.
   */
  readonly netPremium: number;

  /**
   * The total premium amount including all taxes and fees.
   *
   * Tüm vergi ve ücretler dahil toplam prim tutarı.
   */
  readonly grossPremium: number;

  /**
   * The commission amount paid to the agent, if applicable.
   *
   * Varsa, acenteye ödenen komisyon tutarı.
   */
  readonly commission: number | null;

  /**
   * The payment option selected for premium payment.
   *
   * Prim ödemesi için seçilen ödeme seçeneği.
   */
  readonly paymentType: PaymentOption;

  /**
   * The currency used for all monetary amounts in this policy.
   *
   * Bu poliçedeki tüm parasal tutarlar için kullanılan para birimi.
   */
  readonly currency: Currency;

  /**
   * The proposal number assigned by the insurance company.
   *
   * Sigorta şirketi tarafından atanan teklif numarası.
   */
  readonly insuranceCompanyProposalNumber: string;

  /**
   * The policy number assigned by the insurance company.
   *
   * Sigorta şirketi tarafından atanan poliçe numarası.
   */
  readonly insuranceCompanyPolicyNumber: string;

  /**
   * Reference identifier for the policy in external insurance services.
   *
   * Harici sigorta hizmetlerindeki poliçe için referans tanımlayıcısı.
   */
  readonly insuranceServicesPolicyReference: string;

  /**
   * The date and time when the policy was created.
   *
   * Poliçenin oluşturulduğu tarih ve saat.
   */
  readonly createdAt: string;

  /**
   * The policy effective start date.
   *
   * Poliçe geçerlilik başlangıç tarihi.
   */
  readonly startDate: string;

  /**
   * The policy expiration date.
   *
   * Poliçe bitiş tarihi.
   */
  readonly endDate: string;

  /**
   * The arrangement date for policy documentation, if applicable.
   *
   * Varsa, poliçe dokümantasyonu için düzenleme tarihi.
   */
  readonly arrangementDate: string | null;

  /**
   * The endorsement number assigned by the insurance company.
   *
   * Sigorta şirketi tarafından atanan zeyilname numarası.
   */
  readonly insuranceCompanyEndorsementNumber: number;

  /**
   * The renewal number assigned by the insurance company.
   *
   * Sigorta şirketi tarafından atanan yenileme numarası.
   */
  readonly insuranceCompanyRenewalNumber: number;

  /**
   * Snapshot of the policy data at the time of creation or last update.
   *
   * Oluşturma veya son güncelleme anındaki poliçe verilerinin anlık görüntüsü.
   */
  readonly snapshot: PolicySnapshot;

  /**
   * The coverage details and limits for this policy, if available.
   *
   * Varsa, bu poliçe için teminat detayları ve limitleri.
   */
  readonly coverage: Coverage | null;

  /**
   * The current state or status of the policy.
   *
   * Poliçenin mevcut durumu veya statüsü.
   */
  readonly state: PolicyState;

  /**
   * Reference to the user who created this policy.
   *
   * Bu poliçeyi oluşturan kullanıcıya referans.
   */
  readonly createdBy: UserReference;

  /**
   * Reference to the agent user representing this policy, if assigned.
   *
   * Atanmışsa, bu poliçeyi temsil eden acente kullanıcısına referans.
   */
  readonly representedBy: UserReference | null;

  /**
   * DASK (Turkish earthquake insurance) policy number, if applicable.
   *
   * Varsa, DASK (Türk deprem sigortası) poliçe numarası.
   */
  readonly daskPolicyNumber: string | null;

  /**
   * The sales channel through which this policy was sold.
   *
   * Bu poliçenin satıldığı satış kanalı.
   */
  readonly channel: Channel;
}

// ============================================================================
// POLICY DOCUMENT CONTRACTS
// ============================================================================

/**
 * Request to fetch policy document from the system.
 * Used to retrieve policy documents such as certificates, terms, and conditions for download or display.
 *
 * Sistemden poliçe belgesini getirme isteği.
 * İndirme veya görüntüleme için sertifikalar, şartlar ve koşullar gibi poliçe belgelerini almak için kullanılır.
 */
export interface FetchPolicyDocumentRequest {
  /**
   * The unique identifier of the insurance policy for which documents are being requested.
   *
   * Belgeleri istenen sigorta poliçesinin benzersiz tanımlayıcısı.
   */
  readonly policyId: string;
}

/**
 * Response containing the URL for accessing policy documents.
 * Returns a downloadable link to policy certificates, terms, and conditions.
 *
 * Poliçe belgelerine erişim için URL'yi içeren yanıt.
 * Poliçe sertifikaları, şartlar ve koşullara indirilebilir bağlantı döndürür.
 */
export interface FetchPolicyDocumentResult {
  /**
   * The secure URL where the policy document can be accessed, viewed, or downloaded.
   *
   * Poliçe belgesine erişilebilen, görüntülenebilen veya indirilebilen güvenli URL.
   */
  readonly url: string;
}

/**
 * Request to send policy documents to customers via different communication channels.
 * Used to deliver policy certificates, terms, and other documents through email or SMS.
 *
 * Müşterilere farklı iletişim kanalları aracılığıyla poliçe belgelerini gönderme isteği.
 * E-posta veya SMS yoluyla poliçe sertifikaları, şartlar ve diğer belgeleri teslim etmek için kullanılır.
 */
export interface SendPolicyDocumentRequest {
  /**
   * The unique identifier of the insurance policy for which documents should be sent.
   *
   * Belgeleri gönderilmesi gereken sigorta poliçesinin benzersiz tanımlayıcısı.
   */
  readonly policyId: string;

  /**
   * The unique identifier of the customer who will receive the policy documents.
   *
   * Poliçe belgelerini alacak müşterinin benzersiz tanımlayıcısı.
   */
  readonly customerId: string;

  /**
   * The communication channel and contact information for delivering the policy documents.
   *
   * Poliçe belgelerini teslim etmek için iletişim kanalı ve iletişim bilgileri.
   */
  readonly communication: SendPolicyDocumentCommunication;
}

/**
 * Union type for all policy document communication methods
 * Tüm poliçe belgesi iletişim yöntemleri için birleşim türü
 */
export type SendPolicyDocumentCommunication =
  | {
      readonly type: "email";
      readonly email: string;
    }
  | {
      readonly type: "sms";
      readonly phoneNumber: CustomerPhoneNumber;
    };

// ============================================================================
// POLICY REPRESENTATIVE CONTRACTS
// ============================================================================

/**
 * Request to set or change the representative agent for an insurance policy.
 * Used to assign or reassign customer service representatives to policies for better customer management.
 *
 * Bir sigorta poliçesi için temsilci acenteyi belirleme veya değiştirme isteği.
 * Daha iyi müşteri yönetimi için poliçelere müşteri hizmetleri temsilcilerini atama veya yeniden atama için kullanılır.
 */
export interface SetPolicyRepresentativeRequest {
  /**
   * The unique identifier of the insurance policy for which the representative is being assigned or changed.
   *
   * Temsilcisi atanan veya değiştirilen sigorta poliçesinin benzersiz tanımlayıcısı.
   */
  readonly policyId: string;

  /**
   * The unique identifier of the agent user to be assigned as the policy representative.
   * Can be null to remove the current representative assignment.
   *
   * Poliçe temsilcisi olarak atanacak acente kullanıcısının benzersiz tanımlayıcısı.
   * Mevcut temsilci atamasını kaldırmak için null olabilir.
   */
  readonly representativeAgentUserId: string | null;
}

// ============================================================================
// BRANCH ASSIGNMENT TYPES
// ============================================================================

/**
 * Request to set policy branch
 */
export interface SetPolicyBranchRequest {
  readonly policyId: string;
  readonly branchId: string;
}

// ============================================================================
// MANUAL POLICY TYPES
// ============================================================================

/**
 * Request to create manual policy
 */
export interface CreateManualPolicyRequest {
  readonly customerId: string;
  readonly insuranceCompanyId: number;
  readonly productBranch: ProductBranch;
  readonly policyNumber: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly premium: number;
}

/**
 * Response for created manual policy
 */
export interface CreateManualPolicyResult {
  readonly policyId: string;
}

/**
 * Request to update manual policy
 */
export interface UpdateManualPolicyRequest {
  readonly policyId: string;
  readonly policyNumber?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly premium?: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Request for policy count and premium analytics
 */
export interface GetPolicyCountAndPremiumAnalyticsRequest {
  readonly startDate: string;
  readonly endDate: string;
  readonly groupBy?: "productBranch" | "insuranceCompany";
}

/**
 * Policy KPIs
 */
export interface PolicyKPIs {
  readonly totalCount: number;
  readonly totalPremium: number;
  readonly averagePremium: number;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  readonly date: string;
  readonly count: number;
  readonly premium: number;
}

/**
 * Grouped analytics data
 */
export interface GroupedAnalyticsData {
  readonly groupKey: string;
  readonly count: number;
  readonly premium: number;
}

/**
 * Response for policy count and premium analytics
 */
export interface GetPolicyCountAndPremiumAnalyticsResult {
  readonly kpis: PolicyKPIs;
  readonly timeSeries: readonly TimeSeriesDataPoint[];
  readonly groupedData?: readonly GroupedAnalyticsData[];
}

/**
 * Request for policy renewal analytics
 */
export interface GetPolicyRenewalAnalyticsRequest {
  readonly startDate: string;
  readonly endDate: string;
}

/**
 * Daily renewal data
 */
export interface DailyRenewalData {
  readonly date: string;
  readonly count: number;
}

/**
 * Response for policy renewal analytics
 */
export interface GetPolicyRenewalAnalyticsResult {
  readonly dailyRenewals: readonly DailyRenewalData[];
  readonly totalRenewals: number;
  readonly peakRenewals: number;
}

/**
 * Request for policy distribution by branch
 */
export interface GetPolicyDistributionByBranchRequest {
  readonly startDate: string;
  readonly endDate: string;
}

/**
 * Branch distribution data
 */
export interface BranchDistribution {
  readonly branch: ProductBranch;
  readonly count: number;
  readonly premium: number;
  readonly percentage: number;
}

/**
 * Response for policy distribution by branch
 */
export interface GetPolicyDistributionByBranchResult {
  readonly distribution: readonly BranchDistribution[];
}

/**
 * Request for representative earnings analytics
 */
export interface GetRepresentativeEarningsAnalyticsRequest {
  readonly startDate: string;
  readonly endDate: string;
}

/**
 * Representative earning data
 */
export interface RepresentativeEarning {
  readonly representativeId: string;
  readonly representativeName: string;
  readonly earnings: number;
  readonly policyCount: number;
}

/**
 * Response for representative earnings analytics
 */
export interface GetRepresentativeEarningsAnalyticsResult {
  readonly earnings: readonly RepresentativeEarning[];
}
