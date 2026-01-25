/**
 * @fileoverview Proposal Contract Types - Request and response types for proposal management
 * @description All contract types for proposal operations including creation, revision, purchase, and document management
 */

import type {
  ProductBranch,
  Channel,
  UserReference,
  Currency,
  PaymentOption,
  Coverage,
  CreditCard,
  InsuranceProductType,
  InsuranceParameter,
  CustomerType,
  CustomerEmail,
  IndividualCustomerIdentityNumber,
  BirthDate,
  TaxNumber,
  ForeignCustomerIdentityNumber,
  PersonHeight,
  PersonWeight,
  ProposalSnapshotVehicle,
  ProposalSnapshotProperty,
} from "./common.js";
import type { CustomerPhoneNumber } from "./common.js";
import type { Gender, Job, Surgery, Disease } from "./customers.js";
import type { DaskOldPolicy } from "./common.js";

// ============================================================================
// PROPOSAL ENUMS
// ============================================================================

/**
 * Proposal State
 *
 * Represents the current state of an insurance proposal in its lifecycle.
 * Used to track proposal status from creation to completion or expiration.
 *
 * Bir sigorta teklifinin yaşam döngüsündeki mevcut durumunu temsil eder.
 * Teklif durumunu oluşturulmasından tamamlanmasına kadar takip etmek için kullanılır.
 */
export enum ProposalState {
  /**
   * The proposal is waiting for processing
   * Teklif işleme için bekliyor
   */
  Waiting = "WAITING",

  /**
   * The proposal is active and available for purchase
   * Teklif aktif ve satın alınabilir
   */
  Active = "ACTIVE",

  /**
   * The proposal purchase process is in progress
   * Teklif satın alma süreci devam ediyor
   */
  Purchasing = "PURCHASING",

  /**
   * The proposal has been purchased and converted to a policy
   * Teklif satın alınmış ve poliçeye dönüştürülmüş
   */
  Purchased = "PURCHASED",

  /**
   * The proposal processing has failed
   * Teklif işleme başarısız oldu
   */
  Failed = "FAILED",
}

/**
 * Proposal Product State
 *
 * Represents the processing state of an individual insurance product within a proposal.
 * Tracks the status of product quote generation and processing.
 *
 * Bir teklif içindeki bireysel sigorta ürününün işleme durumunu temsil eder.
 * Ürün teklif oluşturma ve işleme durumunu takip eder.
 */
export enum ProposalProductState {
  /**
   * The product is waiting for processing or pricing
   * Ürün işleme veya fiyatlandırma için bekliyor
   */
  Waiting = "WAITING",

  /**
   * The product processing has failed
   * Ürün işleme başarısız oldu
   */
  Failed = "FAILED",

  /**
   * The product has been successfully processed and priced
   * Ürün başarıyla işlendi ve fiyatlandırıldı
   */
  Active = "ACTIVE",

  /**
   * The product purchase is currently in progress
   * Ürün satın alma işlemi şu anda devam ediyor
   */
  Purchasing = "PURCHASING",

  /**
   * The product has been successfully purchased
   * Ürün başarıyla satın alındı
   */
  Purchased = "PURCHASED",
}

// ============================================================================
// PROPOSAL SNAPSHOT TYPES
// ============================================================================

// ============================================================================
// CUSTOMER TYPES FOR PROPOSAL SNAPSHOTS
// ============================================================================

/**
 * Union type for all customer snapshot types in proposals
 * Tekliflerdeki tüm müşteri anlık görüntü türleri için birleşim türü
 */
export type ProposalSnapshotCustomer =
  | ({
      readonly type: CustomerType.Individual;
      readonly identityNumber: IndividualCustomerIdentityNumber;
      readonly birthDate: BirthDate;
      readonly job?: Job;
      readonly gender?: Gender;
      readonly fullName: string;
    } & ProposalSnapshotCustomerBase)
  | ({
      readonly type: CustomerType.Company;
      readonly title: string;
      readonly taxNumber: TaxNumber;
    } & ProposalSnapshotCustomerBase)
  | ({
      readonly type: CustomerType.Foreign;
      readonly identityNumber: ForeignCustomerIdentityNumber;
      readonly birthDate: BirthDate;
      readonly job?: Job;
      readonly gender?: Gender;
      readonly fullName: string;
    } & ProposalSnapshotCustomerBase);

type ProposalSnapshotCustomerBase = {
  readonly id: string;
  readonly name: string;
  readonly city?: InsuranceParameter;
  readonly district?: InsuranceParameter;
  readonly email?: CustomerEmail;
  readonly phoneNumber?: CustomerPhoneNumber;
};

// ============================================================================
// PROPOSAL SNAPSHOT TYPES
// ============================================================================

/**
 * Union type for all proposal snapshot types
 * Tüm teklif anlık görüntü türleri için birleşim türü
 */
export type ProposalSnapshot =
  | ({
      readonly productBranch: ProductBranch.Tss;
      readonly height?: PersonHeight;
      readonly weight?: PersonWeight;
      readonly surgeries: Surgery[];
      readonly diseases: Disease[];
    } & ProposalSnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Kasko;
      readonly vehicle: ProposalSnapshotVehicle;
    } & ProposalSnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Trafik;
      readonly vehicle: ProposalSnapshotVehicle;
    } & ProposalSnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Imm;
      readonly vehicle: ProposalSnapshotVehicle;
    } & ProposalSnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Konut;
      readonly property: ProposalSnapshotProperty;
    } & ProposalSnapshotBase)
  | ({
      readonly productBranch: ProductBranch.Dask;
      readonly property: ProposalSnapshotProperty;
      readonly oldPolicy?: DaskOldPolicy;
    } & ProposalSnapshotBase);

type ProposalSnapshotBase = {
  readonly insurerCustomer: ProposalSnapshotCustomer;
  readonly insuredCustomer: ProposalSnapshotCustomer;
  readonly isInsuredCustomerSameAsInsurerCustomer: boolean;
};

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Union type for all proposal creation requests
 * Tüm teklif oluşturma talepleri için birleşim türü
 */
export type CreateProposalRequest =
  | ({
      readonly $type: "kasko";
      readonly productBranch: ProductBranch.Kasko;
      readonly vehicleId: string;
      readonly coverage?: Extract<
        Coverage,
        { productBranch: ProductBranch.Kasko }
      > | null;
    } & CreateProposalRequestBase)
  | ({
      readonly $type: "dask";
      readonly productBranch: ProductBranch.Dask;
      readonly propertyId: string;
    } & CreateProposalRequestBase)
  | ({
      readonly $type: "konut";
      readonly productBranch: ProductBranch.Konut;
      readonly propertyId: string;
      readonly coverage?: Extract<
        Coverage,
        { productBranch: ProductBranch.Konut }
      > | null;
    } & CreateProposalRequestBase)
  | ({
      readonly $type: "trafik";
      readonly productBranch: ProductBranch.Trafik;
      readonly vehicleId: string;
    } & CreateProposalRequestBase)
  | ({
      readonly $type: "tss";
      readonly productBranch: ProductBranch.Tss;
      readonly coverage?: Extract<
        Coverage,
        { productBranch: ProductBranch.Tss }
      > | null;
    } & CreateProposalRequestBase)
  | ({
      readonly $type: "imm";
      readonly productBranch: ProductBranch.Imm;
      readonly vehicleId: string;
      readonly coverage?: Extract<
        Coverage,
        { productBranch: ProductBranch.Imm }
      > | null;
    } & CreateProposalRequestBase);

type CreateProposalRequestBase = {
  readonly insurerCustomerId: string;
  readonly insuredCustomerId: string;
  readonly coverageGroupIds?: string[] | null;
  readonly channel: Channel;
};

/**
 * Get Proposal Product Premium Detail Request
 *
 * Request to retrieve detailed premium information for a specific insurance product and installment option.
 *
 * Belirli bir sigorta ürünü ve taksit seçeneği için detaylı prim bilgilerini alma talebi.
 */
export interface GetProposalProductPremiumDetailRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the product within the proposal
   * Teklif içindeki ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * The number of installments for the premium calculation
   * Prim hesaplaması için taksit sayısı
   */
  readonly installmentNumber: number;
}

/**
 * Purchase Proposal Product Sync Request
 *
 * Polymorphic request for synchronous proposal product purchase with different payment methods.
 *
 * Farklı ödeme yöntemleri ile senkron teklif ürün satın alma için polimorfik istek.
 */
export interface PurchaseProposalProductSyncRequest {
  /**
   * Unique identifier of the proposal containing the product to be purchased
   * Satın alınacak ürünü içeren teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Unique identifier of the specific product within the proposal to be purchased
   * Satın alınacak teklif içindeki belirli ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * Number of installments for the premium payment plan
   * Prim ödeme planı için taksit sayısı
   */
  readonly installmentNumber: number;
}

/**
 * Credit Card Purchase Request
 * Kredi kartı satın alma talebi
 */
export interface PurchaseProposalProductSyncCreditCardRequest extends PurchaseProposalProductSyncRequest {
  /**
   * Credit card information for payment processing
   * Ödeme işlemi için kredi kartı bilgileri
   */
  readonly card: CreditCard;
}

/**
 * Open Account Purchase Request
 * Açık hesap satın alma talebi
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PurchaseProposalProductSyncOpenAccountRequest extends PurchaseProposalProductSyncRequest {
  // No additional properties for open account payment
  // Açık hesap ödemesi için ek özellik yok
}

/**
 * Purchase Proposal Product Async Request
 *
 * Request to purchase an insurance product from a proposal using asynchronous processing.
 *
 * Asenkron işleme kullanarak bir tekliften sigorta ürünü satın alma talebi.
 */
export interface PurchaseProposalProductAsyncRequest {
  /**
   * Unique identifier of the insurance proposal containing the product to purchase
   * Satın alınacak ürünü içeren sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Unique identifier of the specific product within the proposal to purchase
   * Satın alınacak teklif içindeki belirli ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * Number of installments for the premium payment schedule
   * Prim ödeme programı için taksit sayısı
   */
  readonly installmentNumber: number;

  /**
   * URL where the customer should be redirected after completing the payment process
   * Ödeme sürecini tamamladıktan sonra müşterinin yönlendirilmesi gereken URL
   */
  readonly callbackUrl: string;
}

/**
 * 3D Secure Async Purchase Request
 * 3D Secure asenkron satın alma talebi
 */
export interface PurchaseProposalProductAsync3DSecureRequest extends PurchaseProposalProductAsyncRequest {
  /**
   * Credit card information for processing the payment
   * Ödemeyi işlemek için kredi kartı bilgileri
   */
  readonly card: CreditCard;
}

/**
 * Insurance Company Redirect Async Purchase Request
 * Sigorta şirketi yönlendirme asenkron satın alma talebi
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PurchaseProposalProductAsyncInsuranceCompanyRedirectRequest extends PurchaseProposalProductAsyncRequest {
  // No additional properties for insurance company redirect
  // Sigorta şirketi yönlendirmesi için ek özellik yok
}

/**
 * Get Proposal Product Coverage Request
 *
 * Request to retrieve coverage details for a specific insurance product within a proposal.
 *
 * Bir teklif içindeki belirli bir sigorta ürünü için teminat detaylarını alma talebi.
 */
export interface GetProposalProductCoverageRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the product within the proposal
   * Teklif içindeki ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;
}

/**
 * Revise Proposal Request
 *
 * Request to revise an existing insurance proposal with updated coverage options.
 *
 * Mevcut bir sigorta teklifini güncellenmiş teminat seçenekleri ile revize etme talebi.
 */
export interface ReviseProposalRequest {
  /**
   * The unique identifier of the proposal to revise
   * Revize edilecek teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The updated coverage configuration, or null to keep existing coverage
   * Güncellenmiş teminat konfigürasyonu veya mevcut teminatı korumak için null
   */
  readonly coverage?: Coverage | null;
}

/**
 * Revise Proposal Product Request
 *
 * Request to revise a specific insurance product within a proposal with updated parameters.
 *
 * Bir teklif içindeki belirli bir sigorta ürününü güncellenmiş parametrelerle revize etme talebi.
 */
export interface ReviseProposalProductRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the product to revise
   * Revize edilecek ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * The optional guarantee group identifier to apply
   * Uygulanacak isteğe bağlı garanti grubu tanımlayıcısı
   */
  readonly guaranteeGroupId?: string | null;

  /**
   * The updated coverage configuration, or null to keep existing coverage
   * Güncellenmiş teminat konfigürasyonu veya mevcut teminatı korumak için null
   */
  readonly coverage?: Coverage | null;
}

/**
 * Fetch Proposal Product Document Request
 *
 * Request to fetch a specific proposal product document.
 *
 * Belirli bir teklif ürün belgesini alma talebi.
 */
export interface FetchProposalProductDocumentRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the product within the proposal
   * Teklif içindeki ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;
}

/**
 * Fetch Proposal Information Form Document Request
 *
 * Request to fetch the information form document for a proposal.
 *
 * Bir teklif için bilgi formu belgesini alma talebi.
 */
export interface FetchProposalInformationFormDocumentRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the product within the proposal
   * Teklif içindeki ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;
}

/**
 * Send Proposal Product Document Request
 *
 * Request to send a specific proposal product document to a customer via communication channels.
 *
 * Müşteriye iletişim kanalları aracılığıyla belirli bir teklif ürün belgesi gönderme talebi.
 */
export interface SendProposalProductDocumentRequest {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Unique identifier of the specific product within the proposal
   * Teklif içindeki belirli ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * Customer identifier for document delivery
   * Belge teslimatı için müşteri tanımlayıcısı
   */
  readonly customerId: string;

  /**
   * Communication method and details for document delivery
   * Belge teslimatı için iletişim yöntemi ve detayları
   */
  readonly communication: Communication;
}

/**
 * Communication Method Base
 *
 * Abstract base class defining the contract for different communication methods.
 *
 * Farklı iletişim yöntemleri için sözleşmeyi tanımlayan soyut temel sınıf.
 */
/**
 * Union type for all communication methods
 * Tüm iletişim yöntemleri için birleşim türü
 */
export type Communication =
  | {
      readonly type: "email";
      readonly email: string;
    }
  | {
      readonly type: "sms";
      readonly phoneNumber: CustomerPhoneNumber;
    };

/**
 * Send Proposal Information Form Document Request
 *
 * Request to send the information form document to a customer.
 *
 * Müşteriye bilgi formu belgesini gönderme talebi.
 */
export interface SendProposalInformationFormDocumentRequest {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Unique identifier of the specific product within the proposal
   * Teklif içindeki belirli ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * Customer identifier for document delivery
   * Belge teslimatı için müşteri tanımlayıcısı
   */
  readonly customerId: string;

  /**
   * Communication method and details for document delivery
   * Belge teslimatı için iletişim yöntemi ve detayları
   */
  readonly communication: Communication;
}

/**
 * Generate Compare Proposal Products PDF Request
 *
 * Request to generate a comparison PDF document for multiple proposal products.
 *
 * Birden fazla teklif ürünü için karşılaştırma PDF belgesi oluşturma talebi.
 */
export interface GenerateCompareProposalProductsPdfRequest {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Array of product identifiers to include in the comparison
   * Karşılaştırmaya dahil edilecek ürün tanımlayıcıları dizisi
   */
  readonly proposalProductIds: readonly string[];

  /**
   * Array of coverage field names to exclude from the comparison document
   * Karşılaştırma belgesinden hariç tutulacak teminat alan adları dizisi
   */
  readonly excludedCoverageFields: readonly string[];
}

/**
 * Send Compare Proposal Products PDF Request
 *
 * Request to send a comparison PDF document of multiple proposal products to a customer.
 *
 * Müşteriye birden fazla teklif ürününün karşılaştırma PDF belgesini gönderme talebi.
 */
export interface SendCompareProposalProductsPdfRequest {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Array of product identifiers to include in the comparison
   * Karşılaştırmaya dahil edilecek ürün tanımlayıcıları dizisi
   */
  readonly proposalProductIds: readonly string[];

  /**
   * Array of coverage field names to exclude from the comparison document
   * Karşılaştırma belgesinden hariç tutulacak teminat alan adları dizisi
   */
  readonly excludedCoverageFields: readonly string[];

  /**
   * Customer identifier for document delivery
   * Belge teslimatı için müşteri tanımlayıcısı
   */
  readonly customerId: string;

  /**
   * Communication method and details for document delivery
   * Belge teslimatı için iletişim yöntemi ve detayları
   */
  readonly communication: SendCompareProposalCommunication;
}

/**
 * Send Compare Proposal Communication Method Base
 *
 * Abstract base class defining the contract for different communication methods for comparison documents.
 *
 * Karşılaştırma belgeleri için farklı iletişim yöntemleri için sözleşmeyi tanımlayan soyut temel sınıf.
 */
/**
 * Union type for all compare proposal communication methods
 * Tüm karşılaştırma teklifi iletişim yöntemleri için birleşim türü
 */
export type SendCompareProposalCommunication =
  | {
      readonly type: "email";
      readonly email: string;
    }
  | {
      readonly type: "sms";
      readonly phoneNumber: CustomerPhoneNumber;
    };

/**
 * Set Proposal Representative Request
 *
 * Request to assign or change the representative agent for an insurance proposal.
 *
 * Bir sigorta teklifi için temsilci acente atama veya değiştirme talebi.
 */
export interface SetProposalRepresentativeRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The user ID of the agent to assign as representative, or null to remove assignment
   * Temsilci olarak atanacak acentenin kullanıcı ID'si veya atamayı kaldırmak için null
   */
  readonly representativeAgentUserId?: string | null;
}

/**
 * Retry Failed Proposal Product Request
 *
 * Request to retry processing of a failed insurance product within a proposal.
 *
 * Bir teklif içindeki başarısız sigorta ürününün işlenmesini yeniden deneme talebi.
 */
export interface RetryFailedProposalProductRequest {
  /**
   * The unique identifier of the proposal
   * Teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * The unique identifier of the failed product to retry
   * Yeniden denenecek başarısız ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Create Proposal Response
 *
 * Response returned after successfully creating a new insurance proposal.
 *
 * Yeni bir sigorta teklifini başarıyla oluşturduktan sonra döndürülen yanıt.
 */
export interface CreateProposalResult {
  /**
   * Unique identifier of the newly created insurance proposal
   * Yeni oluşturulan sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;
}

/**
 * Get Proposal By ID Response
 *
 * Response for retrieving detailed information about a specific insurance proposal by its ID.
 *
 * Belirli bir sigorta teklifinin ID'sine göre detaylı bilgilerini alma yanıtı.
 */
export interface GetProposalByIdResult {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Insurance product branch that this proposal belongs to
   * Bu teklifin ait olduğu sigorta ürün dalı
   */
  readonly productBranch: ProductBranch;

  /**
   * Total number of insurance products included in this proposal
   * Bu teklifte yer alan toplam sigorta ürün sayısı
   */
  readonly totalProductsCount: number;

  /**
   * Number of insurance products that successfully generated quotes
   * Başarıyla teklif üreten sigorta ürün sayısı
   */
  readonly succeedProductsCount: number;

  /**
   * Reference to the agent user who created this proposal
   * Bu teklifi oluşturan acente kullanıcısına referans
   */
  readonly agentUserCreatedBy: UserReference;

  /**
   * Reference to the representative handling this proposal, if any
   * Varsa, bu teklifi işleyen temsilciye referans
   */
  readonly representedBy?: UserReference | null;

  /**
   * Timestamp when this proposal was created
   * Bu teklifin oluşturulduğu zaman damgası
   */
  readonly createdAt: string;

  /**
   * Current state of the proposal in the processing workflow
   * İşleme iş akışındaki teklifin mevcut durumu
   */
  readonly state: ProposalState;

  /**
   * Sales channel through which this proposal was created
   * Bu teklifin oluşturulduğu satış kanalı
   */
  readonly channel: Channel;

  /**
   * Lowest premium amount among all successful product quotes
   * Tüm başarılı ürün teklifleri arasındaki en düşük prim tutarı
   */
  readonly lowestPremium?: number | null;

  /**
   * Customer ID of the insurance policy holder/payer
   * Sigorta poliçe sahibi/ödeyicisinin müşteri ID'si
   */
  readonly insurerCustomerId: string;

  /**
   * Customer ID of the person/entity being insured
   * Sigortalanan kişi/kuruluşun müşteri ID'si
   */
  readonly insuredCustomerId: string;

  /**
   * Highest premium amount among all successful product quotes
   * Tüm başarılı ürün teklifleri arasındaki en yüksek prim tutarı
   */
  readonly highestPremium?: number | null;

  /**
   * Initial coverage configuration specified when creating the proposal
   * Teklif oluşturulurken belirtilen başlangıç teminat konfigürasyonu
   */
  readonly initialCoverage?: Coverage | null;

  /**
   * Collection of insurance products and their quotes from various companies
   * Çeşitli şirketlerden sigorta ürünleri ve tekliflerinin koleksiyonu
   */
  readonly products: readonly {
    /**
     * Unique identifier for this product quote
     * Bu ürün teklifinin benzersiz tanımlayıcısı
     */
    readonly id: string;

    /**
     * Identifier of the insurance company providing this quote
     * Bu teklifi sunan sigorta şirketinin tanımlayıcısı
     */
    readonly insuranceCompanyId: number;

    /**
     * Identifier of the specific insurance product
     * Belirli sigorta ürününün tanımlayıcısı
     */
    readonly productId: number;

    /**
     * Premium calculations for different payment installments
     * Farklı ödeme taksitleri için prim hesaplamaları
     */
    readonly premiums: readonly {
      /**
       * The installment number for this premium calculation
       * Bu prim hesaplaması için taksit numarası
       */
      readonly installmentNumber: number;

      /**
       * Net premium amount before taxes and fees
       * Vergi ve ücretler öncesi net prim tutarı
       */
      readonly netPremium: number;

      /**
       * Total premium amount including all taxes and fees
       * Tüm vergi ve ücretler dahil toplam prim tutarı
       */
      readonly grossPremium: number;

      /**
       * Commission amount for the agent or intermediary
       * Acente veya aracı için komisyon tutarı
       */
      readonly commission: number;

      /**
       * Exchange rate used for currency conversion if applicable
       * Uygulanabilirse döviz kuru dönüştürme için kullanılan kur
       */
      readonly exchangeRate: number;

      /**
       * Currency in which this premium is calculated
       * Bu primin hesaplandığı para birimi
       */
      readonly currency: Currency;

      /**
       * Insurance company's internal proposal or quote number
       * Sigorta şirketinin dahili teklif veya fiyat teklifi numarası
       */
      readonly insuranceCompanyProposalNumber?: string | null;
    }[];

    /**
     * Current processing state of this product quote
     * Bu ürün teklifinin mevcut işleme durumu
     */
    readonly state: ProposalProductState;

    /**
     * Indicates if this product requires manual investigation by the insurance company
     * Bu ürünün sigorta şirketi tarafından manuel inceleme gerektirip gerektirmediğini gösterir
     */
    readonly needsInvestigationByCompany: boolean;

    /**
     * Indicates if a vocational discount is applied to this quote
     * Bu teklife mesleki indirim uygulanıp uygulanmadığını gösterir
     */
    readonly hasVocationalDiscount: boolean;

    /**
     * Indicates if an undamaged/no-claims discount is applied
     * Hasarsızlık/talepsizlik indiriminin uygulanıp uygulanmadığını gösterir
     */
    readonly hasUndamagedDiscount: boolean;

    /**
     * Indicates if this product quote has been revised
     * Bu ürün teklifinin revize edilip edilmediğini gösterir
     */
    readonly revised: boolean;

    /**
     * Policy identifier if this product has been purchased
     * Bu ürün satın alınmışsa poliçe tanımlayıcısı
     */
    readonly policyId?: string | null;

    /**
     * Error message if the product quote failed
     * Ürün teklifi başarısız olursa hata mesajı
     */
    readonly errorMessage?: string | null;

    /**
     * Coverage as provided by the insurance service provider
     * Sigorta hizmet sağlayıcısı tarafından sağlanan teminat
     */
    readonly insuranceServiceProviderCoverage?: Coverage | null;

    /**
     * Coverage configuration used for PDF document generation
     * PDF belge oluşturma için kullanılan teminat konfigürasyonu
     */
    readonly pdfCoverage?: Coverage | null;

    /**
     * Original coverage requested for this specific product
     * Bu belirli ürün için talep edilen orijinal teminat
     */
    readonly initialCoverage?: Coverage | null;

    /**
     * Name of the insurance company providing this quote
     * Bu teklifi sunan sigorta şirketinin adı
     */
    readonly insuranceCompanyName: string;

    /**
     * Logo URL or identifier for the insurance company
     * Sigorta şirketi için logo URL'si veya tanımlayıcısı
     */
    readonly insuranceCompanyLogo?: string | null;

    /**
     * Name of the insurance product
     * Sigorta ürününün adı
     */
    readonly productName: string;

    /**
     * Type/category of the insurance product
     * Sigorta ürününün türü/kategorisi
     */
    readonly productType: InsuranceProductType;

    /**
     * Identifier of the coverage group this product belongs to
     * Bu ürünün ait olduğu teminat grubunun tanımlayıcısı
     */
    readonly coverageGroupId?: string | null;

    /**
     * Name of the coverage group this product belongs to
     * Bu ürünün ait olduğu teminat grubunun adı
     */
    readonly coverageGroupName?: string | null;

    /**
     * Payment options supported by this insurance product
     * Bu sigorta ürünü tarafından desteklenen ödeme seçenekleri
     */
    readonly supportedPaymentOptions: readonly PaymentOption[];
  }[];

  /**
   * Snapshot of the customer and asset data at the time of proposal creation
   * Teklif oluşturma anındaki müşteri ve varlık verilerinin anlık görüntüsü
   */
  readonly snapshot: ProposalSnapshot;

  /**
   * Coverage groups available for this proposal type
   * Bu teklif türü için mevcut teminat grupları
   */
  readonly coverageGroups: readonly {
    /**
     * Unique identifier for this coverage group
     * Bu teminat grubunun benzersiz tanımlayıcısı
     */
    readonly id: string;

    /**
     * Coverage configuration for this group
     * Bu grup için teminat konfigürasyonu
     */
    readonly coverage: Coverage;

    /**
     * Display name for this coverage group
     * Bu teminat grubunun görüntüleme adı
     */
    readonly name: string;
  }[];
}

/**
 * Get Proposal Product Premium Detail Response
 *
 * Detailed premium information for a specific insurance product within a proposal.
 *
 * Bir teklif içindeki belirli bir sigorta ürünü için detaylı prim bilgileri.
 */
export interface GetProposalProductPremiumDetailResult {
  /**
   * Unique identifier of the insurance proposal
   * Sigorta teklifinin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;

  /**
   * Unique identifier of the specific product within the proposal
   * Teklif içindeki belirli ürünün benzersiz tanımlayıcısı
   */
  readonly proposalProductId: string;

  /**
   * Customer ID of the policy holder who will pay the premiums
   * Primleri ödeyecek poliçe sahibinin müşteri ID'si
   */
  readonly insurerCustomerId: string;

  /**
   * Customer ID of the person/entity being insured
   * Sigortalanan kişi/kuruluşun müşteri ID'si
   */
  readonly insuredCustomerId: string;

  /**
   * The installment number for this premium calculation
   * Bu prim hesaplaması için taksit numarası
   */
  readonly installmentNumber: number;

  /**
   * Internal identifier used by the insurance services system
   * Sigorta hizmetleri sistemi tarafından kullanılan dahili tanımlayıcı
   */
  readonly insuranceServicesProposalId: string;

  /**
   * Internal identifier for the premium calculation in insurance services
   * Sigorta hizmetlerinde prim hesaplaması için dahili tanımlayıcı
   */
  readonly insuranceServicesPremiumId: string;

  /**
   * Insurance company's internal proposal or quote number
   * Sigorta şirketinin dahili teklif veya fiyat teklifi numarası
   */
  readonly insuranceCompanyProposalNumber?: string | null;
}

/**
 * Purchase Proposal Product Sync Response
 *
 * Response for synchronous purchase of an insurance product from a proposal.
 *
 * Bir tekliften sigorta ürününün senkron satın alınması için yanıt.
 */
export interface PurchaseProposalProductSyncResult {
  /**
   * The unique identifier of the newly created insurance policy
   * Yeni oluşturulan sigorta poliçesinin benzersiz tanımlayıcısı
   */
  readonly policyId: string;
}

/**
 * Purchase Proposal Product Async Response
 *
 * Response for asynchronous purchase of an insurance product from a proposal.
 *
 * Bir tekliften sigorta ürününün asenkron satın alınması için yanıt.
 */
export interface PurchaseProposalProductAsyncResult {
  /**
   * URL where the customer should be redirected to complete the purchase
   * Müşterinin satın almayı tamamlamak için yönlendirilmesi gereken URL
   */
  readonly redirectUrl: string;
}

/**
 * Get Proposal Product Coverage Response
 *
 * Response containing coverage details for a specific insurance product within a proposal.
 *
 * Bir teklif içindeki belirli bir sigorta ürünü için teminat detaylarını içeren yanıt.
 */
export interface GetProposalProductCoverageResult {
  /**
   * The complete coverage configuration for the requested insurance product
   * Talep edilen sigorta ürünü için tam teminat konfigürasyonu
   */
  readonly coverage: Coverage;
}

/**
 * Revise Proposal Response
 *
 * Response after successfully revising an existing insurance proposal.
 *
 * Mevcut bir sigorta teklifini başarıyla revize ettikten sonraki yanıt.
 */
export interface ReviseProposalResult {
  /**
   * The unique identifier of the revised proposal
   * Revize edilmiş teklifin benzersiz tanımlayıcısı
   */
  readonly proposalId: string;
}

/**
 * Fetch Proposal Product Document Response
 *
 * Response containing URL for accessing a specific proposal product document.
 *
 * Belirli bir teklif ürün belgesine erişim için URL içeren yanıt.
 */
export interface FetchProposalProductDocumentResult {
  /**
   * The URL to access or download the proposal product document
   * Teklif ürün belgesine erişmek veya indirmek için URL
   */
  readonly url: string;
}

/**
 * Fetch Proposal Information Form Document Response
 *
 * Response containing URL for accessing the proposal information form document.
 *
 * Teklif bilgi formu belgesine erişim için URL içeren yanıt.
 */
export interface FetchProposalInformationFormDocumentResult {
  /**
   * The URL to access or download the proposal information form document
   * Teklif bilgi formu belgesine erişmek veya indirmek için URL
   */
  readonly url: string;
}

/**
 * Generate Compare Proposal Products PDF Result
 *
 * Result of generating a comparison PDF document for multiple proposal products.
 *
 * Birden fazla teklif ürünü için karşılaştırma PDF belgesi oluşturma sonucu.
 */
export interface GenerateCompareProposalProductsPdfResult {
  /**
   * The URL to access or download the generated comparison PDF document
   * Oluşturulan karşılaştırma PDF belgesine erişmek veya indirmek için URL
   */
  readonly url: string;
}

// ============================================================================
// BRANCH ASSIGNMENT TYPES
// ============================================================================

/**
 * Request to set proposal branch
 */
export interface SetProposalBranchRequest {
  readonly proposalId: string;
  readonly branchId: string;
}

// ============================================================================
// CUSTOMER PROPOSAL DOCUMENT TYPES
// ============================================================================

/**
 * Request to generate customer proposal document PDF
 */
export interface GenerateCustomerProposalDocumentPdfRequest {
  readonly proposalId: string;
  readonly proposalProductIds: readonly string[];
}

/**
 * Response for generated customer proposal document PDF
 */
export interface GenerateCustomerProposalDocumentPdfResult {
  readonly url: string;
}

// ============================================================================
// CONVERSION ANALYTICS TYPES
// ============================================================================

/**
 * Request for proposal conversion trend analytics
 */
export interface GetProposalConversionTrendRequest {
  readonly startDate: string;
  readonly endDate: string;
}

/**
 * Conversion data point
 */
export interface ConversionDataPoint {
  readonly date: string;
  readonly proposalCount: number;
  readonly policyCount: number;
  readonly conversionRate: number;
}

/**
 * Response for proposal conversion trend analytics
 */
export interface GetProposalConversionTrendResult {
  readonly timeSeries: readonly ConversionDataPoint[];
  readonly conversionRate: number;
}
