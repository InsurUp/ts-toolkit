/**
 * Customer management contracts for the InsurUp TypeScript SDK.
 *
 * Provides comprehensive customer management operations for handling customer profiles, contact information,
 * health data, communication flows, and external customer data integration within the insurance ecosystem.
 *
 * Sigorta ekosistemi içinde müşteri profilleri, iletişim bilgileri, sağlık verileri, iletişim akışları
 * ve harici müşteri veri entegrasyonunu yönetmek için kapsamlı müşteri yönetimi işlemlerini sağlar.
 */

import type { CustomerType } from './common.js';
import type {
  Channel,
  InsuranceParameter,
  UserReference,
  CustomerPhoneNumber,
  PropertyAddress,
  PropertyNumber,
  VehiclePlate,
  VehicleModel,
} from './common.js';
import type { DateTime, DateOnly } from './common.date.js';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Gender enumeration
 */
export enum Gender {
  Unknown = 'UNKNOWN',
  Male = 'MALE',
  Female = 'FEMALE',
  Other = 'OTHER',
}

/**
 * Education status enumeration
 */
export enum EducationStatus {
  Unknown = 'UNKNOWN',
  PrimarySchool = 'PRIMARY_SCHOOL',
  MiddleSchool = 'MIDDLE_SCHOOL',
  HighSchool = 'HIGH_SCHOOL',
  University = 'UNIVERSITY',
  Postgraduate = 'POSTGRADUATE',
  Doctorate = 'DOCTORATE',
  Other = 'OTHER',
}

/**
 * Nationality enumeration
 */
export enum Nationality {
  Unknown = 'UNKNOWN',
  Turk = 'TURK',
  Other = 'OTHER',
}

/**
 * Marital status enumeration
 */
export enum MaritalStatus {
  Unknown = 'UNKNOWN',
  Single = 'SINGLE',
  Married = 'MARRIED',
}

/**
 * Job/occupation enumeration
 */
export enum Job {
  Unknown = 'UNKNOWN',
  Banker = 'BANKER',
  CorporateEmployee = 'CORPORATE_EMPLOYEE',
  LtdEmployee = 'LTD_EMPLOYEE',
  Police = 'POLICE',
  MilitaryPersonnel = 'MILITARY_PERSONNEL',
  RetiredSpouse = 'RETIRED_SPOUSE',
  Teacher = 'TEACHER',
  Doctor = 'DOCTOR',
  Pharmacist = 'PHARMACIST',
  Nurse = 'NURSE',
  HealthcareWorker = 'HEALTHCARE_WORKER',
  Lawyer = 'LAWYER',
  Judge = 'JUDGE',
  Prosecutor = 'PROSECUTOR',
  Freelancer = 'FREELANCER',
  Farmer = 'FARMER',
  Instructor = 'INSTRUCTOR',
  ReligiousOfficial = 'RELIGIOUS_OFFICIAL',
  AssociationManager = 'ASSOCIATION_MANAGER',
  Officer = 'OFFICER',
  Retired = 'RETIRED',
  Housewife = 'HOUSEWIFE',
}

/**
 * Contact flow state enumeration.
 * Tracks the current status of a customer contact flow or communication workflow process.
 */
export enum ContactFlowState {
  /** The contact flow is currently active and in progress */
  Active = 'ACTIVE',
  /** The contact flow has completed successfully */
  Succeeded = 'SUCCEEDED',
  /** The contact flow has failed to complete successfully */
  Failed = 'FAILED',
}

/**
 * Contact type enumeration.
 * Defines the specific communication method or channel used for customer interactions.
 */
export enum ContactType {
  /** Contact via telephone or phone call */
  PhoneCall = 'PHONE_CALL',
}

/**
 * Contact state enumeration.
 * Tracks the execution status of planned customer contacts or communication attempts.
 */
export enum ContactState {
  /** The contact has been planned or scheduled but not yet executed */
  Planned = 'PLANNED',
  /** The contact has been successfully executed or completed */
  Occurred = 'OCCURRED',
  /** The contact was planned but did not occur as scheduled */
  NotOccurred = 'NOT_OCCURRED',
}

/**
 * Surgery enumeration for health data
 */
export enum Surgery {
  Other = 'OTHER',
  OrganTransplant = 'ORGAN_TRANSPLANT',
  BoneMarrowTransplant = 'BONE_MARROW_TRANSPLANT',
  HeartSurgery = 'HEART_SURGERY',
  BrainSurgery = 'BRAIN_SURGERY',
}

/**
 * Disease enumeration for health data
 */
export enum Disease {
  Other = 'OTHER',
  KidneyFailure = 'KIDNEY_FAILURE',
  Cancer = 'CANCER',
  LiverDisease = 'LIVER_DISEASE',
  HeartFailure = 'HEART_FAILURE',
  HeartRhythmAndConductionDisorders = 'HEART_RHYTHM_AND_CONDUCTION_DISORDERS',
  ImmuneSystemDisorders = 'IMMUNE_SYSTEM_DISORDERS',
}

/**
 * Consent type enumeration for customer data processing permissions.
 * Used to track customer consent for data privacy regulations (KVKK/GDPR).
 */
export enum ConsentType {
  /** KVKK (Personal Data Protection Law) consent */
  KVKK = 'KVKK',
  /** ETK (Electronic Commerce) consent */
  ETK = 'ETK',
}

/**
 * Channel through which a customer consent was given or revoked.
 * Müşteri izninin verildiği veya geri çekildiği kanal.
 */
export enum ConsentChannel {
  /** Recorded manually by an agent during customer interaction */
  Manual = 'MANUAL',
  /** Provided directly by the customer through the web application */
  Web = 'WEB',
  /** Obtained through automated chatbot conversations */
  Chatbot = 'CHATBOT',
  /** Obtained through an SMS consent link */
  Sms = 'SMS',
  /** Obtained through an email consent link */
  Email = 'EMAIL',
  /** Received from an external system integration (e.g. IYS push webhook) */
  External = 'EXTERNAL',
}

/**
 * Action recorded against a consent for audit purposes.
 * Denetim amaçlı izin üzerinde kaydedilen eylem.
 */
export enum ConsentAction {
  /** Consent was granted */
  Given = 'GIVEN',
  /** Consent was withdrawn */
  Revoked = 'REVOKED',
}

// ============================================================================
// SUPPORTING TYPES
// ============================================================================

// === REQUEST CONTRACTS ===

/**
 * Represents a request to create a new customer in the InsurUp system. Supports individual, foreign, and company customer types with comprehensive customer information.
 *
 * InsurUp sisteminde yeni müşteri oluşturma talebini temsil eder. Kapsamlı müşteri bilgileri ile bireysel, yabancı ve şirket müşteri türlerini destekler.
 */
export type CreateCustomerRequest =
  | CreateCustomerRequestIndividual
  | CreateCustomerRequestForeign
  | CreateCustomerRequestCompany;

/**
 * Base interface for customer creation requests containing common fields.
 *
 * Ortak alanları içeren müşteri oluşturma talepleri için temel arayüz.
 */
interface CreateCustomerRequestBase {
  /**
   * Specifies the category of customer being created in the system. This determines which fields
   * are required and how the customer will be processed in insurance workflows. Each type has
   * specific identification requirements and regulatory compliance needs.
   *
   * Sistemde oluşturulan müşterinin kategorisini belirtir. Bu, hangi alanların zorunlu olduğunu
   * ve müşterinin sigorta iş akışlarında nasıl işleneceğini belirler. Her tür, özel kimlik gereksinimleri
   * ve yasal uyum ihtiyaçlarına sahiptir.
   */
  type: CustomerType;

  /**
   * Primary email address for customer communications, policy notifications, and digital document delivery.
   * This field is masked with redaction for data protection compliance. Email is used for sending policy documents,
   * renewal notices, claim updates, and other important insurance communications.
   *
   * Müşteri iletişimi, poliçe bildirimleri ve dijital belge teslimatı için birincil e-posta adresi.
   * Bu alan veri koruması uyumluluğu için maskeleme ile gizlenir. E-posta, poliçe belgelerini, yenileme
   * bildirimlerini, hasar güncellemelerini ve diğer önemli sigorta iletişimlerini göndermek için kullanılır.
   */
  email?: string | null;

  /**
   * Primary phone number for customer contact, emergency notifications, and customer service communications.
   * This field is masked for data protection compliance. Used for claim notifications, policy confirmations,
   * and urgent insurance-related communications.
   *
   * Müşteri iletişimi, acil durum bildirimleri ve müşteri hizmetleri iletişimi için birincil telefon numarası.
   * Bu alan veri koruması uyumluluğu için maskelenir. Hasar bildirimleri, poliçe onayları ve acil sigorta
   * ile ilgili iletişimler için kullanılır.
   */
  phoneNumber?: CustomerPhoneNumber | null;

  /**
   * Reference to the city where the customer is located. Used for risk assessment, pricing calculations,
   * and regional insurance regulations. Turkish cities are numbered 1-81 according to license plate codes,
   * which affects insurance premium calculations and coverage availability.
   *
   * Müşterinin bulunduğu şehir referansı. Risk değerlendirmesi, fiyatlandırma hesaplamaları ve bölgesel
   * sigorta düzenlemeleri için kullanılır. Türk şehirleri plaka kodlarına göre 1-81 arasında numaralandırılır,
   * bu da sigorta prim hesaplamalarını ve teminat kullanılabilirliğini etkiler.
   */
  cityReference?: string | null;

  /**
   * Reference to the district within the city where the customer is located. Provides more precise
   * location information for risk assessment and local insurance regulations. District-level data
   * helps determine specific hazard zones, theft rates, and other location-based risk factors.
   *
   * Müşterinin bulunduğu şehir içindeki ilçe referansı. Risk değerlendirmesi ve yerel sigorta
   * düzenlemeleri için daha kesin konum bilgisi sağlar. İlçe düzeyindeki veriler, belirli tehlike
   * bölgelerini, hırsızlık oranlarını ve diğer konum tabanlı risk faktörlerini belirlemeye yardımcı olur.
   */
  districtReference?: string | null;

  /**
   * Indicates whether the system should attempt to automatically populate missing customer information
   * from external data sources (e.g., government databases, credit bureaus). This feature helps streamline
   * customer onboarding by reducing manual data entry requirements while ensuring data accuracy.
   *
   * Sistemin eksik müşteri bilgilerini dış veri kaynaklarından (örn. devlet veritabanları, kredi büroları)
   * otomatik olarak doldurmaya çalışıp çalışmayacağını belirtir. Bu özellik, veri doğruluğunu sağlarken
   * manuel veri girişi gereksinimlerini azaltarak müşteri katılım sürecini kolaylaştırmaya yardımcı olur.
   */
  fillMissingFields: boolean;
}

/**
 * Specialized request for creating individual customers who are Turkish citizens. Requires Turkish
 * National Identity Number (TC Kimlik No) and supports comprehensive demographic information including
 * personal details, education, employment, and marital status. This information is essential for
 * insurance underwriting, risk assessment, and regulatory compliance in the Turkish insurance market.
 *
 * Türk vatandaşı olan bireysel müşteri oluşturma için özel talep. Türkiye Cumhuriyeti Kimlik Numarası
 * (TC Kimlik No) gerektirir ve kişisel detaylar, eğitim, istihdam ve medeni durum dahil kapsamlı demografik
 * bilgileri destekler. Bu bilgiler, Türk sigorta piyasasında sigorta sigortacılığı, risk değerlendirmesi
 * ve yasal uyum için gereklidir.
 */
export interface CreateCustomerRequestIndividual extends CreateCustomerRequestBase {
  type: CustomerType.Individual;

  /**
   * The 11-digit Turkish National Identity Number (TC Kimlik Numarası) that uniquely identifies
   * Turkish citizens. This is a mandatory field for individual customers and is used for identity
   * verification, government integrations, and regulatory compliance. The number is validated
   * against government databases to ensure authenticity.
   *
   * Türk vatandaşlarını benzersiz şekilde tanımlayan 11 haneli Türkiye Cumhuriyeti Kimlik Numarası.
   * Bu, bireysel müşteriler için zorunlu bir alandır ve kimlik doğrulama, devlet entegrasyonları ve
   * yasal uyum için kullanılır. Numara, otantikliği sağlamak için devlet veritabanlarına karşı doğrulanır.
   */
  identityNumber: string;

  /**
   * Complete name of the individual customer as registered in official documents. Used for policy
   * issuance, claim processing, and legal documentation. Must match official identification documents
   * for verification purposes.
   *
   * Resmi belgelerde kayıtlı olduğu şekliyle bireysel müşterinin tam adı. Poliçe düzenleme, hasar
   * işleme ve yasal belgelendirme için kullanılır. Doğrulama amacıyla resmi kimlik belgelerindeki
   * adla eşleşmesi gerekir.
   */
  fullName?: string | null;

  /**
   * Date of birth of the individual customer. Critical for age-based risk assessment, premium
   * calculations, and eligibility for certain insurance products. Used to verify identity and
   * ensure compliance with age-related insurance regulations.
   *
   * Bireysel müşterinin doğum tarihi. Yaş tabanlı risk değerlendirmesi, prim hesaplamaları ve
   * belirli sigorta ürünlerine uygunluk için kritiktir. Kimlik doğrulama ve yaşla ilgili sigorta
   * düzenlemelerine uyum sağlamak için kullanılır.
   */
  birthDate?: string | null;

  /**
   * Gender specification of the individual customer. Used for statistical analysis, actuarial
   * calculations, and certain insurance product eligibility. Some insurance products may have
   * gender-specific pricing or coverage options based on risk assessment data.
   *
   * Bireysel müşterinin cinsiyet belirtimi. İstatistiksel analiz, aktüeryal hesaplamalar ve belirli
   * sigorta ürün uygunluğu için kullanılır. Bazı sigorta ürünleri, risk değerlendirme verilerine dayalı
   * olarak cinsiyete özgü fiyatlandırma veya teminat seçeneklerine sahip olabilir.
   */
  gender?: Gender | null;

  /**
   * Current marital status of the individual customer. Affects certain insurance products, especially
   * life insurance beneficiary designations, family coverage options, and dependent coverage eligibility.
   * Important for household risk assessment and insurance planning.
   *
   * Bireysel müşterinin mevcut medeni durumu. Belirli sigorta ürünlerini, özellikle hayat sigortası
   * lehtar atamalarını, aile teminat seçeneklerini ve bağımlı teminat uygunluğunu etkiler. Hane halkı
   * risk değerlendirmesi ve sigorta planlaması için önemlidir.
   */
  maritalStatus?: MaritalStatus | null;

  /**
   * Nationality of the individual customer. Important for regulatory compliance, international
   * insurance coverage, and cross-border claim processing. Different nationalities may have
   * specific requirements or restrictions for certain insurance products.
   *
   * Bireysel müşterinin vatandaşlığı. Yasal uyum, uluslararası sigorta teminatı ve sınır ötesi
   * hasar işleme için önemlidir. Farklı vatandaşlıklar, belirli sigorta ürünleri için özel gereksinimler
   * veya kısıtlamalara sahip olabilir.
   */
  nationality?: Nationality | null;

  /**
   * Highest level of education completed by the individual customer. Used for demographic profiling,
   * risk assessment, and targeted insurance product recommendations. Education level can correlate
   * with income potential and insurance needs.
   *
   * Bireysel müşteri tarafından tamamlanan en yüksek eğitim seviyesi. Demografik profilleme, risk
   * değerlendirmesi ve hedefli sigorta ürün önerileri için kullanılır. Eğitim seviyesi, gelir potansiyeli
   * ve sigorta ihtiyaçları ile ilişkilendirilebilir.
   */
  educationStatus?: EducationStatus | null;

  /**
   * Current job or occupation of the individual customer. Critical for occupational risk assessment,
   * professional liability coverage, and industry-specific insurance needs. Certain high-risk occupations
   * may affect premium calculations or coverage availability.
   *
   * Bireysel müşterinin mevcut işi veya mesleği. Mesleki risk değerlendirmesi, mesleki sorumluluk
   * teminatı ve sektöre özgü sigorta ihtiyaçları için kritiktir. Belirli yüksek riskli meslekler,
   * prim hesaplamalarını veya teminat kullanılabilirliğini etkileyebilir.
   */
  job?: Job | null;
}

/**
 * Specialized request for creating customers who are foreign nationals residing in or visiting Turkey.
 * Requires foreign identification (passport number, foreign ID) and supports the same demographic
 * information as individual customers. Special considerations apply for foreign customers regarding
 * documentation requirements and regulatory compliance.
 *
 * Türkiye'de ikamet eden veya ziyaret eden yabancı vatandaş müşteriler oluşturma için özel talep.
 * Yabancı kimlik (pasaport numarası, yabancı kimlik) gerektirir ve bireysel müşterilerle aynı demografik
 * bilgileri destekler. Belgelendirme gereksinimleri ve yasal uyum konusunda yabancı müşteriler için
 * özel hususlar geçerlidir.
 */
export interface CreateCustomerRequestForeign extends CreateCustomerRequestBase {
  type: CustomerType.Foreign;

  /**
   * Foreign identification number such as passport number or foreign national ID number.
   * This is mandatory for foreign customers and is used for identity verification and regulatory
   * compliance for non-Turkish citizens seeking insurance coverage in Turkey.
   *
   * Pasaport numarası veya yabancı ulusal kimlik numarası gibi yabancı kimlik numarası.
   * Bu, yabancı müşteriler için zorunludur ve Türkiye'de sigorta teminatı arayan Türk olmayan
   * vatandaşlar için kimlik doğrulama ve yasal uyum için kullanılır.
   */
  identityNumber: string;

  /**
   * Complete name of the foreign customer as it appears on their passport or official foreign
   * identification documents. Must match identification documents for verification and policy issuance.
   *
   * Yabancı müşterinin pasaport veya resmi yabancı kimlik belgelerinde göründüğü şekliyle tam adı.
   * Doğrulama ve poliçe düzenleme için kimlik belgeleriyle eşleşmesi gerekir.
   */
  fullName?: string | null;

  /**
   * Date of birth of the foreign customer as recorded in their official identification documents.
   * Used for age verification, risk assessment, and eligibility determination for insurance products.
   *
   * Yabancı müşterinin resmi kimlik belgelerinde kayıtlı doğum tarihi. Yaş doğrulama, risk
   * değerlendirmesi ve sigorta ürünlerine uygunluk belirleme için kullanılır.
   */
  birthDate?: string | null;

  /**
   * Gender specification of the foreign customer for demographic profiling and insurance
   * product eligibility assessment.
   *
   * Demografik profilleme ve sigorta ürün uygunluk değerlendirmesi için yabancı müşterinin
   * cinsiyet belirtimi.
   */
  gender?: Gender | null;

  /**
   * Current marital status of the foreign customer, affecting coverage options and beneficiary
   * designations for insurance products.
   *
   * Yabancı müşterinin mevcut medeni durumu, sigorta ürünleri için teminat seçeneklerini ve
   * lehtar atamalarını etkiler.
   */
  maritalStatus?: MaritalStatus | null;

  /**
   * Country of citizenship for the foreign customer. Essential for international insurance
   * coverage, cross-border regulations, and diplomatic considerations.
   *
   * Yabancı müşterinin vatandaşlık ülkesi. Uluslararası sigorta teminatı, sınır ötesi düzenlemeler
   * ve diplomatik hususlar için gereklidir.
   */
  nationality?: Nationality | null;

  /**
   * Highest level of education completed by the foreign customer for demographic analysis
   * and insurance product recommendations.
   *
   * Demografik analiz ve sigorta ürün önerileri için yabancı müşteri tarafından tamamlanan
   * en yüksek eğitim seviyesi.
   */
  educationStatus?: EducationStatus | null;

  /**
   * Current job or occupation of the foreign customer for occupational risk assessment
   * and professional insurance needs evaluation.
   *
   * Mesleki risk değerlendirmesi ve profesyonel sigorta ihtiyaç değerlendirmesi için yabancı
   * müşterinin mevcut işi veya mesleği.
   */
  job?: Job | null;
}

/**
 * Specialized request for creating corporate customers and business entities. Requires tax number
 * for identification and company title for official records. Corporate customers have different
 * insurance needs, regulatory requirements, and risk profiles compared to individual customers.
 * Used for commercial insurance products and business-related coverage.
 *
 * Kurumsal müşteriler ve işletmeler oluşturma için özel talep. Kimlik için vergi numarası ve
 * resmi kayıtlar için şirket unvanı gerektirir. Kurumsal müşteriler, bireysel müşterilere kıyasla
 * farklı sigorta ihtiyaçları, yasal gereksinimler ve risk profillerine sahiptir. Ticari sigorta
 * ürünleri ve işletme ile ilgili teminatlar için kullanılır.
 */
export interface CreateCustomerRequestCompany extends CreateCustomerRequestBase {
  type: CustomerType.Company;

  /**
   * Official registered name of the company as it appears in commercial registry records.
   * Used for policy issuance, legal documentation, and official correspondence. Must match
   * trade registry records for verification and compliance purposes.
   *
   * Ticaret sicili kayıtlarında göründüğü şekliyle şirketin resmi tescilli adı. Poliçe düzenleme,
   * yasal belgelendirme ve resmi yazışmalar için kullanılır. Doğrulama ve uyum amacıyla ticaret
   * sicili kayıtlarıyla eşleşmesi gerekir.
   */
  title: string;

  /**
   * Official tax identification number of the company issued by Turkish tax authorities.
   * Essential for corporate identification, tax compliance, and business insurance regulations.
   * Used for invoicing, premium calculations, and regulatory reporting requirements.
   *
   * Türk vergi makamları tarafından verilen şirketin resmi vergi kimlik numarası. Kurumsal
   * kimlik, vergi uyumu ve işletme sigorta düzenlemeleri için gereklidir. Faturalama, prim
   * hesaplamaları ve yasal raporlama gereksinimleri için kullanılır.
   */
  taxNumber: string;
}

/**
 * Represents a request to retrieve detailed customer information from the InsurUp system.
 *
 * InsurUp sisteminden detaylı müşteri bilgilerini almak için talebi temsil eder.
 */
export interface GetCustomerRequest {
  /**
   * Unique identifier (GUID) of the customer whose detailed information is being requested.
   * This ID was assigned during customer creation and serves as the primary key for retrieving
   * the complete customer profile from the database.
   *
   * Detaylı bilgileri talep edilen müşterinin benzersiz tanımlayıcısı (GUID). Bu ID müşteri
   * oluşturma sırasında atanmıştır ve veritabanından tam müşteri profilini almak için birincil
   * anahtar görevi görür.
   */
  customerId: string;
}

/**
 * Represents a request to update existing customer information in the InsurUp system. Supports individual, foreign, and company customer types with comprehensive update capabilities.
 *
 * InsurUp sisteminde mevcut müşteri bilgilerini güncelleme talebini temsil eder. Kapsamlı güncelleme yetenekleri ile bireysel, yabancı ve şirket müşteri türlerini destekler.
 */
export type UpdateCustomerRequest =
  | UpdateCustomerRequestIndividual
  | UpdateCustomerRequestForeign
  | UpdateCustomerRequestCompany;

/**
 * Base interface for customer update requests containing common fields.
 *
 * Ortak alanları içeren müşteri güncelleme talepleri için temel arayüz.
 */
interface UpdateCustomerRequestBase {
  type: CustomerType;
  id: string;
  cityReference?: string | null;
  districtReference?: string | null;
  primaryEmail?: string | null;
  primaryPhoneNumber?: CustomerPhoneNumber | null;
  fillMissingFields: boolean;
}

/**
 * Specialized update request for individual customers who are Turkish citizens.
 */
export interface UpdateCustomerRequestIndividual extends UpdateCustomerRequestBase {
  type: CustomerType.Individual;
  fullName?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  nationality?: Nationality | null;
  educationStatus?: EducationStatus | null;
  job?: Job | null;
}

/**
 * Specialized update request for customers who are foreign nationals.
 */
export interface UpdateCustomerRequestForeign extends UpdateCustomerRequestBase {
  type: CustomerType.Foreign;
  fullName?: string | null;
  birthDate?: string | null;
  gender?: Gender | null;
  maritalStatus?: MaritalStatus | null;
  nationality?: Nationality | null;
  educationStatus?: EducationStatus | null;
  job?: Job | null;
}

/**
 * Specialized update request for corporate customers and business entities.
 */
export interface UpdateCustomerRequestCompany extends UpdateCustomerRequestBase {
  type: CustomerType.Company;
  title: string;
  taxNumber: string;
}

/**
 * Request to add a new email address to a customer's contact information.
 */
export interface AddCustomerEmailRequest {
  customerId: string;
  email: string;
}

/**
 * Request to remove an email address from a customer's contact information.
 */
export interface RemoveCustomerEmailRequest {
  customerId: string;
  email: string;
}

/**
 * Request to change the primary email address for a customer.
 */
export interface ChangePrimaryCustomerEmailRequest {
  customerId: string;
  email: string;
}

/**
 * Request to add a new phone number to a customer's contact information.
 */
export interface AddCustomerPhoneNumberRequest {
  customerId: string;
  phoneNumber: CustomerPhoneNumber;
}

/**
 * Request to remove a phone number from a customer's contact information.
 */
export interface RemoveCustomerPhoneNumberRequest {
  customerId: string;
  countryCode: number;
  phoneNumber: string;
}

/**
 * Request to change the primary phone number for a customer.
 */
export interface ChangePrimaryCustomerPhoneNumberRequest {
  customerId: string;
  countryCode: number;
  phoneNumber: string;
}

/**
 * Request to assign or change a customer's representative agent user.
 */
export interface SetCustomerRepresentativeRequest {
  customerId: string;
  representativeAgentUserId?: string | null;
}

/**
 * Request to retrieve comprehensive health information for a customer.
 */
export interface GetCustomerHealthInfoRequest {
  customerId: string;
}

/**
 * Request to update customer health information.
 */
export interface UpdateCustomerHealthInfoRequest {
  customerId: string;
  height?: number | null;
  weight?: number | null;
  surgeries: Surgery[];
  diseases: Disease[];
}

/**
 * Request to initiate a new customer contact flow.
 */
export interface CreateContactFlowRequest {
  customerId: string;
  name: string;
}

/**
 * Request to record a customer contact interaction.
 */
export interface CreateCustomerContactRequest {
  customerId: string;
}

/**
 * Request to complete and close a customer contact flow.
 */
export interface EndContactFlowRequest {
  customerId: string;
  contactFlowId: string;
}

/**
 * Request to retrieve all contact flows for a customer.
 */
export interface GetCustomerContactFlowsRequest {
  customerId: string;
  caseRef?: string | null;
}

/**
 * Request to retrieve all individual contact interactions for a customer.
 */
export interface GetCustomerContactsRequest {
  customerId: string;
  caseRef?: string | null;
}

/**
 * Represents a request to lookup customer information from external data sources.
 */
export type ExternalLookupCustomerRequest =
  | ExternalLookupCustomerRequestIndividual
  | ExternalLookupCustomerRequestCompany
  | ExternalLookupCustomerRequestForeign;

/**
 * External lookup request for Turkish citizens using their National Identity Number.
 */
export interface ExternalLookupCustomerRequestIndividual {
  identityNumber: number;
  birthDate?: string | null;
}

/**
 * External lookup request for corporate entities using their tax identification number.
 */
export interface ExternalLookupCustomerRequestCompany {
  taxNumber: string;
}

/**
 * External lookup request for foreign nationals using their foreign identification documents.
 */
export interface ExternalLookupCustomerRequestForeign {
  identityNumber: string;
  birthDate: string;
}

// === RESPONSE CONTRACTS ===

/**
 * Response returned after successfully creating a new customer.
 */
export interface CreateCustomerResult {
  id: string;
}

/**
 * Comprehensive response containing complete customer profile information.
 */
export type GetCustomerResult =
  | GetCustomerResultIndividual
  | GetCustomerResultForeign
  | GetCustomerResultCompany;

/**
 * Base interface for customer response containing common fields.
 */
interface GetCustomerResultBase {
  id: string;
  type: CustomerType;
  primaryEmail?: string | null;
  primaryPhoneNumber?: CustomerPhoneNumber | null;
  city?: InsuranceParameter | null;
  district?: InsuranceParameter | null;
  createdAt: DateTime;
  createdBy: UserReference;
  representedBy?: UserReference | null;
  creationChannel: Channel;
  agentBranchId?: string | null;
  consents?: CustomerConsent[] | null;
  vehicleCount: number;
  propertyCount: number;
  proposalCount: number;
  policyCount: number;
  caseCount: number;
  emailCount: number;
  phoneCount: number;
}

/**
 * Response for individual customers who are Turkish citizens.
 */
export interface GetCustomerResultIndividual extends GetCustomerResultBase {
  type: CustomerType.Individual;
  fullName?: string | null;
  identityNumber: string;
  birthDate?: DateOnly | null;
  gender?: Gender | null;
  educationStatus?: EducationStatus | null;
  nationality?: Nationality | null;
  maritalStatus?: MaritalStatus | null;
  job?: Job | null;
  passportNumber?: string | null;
}

/**
 * Response for customers who are foreign nationals.
 */
export interface GetCustomerResultForeign extends GetCustomerResultBase {
  type: CustomerType.Foreign;
  fullName?: string | null;
  identityNumber: string;
  birthDate?: DateOnly | null;
  gender?: Gender | null;
  educationStatus?: EducationStatus | null;
  nationality?: Nationality | null;
  maritalStatus?: MaritalStatus | null;
  job?: Job | null;
  passportNumber?: string | null;
  fatherName?: string | null;
}

/**
 * Response for corporate customers and business entities.
 */
export interface GetCustomerResultCompany extends GetCustomerResultBase {
  type: CustomerType.Company;
  title: string;
  taxNumber: string;
}

/**
 * Response item representing a customer email address with primary status indicator.
 */
export interface GetCustomerEmailsResultItem {
  email: string;
  primary: boolean;
}

/**
 * Response item representing a customer phone number with primary status indicator.
 */
export interface GetCustomerPhoneNumbersResultItem {
  phoneNumber: CustomerPhoneNumber;
  primary: boolean;
}

/**
 * Response containing comprehensive health information for a customer.
 */
export interface GetCustomerHealthInfoResult {
  height?: number | null;
  weight?: number | null;
  surgeries: Surgery[];
  diseases: Disease[];
}

/**
 * Response item representing a customer contact flow.
 * Used to track the progress and outcome of customer communication workflows.
 */
export interface GetCustomerContactFlowsResultItem {
  /** Unique identifier for the contact flow */
  readonly id: string;
  /** Name of the contact flow */
  readonly name: string;
  /** Number of contacts in this flow */
  readonly contactsCount: number;
  /** Optional case reference associated with this flow */
  readonly caseRef?: string | null;
  /** Customer ID associated with this flow */
  readonly customerId: string;
  /** User who created this contact flow */
  readonly createdBy: UserReference;
  /** Timestamp when the flow was created */
  readonly createdAt: DateTime;
  /** Current state of the contact flow */
  readonly state: ContactFlowState;
  /** Date when the flow ended (if applicable) */
  readonly endedDate?: DateTime | null;
}

/**
 * Base interface for customer contact interactions.
 * Represents individual contact records within communication workflows.
 */
export interface GetCustomerContactsResultItem {
  /** Unique identifier for the contact */
  readonly id: string;
  /** Type of contact (e.g., phone call) */
  readonly type: ContactType;
  /** Current state of the contact */
  readonly state: ContactState;
  /** Customer ID associated with this contact */
  readonly customerId: string;
  /** Timestamp when the contact was created */
  readonly createdAt: DateTime;
  /** Time when the contact attempt was made */
  readonly attemptTime?: DateTime | null;
  /** Time when the contact started */
  readonly startTime?: DateTime | null;
  /** Time when the contact was planned for */
  readonly plannedTime?: DateTime | null;
  /** Optional flow ID if this contact belongs to a flow */
  readonly flowId?: string | null;
  /** Representative who handled this contact */
  readonly representative?: UserReference | null;
  /** User who created this contact record */
  readonly createdBy: UserReference;
}

/**
 * Phone call contact response item.
 * Extends the base contact with phone-specific properties.
 */
export interface PhoneCallContactResultItem extends GetCustomerContactsResultItem {
  /** Time when the call was hung up */
  readonly hangUpTime?: DateTime | null;
}

/**
 * Discriminator for the polymorphic external lookup response. Mirrors the backend
 * `$type` JSON discriminator emitted by `ExternalLookupCustomerEndpointResponse`.
 */
export type ExternalLookupCustomerResultType = 'individual' | 'company' | 'foreign';

/**
 * Common location fields shared by every external lookup response variant.
 */
interface ExternalLookupCustomerResultBase {
  readonly $type: ExternalLookupCustomerResultType;
  /** City information retrieved from external sources */
  readonly city?: InsuranceParameter | null;
  /** District information retrieved from external sources */
  readonly district?: InsuranceParameter | null;
}

/**
 * External lookup response for individual customers (Turkish citizens).
 * Contains personal information retrieved from government databases and identity verification services.
 */
export interface ExternalLookupIndividualCustomerResult extends ExternalLookupCustomerResultBase {
  readonly $type: 'individual';
  /** Full legal name retrieved from official records */
  readonly fullName?: string | null;
  /** Gender information retrieved from official records */
  readonly gender?: Gender | null;
  /** Email address retrieved from external sources */
  readonly email?: string | null;
  /** Phone number retrieved from external sources */
  readonly phoneNumber?: CustomerPhoneNumber | null;
  /** Marital status retrieved from official records */
  readonly maritalStatus?: MaritalStatus | null;
  /** Date of birth retrieved from official records */
  readonly birthDate?: DateOnly | null;
}

/**
 * External lookup response for foreign customers (non-Turkish citizens).
 * Contains personal information retrieved from international identity verification services.
 */
export interface ExternalLookupForeignCustomerResult extends ExternalLookupCustomerResultBase {
  readonly $type: 'foreign';
  /** Full name retrieved from international verification services */
  readonly fullName?: string | null;
  /** Gender information retrieved from international sources */
  readonly gender?: Gender | null;
  /** Email address retrieved from external sources */
  readonly email?: string | null;
  /** Phone number retrieved from external sources */
  readonly phoneNumber?: CustomerPhoneNumber | null;
  /** Marital status retrieved from international records */
  readonly maritalStatus?: MaritalStatus | null;
  /** Date of birth retrieved from international sources */
  readonly birthDate?: DateOnly | null;
}

/**
 * External lookup response for company customers (corporate entities).
 * Contains corporate information retrieved from tax authority and commercial registry databases.
 */
export interface ExternalLookupCompanyCustomerResult extends ExternalLookupCustomerResultBase {
  readonly $type: 'company';
  /** Official registered business name */
  readonly title?: string | null;
}

/**
 * Polymorphic external lookup response. The `$type` discriminator narrows between individual,
 * foreign, and company results, each carrying the demographic fields the backend returns for
 * that customer type.
 */
export type ExternalLookupCustomerResult =
  | ExternalLookupIndividualCustomerResult
  | ExternalLookupForeignCustomerResult
  | ExternalLookupCompanyCustomerResult;

// ============================================================================
// BRANCH ASSIGNMENT TYPES
// ============================================================================

/**
 * Request to set or unassign a customer's branch.
 *
 * `agentBranchId` is nullable: pass `null` to remove the current branch assignment.
 *
 * Müşterinin şubesini belirleme veya kaldırma isteği. Şube atamasını kaldırmak için
 * `agentBranchId` alanı `null` geçilebilir.
 */
export interface SetCustomerBranchRequest {
  readonly customerId: string;
  readonly agentBranchId: string | null;
}

// ============================================================================
// ADDRESS MANAGEMENT TYPES
// ============================================================================

/**
 * Classification of a customer address. Mirrors the backend `AddressType` enum.
 */
export enum AddressType {
  Unknown = 'UNKNOWN',
  Home = 'HOME',
  Work = 'WORK',
  Temporary = 'TEMPORARY',
  Other = 'OTHER',
}

/**
 * Request to create customer address
 */
export interface CreateCustomerAddressRequest {
  readonly customerId: string;
  readonly propertyNumber: number;
  readonly type: AddressType;
}

/**
 * Response for created customer address
 */
export interface CreateCustomerAddressResult {
  readonly addressId: string;
}

/**
 * Request to update customer address
 */
export interface UpdateCustomerAddressRequest {
  readonly customerId: string;
  readonly addressId: string;
  readonly type: AddressType;
}

/**
 * Response for customer address
 */
export interface GetCustomerAddressResult {
  readonly id: string;
  readonly propertyNumber: number;
  readonly type: AddressType;
  readonly address: PropertyAddress;
  readonly createdAt: string;
}

// ============================================================================
// CONSENT MANAGEMENT TYPES
// ============================================================================

/**
 * Request to give customer consent.
 * Müşteri iznini kaydetme talebi.
 */
export interface GiveCustomerConsentRequest {
  readonly consentType: ConsentType;
  readonly channel: ConsentChannel;
}

/**
 * Active consent status for a customer (lightweight model used in list responses).
 * Müşteri için aktif izin durumu (liste yanıtlarında kullanılan hafif model).
 */
export interface CustomerConsent {
  readonly consentType: ConsentType;
  readonly isActive: boolean;
}

/**
 * Single entry in the consent audit history.
 * İzin denetim geçmişindeki tek bir kayıt.
 */
export interface ConsentHistoryItem {
  readonly consentType: ConsentType;
  readonly action: ConsentAction;
  readonly performedAt: string;
  readonly performedBy: UserReference;
  readonly channel: ConsentChannel;
}

/**
 * Response for `GET customers/{customerId}/consents` — current consent states plus full history.
 * Müşteri için aktif izin durumları ve tam izin geçmişi.
 */
export interface GetCustomerConsentsResult {
  readonly consents: readonly CustomerConsent[];
  readonly history: readonly ConsentHistoryItem[];
}

// ============================================================================
// PRIMARY EMAIL / PHONE NUMBER TYPES
// ============================================================================

/**
 * Response containing a customer's primary email address.
 *
 * Müşterinin birincil e-posta adresini içeren yanıt.
 */
export interface GetPrimaryCustomerEmailResult {
  readonly email: string;
}

/**
 * Request to set the primary email address for a customer (upsert — adds to the customer's
 * email collection if missing, then marks it as primary).
 *
 * Müşterinin birincil e-posta adresini ayarlama talebi (mevcut değilse koleksiyona ekler
 * ve birincil olarak işaretler).
 */
export interface SetPrimaryCustomerEmailRequest {
  readonly customerId: string;
  readonly email: string;
}

/**
 * Response containing a customer's primary phone number.
 *
 * Müşterinin birincil telefon numarasını içeren yanıt.
 */
export interface GetPrimaryCustomerPhoneNumberResult {
  readonly phoneNumber: CustomerPhoneNumber;
}

/**
 * Request to set the primary phone number for a customer (upsert — adds to the customer's
 * phone number collection if missing, then marks it as primary).
 *
 * Müşterinin birincil telefon numarasını ayarlama talebi (mevcut değilse koleksiyona ekler
 * ve birincil olarak işaretler).
 */
export interface SetPrimaryCustomerPhoneNumberRequest {
  readonly customerId: string;
  readonly phoneNumber: CustomerPhoneNumber;
}

// ============================================================================
// CUSTOMER ASSETS TYPES
// ============================================================================

/**
 * Discriminator value for vehicle assets in the polymorphic customer assets response.
 *
 * Polimorfik müşteri varlık yanıtında araç varlıkları için ayrım değeri.
 */
export type GetCustomerAssetsResultItemType = 'vehicle' | 'property';

/**
 * Common fields shared by every item in a customer's asset list.
 *
 * Müşteri varlık listesindeki her öğenin paylaştığı ortak alanlar.
 */
interface GetCustomerAssetsResultItemBase {
  readonly $type: GetCustomerAssetsResultItemType;
  readonly id: string;
  readonly customerId: string;
  readonly createdAt: DateTime;
}

/**
 * Vehicle entry within a customer's asset list.
 *
 * Müşterinin varlık listesindeki araç girdisi.
 */
export interface GetCustomerAssetsResultItemVehicle extends GetCustomerAssetsResultItemBase {
  readonly $type: 'vehicle';
  readonly plate: VehiclePlate;
  readonly model?: VehicleModel | null;
}

/**
 * Property entry within a customer's asset list.
 *
 * Müşterinin varlık listesindeki mülk girdisi.
 */
export interface GetCustomerAssetsResultItemProperty extends GetCustomerAssetsResultItemBase {
  readonly $type: 'property';
  readonly number: PropertyNumber;
  readonly address: PropertyAddress;
}

/**
 * Polymorphic asset item returned by `GET /customers/{id}/assets`. The `$type` discriminator
 * narrows between vehicles and properties.
 *
 * `GET /customers/{id}/assets` tarafından döndürülen polimorfik varlık öğesi. `$type` ayraçları
 * araçlar ve mülkler arasında daraltma yapar.
 */
export type GetCustomerAssetsResultItem =
  | GetCustomerAssetsResultItemVehicle
  | GetCustomerAssetsResultItemProperty;
