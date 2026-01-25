/**
 * @fileoverview Case Management Contracts - Case management operations
 * @description TypeScript contracts for case management operations
 */

import {
  Channel,
  AssetType,
  CustomerType,
  ProductBranch,
  Currency,
  PaymentOption,
  PolicyState
} from "./common.js";
import type {
  InsuranceParameter,
  UserReference,
  VehicleEngine,
  VehicleChassis,
  VehicleRegistrationDate,
  VehicleSeatNumber,
  PropertyNumber,
  PropertySquareMeter,
  PropertyConstructionYear,

  CustomerEmail,
  BirthDate} from "./common.js";
import type { CustomerPhoneNumber } from "./common.js";
import type {
  VehicleModel,
  VehiclePlate,
  VehicleDocumentSerial,
  VehicleFuel,
  VehicleUtilizationStyle,
  PropertyDamageStatus,
  PropertyFloor,
  PropertyStructure,
  PropertyUtilizationStyle,
  PropertyOwnershipType,
} from "./common.js";

// ============================================================================
// CASE-SPECIFIC ENUMS
// ============================================================================

/**
 * Insurance Case Types
 *
 * Primary categorization of insurance cases that defines the business context, processing workflows,
 * and service requirements for different customer interactions. Each case type has distinct business
 * rules, documentation requirements, approval processes, and success criteria. Essential for routing
 * cases to appropriate specialists, applying correct service level agreements, and ensuring
 * consistent handling procedures across the organization.
 *
 * Farklı müşteri etkileşimleri için iş bağlamını, işleme iş akışlarını ve hizmet gereksinimlerini
 * tanımlayan sigorta taleplerinin birincil kategorizasyonu. Her talep türünün kendine özgü iş kuralları,
 * belgelendirme gereksinimleri, onay süreçleri ve başarı kriterleri vardır. Talepleri uygun uzmanlara
 * yönlendirmek, doğru hizmet seviye anlaşmalarını uygulamak ve kuruluş genelinde tutarlı işleme
 * prosedürlerini sağlamak için gereklidir.
 */
export enum CaseType {
  /**
   * Sales opportunity case for new business acquisition or policy sales
   */
  SaleOpportunity = "SALE_OPPORTUNITY",
  /**
   * Policy endorsement case for modifications and changes
   */
  Endorsement = "ENDORSEMENT",
  /**
   * Policy cancellation case
   */
  Cancel = "CANCEL",
  /**
   * Customer complaint case
   */
  Complaint = "COMPLAINT",
}

/**
 * Case Main States
 */
export enum CaseMainState {
  Fail = "FAIL",
  Open = "OPEN",
  InProgress = "IN_PROGRESS",
  Success = "SUCCESS",
}

/**
 * Case Sub-States
 */
export enum CaseSubState {
  FailNoResponse = "FAIL_NO_RESPONSE",
  FailInvalidCase = "FAIL_INVALID_CASE",
  FailCustomerWithdrawn = "FAIL_CUSTOMER_WITHDRAWN",
  FailPaymentError = "FAIL_PAYMENT_ERROR",
  FailDeclinedCardInformation = "FAIL_DECLINED_CARD_INFORMATION",
  FailForeignUser = "FAIL_FOREIGN_USER",
  FailTakenElsewhere = "FAIL_TAKEN_ELSEWHERE",
  FailPriceTooHigh = "FAIL_PRICE_TOO_HIGH",
  FailAssetAcquisition = "FAIL_ASSET_ACQUISITION",
  FailAssetSold = "FAIL_ASSET_SOLD",
  FailUnresolved = "FAIL_UNRESOLVED",
  FailReferredToLegal = "FAIL_REFERRED_TO_LEGAL",
  FailCustomerUnsatisfied = "FAIL_CUSTOMER_UNSATISFIED",
  FailMissingDocuments = "FAIL_MISSING_DOCUMENTS",
  FailInsurerDenied = "FAIL_INSURER_DENIED",
  FailConditionsNotMet = "FAIL_CONDITIONS_NOT_MET",
  OpenInitial = "OPEN_INITIAL",
  OpenCollectingInformation = "OPEN_COLLECTING_INFORMATION",
  OpenDelayed = "OPEN_DELAYED",
  OpenWaiting = "OPEN_WAITING",
  InProgressUnderAnalysis = "IN_PROGRESS_UNDER_ANALYSIS",
  InProgressProposalPrepared = "IN_PROGRESS_PROPOSAL_PREPARED",
  InProgressAwaitingApproval = "IN_PROGRESS_AWAITING_APPROVAL",
  InProgressToBeRecontacted = "IN_PROGRESS_TO_BE_RECONTACTED",
  SuccessCompleted = "SUCCESS_COMPLETED",
}

/**
 * Case Status
 */
export enum CaseStatus {
  Open = "OPEN",
  Delayed = "DELAYED",
  Success = "SUCCESS",
  Fail = "FAIL",
}

/**
 * Represents specific subtypes of sales opportunity cases that categorize different sales scenarios and business development activities.
 * Sales opportunity subtypes help optimize sales processes and track different revenue streams and customer acquisition strategies.
 *
 * Farklı satış senaryolarını ve iş geliştirme faaliyetlerini kategorize eden satış fırsatı taleplerinin belirli alt türlerini temsil eder.
 * Satış fırsatı alt türleri, satış süreçlerini optimize etmeye ve farklı gelir akışları ile müşteri kazanım stratejilerini takip etmeye yardımcı olur.
 */
export enum SaleOpportunityCaseSubType {
  /**
   * New customer acquisition sale with first-time policy purchase.
   *
   * İlk kez poliçe satın alımı ile yeni müşteri kazanım satışı.
   */
  NewSale = "NEW_SALE",

  /**
   * Cross-selling additional products to existing customers.
   *
   * Mevcut müşterilere ek ürünlerin çapraz satışı.
   */
  CrossSale = "CROSS_SALE",

  /**
   * Policy renewal sale for existing coverage continuation.
   *
   * Mevcut teminatın devamı için poliçe yenileme satışı.
   */
  Renewal = "RENEWAL",
}

/**
 * Policy Cancellation Case Subtypes
 *
 * Enumeration of specific cancellation scenarios that require different processing workflows,
 * documentation requirements, and refund calculations. Each subtype represents a distinct reason
 * for policy termination with its own business rules, timing requirements, and administrative procedures.
 * Critical for ensuring proper handling of cancellation requests, calculating appropriate refunds,
 * and maintaining compliance with insurance regulations and customer service standards.
 *
 * Farklı işlem akışları, belgelendirme gereksinimleri ve iade hesaplamaları gerektiren belirli
 * iptal senaryolarının numaralandırması. Her alt tür, kendi iş kuralları, zamanlama gereksinimleri
 * ve idari prosedürleri ile farklı bir poliçe fesih nedenini temsil eder. İptal taleplerinin uygun
 * şekilde işlenmesi, uygun iadelerin hesaplanması ve sigorta düzenlemeleri ile müşteri hizmetleri
 * standartlarına uyumun sağlanması için kritiktir.
 */
export enum CancelCaseSubType {
  /**
   * Online Cancellation with Refund / İade ile Çevrimiçi İptal
   *
   * Policy cancellation initiated through digital channels (website, mobile app) with automatic
   * refund processing. This self-service option allows customers to cancel policies and receive
   * prorated refunds without agent intervention. Typically includes automated calculations for
   * cancellation fees, used coverage periods, and final refund amounts based on policy terms and conditions.
   *
   * Otomatik iade işlemi ile dijital kanallar (web sitesi, mobil uygulama) aracılığıyla başlatılan
   * poliçe iptali. Bu self-servis seçeneği, müşterilerin acente müdahalesi olmadan poliçeleri iptal etmelerini
   * ve oransal iadeler almalarını sağlar. Genellikle iptal ücretleri, kullanılan teminat dönemleri ve
   * poliçe şartlarına göre nihai iade tutarları için otomatik hesaplamaları içerir.
   */
  OnlineCancellationRefund = "ONLINE_CANCELLATION_REFUND",
  /**
   * MEB (Ministry of Education) Cancellation / MEB (Milli Eğitim Bakanlığı) İptali
   *
   * Policy cancellation required due to Ministry of Education regulations, typically related to
   * educational institution insurance requirements or student insurance policies. May involve special
   * regulatory compliance procedures and specific documentation requirements. Often processed with
   * expedited timelines to meet educational calendar requirements.
   *
   * Milli Eğitim Bakanlığı düzenlemeleri nedeniyle gereken poliçe iptali, genellikle eğitim kurumu
   * sigorta gereksinimleri veya öğrenci sigorta poliçeleri ile ilgilidir. Özel düzenleyici uyumluluk
   * prosedürleri ve belirli belgelendirme gereksinimlerini içerebilir. Genellikle eğitim takvimi
   * gereksinimlerini karşılamak için hızlandırılmış zaman çizelgeleri ile işlenir.
   */
  MebCancellation = "MEB_CANCELLATION",
  /**
   * Partial Policy Cancellation / Kısmi Poliçe İptali
   *
   * Cancellation of specific coverage components or partial termination of policy terms while
   * maintaining other active coverages. Requires careful calculation of prorated premiums and
   * adjustments to remaining policy terms. Common in scenarios where customers want to reduce
   * coverage levels or remove specific optional coverages while keeping basic protection active.
   *
   * Diğer aktif teminatları korurken belirli teminat bileşenlerinin iptali veya poliçe şartlarının
   * kısmi feshi. Oransal primlerin dikkatli hesaplanmasını ve kalan poliçe şartlarında ayarlamalar
   * yapılmasını gerektirir. Müşterilerin temel korumayı aktif tutarken teminat seviyelerini azaltmak
   * veya belirli isteğe bağlı teminatları kaldırmak istediği senaryolarda yaygındır.
   */
  PartialCancellation = "PARTIAL_CANCELLATION",
  /**
   * Cancellation from Sale Process / Satış Sürecinden İptal
   */
  CancellationFromSale = "CANCELLATION_FROM_SALE",
  /**
   * Cancellation Due to Collection Issues / Tahsilat Sorunları Nedeniyle İptal
   */
  CancellationDueToCollection = "CANCELLATION_DUE_TO_COLLECTION",
  /**
   * Cancellation Due to Damage / Hasar Nedeniyle İptal
   *
   * Policy termination following total loss or constructive total loss events where the insured
   * asset is deemed beyond economical repair. Involves coordination with claims processing, salvage
   * operations, and final settlement calculations. Requires careful handling of remaining premium
   * refunds and coordination with loss adjusters and repair facilities.
   *
   * Sigortalı varlığın ekonomik onarımın ötesinde kabul edildiği tam hasar veya yapıcı tam hasar
   * olaylarını takiben poliçe feshi. Hasar işleme, hurda işlemleri ve nihai uzlaşma hesaplamaları ile
   * koordinasyon içerir. Kalan prim iadelerinin dikkatli işlenmesini ve eksper ile onarım tesisleri
   * ile koordinasyonu gerektirir.
   */
  CancellationDueToDamage = "CANCELLATION_DUE_TO_DAMAGE",
}

/**
 * Customer Complaint Case Subtypes
 *
 * Categorization of customer complaints based on the nature of the issue and the area of
 * service or process involved. This classification enables proper routing of complaints to
 * specialized resolution teams, ensures appropriate handling procedures, and facilitates
 * regulatory reporting requirements. Essential for customer service quality management,
 * compliance monitoring, and operational improvement initiatives.
 *
 * Sorunun doğası ve dahil olan hizmet veya süreç alanına dayalı müşteri şikayetlerinin
 * kategorizasyonu. Bu sınıflandırma, şikayetlerin uzman çözüm ekiplerine uygun yönlendirilmesini
 * sağlar, uygun işleme prosedürlerini garanti eder ve düzenleyici raporlama gereksinimlerini
 * kolaylaştırır. Müşteri hizmetleri kalite yönetimi, uyumluluk izleme ve operasyonel iyileştirme
 * girişimleri için gereklidir.
 */
export enum ComplaintCaseSubType {
  /**
   * Consultant Error Complaint / Danışman Hatası Şikayeti
   *
   * Complaints regarding errors, misinformation, or inappropriate behavior by insurance
   * consultants or agents. Includes issues such as incorrect advice, misrepresentation of
   * policy terms, unprofessional conduct, or failure to provide adequate service.
   * Requires investigation of agent conduct and may involve disciplinary actions or additional training.
   *
   * Sigorta danışmanları veya acenteleri tarafından yapılan hatalar, yanlış bilgilendirme
   * veya uygunsuz davranışlar hakkında şikayetler. Yanlış tavsiye, poliçe şartlarının yanlış
   * sunumu, profesyonel olmayan davranış veya yeterli hizmet sağlayamama gibi sorunları içerir.
   * Acente davranışının araştırılmasını gerektirir ve disiplin eylemleri veya ek eğitim içerebilir.
   */
  ConsultantError = "CONSULTANT_ERROR",
  /**
   * Policy Operations Complaint / Poliçe Operasyonları Şikayeti
   *
   * Complaints related to policy administration, endorsements, renewals, or other
   * operational aspects of policy management. Includes issues with policy issuance,
   * documentation errors, processing delays, or system-related problems affecting
   * policy services. Requires review of operational procedures and system functionality.
   *
   * Poliçe yönetimi, zeyilnameler, yenilemeler veya poliçe yönetiminin diğer operasyonel
   * yönleri ile ilgili şikayetler. Poliçe düzenleme, belgelendirme hataları, işleme gecikmeleri
   * veya poliçe hizmetlerini etkileyen sistemle ilgili sorunları içerir. Operasyonel prosedürlerin
   * ve sistem işlevselliğinin gözden geçirilmesini gerektirir.
   */
  PolicyOperations = "POLICY_OPERATIONS",
  /**
   * Premium Collection Complaint / Prim Tahsilat Şikayeti
   *
   * Complaints regarding premium collection practices, payment processing issues,
   * or billing disputes. Includes problems with payment methods, incorrect billing amounts,
   * unauthorized charges, or aggressive collection practices. Requires review of billing
   * procedures and payment processing systems to ensure compliance with regulations.
   *
   * Prim tahsilat uygulamaları, ödeme işleme sorunları veya faturalandırma anlaşmazlıkları
   * ile ilgili şikayetler. Ödeme yöntemleri ile ilgili sorunlar, yanlış faturalandırma tutarları,
   * yetkisiz ücretlendirmeler veya agresif tahsilat uygulamalarını içerir. Düzenlemelere uyumu
   * sağlamak için faturalandırma prosedürleri ve ödeme işleme sistemlerinin gözden geçirilmesini gerektirir.
   */
  Collection = "COLLECTION",
  /**
   * Frequent Calls Complaint / Sık Arama Şikayeti
   *
   * Complaints about excessive or unwanted communications from the insurance company,
   * including too many phone calls, SMS messages, or emails. May involve marketing calls,
   * renewal reminders, or collection attempts that customers find intrusive or annoying.
   * Requires review of communication policies and customer preference settings.
   *
   * Sigorta şirketinden gelen aşırı veya istenmeyen iletişimler hakkında şikayetler,
   * çok fazla telefon görüşmesi, SMS mesajı veya e-posta dahil. Müşterilerin rahatsız edici
   * veya can sıkıcı bulduğu pazarlama aramaları, yenileme hatırlatmaları veya tahsilat
   * girişimlerini içerebilir. İletişim politikalarının ve müşteri tercih ayarlarının
   * gözden geçirilmesini gerektirir.
   */
  DueToFrequentCalls = "DUE_TO_FREQUENT_CALLS",
  /**
   * Fraud-Related Complaint / Dolandırıcılık İlgili Şikayet
   *
   * Complaints involving suspected fraudulent activities, either by company representatives
   * or third parties. Includes identity theft, unauthorized policy changes, false claims,
   * or misrepresentation of company services. Requires immediate investigation, potential
   * law enforcement involvement, and special handling procedures to protect customer interests.
   *
   * Şirket temsilcileri veya üçüncü şahıslar tarafından şüpheli dolandırıcılık faaliyetlerini
   * içeren şikayetler. Kimlik hırsızlığı, yetkisiz poliçe değişiklikleri, sahte talepler veya
   * şirket hizmetlerinin yanlış sunumu dahildir. Anında araştırma, potansiyel kolluk kuvvetleri
   * müdahalesi ve müşteri çıkarlarını korumak için özel işleme prosedürleri gerektirir.
   */
  Fraud = "FRAUD",
  /**
   * Damage/Claims Handling Complaint / Hasar/Talep İşleme Şikayeti
   *
   * Complaints regarding claims processing, damage assessment, settlement amounts,
   * or claims denial decisions. Includes issues with claims adjusters, repair quality,
   * settlement delays, or disagreements with damage evaluations. Requires review of
   * claims handling procedures and may involve independent assessments or re-evaluations.
   *
   * Hasar işleme, zarar değerlendirme, uzlaşma tutarları veya hasar red kararları ile
   * ilgili şikayetler. Eksperler, onarım kalitesi, uzlaşma gecikmeleri veya zarar değerlendirmeleri
   * ile anlaşmazlıkları içerir. Hasar işleme prosedürlerinin gözden geçirilmesini gerektirir
   * ve bağımsız değerlendirmeler veya yeniden değerlendirmeler içerebilir.
   */
  Damage = "DAMAGE",
  /**
   * Erroneous Transaction Complaint / Hatalı İşlem Şikayeti
   *
   * Complaints about incorrect financial transactions, system errors, or processing mistakes
   * that result in wrong charges, incorrect payments, or data inaccuracies. Requires
   * investigation of transaction records, system logs, and correction of any identified errors.
   * May involve financial adjustments or refunds to resolve customer concerns.
   *
   * Yanlış ücretlendirmeler, hatalı ödemeler veya veri yanlışlıkları ile sonuçlanan yanlış
   * finansal işlemler, sistem hataları veya işleme hatalarıyla ilgili şikayetler. İşlem kayıtları,
   * sistem günlükleri araştırması ve belirlenen hataların düzeltilmesini gerektirir. Müşteri
   * endişelerini çözmek için finansal ayarlamalar veya iadeler içerebilir.
   */
  ErroneousTransaction = "ERRONEOUS_TRANSACTION",
  /**
   * Operations Delay Complaint / Operasyon Gecikmesi Şikayeti
   *
   * Complaints about excessive delays in processing insurance operations such as
   * policy issuance, endorsements, claims processing, or customer service responses.
   * Requires analysis of processing times, identification of bottlenecks, and
   * implementation of process improvements to meet service level commitments.
   *
   * Poliçe düzenleme, zeyilnameler, hasar işleme veya müşteri hizmetleri yanıtları gibi
   * sigorta operasyonlarının işlenmesindeki aşırı gecikmelerle ilgili şikayetler. İşleme
   * sürelerinin analizi, darboğazların belirlenmesi ve hizmet seviye taahhütlerini karşılamak
   * için süreç iyileştirmelerinin uygulanmasını gerektirir.
   */
  DelayInOperations = "DELAY_IN_OPERATIONS",
  /**
   * Online Transaction Error Complaint / Çevrimiçi İşlem Hatası Şikayeti
   *
   * Complaints regarding technical issues with online platforms, mobile applications,
   * or digital transaction processing. Includes website malfunctions, payment gateway errors,
   * login problems, or system unavailability. Requires technical investigation and
   * coordination with IT teams to resolve platform issues.
   *
   * Çevrimiçi platformlar, mobil uygulamalar veya dijital işlem işlemesi ile ilgili teknik
   * sorunlarla ilgili şikayetler. Web sitesi arızaları, ödeme geçidi hataları, giriş sorunları
   * veya sistem kullanılabilirliği sorunlarını içerir. Platform sorunlarını çözmek için teknik
   * araştırma ve IT ekipleri ile koordinasyon gerektirir.
   */
  OnlineTransactionErrors = "ONLINE_TRANSACTION_ERRORS",
  /**
   * Cancellation Period Delay Complaint / İptal Dönemi Gecikmesi Şikayeti
   *
   * Complaints about excessive delays in processing policy cancellations or issuing
   * refunds within the required timeframes. Includes delays in calculating refund amounts,
   * processing cancellation requests, or transferring refund payments. May involve
   * regulatory compliance issues requiring immediate attention and resolution.
   *
   * Gerekli zaman dilimlerinde poliçe iptallerinin işlenmesi veya iadelerin yapılmasındaki
   * aşırı gecikmelerle ilgili şikayetler. İade tutarlarının hesaplanmasında, iptal taleplerinin
   * işlenmesinde veya iade ödemelerinin transferinde gecikmeleri içerir. Acil dikkat ve çözüm
   * gerektiren düzenleyici uyumluluk sorunları içerebilir.
   */
  DelayInCancellationPeriod = "DELAY_IN_CANCELLATION_PERIOD",
  /**
   * Non-Receipt of Policy Documents Complaint / Poliçe Belgeleri Almama Şikayeti
   *
   * Complaints about customers not receiving their policy documents, endorsements,
   * or other important insurance documentation. May involve postal delivery issues,
   * incorrect addresses, or system failures in document generation or distribution.
   * Requires investigation of delivery methods and reissuance of missing documents.
   *
   * Müşterilerin poliçe belgelerini, zeyilnamelerini veya diğer önemli sigorta belgelerini
   * almama konusundaki şikayetler. Posta teslim sorunları, yanlış adresler veya belge oluşturma
   * veya dağıtımında sistem arızalarını içerebilir. Teslim yöntemlerinin araştırılmasını ve
   * eksik belgelerin yeniden düzenlenmesini gerektirir.
   */
  NonReceiptOfPolicyOrEndorsement = "NON_RECEIPT_OF_POLICY_OR_ENDORSEMENT",
  /**
   * Non-Production of Policy Documents Complaint / Poliçe Belgeleri Üretmeme Şikayeti
   *
   * Complaints about the company's failure to generate, produce, or issue policy
   * documents or endorsements after coverage has been purchased or changes have been approved.
   * Requires investigation of document production systems and processes to ensure
   * timely issuance of all required documentation.
   *
   * Teminat satın alındıktan veya değişiklikler onaylandıktan sonra şirketin poliçe
   * belgelerini veya zeyilnamelerini üretmeme, oluşturmama veya düzenlememe konusundaki
   * şikayetler. Gerekli tüm belgelerin zamanında düzenlenmesini sağlamak için belge üretim
   * sistemleri ve süreçlerinin araştırılmasını gerektirir.
   */
  NonProductionOfPolicyOrEndorsement = "NON_PRODUCTION_OF_POLICY_OR_ENDORSEMENT",
  /**
   * Endorsement Operations Delay Complaint / Zeyilname Operasyonları Gecikmesi Şikayeti
   *
   * Complaints about excessive delays in processing policy endorsements, modifications,
   * or change requests. Includes delays in reviewing requests, obtaining approvals,
   * calculating premium adjustments, or implementing policy changes. Requires review
   * of endorsement workflows and resource allocation for timely processing.
   *
   * Poliçe zeyilnamelerinin, değişikliklerinin veya değişiklik taleplerinin işlenmesindeki
   * aşırı gecikmelerle ilgili şikayetler. Taleplerin incelenmesi, onay alınması, prim
   * ayarlamalarının hesaplanması veya poliçe değişikliklerinin uygulanmasındaki gecikmeleri
   * içerir. Zamanında işleme için zeyilname iş akışları ve kaynak tahsisinin gözden
   * geçirilmesini gerektirir.
   */
  DelayInEndorsementOperations = "DELAY_IN_ENDORSEMENT_OPERATIONS",
  /**
   * Erroneous Premium Collection Complaint / Hatalı Prim Tahsilatı Şikayeti
   *
   * Complaints about incorrect premium charges, wrong billing amounts, or unauthorized
   * premium collections. Includes overcharges, duplicate charges, or charges for cancelled
   * policies. Requires detailed investigation of billing records and correction of any
   * financial errors with appropriate refunds or adjustments.
   *
   * Yanlış prim ücretlendirmeleri, hatalı faturalandırma tutarları veya yetkisiz prim
   * tahsilatlarıyla ilgili şikayetler. Fazla ücretlendirmeler, çift ücretlendirmeler veya
   * iptal edilen poliçeler için ücretlendirmeler dahildir. Faturalandırma kayıtlarının
   * ayrıntılı araştırılmasını ve uygun iadeler veya ayarlamalarla finansal hataların
   * düzeltilmesini gerektirir.
   */
  ErroneousPremiumCollection = "ERRONEOUS_PREMIUM_COLLECTION",
  /**
   * Non-Delivery of Refund Receipt Complaint / İade Makbuzu Teslim Etmeme Şikayeti
   *
   * Complaints about not receiving official receipts or confirmation documents for
   * premium refunds or other financial adjustments. Important for customer record-keeping
   * and tax purposes. Requires investigation of document delivery processes and
   * reissuance of missing receipts or confirmations.
   *
   * Prim iadeleri veya diğer finansal ayarlamalar için resmi makbuzları veya onay
   * belgelerini almama konusundaki şikayetler. Müşteri kayıt tutma ve vergi amaçları için
   * önemlidir. Belge teslim süreçlerinin araştırılmasını ve eksik makbuz veya onayların
   * yeniden düzenlenmesini gerektirir.
   */
  NonDeliveryOfRefundReceipt = "NON_DELIVERY_OF_REFUND_RECEIPT",
  /**
   * Non-Refund of Premium Complaint / Prim İade Etmeme Şikayeti
   *
   * Complaints about the company's failure to process legitimate premium refunds
   * for cancelled policies, overpayments, or other valid refund situations. Requires
   * investigation of refund calculations, verification of entitlements, and processing
   * of any owed refunds according to policy terms and regulatory requirements.
   *
   * Şirketin iptal edilen poliçeler, fazla ödemeler veya diğer geçerli iade durumları
   * için meşru prim iadelerini işlemede başarısızlığı hakkında şikayetler. İade hesaplamalarının
   * araştırılmasını, hak sahipliğinin doğrulanmasını ve poliçe şartları ile düzenleyici
   * gereksinimlere göre borçlu olunan iadelerin işlenmesini gerektirir.
   */
  NonRefundOfPremium = "NON_REFUND_OF_PREMIUM",
  /**
   * Staff Attitude Complaint / Personel Tutumu Şikayeti
   *
   * Complaints about unprofessional behavior, poor attitude, or inappropriate conduct
   * by company staff members. Includes rudeness, unhelpfulness, discrimination, or
   * failure to provide courteous service. Requires investigation of staff interactions
   * and may involve coaching, training, or disciplinary actions.
   *
   * Şirket personeli tarafından profesyonel olmayan davranış, kötü tutum veya uygunsuz
   * davranışlar hakkında şikayetler. Kabalık, yardım etmeme, ayrımcılık veya nazik hizmet
   * sağlayamama dahildir. Personel etkileşimlerinin araştırılmasını gerektirir ve koçluk,
   * eğitim veya disiplin eylemlerini içerebilir.
   */
  StaffAttitude = "STAFF_ATTITUDE",
  /**
   * Insufficient or Erroneous Information Complaint / Yetersiz veya Hatalı Bilgi Şikayeti
   *
   * Complaints about incomplete, inaccurate, or misleading information provided by
   * the company regarding policies, procedures, coverage details, or customer rights.
   * Requires review of information sources, training materials, and communication
   * protocols to ensure accurate and complete information delivery.
   *
   * Şirket tarafından poliçeler, prosedürler, teminat detayları veya müşteri hakları
   * hakkında sağlanan eksik, yanlış veya yanıltıcı bilgilerle ilgili şikayetler.
   * Doğru ve eksiksiz bilgi teslimini sağlamak için bilgi kaynakları, eğitim materyalleri
   * ve iletişim protokollerinin gözden geçirilmesini gerektirir.
   */
  InsufficientOrErroneousInformation = "INSUFFICIENT_OR_ERRONEOUS_INFORMATION",
  /**
   * No Timely Response Complaint / Zamanında Yanıt Vermeme Şikayeti
   *
   * Complaints about the company's failure to respond to customer inquiries,
   * requests, or communications within reasonable or promised timeframes. Includes
   * delays in responding to emails, phone calls, or formal requests. Requires review
   * of response time standards and resource allocation for customer communications.
   *
   * Şirketin müşteri sorularına, taleplerine veya iletişimlerine makul veya vaat edilen
   * zaman dilimlerinde yanıt vermede başarısızlığı hakkında şikayetler. E-postalara, telefon
   * aramalarına veya resmi taleplere yanıt vermede gecikmeleri içerir. Yanıt süresi standartları
   * ve müşteri iletişimleri için kaynak tahsisinin gözden geçirilmesini gerektirir.
   */
  NoTimelyResponse = "NO_TIMELY_RESPONSE",
}

/**
 * Policy Endorsement Case Subtypes
 *
 * Categorization of policy endorsement requests based on the type of modification being made
 * to existing insurance coverage. Each subtype represents a specific type of policy change with
 * distinct processing requirements, documentation needs, and regulatory considerations.
 * Essential for workflow routing, approval processes, premium calculations, and maintaining
 * accurate policy records throughout the endorsement lifecycle.
 *
 * Mevcut sigorta teminatında yapılan değişiklik türüne dayalı poliçe zeyilname taleplerinin
 * kategorizasyonu. Her alt tür, kendine özgü işleme gereksinimleri, belgelendirme ihtiyaçları
 * ve düzenleyici hususları olan belirli bir poliçe değişiklik türünü temsil eder.
 * İş akışı yönlendirme, onay süreçleri, prim hesaplamaları ve zeyilname yaşam döngüsü boyunca
 * doğru poliçe kayıtlarının korunması için gereklidir.
 */
export enum EndorsementCaseSubType {
  /**
   * Vehicle Change Endorsement / Araç Değişikliği Zeyilnamesi
   *
   * Endorsement for replacing the currently insured vehicle with a different vehicle.
   * Involves vehicle inspection, value assessment, risk evaluation, and premium recalculation
   * based on the new vehicle's specifications. Requires documentation of the new vehicle's
   * details, ownership transfer, and potential adjustment of coverage limits and deductibles.
   *
   * Şu anda sigortalı olan aracın farklı bir araçla değiştirilmesi için zeyilname.
   * Araç muayenesi, değer takdiri, risk değerlendirmesi ve yeni aracın özelliklerine dayalı
   * prim yeniden hesaplamasını içerir. Yeni aracın detaylarının belgelenmesini, konutiyet
   * devri ve teminat limitleri ile muafiyetlerin potansiyel ayarlanmasını gerektirir.
   */
  VehicleChange = "VEHICLE_CHANGE",
  /**
   * Insured Value Increase Endorsement / Sigorta Değeri Artışı Zeyilnamesi
   *
   * Endorsement to increase the insured value or coverage limits of existing policies.
   * Common when asset values appreciate or when customers want enhanced protection.
   * Requires current value assessment, risk re-evaluation, and premium adjustment calculations.
   * May involve additional underwriting requirements for significant value increases.
   *
   * Mevcut poliçelerin sigorta değeri veya teminat limitlerini artırmak için zeyilname.
   * Varlık değerlerinin değer kazandığı veya müşterilerin gelişmiş koruma istediği durumlarda yaygındır.
   * Güncel değer takdiri, risk yeniden değerlendirmesi ve prim ayarlama hesaplamalarını gerektirir.
   * Önemli değer artışları için ek yüklenim gereksinimleri içerebilir.
   */
  ValueIncrease = "VALUE_INCREASE",
  /**
   * No-Claim Bonus Transfer Endorsement / Hasarsızlık Bonus Transfer Zeyilnamesi
   *
   * Endorsement to transfer no-claim discount history from a previous insurance company.
   * Requires verification of claim-free periods, validation of bonus entitlements, and
   * premium adjustments based on the transferred discount levels. Essential for competitive
   * pricing and customer retention when switching insurers.
   *
   * Önceki bir sigorta şirketinden hasarsızlık indirimi geçmişinin transferi için zeyilname.
   * Hasarsız dönemlerin doğrulanmasını, bonus haklarının onaylanmasını ve transfer edilen
   * indirim seviyelerine dayalı prim ayarlamalarını gerektirir. Sigortacı değiştirirken
   * rekabetçi fiyatlandırma ve müşteri elde tutma için gereklidir.
   */
  NoClaimBonusTransfer = "NO_CLAIM_BONUS_TRANSFER",
  /**
   * Coverage Modification Endorsement / Teminat Değişikliği Zeyilnamesi
   *
   * Endorsement for modifying existing coverage terms, adding or removing optional coverages,
   * or adjusting deductibles and policy limits. Requires careful documentation of changes,
   * risk assessment for new coverages, and accurate premium calculations. Common when
   * customers' needs change or when new coverage options become available.
   *
   * Mevcut teminat şartlarını değiştirmek, isteğe bağlı teminatları eklemek veya çıkarmak
   * ya da muafiyetleri ve poliçe limitlerini ayarlamak için zeyilname. Değişikliklerin dikkatli
   * belgelenmesini, yeni teminatlar için risk değerlendirmesi ve doğru prim hesaplamalarını gerektirir.
   * Müşterilerin ihtiyaçları değiştiğinde veya yeni teminat seçenekleri mevcut olduğunda yaygındır.
   */
  CoverageChange = "COVERAGE_CHANGE",
  /**
   * Vehicle Usage Type Change Endorsement / Araç Kullanım Türü Değişikliği Zeyilnamesi
   *
   * Endorsement for changing the declared usage of the insured vehicle, such as from
   * private use to commercial use or vice versa. Requires risk re-assessment based on
   * the new usage pattern, premium adjustments, and potential coverage modifications.
   * Critical for maintaining accurate risk profiles and appropriate pricing.
   *
   * Sigortalı aracın beyan edilen kullanımının değiştirilmesi için zeyilname, örneğin
   * özel kullanımdan ticari kullanıma veya tam tersi. Yeni kullanım modeline dayalı risk
   * yeniden değerlendirmesi, prim ayarlamaları ve potansiyel teminat değişikliklerini gerektirir.
   * Doğru risk profillerinin korunması ve uygun fiyatlandırma için kritiktir.
   */
  UsageTypeChange = "USAGE_TYPE_CHANGE",
  /**
   * Policy Transfer Request Endorsement / Poliçe Transfer Talebi Zeyilnamesi
   *
   * Endorsement for transferring policy ownership from one party to another, commonly
   * occurring in vehicle sales or asset transfers. Requires verification of new owner details,
   * creditworthiness assessment, risk evaluation, and legal documentation of ownership transfer.
   * May involve premium adjustments based on the new owner's risk profile.
   *
   * Poliçe sahipliğinin bir taraftan diğerine transferi için zeyilname, genellikle araç
   * satışları veya varlık transferlerinde gerçekleşir. Yeni sahip detaylarının doğrulanmasını,
   * kredi güvenilirliği değerlendirmesi, risk değerlendirmesi ve konutiyet transferinin yasal
   * belgelenmesini gerektirir. Yeni sahibin risk profiline dayalı prim ayarlamaları içerebilir.
   */
  TransferRequest = "TRANSFER_REQUEST",
  /**
   * License Plate Change Endorsement / Plaka Değişikliği Zeyilnamesi
   *
   * Endorsement for updating the license plate number of the insured vehicle due to
   * registration changes, plate renewal, or administrative requirements. Requires verification
   * of new registration documents and updating policy records accordingly. Typically a
   * straightforward administrative change with minimal impact on premiums or coverage.
   *
   * Tescil değişiklikleri, plaka yenileme veya idari gereksinimler nedeniyle sigortalı
   * aracın plaka numarasının güncellenmesi için zeyilname. Yeni tescil belgelerinin doğrulanmasını
   * ve poliçe kayıtlarının buna göre güncellenmesini gerektirir. Genellikle primler veya
   * teminat üzerinde minimal etkisi olan basit bir idari değişikliktir.
   */
  LicensePlateChange = "LICENSE_PLATE_CHANGE",
  /**
   * Vehicle Brand and Model Change Endorsement / Araç Marka ve Model Değişikliği Zeyilnamesi
   *
   * Endorsement for correcting or updating the vehicle brand and model information in
   * the policy records. May occur due to initial data entry errors or vehicle modifications.
   * Requires verification of correct vehicle specifications, risk re-assessment based on
   * actual vehicle characteristics, and potential premium adjustments.
   *
   * Poliçe kayıtlarındaki araç marka ve model bilgilerinin düzeltilmesi veya güncellenmesi
   * için zeyilname. İlk veri giriş hataları veya araç modifikasyonları nedeniyle ortaya çıkabilir.
   * Doğru araç spesifikasyonlarının doğrulanmasını, gerçek araç özelliklerine dayalı risk
   * yeniden değerlendirmesi ve potansiyel prim ayarlamalarını gerektirir.
   */
  BrandModelChange = "BRAND_MODEL_CHANGE",
  /**
   * Engine and Chassis Number Change Endorsement / Motor ve Şasi Numarası Değişikliği Zeyilnamesi
   *
   * Endorsement for updating engine and chassis identification numbers due to vehicle
   * repairs, engine replacement, or administrative corrections. Requires verification of
   * new identification numbers, documentation from authorized service centers, and
   * anti-fraud checks to ensure vehicle authenticity and prevent identity fraud.
   *
   * Araç onarımları, motor değişimi veya idari düzeltmeler nedeniyle motor ve şasi
   * tanımlama numaralarının güncellenmesi için zeyilname. Yeni tanımlama numaralarının
   * doğrulanmasını, yetkili servis merkezlerinden belgelendirme ve araç otantikliğini
   * sağlamak ve kimlik dolandırıcılığını önlemek için dolandırıcılık karşıtı kontrolleri gerektirir.
   */
  EngineChassisNumberChange = "ENGINE_CHASSIS_NUMBER_CHANGE",
  /**
   * Contact and Address Change Endorsement / İletişim ve Adres Değişikliği Zeyilnamesi
   *
   * Endorsement for updating policyholder contact information including address, phone
   * numbers, and email addresses. Important for maintaining accurate communication channels
   * and ensuring proper delivery of policy documents and notices. May affect premium
   * calculations if the address change impacts risk assessment (e.g., different geographic risk zones).
   *
   * Adres, telefon numaraları ve e-posta adresleri dahil olmak üzere poliçe sahibi
   * iletişim bilgilerinin güncellenmesi için zeyilname. Doğru iletişim kanallarının korunması
   * ve poliçe belgelerinin ve bildirimlerin uygun şekilde teslim edilmesi için önemlidir.
   * Adres değişikliği risk değerlendirmesini etkiliyorsa (örn. farklı coğrafi risk bölgeleri)
   * prim hesaplamalarını etkileyebilir.
   */
  ContactAddressChange = "CONTACT_ADDRESS_CHANGE",
  /**
   * Other Endorsement Types / Diğer Zeyilname Türleri
   *
   * Catch-all category for endorsement requests that don't fit into predefined specific
   * categories. These may include unique policy modifications, special coverage requests,
   * or new types of changes not yet standardized in the system. Requires case-by-case
   * evaluation and may need special approval processes.
   *
   * Önceden tanımlanmış belirli kategorilere uymayan zeyilname talepleri için genel kategori.
   * Bunlar benzersiz poliçe değişikliklerini, özel teminat taleplerini veya sistemde henüz
   * standartlaştırılmamış yeni değişiklik türlerini içerebilir. Talebe özel değerlendirme
   * gerektirir ve özel onay süreçlerine ihtiyaç duyabilir.
   */
  Other = "OTHER",
  /**
   * Pledgee Correction and Addition Endorsement / Rehinli Düzeltme ve Ekleme Zeyilnamesi
   *
   * Endorsement for adding, removing, or correcting pledgee (lien holder) information on
   * the policy. Common when vehicles are financed, refinanced, or loans are paid off.
   * Requires verification of financial institution details, loan documentation, and
   * proper legal authorization for changes. Critical for ensuring proper claim payment procedures.
   *
   * Poliçe üzerinde rehinli (rehin alacaklısı) bilgilerinin eklenmesi, çıkarılması veya
   * düzeltilmesi için zeyilname. Araçlar finanse edildiğinde, yeniden finanse edildiğinde
   * veya krediler ödendiğinde yaygındır. Finansal kurum detaylarının doğrulanmasını, kredi
   * belgelendirmesi ve değişiklikler için uygun yasal yetkilendirmeyi gerektirir.
   * Uygun hasar ödeme prosedürlerinin sağlanması için kritiktir.
   */
  PledgeeCorrectionAddition = "PLEDGEE_CORRECTION_ADDITION",
}

/**
 * Case Activity Actions
 */
export enum CaseActivityAction {
  Created = "CREATED",
  Updated = "UPDATED",
  StateChanged = "STATE_CHANGED",
  ChannelChanged = "CHANNEL_CHANGED",
  RepresentativeAssigned = "REPRESENTATIVE_ASSIGNED",
  NoteAdded = "NOTE_ADDED",
  AssetSet = "ASSET_SET",
  PolicyAdded = "POLICY_ADDED",
  ProposalAdded = "PROPOSAL_ADDED",
  PolicyEndDateSet = "POLICY_END_DATE_SET",
  CustomerUpdated = "CUSTOMER_UPDATED",
  AssetUpdated = "ASSET_UPDATED",
  PriorityAssessed = "PRIORITY_ASSESSED",
  ProposalProductPurchaseAttempted = "PROPOSAL_PRODUCT_PURCHASE_ATTEMPTED",
}

// Re-export enums for backward compatibility with existing imports
export {
  Channel,
  AssetType,
  CustomerType,
  ProductBranch,
  Currency,
  PaymentOption,
  PolicyState,
};

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Represents a request to retrieve comprehensive case information by case reference number.
 * Used to fetch detailed case data including status, customer information, and associated policies.
 *
 * Talep referans numarası ile kapsamlı talep bilgilerini almak için kullanılan istek.
 * Durum, müşteri bilgileri ve ilişkili poliçeler dahil olmak üzere detaylı talep verilerini getirmek için kullanılır.
 */
export interface GetCaseByRefRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier assigned to the insurance case. This alphanumeric reference
   * is used across InsurUp's systems to track and identify specific cases throughout their lifecycle.
   * Case references are typically formatted for easy customer communication and internal tracking.
   *
   * TR: Sigorta talebine atanan benzersiz referans tanımlayıcısı. Bu alfanümerik referans,
   * InsurUp'ın sistemlerinde belirli talepleri yaşam döngüleri boyunca takip etmek ve tanımlamak
   * için kullanılır. Talep referansları genellikle kolay müşteri iletişimi ve iç takip için formatlanır.
   */
  readonly ref: string;
}

/**
 * Represents a request to assign or change the representative agent user for an insurance case.
 * Used to delegate case responsibility to specific agents for customer service and case management.
 *
 * Sigorta talebi için temsilci acente kullanıcısını atamak veya değiştirmek için kullanılan istek.
 * Müşteri hizmetleri ve talep yönetimi için talep sorumluluğunu belirli acentelere devretmek için kullanılır.
 */
export interface AssignCaseRepresentativeRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier of the insurance case for which to assign or change
   * the responsible representative agent. This reference ensures the assignment is applied
   * to the correct case in the system.
   *
   * TR: Sorumlu temsilci acentenin atanacağı veya değiştirileceği sigorta talebinin benzersiz
   * referans tanımlayıcısı. Bu referans, atamanın sistemde doğru talebe uygulanmasını sağlar.
   */
  readonly ref: string;

  /**
   * Representative Agent User ID / Temsilci Acente Kullanıcı Kimliği
   *
   * EN: The unique GUID identifier of the agent user who will be assigned as the case representative.
   * This agent will become responsible for handling customer communications, case progression,
   * and decision-making related to the case. Set to null to unassign the current representative,
   * leaving the case without a specific assigned agent.
   *
   * TR: Talep temsilcisi olarak atanacak acente kullanıcısının benzersiz GUID tanımlayıcısı.
   * Bu acente, müşteri iletişimleri, talep ilerlemesi ve talep ile ilgili karar verme süreçlerinden
   * sorumlu olacaktır. Mevcut temsilciyi atamadan çıkarmak ve talebi belirli bir atanmış acente
   * olmadan bırakmak için null olarak ayarlayın.
   */
  readonly representativeAgentUserId?: string | null;
}

/**
 * Represents a request to change the communication channel of an existing insurance case.
 * Used to update how the case is handled based on customer preference or operational requirements.
 *
 * Mevcut bir sigorta talebinin iletişim kanalını değiştirmek için kullanılan istek.
 * Müşteri tercihi veya operasyonel gereksinimler temelinde talebin nasıl işleneceğini güncellemek için kullanılır.
 */
export interface ChangeCaseChannelRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier of the insurance case for which to change the communication
   * channel. This reference ensures the channel change is applied to the correct case and properly
   * tracked in the system for audit and historical purposes.
   *
   * TR: İletişim kanalının değiştirileceği sigorta talebinin benzersiz referans tanımlayıcısı.
   * Bu referans, kanal değişikliğinin doğru talebe uygulanmasını ve denetim ve tarihsel amaçlar
   * için sistemde uygun şekilde takip edilmesini sağlar.
   */
  readonly ref: string;

  /**
   * New Communication Channel / Yeni İletişim Kanalı
   *
   * EN: The communication channel to which the case should be transferred. This determines how
   * the case will be processed, routed, and handled going forward. Different channels may have
   * different service levels, processing priorities, and communication protocols. The change
   * affects all subsequent case interactions and workflow routing.
   *
   * TR: Talebin aktarılacağı iletişim kanalı. Bu, talebin bundan sonra nasıl işleneceği,
   * yönlendirileceği ve ele alınacağını belirler. Farklı kanalların farklı hizmet seviyeleri,
   * işleme öncelikleri ve iletişim protokolleri olabilir. Değişiklik, sonraki tüm talep
   * etkileşimlerini ve iş akışı yönlendirmesini etkiler.
   */
  readonly channel: Channel;
}

/**
 * Represents a request to change the main and sub-state of an existing insurance case.
 * Used to progress cases through their lifecycle with appropriate status tracking and optional notes.
 *
 * Mevcut bir sigorta talebinin ana ve alt durumunu değiştirmek için kullanılan istek.
 * Talepleri uygun durum takibi ve isteğe bağlı notlarla yaşam döngüleri boyunca ilerletmek için kullanılır.
 */
export interface ChangeCaseStateRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier of the case for which to change the state.
   *
   * TR: Durumunun değiştirileceği talebin benzersiz referans tanımlayıcısı.
   */
  readonly ref: string;

  /**
   * New Main State / Yeni Ana Durum
   *
   * EN: The new main state to which the case should be transitioned.
   *
   * TR: Talebin geçiş yapacağı yeni ana durum.
   */
  readonly mainState: CaseMainState;

  /**
   * New Sub-State / Yeni Alt Durum
   *
   * EN: The new sub-state to which the case should be transitioned.
   *
   * TR: Talebin geçiş yapacağı yeni alt durum.
   */
  readonly subState: CaseSubState;

  /**
   * Optional Note / İsteğe Bağlı Not
   *
   * EN: Optional note explaining the reason for the state change.
   *
   * TR: Durum değişikliğinin nedenini açıklayan isteğe bağlı not.
   */
  readonly note?: string;
}

/**
 * Represents a request to create a new cancellation case for an existing insurance policy.
 * Used to initiate policy cancellation workflows for customer-requested or administrative cancellations.
 *
 * Mevcut bir sigorta poliçesi için yeni iptal talebi oluşturmak için kullanılan istek.
 * Müşteri talebine bağlı veya idari iptal işlemleri için poliçe iptal iş akışlarını başlatmak için kullanılır.
 */
export interface CreateCancelCaseRequest {
  /**
   * Policy Unique Identifier / Poliçe Benzersiz Tanımlayıcısı
   *
   * EN: The unique identifier of the insurance policy that is subject to cancellation.
   * This policy must be in an active state to be eligible for cancellation. The system
   * will validate policy status and customer authorization before processing the cancellation request.
   *
   * TR: İptalin konusu olan sigorta poliçesinin benzersiz tanımlayıcısı. Bu poliçe iptal
   * için uygun olmak üzere aktif durumda olmalıdır. Sistem, iptal talebini işlemeden önce
   * poliçe durumunu ve müşteri yetkisini doğrulayacaktır.
   */
  readonly policyId: string;

  /**
   * Cancellation Sub-Type / İptal Alt Türü
   *
   * EN: The specific category of cancellation being requested, which determines the appropriate
   * processing procedures, refund calculations, and regulatory requirements. Different cancellation
   * types may have different timelines, fees, and customer communication requirements.
   *
   * TR: Talep edilen iptalin belirli kategorisi; uygun işleme prosedürleri, iade hesaplamaları
   * ve düzenleyici gereksinimleri belirler. Farklı iptal türlerinin farklı zaman çizelgeleri,
   * ücretleri ve müşteri iletişimi gereksinimleri olabilir.
   */
  readonly subType: CancelCaseSubType;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the customer submitted the cancellation request. This information
   * helps ensure appropriate response methods and processing timelines based on channel-specific
   * service level agreements. Some channels may require additional verification steps.
   * Defaults to Unknown if not specified.
   *
   * TR: Müşterinin iptal talebini gönderdiği kanal. Bu bilgi, kanala özel hizmet seviyesi
   * anlaşmalarına dayalı uygun yanıt yöntemleri ve işleme zaman çizelgelerini sağlamaya yardımcı olur.
   * Bazı kanallar ek doğrulama adımları gerektirebilir. Belirtilmezse Bilinmeyen olarak
   * varsayılan değer alır.
   */
  readonly channel?: Channel;
}

/**
 * Represents a request to create a new complaint case for a customer.
 * Used to initiate customer complaint resolution workflows for service issues, claim disputes, or other concerns.
 *
 * Bir müşteri için yeni şikayet talebi oluşturmak için kullanılan istek.
 * Hizmet sorunları, hasar uyuşmazlıkları veya diğer endişeler için müşteri şikayet çözüm iş akışlarını başlatmak için kullanılır.
 */
export interface CreateComplaintCaseRequest {
  /**
   * Customer Unique Identifier / Müşteri Benzersiz Tanımlayıcısı
   *
   * EN: The unique identifier of the customer filing the complaint.
   *
   * TR: Şikayeti dosyalayan müşterinin benzersiz tanımlayıcısı.
   */
  readonly customerId: string;

  /**
   * Complaint Sub-Type / Şikayet Alt Türü
   *
   * EN: The specific category of complaint being filed.
   *
   * TR: Dosyalanan şikayetin belirli kategorisi.
   */
  readonly subType: ComplaintCaseSubType;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the complaint was received.
   *
   * TR: Şikayetin alındığı kanal.
   */
  readonly channel?: Channel;

  /**
   * Asset Type / Varlık Türü
   *
   * EN: The type of asset related to the complaint, if applicable.
   *
   * TR: Varsa, şikayet ile ilgili varlığın türü.
   */
  readonly assetType?: AssetType;

  /**
   * Asset ID / Varlık Kimliği
   *
   * EN: The unique identifier of the asset related to the complaint, if applicable.
   *
   * TR: Varsa, şikayet ile ilgili varlığın benzersiz tanımlayıcısı.
   */
  readonly assetId?: string;

  /**
   * Product Branch / Ürün Dalı
   *
   * EN: The insurance product branch related to the complaint.
   *
   * TR: Şikayet ile ilgili sigorta ürün dalı.
   */
  readonly productBranch?: ProductBranch;
}

/**
 * Represents a request to create a new cross-sale opportunity case derived from an existing case.
 * Used to identify and pursue additional insurance product sales opportunities for existing customers.
 *
 * Mevcut bir talepten türetilen yeni çapraz satış fırsatı talebi oluşturmak için kullanılan istek.
 * Mevcut müşteriler için ek sigorta ürünü satış fırsatlarını belirlemek ve takip etmek için kullanılır.
 */
export interface CreateCrossSaleOpportunityCaseRequest {
  /**
   * Source Case Identifier / Kaynak Talep Tanımlayıcısı
   *
   * EN: The unique identifier of the existing case that generated this cross-sale opportunity.
   * This creates a link between the original case and the new sales opportunity, enabling
   * better tracking of sales funnel effectiveness and customer journey analytics.
   *
   * TR: Bu çapraz satış fırsatını oluşturan mevcut talebin benzersiz tanımlayıcısı.
   * Bu, orijinal talep ile yeni satış fırsatı arasında bir bağlantı oluşturarak satış
   * hunisi etkinliğinin ve müşteri yolculuğu analitiğinin daha iyi takibini sağlar.
   */
  readonly sourceCaseId: string;

  /**
   * Customer Unique Identifier / Müşteri Benzersiz Tanımlayıcısı
   *
   * EN: The unique GUID identifier of the customer who is the subject of this cross-sale opportunity.
   * This should typically be the same customer from the source case, allowing the sales team
   * to leverage existing customer relationships and knowledge for additional sales.
   *
   * TR: Bu çapraz satış fırsatının konusu olan müşterinin benzersiz GUID tanımlayıcısı.
   * Bu genellikle kaynak talepteki aynı müşteri olmalıdır; satış ekibinin mevcut müşteri
   * ilişkilerini ve bilgilerini ek satışlar için kullanmasına olanak tanır.
   */
  readonly customerId: string;

  /**
   * Asset Type / Varlık Türü
   *
   * EN: The type of asset related to the cross-sale opportunity, if applicable.
   *
   * TR: Varsa, çapraz satış fırsatı ile ilgili varlığın türü.
   */
  readonly assetType?: AssetType;

  /**
   * Asset ID / Varlık Kimliği
   *
   * EN: The unique identifier of the asset related to the cross-sale opportunity, if applicable.
   *
   * TR: Varsa, çapraz satış fırsatı ile ilgili varlığın benzersiz tanımlayıcısı.
   */
  readonly assetId?: string;

  /**
   * Insurance Product Branch / Sigorta Ürün Dalı
   *
   * EN: The specific insurance product branch that represents the cross-sale opportunity.
   * This should be different from the original case's product branch to represent an
   * additional product offering that complements the customer's existing insurance portfolio.
   *
   * TR: Çapraz satış fırsatını temsil eden belirli sigorta ürün dalı. Bu, müşterinin mevcut
   * sigorta portföyünü tamamlayan ek bir ürün teklifini temsil etmek üzere orijinal talebin
   * ürün dalından farklı olmalıdır.
   */
  readonly productBranch: ProductBranch;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the cross-sale opportunity will be pursued. This may be
   * the same channel as the source case or a different channel based on the customer's
   * preferences and the nature of the additional product being offered.
   * Defaults to Unknown if not specified.
   *
   * TR: Çapraz satış fırsatının takip edileceği kanal. Bu, kaynak talep ile aynı kanal
   * veya müşterinin tercihleri ve sunulan ek ürünün doğasına göre farklı bir kanal olabilir.
   * Belirtilmezse Bilinmeyen olarak varsayılan değer alır.
   */
  readonly channel?: Channel;
}

/**
 * Represents a request to create an endorsement case for policy modifications or updates requested by the customer.
 * Used to initiate policy change workflows for coverage modifications, beneficiary updates, or other policy amendments.
 *
 * Müşteri tarafından talep edilen poliçe değişiklikleri veya güncellemeler için zeyilname talebi oluşturmak için kullanılan istek.
 * Teminat değişiklikleri, lehtar güncellemeleri veya diğer poliçe değişiklikleri için poliçe değişiklik iş akışlarını başlatmak için kullanılır.
 */
export interface CreateEndorsementCaseRequest {
  /**
   * Policy Unique Identifier / Poliçe Benzersiz Tanımlayıcısı
   *
   * EN: The unique identifier of the insurance policy that is subject to endorsement.
   *
   * TR: Zeyilnamenin konusu olan sigorta poliçesinin benzersiz tanımlayıcısı.
   */
  readonly policyId: string;

  /**
   * Endorsement Sub-Type / Zeyilname Alt Türü
   *
   * EN: The specific category of endorsement being requested.
   *
   * TR: Talep edilen zeyilnamenin belirli kategorisi.
   */
  readonly subType: EndorsementCaseSubType;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the endorsement request was received.
   *
   * TR: Zeyilname talebinin alındığı kanal.
   */
  readonly channel?: Channel;
}

/**
 * Represents a request to create a new sale opportunity case to track potential insurance sales to prospective customers.
 * Used to initiate sales workflows for new customers or existing customers seeking additional coverage.
 *
 * Potansiyel müşterilere olası sigorta satışlarını takip etmek için yeni satış fırsatı talebi oluşturmak için kullanılan istek.
 * Yeni müşteriler veya ek teminat arayan mevcut müşteriler için satış iş akışlarını başlatmak için kullanılır.
 */
export interface CreateNewSaleOpportunityCaseRequest {
  /**
   * Customer Unique Identifier / Müşteri Benzersiz Tanımlayıcısı
   *
   * EN: The unique identifier of the customer for whom the sale opportunity is being created.
   *
   * TR: Satış fırsatının oluşturulduğu müşterinin benzersiz tanımlayıcısı.
   */
  readonly customerId: string;

  /**
   * Asset Type / Varlık Türü
   *
   * EN: The type of asset related to the sale opportunity, if applicable.
   *
   * TR: Varsa, satış fırsatı ile ilgili varlığın türü.
   */
  readonly assetType?: AssetType;

  /**
   * Asset ID / Varlık Kimliği
   *
   * EN: The unique identifier of the asset related to the sale opportunity, if applicable.
   *
   * TR: Varsa, satış fırsatı ile ilgili varlığın benzersiz tanımlayıcısı.
   */
  readonly assetId?: string;

  /**
   * Insurance Product Branch / Sigorta Ürün Dalı
   *
   * EN: The specific insurance product branch for which the sale opportunity is being created.
   *
   * TR: Satış fırsatının oluşturulduğu belirli sigorta ürün dalı.
   */
  readonly productBranch: ProductBranch;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the sale opportunity will be pursued.
   *
   * TR: Satış fırsatının takip edileceği kanal.
   */
  readonly channel?: Channel;
}

/**
 * Represents a request to add a note or comment to an existing insurance case.
 * Used to record important information, observations, or communication details during case processing.
 *
 * Mevcut bir sigorta talebine not veya yorum eklemek için kullanılan istek.
 * Talep işleme sırasında önemli bilgileri, gözlemleri veya iletişim detaylarını kaydetmek için kullanılır.
 */
export interface AddNoteToCaseRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier of the insurance case to which the note will be added.
   * This reference ensures the note is properly associated with the correct case for historical
   * tracking and audit purposes.
   *
   * TR: Notun ekleneceği sigorta talebinin benzersiz referans tanımlayıcısı.
   * Bu referans, notun tarihsel takip ve denetim amaçları için doğru talep ile uygun şekilde
   * ilişkilendirilmesini sağlar.
   */
  readonly ref: string;

  /**
   * Note Content / Not İçeriği
   *
   * EN: The textual content of the note to be added to the case. This can include observations,
   * decisions, communication summaries, action items, or any other relevant information that
   * should be recorded as part of the case documentation. The note will be timestamped and
   * associated with the user who created it.
   *
   * TR: Talebe eklenecek notun metin içeriği. Bu, gözlemler, kararlar, iletişim özetleri,
   * eylem öğeleri veya talep dokümantasyonunun bir parçası olarak kaydedilmesi gereken diğer
   * ilgili bilgileri içerebilir. Not, zaman damgası ile işaretlenecek ve onu oluşturan kullanıcı
   * ile ilişkilendirilecektir.
   */
  readonly note: string;
}

/**
 * Represents a request to set or update the asset associated with an existing case.
 * Used to link a specific asset (vehicle or property) to the case for proper tracking and management.
 *
 * Mevcut bir talebe varlık (asset) atamak veya güncellemek için kullanılan istek.
 * Uygun takip ve yönetim için belirli bir varlığı (araç veya emlak) talebe bağlamak için kullanılır.
 */
export interface SetCaseAssetRequest {
  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The unique reference identifier of the case for which to set the asset.
   * This reference ensures the asset is associated with the correct case and properly
   * tracked in the system for audit and historical purposes.
   *
   * TR: Varlığın ayarlanacağı talebin benzersiz referans tanımlayıcısı.
   * Bu referans, varlığın doğru talebe ilişkilendirilmesini ve denetim ve tarihsel amaçlar
   * için sistemde uygun şekilde takip edilmesini sağlar.
   */
  readonly ref: string;

  /**
   * Asset Identifier / Varlık Tanımlayıcısı
   *
   * EN: The unique identifier of the asset (vehicle or property) to be linked to the case.
   * This ID corresponds to an existing asset in the customer's portfolio and is used for
   * case tracking, customer service, and relationship management.
   *
   * TR: Talebe bağlanacak varlığın (araç veya emlak) benzersiz tanımlayıcısı.
   * Bu ID, müşterinin portföyündeki mevcut bir varlığa karşılık gelir ve talep takibi,
   * müşteri hizmetleri ve ilişki yönetimi için kullanılır.
   */
  readonly assetId: string;

  /**
   * Asset Type / Varlık Türü
   *
   * EN: The type of asset being linked to the case (e.g., Vehicle, Property). This determines
   * the specific processing workflows, data requirements, and management procedures that apply
   * to the case. Different asset types may have different handling processes and requirements.
   *
   * TR: Talebe bağlanan varlığın türü (örneğin, Araç, Emlak). Bu, talebe uygulanan belirli
   * işlem iş akışlarını, veri gereksinimlerini ve yönetim prosedürlerini belirler. Farklı varlık
   * türlerinin farklı işleme süreçleri ve gereksinimleri olabilir.
   */
  readonly assetType: AssetType;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

/**
 * Base class for case information responses returned when retrieving case details by reference number.
 * Provides common case properties and serves as a polymorphic base for specific case type responses.
 *
 * Referans numarası ile talep detayları alınırken döndürülen talep bilgi yanıtları için temel sınıf.
 * Ortak talep özelliklerini sağlar ve belirli talep türü yanıtları için polimorfik temel olarak hizmet eder.
 */
export type GetCaseByRefResult =
  | GetSaleOpportunityCaseResult
  | GetCancelCaseResult
  | GetEndorsementCaseResult
  | GetComplaintCaseResult;

interface GetCaseByRefResultBase {
  /**
   * Case Unique Identifier / Talep Benzersiz Tanımlayıcısı
   *
   * EN: The unique system-generated identifier for the insurance case. This ID is used
   * internally for data relationships and API operations throughout InsurUp's systems.
   *
   * TR: Sigorta talebi için sistem tarafından oluşturulan benzersiz tanımlayıcı. Bu kimlik,
   * InsurUp'ın sistemleri boyunca veri ilişkileri ve API operasyonları için dahili olarak kullanılır.
   */
  readonly id: string;

  /**
   * Case Reference Number / Talep Referans Numarası
   *
   * EN: The human-readable reference number assigned to the case for customer communication
   * and internal tracking. This reference is used in all customer-facing communications
   * and is typically formatted for easy verbal communication.
   *
   * TR: Müşteri iletişimi ve iç takip için talebe atanan insan tarafından okunabilir referans
   * numarası. Bu referans, müşteriye yönelik tüm iletişimlerde kullanılır ve genellikle kolay
   * sözlü iletişim için formatlanır.
   */
  readonly ref: string;

  /**
   * Case Type Category / Talep Tür Kategorisi
   *
   * EN: The primary category of the case, which determines the overall processing workflow
   * and business rules applied to the case throughout its lifecycle.
   *
   * TR: Talebin yaşam döngüsü boyunca uygulanan genel işleme iş akışını ve iş kurallarını
   * belirleyen talebin birincil kategorisi.
   */
  readonly type: CaseType;

  /**
   * Case Status / Talep Durumu
   *
   * EN: The current operational status of the case, indicating whether it is active,
   * completed, or in another state that affects how it should be processed.
   *
   * TR: Talebin mevcut operasyonel durumu; aktif, tamamlanmış veya nasıl işlenmesi
   * gerektiğini etkileyen başka bir durumda olup olmadığını gösterir.
   */
  readonly status: CaseStatus;

  /**
   * Case Main State / Talep Ana Durumu
   *
   * EN: The primary state category of the case in its workflow progression, representing
   * the high-level phase of case processing.
   *
   * TR: Talep iş akışı ilerlemesindeki talebin birincil durum kategorisi; talep işlemenin
   * üst düzey aşamasını temsil eder.
   */
  readonly mainState: CaseMainState;

  /**
   * Case Sub-State / Talep Alt Durumu
   *
   * EN: The specific sub-state within the main state category, providing granular
   * details about the exact phase of case processing.
   *
   * TR: Ana durum kategorisi içindeki belirli alt durum; talep işlemenin tam aşaması
   * hakkında ayrıntılı detaylar sağlar.
   */
  readonly subState: CaseSubState;

  /**
   * Customer Unique Identifier / Müşteri Benzersiz Tanımlayıcısı
   *
   * EN: The unique identifier of the customer who is the subject of this case.
   * This links the case to customer profiles and history within InsurUp's system.
   *
   * TR: Bu talebin konusu olan müşterinin benzersiz tanımlayıcısı. Bu, talebi
   * InsurUp'ın sistemindeki müşteri profilleri ve geçmişi ile ilişkilendirir.
   */
  readonly customerId: string;

  /**
   * Customer Type / Müşteri Türü
   *
   * EN: The classification of the customer, such as individual or corporate,
   * which affects processing rules and regulatory requirements.
   *
   * TR: Bireysel veya kurumsal gibi müşterinin sınıflandırması; işleme kurallarını
   * ve düzenleyici gereksinimleri etkiler.
   */
  readonly customerType: CustomerType;

  /**
   * Customer Name / Müşteri Adı
   *
   * EN: The name of the customer associated with this case, used for identification
   * and communication purposes. May be null if customer information is restricted.
   *
   * TR: Bu talep ile ilişkili müşterinin adı; tanımlama ve iletişim amaçları için
   * kullanılır. Müşteri bilgileri kısıtlıysa null olabilir.
   */
  readonly customerName?: string | null;

  /**
   * Base Product Branch / Temel Ürün Dalı
   *
   * EN: The primary insurance product branch that this case relates to, if applicable.
   * This helps categorize the case and determine appropriate handling procedures.
   *
   * TR: Bu talebin ilgili olduğu birincil sigorta ürün dalı (varsa). Bu, talebi
   * kategorize etmeye ve uygun işleme prosedürlerini belirlemeye yardımcı olur.
   */
  readonly baseProductBranch?: ProductBranch;

  /**
   * Asset Type / Varlık Türü
   *
   * EN: The type of asset associated with this case, if applicable.
   *
   * TR: Bu talep ile ilişkili varlığın türü (varsa).
   */
  readonly assetType?: AssetType;

  /**
   * Asset ID / Varlık Kimliği
   *
   * EN: The unique identifier of the asset associated with this case, if applicable.
   *
   * TR: Bu talep ile ilişkili varlığın benzersiz tanımlayıcısı (varsa).
   */
  readonly assetId?: string;

  /**
   * Case Creation Timestamp / Talep Oluşturma Zaman Damgası
   *
   * EN: The date and time when the case was initially created in the system.
   * Used for tracking case age, SLA compliance, and reporting purposes.
   *
   * TR: Talebin sistemde ilk oluşturulduğu tarih ve saat. Talep yaşı takibi,
   * SLA uyumluluğu ve raporlama amaçları için kullanılır.
   */
  readonly createdAt: string;

  /**
   * Case Creator User Reference / Talep Oluşturan Kullanıcı Referansı
   *
   * EN: Reference to the user who initially created this case, including their
   * identification and role information for audit and tracking purposes.
   *
   * TR: Bu talebi ilk oluşturan kullanıcıya referans; denetim ve takip amaçları
   * için tanımlama ve rol bilgilerini içerir.
   */
  readonly createdBy: UserReference;

  /**
   * Assigned Representative User Reference / Atanmış Temsilci Kullanıcı Referansı
   *
   * EN: Reference to the user currently assigned as the case representative, if any.
   * This person is responsible for handling customer communications and case progression.
   *
   * TR: Şu anda talep temsilcisi olarak atanmış kullanıcıya referans (varsa). Bu kişi,
   * müşteri iletişimleri ve talep ilerlemesini yönetmekten sorumludur.
   */
  readonly representedBy?: UserReference;

  /**
   * Communication Channel / İletişim Kanalı
   *
   * EN: The channel through which the case was originally initiated, affecting
   * handling procedures and service level agreements.
   *
   * TR: Talebin ilk başlatıldığı kanal; işleme prosedürleri ve hizmet seviyesi
   * anlaşmalarını etkiler.
   */
  readonly channel: Channel;

  /**
   * Source Case Identifier / Kaynak Talep Tanımlayıcısı
   *
   * EN: The identifier of the original case from which this case was derived,
   * if applicable. Used for tracking case relationships and workflows.
   *
   * TR: Bu talebin türetildiği orijinal talebin tanımlayıcısı (varsa). Talep
   * ilişkileri ve iş akışlarını takip etmek için kullanılır.
   */
  readonly sourceCaseId?: string;

  /**
   * Source Case Reference Number / Kaynak Talep Referans Numarası
   *
   * EN: The reference number of the original case from which this case was derived,
   * if applicable. Used for customer communication and case traceability.
   *
   * TR: Bu talebin türetildiği orijinal talebin referans numarası (varsa). Müşteri
   * iletişimi ve talep izlenebilirliği için kullanılır.
   */
  readonly sourceCaseRef?: string;

  /**
   * Policy End Date / Poliçe Bitiş Tarihi
   *
   * EN: The end date of the policy relevant to this case, if applicable.
   * Used for timing decisions and renewal-related case processing.
   *
   * TR: Bu talep ile ilgili poliçenin bitiş tarihi (varsa). Zamanlama kararları
   * ve yenileme ile ilgili talep işleme için kullanılır.
   */
  readonly policyEndDate?: string;

  /**
   * Associated Policy IDs / İlişkili Poliçe Kimlikleri
   *
   * EN: Array of policy identifiers that are associated with or relevant to this case.
   * These policies may be directly affected by case actions or referenced for context.
   *
   * TR: Bu talep ile ilişkili veya ilgili poliçe tanımlayıcıları dizisi. Bu poliçeler,
   * talep eylemlerinden doğrudan etkilenebilir veya bağlam için referans alınabilir.
   */
  readonly policyIds: readonly string[];

  /**
   * Associated Proposal IDs / İlişkili Teklif Kimlikleri
   *
   * EN: Array of proposal identifiers that are associated with or relevant to this case.
   * These proposals may be generated as part of the case or referenced for comparison.
   *
   * TR: Bu talep ile ilişkili veya ilgili teklif tanımlayıcıları dizisi. Bu teklifler,
   * talebin bir parçası olarak oluşturulabilir veya karşılaştırma için referans alınabilir.
   */
  readonly proposalIds: readonly string[];

  /**
   * Case Notes / Talep Notları
   *
   * EN: Array of notes that have been added to this case throughout its lifecycle.
   * These notes provide additional context, decisions, and communication history.
   *
   * TR: Bu talebe yaşam döngüsü boyunca eklenmiş notlar dizisi. Bu notlar ek bağlam,
   * kararlar ve iletişim geçmişi sağlar.
   */
  readonly notes: readonly Note[];

  /**
   * Case Priority Assessment / Talep Öncelik Değerlendirmesi
   *
   * EN: Contains the priority assessment information for the case, including the total score,
   * detailed rule information, and assessment timestamp. This helps determine case handling
   * urgency and resource allocation.
   *
   * TR: Toplam puan, detaylı kural bilgileri ve değerlendirme zaman damgası dahil olmak üzere
   * talebin öncelik değerlendirme bilgilerini içerir. Bu, talep işleme aciliyeti ve kaynak
   * tahsisini belirlemeye yardımcı olur.
   */
  readonly priority?: CasePriorityResult;
}

export interface GetSaleOpportunityCaseResult extends GetCaseByRefResultBase {
  readonly type: CaseType.SaleOpportunity;
  readonly caseSubType: SaleOpportunityCaseSubType;
}

export interface GetCancelCaseResult extends GetCaseByRefResultBase {
  readonly type: CaseType.Cancel;
  readonly caseSubType: CancelCaseSubType;
  readonly policyId: string;
}

export interface GetEndorsementCaseResult extends GetCaseByRefResultBase {
  readonly type: CaseType.Endorsement;
  readonly caseSubType: EndorsementCaseSubType;
  readonly policyId: string;
}

export interface GetComplaintCaseResult extends GetCaseByRefResultBase {
  readonly type: CaseType.Complaint;
  readonly caseSubType: ComplaintCaseSubType;
}

/**
 * Represents case priority assessment information including score and rule details.
 * Puan ve kural detayları dahil olmak üzere talep öncelik değerlendirme bilgilerini temsil eder.
 */
export interface CasePriorityResult {
  /**
   * Total Priority Score / Toplam Öncelik Puanı
   *
   * EN: The calculated total priority score for the case based on all applicable rules.
   * Higher scores indicate higher priority and urgency for case handling.
   *
   * TR: Geçerli tüm kurallara dayalı olarak talep için hesaplanan toplam öncelik puanı.
   * Daha yüksek puanlar talep işleme için daha yüksek öncelik ve aciliyeti gösterir.
   */
  readonly totalScore: number;

  /**
   * Priority Rule Hits / Öncelik Kuralı Eşleşmeleri
   *
   * EN: Array of detailed information about priority rules that were triggered during
   * the assessment, including user-friendly labels, descriptions, and scores.
   *
   * TR: Değerlendirme sırasında tetiklenen öncelik kuralları hakkında kullanıcı dostu
   * etiketler, açıklamalar ve puanlar dahil olmak üzere detaylı bilgi dizisi.
   */
  readonly ruleHits: readonly CasePriorityRuleHitDetail[];

  /**
   * Assessment Timestamp / Değerlendirme Zaman Damgası
   *
   * EN: The date and time when the priority assessment was last calculated for this case.
   * Used for tracking assessment currency and audit purposes.
   *
   * TR: Bu talep için öncelik değerlendirmesinin son hesaplandığı tarih ve saat.
   * Değerlendirme güncelliğini takip etmek ve denetim amaçları için kullanılır.
   */
  readonly assessedAt: string;
}

/**
 * Details about a case priority rule hit including user-friendly information.
 * Kullanıcı dostu bilgiler dahil olmak üzere talep öncelik kuralı eşleşmesi hakkında detaylar.
 */
export interface CasePriorityRuleHitDetail {
  /**
   * Rule System Name / Kural Sistem Adı
   *
   * EN: The internal system identifier for the priority rule. This is used by
   * the system for rule execution and configuration.
   *
   * TR: Öncelik kuralı için dahili sistem tanımlayıcısı. Bu, kural yürütme
   * ve yapılandırma için sistem tarafından kullanılır.
   */
  readonly name: string;

  /**
   * Rule Display Label / Kural Görüntü Etiketi
   *
   * EN: A user-friendly, localized label for the rule that can be displayed
   * in user interfaces to help users understand which rule was applied.
   *
   * TR: Hangi kuralın uygulandığını kullanıcıların anlamasına yardımcı olmak
   * için kullanıcı arayüzlerinde görüntülenebilen kullanıcı dostu, yerelleştirilmiş
   * kural etiketi.
   */
  readonly label: string;

  /**
   * Rule Description / Kural Açıklaması
   *
   * EN: A detailed, user-friendly description explaining what the rule does,
   * when it applies, and how it affects case priority calculation.
   *
   * TR: Kuralın ne yaptığını, ne zaman uygulandığını ve talep öncelik hesaplamasını
   * nasıl etkilediğini açıklayan detaylı, kullanıcı dostu açıklama.
   */
  readonly description: string;

  /**
   * Rule Score Contribution / Kural Puan Katkısı
   *
   * EN: The score value that this rule contributed to the total case priority score.
   * Higher values indicate higher priority impact.
   *
   * TR: Bu kuralın toplam talep öncelik puanına katkı sağladığı puan değeri.
   * Daha yüksek değerler daha yüksek öncelik etkisini gösterir.
   */
  readonly score: number;
}

/**
 * Represents a note added to a case with timestamp and creator information.
 * Zaman damgası ve oluşturucu bilgisi ile talebe eklenen bir notu temsil eder.
 */
export interface Note {
  /**
   * Note Content / Not İçeriği
   *
   * EN: The textual content of the note added to the case. This can include observations,
   * decisions, communication summaries, or any other relevant information.
   *
   * TR: Talebe eklenen notun metin içeriği. Bu, gözlemler, kararlar, iletişim özetleri
   * veya diğer ilgili bilgileri içerebilir.
   */
  readonly note: string;

  /**
   * Note Creation Timestamp / Not Oluşturma Zaman Damgası
   *
   * EN: The date and time when the note was added to the case. Used for
   * chronological ordering and audit trail purposes.
   *
   * TR: Notun talebe eklendiği tarih ve saat. Kronolojik sıralama ve denetim
   * izi amaçları için kullanılır.
   */
  readonly createdAt: string;

  /**
   * Note Creator User Reference / Not Oluşturan Kullanıcı Referansı
   *
   * EN: Reference to the user who created this note, including their identification
   * and role information for accountability and audit purposes.
   *
   * TR: Bu notu oluşturan kullanıcıya referans; hesap verebilirlik ve denetim
   * amaçları için tanımlama ve rol bilgilerini içerir.
   */
  readonly createdBy: UserReference;
}

/**
 * Response class containing comprehensive information about an insurance policy associated with a case.
 * Provides detailed policy data including financial information, customer details, and asset-specific properties.
 *
 * Bir talep ile ilişkili sigorta poliçesi hakkında kapsamlı bilgi içeren yanıt sınıfı.
 * Finansal bilgiler, müşteri detayları ve varlığa özel özellikler dahil olmak üzere detaylı poliçe verisi sağlar.
 */
export interface CasePolicyResult {
  /**
   * Policy Unique Identifier / Poliçe Benzersiz Tanımlayıcısı
   */
  readonly id: string;

  /**
   * Insurer Customer Identifier / Sigortalayan Müşteri Tanımlayıcısı
   */
  readonly insurerCustomerId: string;

  /**
   * Insured Customer Identifier / Sigortalı Müşteri Tanımlayıcısı
   */
  readonly insuredCustomerId: string;

  /**
   * Premium Payment Installment Number / Prim Ödeme Taksit Numarası
   */
  readonly installmentNumber?: number;

  /**
   * Insurance Product Branch / Sigorta Ürün Dalı
   */
  readonly productBranch: ProductBranch;

  /**
   * Net Premium Amount / Net Prim Tutarı
   */
  readonly netPremium: number;

  /**
   * Gross Premium Amount / Brüt Prim Tutarı
   */
  readonly grossPremium: number;

  /**
   * Commission Amount / Komisyon Tutarı
   */
  readonly commission?: number;

  /**
   * Payment Option / Ödeme Seçeneği
   */
  readonly paymentType: PaymentOption;

  /**
   * Policy Currency / Poliçe Para Birimi
   */
  readonly currency: Currency;

  /**
   * Insurance Company Proposal Number / Sigorta Şirketi Teklif Numarası
   */
  readonly insuranceCompanyProposalNumber: string;

  /**
   * Policy Creation Timestamp / Poliçe Oluşturma Zaman Damgası
   */
  readonly createdAt: string;

  /**
   * Policy Start Date / Poliçe Başlangıç Tarihi
   */
  readonly startDate: string;

  /**
   * Policy End Date / Poliçe Bitiş Tarihi
   */
  readonly endDate: string;

  /**
   * Policy State / Poliçe Durumu
   */
  readonly state: PolicyState;

  /**
   * Insured Customer Name / Sigortalı Müşteri Adı
   */
  readonly insuredCustomerName?: string;

  /**
   * Insurer Customer Name / Sigortalayan Müşteri Adı
   */
  readonly insurerCustomerName?: string;

  /**
   * Insurance Product Identifier / Sigorta Ürün Tanımlayıcısı
   */
  readonly productId: string;

  /**
   * Insurance Product Name / Sigorta Ürün Adı
   */
  readonly productName: string;

  /**
   * Insurance Company Identifier / Sigorta Şirketi Tanımlayıcısı
   */
  readonly insuranceCompanyId: string;

  /**
   * Insurance Company Name / Sigorta Şirketi Adı
   */
  readonly insuranceCompanyName: string;

  /**
   * Insurance Company Logo URL / Sigorta Şirketi Logo URL'si
   */
  readonly insuranceCompanyLogo?: string;

  /**
   * Insurance Company Policy Number / Sigorta Şirketi Poliçe Numarası
   */
  readonly insuranceCompanyPolicyNumber: string;

  /**
   * Insured Customer Identity / Sigortalı Müşteri Kimliği
   */
  readonly insuredCustomerIdentity: string;

  /**
   * Insurer Customer Identity / Sigortalayan Müşteri Kimliği
   */
  readonly insurerCustomerIdentity: string;

  /**
   * Insured Customer Type / Sigortalı Müşteri Türü
   */
  readonly insuredCustomerType: CustomerType;

  /**
   * Insurer Customer City / Sigortalayan Müşteri Şehri
   */
  readonly insurerCustomerCity?: InsuranceParameter;

  /**
   * Insured Customer City / Sigortalı Müşteri Şehri
   */
  readonly insuredCustomerCity?: InsuranceParameter;

  /**
   * Insurer Customer District / Sigortalayan Müşteri İlçesi
   */
  readonly insurerCustomerDistrict?: InsuranceParameter;

  /**
   * Insured Customer District / Sigortalı Müşteri İlçesi
   */
  readonly insuredCustomerDistrict?: InsuranceParameter;

  /**
   * Insurer Customer Birth Date / Sigortalayan Müşteri Doğum Tarihi
   */
  readonly insurerCustomerBirthDate?: string;

  /**
   * Vehicle Model Information / Araç Model Bilgisi
   */
  readonly vehicleModel?: VehicleModel;

  /**
   * Vehicle Plate Information / Araç Plaka Bilgisi
   */
  readonly vehiclePlate?: VehiclePlate;

  /**
   * Vehicle Document Serial / Araç Belge Serisi
   */
  readonly vehicleDocumentSerial?: VehicleDocumentSerial;

  /**
   * Vehicle Fuel Type / Araç Yakıt Türü
   */
  readonly vehicleFuel?: VehicleFuel;

  /**
   * Insured Customer Birth Date / Sigortalı Müşteri Doğum Tarihi
   */
  readonly insuredCustomerBirthDate?: string;

  /**
   * Policy Creator User Reference / Poliçe Oluşturan Kullanıcı Referansı
   */
  readonly createdBy: UserReference;

  /**
   * Property Number / Mülk Numarası
   */
  readonly propertyNumber?: number;

  /**
   * Old DASK Policy Number / Eski DASK Poliçe Numarası
   */
  readonly daskOldPolicyNumber?: number;

  /**
   * Current DASK Policy Number / Mevcut DASK Poliçe Numarası
   */
  readonly daskPolicyNumber?: string;
}

/**
 * Response class containing comprehensive information about an insurance proposal associated with a case.
 * Provides detailed proposal data including product information, customer details, and success metrics.
 *
 * Bir talep ile ilişkili sigorta teklifi hakkında kapsamlı bilgi içeren yanıt sınıfı.
 * Ürün bilgileri, müşteri detayları ve başarı metrikleri dahil olmak üzere detaylı teklif verisi sağlar.
 */
export interface CaseProposalResult {
  /**
   * Proposal Unique Identifier / Teklif Benzersiz Tanımlayıcısı
   */
  readonly id: string;

  /**
   * Insurer Customer Identifier / Sigortalayan Müşteri Tanımlayıcısı
   */
  readonly insurerCustomerId: string;

  /**
   * Insured Customer Identifier / Sigortalı Müşteri Tanımlayıcısı
   */
  readonly insuredCustomerId: string;

  /**
   * Insurance Product Branch / Sigorta Ürün Dalı
   */
  readonly productBranch: ProductBranch;

  /**
   * Proposal State / Teklif Durumu
   */
  readonly state: string; // ProposalState enum

  /**
   * Total Products Count / Toplam Ürün Sayısı
   */
  readonly productsCount: number;

  /**
   * Successful Products Count / Başarılı Ürün Sayısı
   */
  readonly succeedProductsCount: number;

  /**
   * Agent User Creator Reference / Acente Kullanıcı Oluşturucu Referansı
   */
  readonly agentUserCreatedBy: UserReference;

  /**
   * Insured Customer Name / Sigortalı Müşteri Adı
   */
  readonly insuredCustomerName: string;

  /**
   * Insured Customer Identity / Sigortalı Müşteri Kimliği
   */
  readonly insuredCustomerIdentity: string;

  /**
   * Insured Customer Type / Sigortalı Müşteri Türü
   */
  readonly insuredCustomerType: CustomerType;

  /**
   * Insured Customer City / Sigortalı Müşteri Şehri
   */
  readonly insuredCustomerCity?: InsuranceParameter;

  /**
   * Insured Customer District / Sigortalı Müşteri İlçesi
   */
  readonly insuredCustomerDistrict?: InsuranceParameter;

  /**
   * Vehicle Model Information / Araç Model Bilgisi
   */
  readonly vehicleModel?: VehicleModel;

  /**
   * Vehicle Plate Information / Araç Plaka Bilgisi
   */
  readonly vehiclePlate?: VehiclePlate;

  /**
   * Vehicle Document Serial / Araç Belge Serisi
   */
  readonly vehicleDocumentSerial?: VehicleDocumentSerial;

  /**
   * Vehicle Fuel Type / Araç Yakıt Türü
   */
  readonly vehicleFuel?: VehicleFuel;

  /**
   * Insured Customer Birth Date / Sigortalı Müşteri Doğum Tarihi
   */
  readonly insuredCustomerBirthDate?: string;

  /**
   * Proposal Success Rate / Teklif Başarı Oranı
   */
  readonly successRate: number;

  /**
   * Lowest Premium Amount / En Düşük Prim Tutarı
   */
  readonly lowestPremium?: number;

  /**
   * Highest Premium Amount / En Yüksek Prim Tutarı
   */
  readonly highestPremium?: number;

  /**
   * Vehicle Utilization Style / Araç Kullanım Biçimi
   */
  readonly utilizationStyle?: string; // VehicleUtilizationStyle enum

  /**
   * Proposal Creation Timestamp / Teklif Oluşturma Zaman Damgası
   */
  readonly createdAt: string;
}

/**
 * Base class for case activity responses that represent different types of actions performed on insurance cases.
 * Provides common activity properties and serves as a polymorphic base for specific activity type responses.
 *
 * Sigorta talepleri üzerinde gerçekleştirilen farklı eylem türlerini temsil eden talep aktivite yanıtları için temel sınıf.
 * Ortak aktivite özelliklerini sağlar ve belirli aktivite türü yanıtları için polimorfik temel olarak hizmet eder.
 */
export type CaseActivityResult =
  | CaseCreatedActivityResult
  | CasePolicyAddedActivityResult
  | CaseProposalAddedActivityResult
  | CaseRepresentativeAssignedActivityResult
  | CaseChannelChangedActivityResult
  | CaseStateChangedActivityResult
  | CasePolicyEndDateSetActivityResult
  | CaseCustomerUpdatedActivityResult
  | CaseAssetUpdatedActivityResult
  | CaseNoteAddedActivityResult
  | CasePriorityAssessedActivityResult
  | CaseProposalProductPurchaseAttemptedActivityResult;

interface CaseActivityResultBase {
  /**
   * Case Activity Action / Talep Aktivite Eylemi
   *
   * EN: The specific action or event type that this activity represents in the case lifecycle.
   * This determines the nature of the change or event that occurred and how it should be
   * interpreted in the context of case management and audit trails.
   *
   * TR: Bu aktivitenin talep yaşam döngüsünde temsil ettiği belirli eylem veya olay türü.
   * Bu, meydana gelen değişiklik veya olayın doğasını ve talep yönetimi ve denetim izleri
   * bağlamında nasıl yorumlanması gerektiğini belirler.
   */
  readonly action: CaseActivityAction;

  /**
   * Activity Timestamp / Aktivite Zaman Damgası
   *
   * EN: The date and time when this activity was performed on the case. Used for
   * chronological ordering of activities, audit trails, and timeline analysis.
   *
   * TR: Bu aktivitenin talep üzerinde gerçekleştirildiği tarih ve saat. Aktivitelerin
   * kronolojik sıralaması, denetim izleri ve zaman çizelgesi analizi için kullanılır.
   */
  readonly createdAt: string;

  /**
   * Activity Performer User Reference / Aktivite Gerçekleştiren Kullanıcı Referansı
   *
   * EN: Reference to the user who performed this activity, including their identification
   * and role information for accountability and audit purposes.
   *
   * TR: Bu aktiviteyi gerçekleştiren kullanıcıya referans; hesap verebilirlik ve denetim
   * amaçları için tanımlama ve rol bilgilerini içerir.
   */
  readonly createdBy: UserReference;
}

export interface CaseCreatedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.Created;
  readonly channel: Channel;
  readonly representative?: UserReference;
}

export interface CasePolicyAddedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.PolicyAdded;
  readonly policyId: string;
  readonly policyCreatedBy: UserReference;
}

export interface CaseProposalAddedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.ProposalAdded;
  readonly proposalId: string;
  readonly proposalCreatedBy: UserReference;
}

export interface CaseRepresentativeAssignedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.RepresentativeAssigned;
  readonly oldRepresentative?: UserReference;
  readonly newRepresentative?: UserReference;
}

export interface CaseChannelChangedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.ChannelChanged;
  readonly oldChannel: Channel;
  readonly newChannel: Channel;
}

export interface CaseStateChangedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.StateChanged;
  readonly oldMainState: CaseMainState;
  readonly oldSubState: CaseSubState;
  readonly newMainState: CaseMainState;
  readonly newSubState: CaseSubState;
}

export interface CasePolicyEndDateSetActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.PolicyEndDateSet;
  readonly oldPolicyEndDate?: string;
  readonly newPolicyEndDate?: string;
}

export interface CaseCustomerUpdatedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.CustomerUpdated;
  readonly oldCustomerName?: string;
  readonly newCustomerName?: string;
  readonly oldCustomerIdentity?: string;
  readonly newCustomerIdentity?: string;
  readonly oldCustomerCity?: InsuranceParameter;
  readonly newCustomerCity?: InsuranceParameter;
  readonly oldCustomerDistrict?: InsuranceParameter;
  readonly newCustomerDistrict?: InsuranceParameter;
  readonly oldCustomerPrimaryPhoneNumber?: CustomerPhoneNumber;
  readonly newCustomerPrimaryPhoneNumber?: CustomerPhoneNumber;
  readonly oldCustomerPrimaryEmail?: CustomerEmail;
  readonly newCustomerPrimaryEmail?: CustomerEmail;
  readonly oldCustomerBirthDate?: BirthDate;
  readonly newCustomerBirthDate?: BirthDate;
}

export interface CaseAssetUpdatedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.AssetUpdated;
  readonly oldAssetId?: string;
  readonly newAssetId?: string;
  readonly oldVehiclePlate?: VehiclePlate;
  readonly newVehiclePlate?: VehiclePlate;
  readonly oldVehicleModel?: VehicleModel;
  readonly newVehicleModel?: VehicleModel;
  readonly oldVehicleUtilizationStyle?: VehicleUtilizationStyle;
  readonly newVehicleUtilizationStyle?: VehicleUtilizationStyle;
  readonly oldVehicleEngine?: VehicleEngine;
  readonly newVehicleEngine?: VehicleEngine;
  readonly oldVehicleChassis?: VehicleChassis;
  readonly newVehicleChassis?: VehicleChassis;
  readonly oldVehicleRegistrationDate?: VehicleRegistrationDate;
  readonly newVehicleRegistrationDate?: VehicleRegistrationDate;
  readonly oldVehicleFuel?: VehicleFuel;
  readonly newVehicleFuel?: VehicleFuel;
  readonly oldVehicleSeatNumber?: VehicleSeatNumber;
  readonly newVehicleSeatNumber?: VehicleSeatNumber;
  readonly oldVehicleDocumentSerial?: VehicleDocumentSerial;
  readonly newVehicleDocumentSerial?: VehicleDocumentSerial;
  readonly oldPropertyNumber?: PropertyNumber;
  readonly newPropertyNumber?: PropertyNumber;
  readonly oldPropertySquareMeter?: PropertySquareMeter;
  readonly newPropertySquareMeter?: PropertySquareMeter;
  readonly oldPropertyConstructionYear?: PropertyConstructionYear;
  readonly newPropertyConstructionYear?: PropertyConstructionYear;
  readonly oldPropertyDamageStatus?: PropertyDamageStatus;
  readonly newPropertyDamageStatus?: PropertyDamageStatus;
  readonly oldPropertyFloor?: PropertyFloor;
  readonly newPropertyFloor?: PropertyFloor;
  readonly oldPropertyStructure?: PropertyStructure;
  readonly newPropertyStructure?: PropertyStructure;
  readonly oldPropertyUtilizationStyle?: PropertyUtilizationStyle;
  readonly newPropertyUtilizationStyle?: PropertyUtilizationStyle;
  readonly oldPropertyOwnershipType?: PropertyOwnershipType;
  readonly newPropertyOwnershipType?: PropertyOwnershipType;
}

export interface CaseNoteAddedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.NoteAdded;
  readonly note: string;
}

export interface CasePriorityAssessedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.PriorityAssessed;
  readonly oldTotalScore?: number;
  readonly oldRuleHits?: readonly CasePriorityRuleHitDetail[];
  readonly newTotalScore: number;
  readonly newRuleHits: readonly CasePriorityRuleHitDetail[];
}

export interface CaseProposalProductPurchaseAttemptedActivityResult extends CaseActivityResultBase {
  readonly action: CaseActivityAction.ProposalProductPurchaseAttempted;
  readonly proposalId: string;
  readonly proposalProductId: string;
  readonly insuranceProductId: number;
  readonly installmentNumber: number;
  readonly attemptedTime: string;
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly channel: Channel;
  readonly paymentOption: PaymentOption;
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

// UserReference, InsuranceParameter, and vehicle types are imported from './common'

// ============================================================================
// BRANCH ASSIGNMENT TYPES
// ============================================================================

/**
 * Request to set case branch
 */
export interface SetCaseBranchRequest {
  readonly ref: string;
  readonly branchId: string;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Request for sales opportunity funnel analytics
 */
export interface GetSalesOpportunityFunnelAnalyticsRequest {
  readonly startDate?: string;
  readonly endDate?: string;
}

/**
 * Funnel stage data
 */
export interface FunnelStage {
  readonly stage: string;
  readonly count: number;
  readonly percentage: number;
}

/**
 * Response for sales opportunity funnel analytics
 */
export interface GetSalesOpportunityFunnelAnalyticsResult {
  readonly stages: readonly FunnelStage[];
}

/**
 * Request for open case backlog pivot analytics
 */
export interface GetOpenCaseBacklogPivotAnalyticsRequest {
  readonly filters?: object;
}

/**
 * Backlog pivot data
 */
export interface BacklogPivotData {
  readonly type: string;
  readonly subtype: string;
  readonly count: number;
}

/**
 * Response for open case backlog pivot analytics
 */
export interface GetOpenCaseBacklogPivotAnalyticsResult {
  readonly pivotData: readonly BacklogPivotData[];
}

/**
 * Request for failed cases reason distribution
 */
export interface GetFailedCasesReasonDistributionRequest {
  readonly startDate?: string;
  readonly endDate?: string;
}

/**
 * Reason distribution data
 */
export interface ReasonDistribution {
  readonly reason: string;
  readonly count: number;
  readonly percentage: number;
}

/**
 * Response for failed cases reason distribution
 */
export interface GetFailedCasesReasonDistributionResult {
  readonly reasons: readonly ReasonDistribution[];
}

// ============================================================================
// COMMUNICATION AUTOMATION TYPES
// ============================================================================

/**
 * Automation argument
 */
export interface AutomationArgument {
  readonly key: string;
  readonly type: string;
  readonly required: boolean;
}

/**
 * Case communication automation result
 */
export interface CaseCommunicationAutomationResult {
  readonly id: string;
  readonly name: string;
  readonly arguments: readonly AutomationArgument[];
}

// ============================================================================
// PRIORITY TEMPLATE TYPES
// ============================================================================

/**
 * Priority template
 */
export interface PriorityTemplate {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
}

/**
 * Response for case priority templates
 */
export interface GetCasePriorityTemplatesResult {
  readonly templates: readonly PriorityTemplate[];
}
