/**
 * @fileoverview Common Base Types - Core fundamental types, interfaces, and business enums
 * @description Core data structures and business-related enums used throughout the InsurUp platform
 */

// ============================================================================
// GENERAL BUSINESS ENUMS
// ============================================================================

/**
 * Communication and Sales Channel
 *
 * Enumeration of various channels through which customers can interact with the insurance company,
 * submit proposals, purchase policies, or receive support. Channels are essential for tracking customer
 * acquisition sources, calculating agent commissions, analyzing marketing effectiveness, and providing
 * appropriate service levels. Each channel may have different processing workflows, commission structures,
 * and service requirements in the insurance business operations.
 *
 * Müşterilerin sigorta şirketi ile etkileşime geçebileceği, teklif verebileceği, poliçe satın alabileceği
 * veya destek alabileceği çeşitli kanalların numaralandırması. Kanallar, müşteri kazanım kaynaklarını takip etmek,
 * acente komisyonlarını hesaplamak, pazarlama etkinliğini analiz etmek ve uygun hizmet seviyelerini sağlamak için
 * gereklidir. Her kanal, sigorta işletme operasyonlarında farklı işlem akışlarına, komisyon yapılarına ve
 * hizmet gereksinimlerine sahip olabilir.
 */
export enum Channel {
  /**
   * Unknown Channel Source / Bilinmeyen Kanal Kaynağı
   *
   * Default value used when the customer acquisition or interaction channel cannot be determined
   * or is not specified. This may occur with legacy data, incomplete records, or when channel
   * tracking systems fail to capture the source information. Requires manual review and
   * categorization for proper analytics and commission processing.
   *
   * Müşteri kazanımı veya etkileşim kanalı belirlenemediğinde veya belirtilmediğinde kullanılan
   * varsayılan değer. Bu durum eski veriler, eksik kayıtlar veya kanal takip sistemlerinin kaynak
   * bilgilerini yakalayamaması durumunda ortaya çıkabilir. Uygun analitik ve komisyon işleme için
   * manuel inceleme ve kategorilendirme gerektirir.
   */
  Unknown = 'UNKNOWN',

  /**
   * Manual entry or direct agent input channel
   * Manuel giriş veya doğrudan acente girişi kanalı
   */
  Manual = 'MANUAL',

  /**
   * Company website or web portal channel
   * Şirket web sitesi veya web portalı kanalı
   */
  Website = 'WEBSITE',

  /**
   * Google Ads or Google advertising platform channel
   * Google Ads veya Google reklam platformu kanalı
   */
  GoogleAds = 'GOOGLE_ADS',

  /**
   * Call center or telephone support channel
   * Çağrı merkezi veya telefon destek kanalı
   */
  CallCenter = 'CALL_CENTER',

  /**
   * Social media platforms channel
   * Sosyal medya platformları kanalı
   */
  SocialMedia = 'SOCIAL_MEDIA',

  /**
   * Mobile application channel
   * Mobil uygulama kanalı
   */
  MobileApp = 'MOBILE_APP',

  /**
   * Offline proposal form or paper-based application channel
   * Çevrimdışı teklif formu veya kağıt tabanlı başvuru kanalı
   */
  OfflineProposalForm = 'OFFLINE_PROPOSAL_FORM',

  /**
   * Field sales or door-to-door sales channel
   * Saha satışı veya kapı kapı satış kanalı
   */
  Field = 'FIELD',

  /**
   * Print media advertising channel
   * Basılı medya reklam kanalı
   */
  PrintMedia = 'PRINT_MEDIA',

  /**
   * Trade fairs, exhibitions, or promotional events channel
   * Ticaret fuarları, sergiler veya promosyon etkinlikleri kanalı
   */
  FairEvent = 'FAIR_EVENT',

  /**
   * Business partner or affiliate marketing channel
   * İş ortağı veya bağlı pazarlama kanalı
   */
  BusinessPartner = 'BUSINESS_PARTNER',

  /**
   * Automated chatbot or AI-powered customer service channel
   * Otomatik chatbot veya AI destekli müşteri hizmetleri kanalı
   */
  Chatbot = 'CHATBOT',
}

/**
 * Insurance Asset Types
 *
 * Defines the primary categories of assets that can be covered under insurance policies.
 * This classification helps determine the appropriate insurance products, coverage terms,
 * risk assessment methods, and regulatory requirements for different types of insurable assets.
 *
 * Sigorta poliçeleri kapsamında kapsanabilecek varlıkların birincil kategorilerini tanımlar.
 * Bu sınıflandırma, farklı sigortalanabilir varlık türleri için uygun sigorta ürünleri, kapsam
 * koşulları, risk değerlendirme yöntemleri ve yasal gereksinimleri belirlemeye yardımcı olur.
 */
export enum AssetType {
  /**
   * Vehicle Assets / Araç Varlıkları
   *
   * All types of motorized vehicles that can be insured including passenger cars, motorcycles,
   * commercial vehicles, trucks, buses, and specialized equipment. Vehicle insurance typically
   * includes coverage for damage, theft, liability, and optional additional protections.
   *
   * Binek araçlar, motosikletler, ticari araçlar, kamyonlar, otobüsler ve özel ekipmanlar
   * dahil sigortalanabilecek tüm motorlu araç türleri. Araç sigortası genellikle hasar, hırsızlık,
   * sorumluluk ve isteğe bağlı ek korumalar için kapsam içerir.
   */
  Vehicle = 'VEHICLE',
  /**
   * Property Assets / Konut Varlıkları
   *
   * Real estate properties that can be insured including residential homes, commercial buildings,
   * and their contents. Property insurance typically covers structural damage, theft, natural disasters,
   * and liability related to the property.
   *
   * Konut evleri, ticari binalar ve içerikleri dahil sigortalanabilecek gayrimenkul konutları.
   * Konut sigortası genellikle yapısal hasar, hırsızlık, doğal afetler ve konutla ilgili sorumluluk
   * kapsamlarını içerir.
   */
  Property = 'PROPERTY',
}

/**
 * Customer Type Classification
 *
 * Defines the legal and regulatory classification of insurance customers based on their
 * entity type and residency status. This classification is crucial for determining applicable
 * insurance regulations, pricing models, documentation requirements, and legal procedures.
 * Different customer types may have varying coverage options, premium calculations, and
 * compliance requirements under Turkish insurance law and international regulations.
 *
 * Sigorta müşterilerinin yasal ve düzenleyici sınıflandırmasını varlık türü ve ikamet
 * durumuna göre tanımlar. Bu sınıflandırma, uygulanabilir sigorta düzenlemeleri, fiyatlandırma
 * modelleri, dokümantasyon gereksinimleri ve yasal prosedürleri belirlemek için çok önemlidir.
 * Farklı müşteri türleri, Türk sigorta hukuku ve uluslararası düzenlemeler altında değişen
 * kapsam seçenekleri, prim hesaplamaları ve uyumluluk gereksinimlerine sahip olabilir.
 */
export enum CustomerType {
  /**
   * Individual Customer / Bireysel Müşteri
   *
   * Represents a natural person (individual) who purchases insurance coverage for personal use.
   * This includes private individuals buying auto insurance, home insurance, life insurance, or
   * other personal lines of coverage. Individual customers typically have different documentation
   * requirements, coverage limits, and premium structures compared to corporate customers.
   * Subject to consumer protection laws and individual privacy regulations.
   *
   * Kişisel kullanım için sigorta kapsamı satın alan gerçek kişiyi (birey) temsil eder.
   * Bu, kasko sigortası, konut sigortası, hayat sigortası veya diğer kişisel kapsam türlerini
   * satın alan özel bireyleri içerir. Bireysel müşteriler genellikle kurumsal müşterilere
   * kıyasla farklı dokümantasyon gereksinimlerine, kapsam limitelerine ve prim yapılarına
   * sahiptir. Tüketici koruma yasaları ve bireysel gizlilik düzenlemelerine tabidir.
   */
  Individual = 'INDIVIDUAL',
  /**
   * Corporate Customer / Kurumsal Müşteri
   *
   * Represents a legal entity such as a corporation, limited liability company, partnership,
   * or other business organization that purchases commercial insurance coverage. Corporate
   * customers typically require higher coverage limits, more complex policy structures, and
   * specialized commercial insurance products. Subject to commercial regulations and may have
   * different tax implications and reporting requirements.
   *
   * Ticari sigorta kapsamı satın alan şirket, limited şirket, ortaklık veya diğer iş
   * organizasyonları gibi tüzel kişiyi temsil eder. Kurumsal müşteriler genellikle daha yüksek
   * kapsam limitleri, daha karmaşık poliçe yapıları ve özelleşmiş ticari sigorta ürünleri
   * gerektirir. Ticari düzenlemelere tabidir ve farklı vergi etkileri ve raporlama
   * gereksinimlerine sahip olabilir.
   */
  Company = 'COMPANY',
  /**
   * Foreign Customer / Yabancı Müşteri
   *
   * Represents a foreign national or non-resident individual/entity who purchases insurance
   * coverage. Foreign customers may have special documentation requirements, different identification
   * procedures, and specific regulatory considerations based on their country of origin and
   * residency status. May require additional compliance checks and have different coverage
   * options or restrictions depending on international agreements and local regulations.
   *
   * Sigorta kapsamı satın alan yabancı uyruklu veya yerleşik olmayan birey/kuruluşu temsil eder.
   * Yabancı müşteriler, köken ülkeleri ve ikamet durumlarına göre özel dokümantasyon gereksinimleri,
   * farklı kimlik doğrulama prosedürleri ve belirli düzenleyici değerlendirmelere sahip olabilir.
   * Uluslararası anlaşmalara ve yerel düzenlemelere bağlı olarak ek uyumluluk kontrolleri
   * gerektirebilir ve farklı kapsam seçenekleri veya kısıtlamaları olabilir.
   */
  Foreign = 'FOREIGN',
}

/**
 * Insurance Product Branches
 *
 * Defines the comprehensive classification of insurance product branches available
 * in the Turkish insurance market. Each branch represents a distinct type of insurance
 * coverage with specific regulatory requirements, pricing models, coverage options,
 * and business rules. This classification is essential for proper product categorization,
 * regulatory compliance, and system functionality organization.
 *
 * Türk sigorta pazarında mevcut sigorta ürün dallarının kapsamlı sınıflandırmasını
 * tanımlar. Her dal, belirli düzenleyici gereksinimler, fiyatlandırma modelleri, kapsam
 * seçenekleri ve iş kuralları olan farklı bir sigorta kapsam türünü temsil eder.
 * Bu sınıflandırma, uygun ürün kategorizasyonu, düzenleyici uyum ve sistem işlevsellik
 * organizasyonu için gereklidir.
 */
export enum ProductBranch {
  /**
   * Comprehensive motor vehicle insurance (Kasko)
   * Kapsamlı motorlu araç sigortası (Kasko)
   */
  Kasko = 'KASKO',

  /**
   * Compulsory Earthquake Insurance (DASK)
   * Zorunlu Deprem Sigortası (DASK)
   */
  Dask = 'DASK',

  /**
   * Residential property insurance (Konut)
   * Konut sigortası
   */
  Konut = 'KONUT',

  /**
   * Mandatory motor vehicle liability insurance (Trafik)
   * Zorunlu motorlu araç sorumluluk sigortası (Trafik)
   */
  Trafik = 'TRAFIK',

  /**
   * Supplementary Health Insurance (TSS)
   * Tamamlayıcı Sağlık Sigortası (TSS)
   */
  Tss = 'TSS',

  /**
   * Voluntary Financial Liability Insurance (İMM)
   * İhtiyari Mali Mesuliyet Sigortası (İMM)
   */
  Imm = 'IMM',

  /**
   * Green Card international motor insurance
   * Yeşil Kart uluslararası motorlu araç sigortası
   */
  YesilKart = 'YESIL_KART',

  /**
   * Personal accident insurance (Ferdi Kaza)
   * Ferdi kaza sigortası
   */
  FerdiKaza = 'FERDI_KAZA',

  /**
   * Group life insurance (Grup Hayat)
   * Grup hayat sigortası
   */
  GrupHayat = 'GRUP_HAYAT',

  /**
   * Health insurance (Sağlık)
   * Sağlık sigortası
   */
  Saglik = 'SAGLIK',

  /**
   * Credit card and identity protection insurance
   * Kredi kartı ve kimlik koruma sigortası
   */
  KartKimlikKoruma = 'KART_KIMLIK_KORUMA',

  /**
   * Third-party liability insurance
   * Üçüncü şahıs mali sorumluluk sigortası
   */
  UcuncuSahisMaliSorumluluk = 'UCUNCU_SAHIS_MALI_SORUMLULUK',

  /**
   * Commercial property fire insurance
   * İşyeri yangın sigortası
   */
  IsyeriYangin = 'ISYERI_YANGIN',

  /**
   * Travel insurance (Seyahat)
   * Seyahat sigortası
   */
  Seyahat = 'SEYAHAT',

  /**
   * Electronic device insurance
   * Elektronik cihaz sigortası
   */
  ElektronikCihaz = 'ELEKTRONIK_CIHAZ',

  /**
   * Pet insurance
   * Evcil hayvan sigortası
   */
  Pet = 'PET',

  /**
   * Individual Retirement System (BES)
   * Bireysel Emeklilik Sistemi (BES)
   */
  Bes = 'BES',

  /**
   * Construction all-risk insurance
   * İnşaat tüm riskler sigortası
   */
  InsaatAllRisk = 'INSAAT_ALL_RISK',

  /**
   * Leasing all-risk insurance
   * Leasing tüm riskler sigortası
   */
  LeasingAllRisk = 'LEASING_ALL_RISK',

  /**
   * Assembly/installation all-risk insurance
   * Montaj tüm riskler sigortası
   */
  MontajAllRisk = 'MONTAJ_ALL_RISK',

  /**
   * Transportation/cargo insurance
   * Nakliyat sigortası
   */
  Nakliyat = 'NAKLIYAT',

  /**
   * Private security financial liability insurance
   * Özel güvenlik mali sorumluluk sigortası
   */
  OzelGuvenlikMaliSorumluluk = 'OZEL_GUVENLIK_MALI_SORUMLULUK',

  /**
   * Smart phone insurance
   * Akıllı telefon sigortası
   */
  AkilliTelefon = 'AKILLI_TELEFON',

  /**
   * Hazardous materials liability insurance
   * Tehlikeli maddeler mali sorumluluk sigortası
   */
  TehlikeliMaddelerMaliSorumluluk = 'TEHLIKELI_MADDELER_MALI_SORUMLULUK',

  /**
   * Yacht, boat, and pleasure craft insurance
   * Yat, gemi ve gezinti teknesi sigortası
   */
  YatGemiGezintiTeknesi = 'YAT_GEMI_GEZINTI_TEKNESI',

  /**
   * Agricultural insurance
   * Tarım sigortası
   */
  Tarim = 'TARIM',

  /**
   * Professional liability insurance
   * Mesleki sorumluluk sigortası
   */
  MeslekiSorumluluk = 'MESLEKI_SORUMLULUK',

  /**
   * Credit insurance
   * Alacak sigortası
   */
  Alacak = 'ALACAK',

  /**
   * Employer's liability insurance
   * İşveren mali mesuliyet sigortası
   */
  IsverenMaliMesuliyet = 'ISVEREN_MALI_MESULIYET',

  /**
   * Engineering insurance
   * Mühendislik sigortası
   */
  Muhendislik = 'MUHENDISLIK',

  /**
   * Legal protection insurance
   * Hukuksal koruma sigortası
   */
  HukuksalKoruma = 'HUKUKSAL_KORUMA',

  /**
   * First Fire Residential Insurance
   * İlk ateş konut sigortası
   */
  IlkAtesKonut = 'ILK_ATES_KONUT',

  /**
   * Surety Insurance
   * Kefalet sigortası
   */
  Kefalet = 'KEFALET',
}

// ============================================================================
// CORE INTERFACES AND TYPES
// ============================================================================

/**
 * Insurance parameter for location and reference data
 *
 * Standard structure for insurance-related parameters such as cities, districts,
 * vehicle models, and other reference data used throughout the platform.
 *
 * Şehirler, ilçeler, araç modelleri ve platform genelinde kullanılan diğer
 * referans verileri gibi sigortayla ilgili parametreler için standart yapı.
 */
export interface InsuranceParameter {
  /**
   * Parameter code / Parametre kodu
   */
  readonly value: string;

  /**
   * Parameter name / Parametre adı
   */
  readonly text: string;

  /**
   * Optional reference identifier / İsteğe bağlı referans tanımlayıcısı
   */
  readonly reference?: string;
}

/**
 * User reference information
 *
 * Standard structure for referencing users throughout the system including
 * agents, administrators, and other system users with their basic identification
 * and role information.
 *
 * Temel kimlik ve rol bilgileri ile acenteler, yöneticiler ve diğer sistem
 * kullanıcıları dahil olmak üzere sistem genelinde kullanıcılara referans
 * vermek için standart yapı.
 */
export interface UserReference {
  /**
   * User unique identifier / Kullanıcı benzersiz tanımlayıcısı
   */
  readonly id: string;

  /**
   * User display name / Kullanıcı görüntü adı
   */
  readonly name: string;

  /**
   * User email address / Kullanıcı e-posta adresi
   */
  readonly email?: string | null;

  /**
   * Whether this reference points to a service account (machine identity).
   * Bu referansın bir servis hesabına (makine kimliği) işaret edip etmediği.
   */
  readonly isServiceAccount?: boolean;

  /**
   * Numeric user type code (verified live: e.g. `2` for service accounts).
   * The OpenAPI description says "string representation" but the deployed API
   * returns an integer — we trust the wire format.
   *
   * Kullanıcının kullanıcı türü kodu.
   */
  readonly userType?: number | null;
}

/**
 * Credit Card Information
 *
 * Credit card details required for payment processing. Contains sensitive payment
 * information that must be handled securely according to PCI compliance standards.
 *
 * Ödeme işlemi için gerekli kredi kartı detayları. PCI uyumluluk standartlarına
 * göre güvenli şekilde işlenmesi gereken hassas ödeme bilgilerini içerir.
 */
export interface CreditCard {
  /**
   * Identity number of the cardholder (optional)
   * Kart sahibinin kimlik numarası (isteğe bağlı)
   */
  readonly identityNumber?: string | null;

  /**
   * Credit card number
   * Kredi kartı numarası
   */
  readonly number: string;

  /**
   * Card verification code (CVC/CVV)
   * Kart doğrulama kodu (CVC/CVV)
   */
  readonly cvc: string;

  /**
   * Expiry month (MM format)
   * Son kullanma ayı (AA formatı)
   */
  readonly expiryMonth: string;

  /**
   * Expiry year (YYYY format)
   * Son kullanma yılı (YYYY formatı)
   */
  readonly expiryYear: string;

  /**
   * Cardholder name
   * Kart sahibinin adı
   */
  readonly holderName: string;
}

/**
 * Currency Types
 */
export enum Currency {
  Unknown = 'UNKNOWN',
  TurkishLira = 'TURKISH_LIRA',
  UnitedStatesDollar = 'UNITED_STATES_DOLLAR',
  Euro = 'EURO',
}

/**
 * Payment Options
 *
 * Enumeration of payment methods and processing types available for insurance premium payments
 * and financial transactions. Each option represents a different payment flow with specific security
 * requirements, user interaction patterns, and technical implementations.
 *
 * Sigorta prim ödemeleri ve finansal işlemler için mevcut ödeme yöntemleri ve işleme türlerinin
 * numaralandırması. Her seçenek, belirli güvenlik gereksinimleri, kullanıcı etkileşim kalıpları
 * ve teknik uygulamalar ile farklı bir ödeme akışını temsil eder.
 */
export enum PaymentOption {
  /**
   * Unknown or unspecified payment option
   * Bilinmeyen veya belirtilmemiş ödeme seçeneği
   */
  Unknown = 'UNKNOWN',

  /**
   * Synchronous credit card payment processing
   * Senkron kredi kartı ödeme işlemi
   */
  SyncCreditCard = 'SYNC_CREDIT_CARD',

  /**
   * Synchronous open account payment processing
   * Senkron açık hesap ödeme işlemi
   */
  SyncOpenAccount = 'SYNC_OPEN_ACCOUNT',

  /**
   * Asynchronous 3D Secure payment processing
   * Asenkron 3D Secure ödeme işlemi
   */
  Async3dSecure = 'ASYNC_3D_SECURE',

  /**
   * Asynchronous insurance company redirect payment processing
   * Asenkron sigorta şirketi yönlendirme ödeme işlemi
   */
  AsyncInsuranceCompanyRedirect = 'ASYNC_INSURANCE_COMPANY_REDIRECT',

  /**
   * Asynchronous third-party 3D Secure payment processing
   * Asenkron üçüncü taraf 3D Secure ödeme işlemi
   */
  AsyncThirdParty3dSecure = 'ASYNC_THIRD_PARTY_3D_SECURE',
}

/**
 * Policy States
 *
 * Represents the current state of an insurance policy throughout its lifecycle.
 * Used to track policy status from active coverage to termination.
 *
 * Bir sigorta poliçesinin yaşam döngüsü boyunca mevcut durumunu temsil eder.
 * Poliçenin aktif teminat durumundan sonlandırılmasına kadar olan süreçte durumunu takip etmek için kullanılır.
 */
export enum PolicyState {
  /**
   * The policy is currently active and providing coverage
   * Poliçe şu anda aktif durumda ve teminat sağlıyor
   */
  Active = 'ACTIVE',

  /**
   * The policy has reached its natural end date and is no longer providing coverage
   * Poliçe doğal bitiş tarihine ulaşmış ve artık teminat sağlamıyor
   */
  EndOfLife = 'END_OF_LIFE',

  /**
   * The policy has been cancelled before its natural expiration date
   * Poliçe doğal bitiş tarihinden önce iptal edilmiş
   */
  Cancelled = 'CANCELLED',
}

/**
 * Insurance Product Integration Type
 *
 * Defines the technical integration method used to connect with and process insurance
 * products. This classification determines the communication protocol, data exchange
 * method, and processing approach used for each insurance product offering. Critical
 * for system architecture, performance optimization, and maintenance strategies of
 * insurance product integrations.
 *
 * Sigorta ürünleri ile bağlantı kurmak ve işlemek için kullanılan teknik entegrasyon
 * yöntemini tanımlar. Bu sınıflandırma, her sigorta ürünü teklifi için kullanılan
 * iletişim protokolünü, veri alışverişi yöntemini ve işleme yaklaşımını belirler.
 * Sistem mimarisi, performans optimizasyonu ve sigorta ürünü entegrasyonlarının
 * bakım stratejileri için kritiktir.
 */
export enum InsuranceProductType {
  /**
   * Web service-based integration using API calls and real-time communication.
   *
   * Represents insurance products that integrate through web services, APIs, and
   * real-time communication protocols. This approach enables immediate data exchange,
   * real-time quotes, instant policy issuance, and immediate transaction processing.
   * Provides the best user experience with instant responses but requires stable
   * network connectivity and reliable external service availability.
   *
   * API çağrıları ve gerçek zamanlı iletişim kullanan web servis tabanlı entegrasyon.
   *
   * Web servisleri, API'ler ve gerçek zamanlı iletişim protokolleri aracılığıyla
   * entegre olan sigorta ürünlerini temsil eder. Bu yaklaşım, anında veri alışverişi,
   * gerçek zamanlı teklifler, anında poliçe düzenleme ve anında işlem işleme olanağı
   * sağlar. Anında yanıtlarla en iyi kullanıcı deneyimini sağlar ancak kararlı ağ
   * bağlantısı ve güvenilir harici servis kullanılabilirliği gerektirir.
   */
  WebService = 'WEB_SERVICE',

  /**
   * Automated robot-based integration using screen scraping or automated processes.
   *
   * Represents insurance products that integrate through automated robot processes,
   * screen scraping, or browser automation. This approach is used when direct API
   * integration is not available and the system must interact with web interfaces
   * or legacy systems. May have slower response times and requires regular maintenance
   * to adapt to interface changes but enables integration with older systems.
   *
   * Ekran kazıma veya otomatik süreçler kullanan otomatik robot tabanlı entegrasyon.
   *
   * Otomatik robot süreçleri, ekran kazıma veya tarayıcı otomasyonu aracılığıyla
   * entegre olan sigorta ürünlerini temsil eder. Bu yaklaşım, doğrudan API entegrasyonu
   * mevcut olmadığında ve sistemin web arayüzleri veya eski sistemler ile etkileşim
   * kurması gerektiğinde kullanılır. Daha yavaş yanıt süreleri olabilir ve arayüz
   * değişikliklerine uyum sağlamak için düzenli bakım gerektirir ancak eski sistemlerle
   * entegrasyonu mümkün kılar.
   */
  Robot = 'ROBOT',
}

/**
 * Customer Phone Number
 *
 * Represents a customer's phone number with country code for authentication and communication.
 * This structure is used throughout the platform for customer contact information and
 * multi-factor authentication processes.
 *
 * Müşterinin kimlik doğrulama ve iletişim için ülke kodu ile telefon numarasını temsil eder.
 * Bu yapı, müşteri iletişim bilgileri ve çok faktörlü kimlik doğrulama süreçleri için
 * platform genelinde kullanılır.
 */
export interface CustomerPhoneNumber {
  /**
   * Country calling code (e.g., 90 for Turkey)
   * Ülke arama kodu (örn. Türkiye için 90)
   */
  readonly countryCode: number;

  /**
   * Phone number without country code
   * Ülke kodu olmadan telefon numarası
   */
  readonly number: string;
}
