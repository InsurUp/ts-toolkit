/**
 * @fileoverview Insurance Contracts - Insurance industry data and configuration contracts
 * @description Contracts for insurance companies, products, resource keys, release notes, and financial institutions
 */

import type {
  PaymentOption,
  ProductBranch,
  InsuranceProductType,
} from "./common.js";

// ============================================================================
// RESOURCE KEYS
// ============================================================================

/**
 * Represents a localization resource key with its associated value and metadata.
 * Used for managing multilingual content and application localization.
 *
 * İlişkili değeri ve meta verisi ile birlikte yerelleştirme kaynak anahtarını temsil eder.
 * Çokdilli içerik ve uygulama yerelleştirmesi yönetimi için kullanılır.
 *
 * **Resource Key Model / Kaynak Anahtarı Modeli**
 *
 * EN: Represents a localization resource key used for managing multilingual content
 * in the application. Resource keys enable the system to display content in different
 * languages based on user preferences. Each key has an associated value for a specific
 * language and optional description for context. Essential for internationalization
 * and providing localized user experiences across different regions and cultures.
 *
 * TR: Uygulamada çokdilli içerik yönetimi için kullanılan yerelleştirme kaynak anahtarını
 * temsil eder. Kaynak anahtarları, sistemin kullanıcı tercihlerine göre içeriği farklı
 * dillerde görüntülemesine olanak tanır. Her anahtarın belirli bir dil için ilişkili değeri
 * ve bağlam için isteğe bağlı açıklaması vardır. Uluslararasılaştırma ve farklı bölgeler
 * ve kültürler arasında yerelleştirilmiş kullanıcı deneyimleri sağlamak için gereklidir.
 */
export interface ResourceKey {
  /**
   * Language identifier for the resource value.
   *
   * Numeric identifier specifying the language for which this resource value is defined.
   * Used to associate the resource key with a specific language variant, enabling
   * the application to display appropriate content based on user language preferences.
   *
   * Kaynak değeri için dil tanımlayıcısı.
   *
   * Bu kaynak değerinin tanımlandığı dili belirten sayısal tanımlayıcı. Kaynak anahtarını
   * belirli bir dil varyantı ile ilişkilendirmek için kullanılır ve uygulamanın kullanıcı
   * dil tercihlerine göre uygun içeriği görüntülemesine olanak tanır.
   */
  readonly languageId: number;

  /**
   * Unique key identifier for the resource.
   *
   * The unique string identifier that represents this localization resource.
   * Used by the application code to reference and retrieve the appropriate localized
   * content. Should be descriptive and follow consistent naming conventions for maintainability.
   *
   * Kaynak için benzersiz anahtar tanımlayıcısı.
   *
   * Bu yerelleştirme kaynağını temsil eden benzersiz dize tanımlayıcısı. Uygulama
   * kodu tarafından uygun yerelleştirilmiş içeriği referans almak ve almak için kullanılır.
   * Sürdürülebilirlik için açıklayıcı olmalı ve tutarlı adlandırma kurallarını takip etmelidir.
   */
  readonly key: string;

  /**
   * Optional description providing context for the resource key.
   *
   * Optional descriptive text that provides context about how and where this resource
   * key is used. Helps translators and developers understand the purpose and usage
   * context of the resource, leading to more accurate translations and maintenance.
   *
   * Kaynak anahtarı için bağlam sağlayan isteğe bağlı açıklama.
   *
   * Bu kaynak anahtarının nasıl ve nerede kullanıldığı hakkında bağlam sağlayan
   * isteğe bağlı açıklayıcı metin. Çevirmenlerin ve geliştiricilerin kaynağın amacını
   * ve kullanım bağlamını anlamalarına yardımcı olur, daha doğru çeviriler ve bakıma yol açar.
   */
  readonly description?: string | null;

  /**
   * Localized value associated with the resource key.
   *
   * The actual localized text or content that will be displayed to users for this
   * resource key in the specified language. This is the translated content that appears
   * in the user interface when the resource key is referenced by the application.
   *
   * Kaynak anahtarı ile ilişkili yerelleştirilmiş değer.
   *
   * Bu kaynak anahtarı için belirtilen dilde kullanıcılara görüntülenecek gerçek
   * yerelleştirilmiş metin veya içerik. Bu, kaynak anahtarı uygulama tarafından referans
   * alındığında kullanıcı arayüzünde görünen çevrilmiş içeriktir.
   */
  readonly value: string;
}

// ============================================================================
// INSURANCE COMPANIES
// ============================================================================

/**
 * Represents an insurance company model containing basic company information and configuration.
 * Used to store and manage insurance company details within the system.
 *
 * Temel şirket bilgilerini ve konfigürasyonunu içeren sigorta şirketi modelini temsil eder.
 * Sistem içinde sigorta şirketi detaylarını saklamak ve yönetmek için kullanılır.
 *
 * **Insurance Company Model / Sigorta Şirketi Modeli**
 *
 * EN: Represents a comprehensive model of an insurance company including identification,
 * branding, operational status, and supported payment options. This model is used throughout
 * the system to manage insurance provider information, configure integrations, and
 * determine available services and features for each insurance company partnership.
 * Essential for multi-carrier insurance operations and customer choice management.
 *
 * TR: Tanımlama, markalaşma, operasyonel durum ve desteklenen ödeme seçenekleri dahil
 * bir sigorta şirketinin kapsamlı modelini temsil eder. Bu model, sistem genelinde
 * sigorta sağlayıcı bilgilerini yönetmek, entegrasyonları yapılandırmak ve her sigorta
 * şirketi ortaklığı için mevcut hizmetleri ve özellikleri belirlemek için kullanılır.
 * Çok taşıyıcılı sigorta operasyonları ve müşteri tercih yönetimi için gereklidir.
 */
export interface InsuranceCompany {
  /**
   * The unique identifier for the insurance company.
   *
   * The unique numeric identifier for the insurance company within the system.
   * This ID is used as a primary key for database operations and as a reference
   * for all insurance company-related operations including policy creation,
   * claims processing, and agent management.
   *
   * Sigorta şirketinin benzersiz tanımlayıcısı.
   *
   * Sistem içinde sigorta şirketinin benzersiz sayısal tanımlayıcısı.
   * Bu ID, veritabanı işlemleri için birincil anahtar ve poliçe oluşturma,
   * hasar işleme ve acente yönetimi dahil tüm sigorta şirketi ile ilgili
   * işlemler için referans olarak kullanılır.
   */
  readonly id: number;

  /**
   * The display name of the insurance company.
   *
   * The official business name of the insurance company as displayed to users
   * throughout the system. This name appears in user interfaces, reports, policies,
   * and all customer-facing communications. Should match the company's legal
   * business name or commonly recognized brand name.
   *
   * Sigorta şirketinin görüntülenen adı.
   *
   * Sistem genelinde kullanıcılara gösterilen sigorta şirketinin resmi iş adı.
   * Bu ad, kullanıcı arayüzlerinde, raporlarda, poliçelerde ve tüm müşteriye yönelik
   * iletişimlerde görünür. Şirketin yasal iş adı veya yaygın olarak tanınan marka
   * adı ile eşleşmelidir.
   */
  readonly name: string;

  /**
   * The logo URL or path for the insurance company.
   *
   * The URL or file path to the insurance company's logo image used for
   * branding and visual identification throughout the system. This logo appears
   * in user interfaces, documents, and customer communications to provide
   * visual brand recognition. May be null if no logo is configured.
   *
   * Sigorta şirketinin logo URL'si veya yolu.
   *
   * Sistem genelinde markalaşma ve görsel tanımlama için kullanılan sigorta
   * şirketinin logo görüntüsünün URL'si veya dosya yolu. Bu logo, görsel marka
   * tanıma sağlamak için kullanıcı arayüzlerinde, belgelerde ve müşteri iletişimlerinde
   * görünür. Logo yapılandırılmadıysa null olabilir.
   */
  readonly logo?: string | null;

  /**
   * Whether the insurance company is currently enabled and active.
   *
   * Indicates whether the insurance company is currently active and enabled
   * for new business operations. When true, the company is available for new
   * policy creation, quotes, and other business operations. When false, the
   * company is temporarily disabled and not available for new business.
   *
   * Sigorta şirketinin şu anda etkin ve aktif olup olmadığı.
   *
   * Sigorta şirketinin şu anda aktif olup yeni iş operasyonları için etkin
   * olup olmadığını belirtir. True olduğunda, şirket yeni poliçe oluşturma,
   * teklifler ve diğer iş operasyonları için kullanılabilir. False olduğunda,
   * şirket geçici olarak devre dışıdır ve yeni iş için kullanılamaz.
   */
  readonly enabled: boolean;

  /**
   * The collection of payment options supported by the insurance company.
   *
   * An immutable collection of payment methods and options that this insurance
   * company supports for premium payments and other financial transactions.
   * This determines which payment methods are available to customers when
   * purchasing policies or making payments for this specific insurance provider.
   *
   * Sigorta şirketi tarafından desteklenen ödeme seçenekleri koleksiyonu.
   *
   * Bu sigorta şirketinin prim ödemeleri ve diğer finansal işlemler için
   * desteklediği ödeme yöntemleri ve seçeneklerinin değişmez koleksiyonu.
   * Bu, bu belirli sigorta sağlayıcısı için poliçe satın alırken veya ödeme
   * yaparken müşterilere hangi ödeme yöntemlerinin sunulacağını belirler.
   */
  readonly supportedPaymentOptions: readonly PaymentOption[];
}

// ============================================================================
// INSURANCE PRODUCTS
// ============================================================================

/**
 * Represents an insurance product model containing product information and metadata.
 * Used to store and manage insurance product details and their associations with insurance companies.
 *
 * Ürün bilgileri ve metadata içeren sigorta ürünü modelini temsil eder.
 * Sigorta ürün detaylarını ve sigorta şirketleri ile ilişkilerini saklamak ve yönetmek için kullanılır.
 *
 * **Insurance Product Model / Sigorta Ürünü Modeli**
 *
 * EN: Represents a comprehensive model of an insurance product including identification,
 * naming, company association, product branch classification, and integration type.
 * This model defines the structure and metadata for individual insurance products
 * offered by insurance companies within the system. Essential for product catalog
 * management, quote generation, and policy creation workflows.
 *
 * TR: Tanımlama, adlandırma, şirket ilişkisi, ürün dalı sınıflandırması ve entegrasyon
 * türü dahil bir sigorta ürününün kapsamlı modelini temsil eder. Bu model, sistem
 * içinde sigorta şirketleri tarafından sunulan bireysel sigorta ürünleri için yapı
 * ve metadata tanımlar. Ürün kataloğu yönetimi, teklif oluşturma ve poliçe oluşturma
 * iş akışları için gereklidir.
 */
export interface InsuranceProduct {
  /**
   * The unique identifier for the insurance product.
   *
   * The unique numeric identifier for the insurance product within the system.
   * This ID is used as a primary key for database operations and as a reference
   * for all product-related operations including quote generation, policy creation,
   * and product configuration management.
   *
   * Sigorta ürününün benzersiz tanımlayıcısı.
   *
   * Sistem içinde sigorta ürününün benzersiz sayısal tanımlayıcısı.
   * Bu ID, veritabanı işlemleri için birincil anahtar ve teklif oluşturma,
   * poliçe oluşturma ve ürün konfigürasyon yönetimi dahil tüm ürünle ilgili
   * işlemler için referans olarak kullanılır.
   */
  readonly id: number;

  /**
   * The name of the insurance product.
   *
   * The official name of the insurance product as provided by the insurance
   * company and displayed to users. This name appears in user interfaces,
   * quotes, policies, and all customer communications related to the product.
   *
   * Sigorta ürününün adı.
   *
   * Sigorta şirketi tarafından sağlanan ve kullanıcılara gösterilen sigorta
   * ürününün resmi adı. Bu ad, kullanıcı arayüzlerinde, tekliflerde, poliçelerde
   * ve ürünle ilgili tüm müşteri iletişimlerinde görünür.
   */
  readonly name: string;

  /**
   * The identifier of the insurance company that offers this product.
   *
   * The unique identifier of the insurance company that offers this specific
   * insurance product. This establishes the relationship between the product
   * and its provider, enabling proper company-specific functionality, branding,
   * and business rules application.
   *
   * Bu ürünü sunan sigorta şirketinin tanımlayıcısı.
   *
   * Bu belirli sigorta ürününü sunan sigorta şirketinin benzersiz tanımlayıcısı.
   * Bu, ürün ile sağlayıcısı arasında ilişki kurar ve uygun şirkete özel işlevsellik,
   * markalaşma ve iş kuralları uygulamasını mümkün kılar.
   */
  readonly insuranceCompanyId: number;

  /**
   * The product branch classification for this insurance product.
   *
   * The insurance product branch classification that categorizes the type
   * of insurance coverage provided by this product. This determines the
   * regulatory requirements, coverage options, pricing models, and business
   * rules that apply to the product.
   *
   * Bu sigorta ürünü için ürün dalı sınıflandırması.
   *
   * Bu ürün tarafından sağlanan sigorta kapsamı türünü kategorize eden
   * sigorta ürünü dalı sınıflandırması. Bu, üründe geçerli olan düzenleyici
   * gereksinimler, kapsam seçenekleri, fiyatlandırma modelleri ve iş kurallarını
   * belirler.
   */
  readonly branch: ProductBranch;

  /**
   * The integration type for this insurance product.
   *
   * The technical integration approach used to connect with and process
   * this specific insurance product. This determines the communication protocol,
   * response times, and technical requirements for interacting with the
   * insurance company's systems for this product.
   *
   * Bu sigorta ürünü için entegrasyon türü.
   *
   * Bu belirli sigorta ürünü ile bağlantı kurmak ve işlemek için kullanılan
   * teknik entegrasyon yaklaşımı. Bu, bu ürün için sigorta şirketinin sistemleri
   * ile etkileşim kurmak için iletişim protokolünü, yanıt sürelerini ve teknik
   * gereksinimleri belirler.
   */
  readonly type: InsuranceProductType;
}

// ============================================================================
// CONNECTION FIELDS
// ============================================================================

/**
 * Represents a single agent-based connection field item returned when retrieving agent-specific configuration fields for an insurance company.
 *
 * Sigorta şirketi için acenteye özel yapılandırma alanlarını alırken döndürülen tek acente tabanlı bağlantı alanı öğesini temsil eder.
 *
 * **Agent-Based Connection Field Response Item / Acente Tabanlı Bağlantı Alanı Yanıt Öğesi**
 *
 * EN: Response item containing information about a specific agent-level connection field configuration
 * for an insurance company. These fields are specifically designed for agent-level integrations where
 * individual insurance agents may have different API credentials, regional endpoints, or customized
 * integration parameters. Essential for multi-agent distribution models common in the Turkish insurance market.
 *
 * TR: Sigorta şirketi için belirli bir acente düzeyinde bağlantı alanı yapılandırması hakkında bilgi
 * içeren yanıt öğesi. Bu alanlar, bireysel sigorta acentelerinin farklı API kimlik bilgilerine, bölgesel
 * uç noktalara veya özelleştirilmiş entegrasyon parametrelerine sahip olabileceği acente düzeyinde
 * entegrasyonlar için özel olarak tasarlanmıştır. Türk sigorta piyasasında yaygın olan çok acenteli
 * dağıtım modelleri için gereklidir.
 */
export interface GetAgentBasedConnectionFieldsByCompanyIdResultItem {
  /**
   * The unique key identifier for this agent-based connection field.
   *
   * Unique string identifier for this agent-based connection field within the insurance company's
   * integration configuration. This key distinguishes agent-specific fields from company-wide fields
   * and is used to reference the field in agent-level API integration processes.
   *
   * Bu acente tabanlı bağlantı alanı için benzersiz anahtar tanımlayıcısı.
   *
   * Bu acente tabanlı bağlantı alanı için sigorta şirketinin entegrasyon yapılandırması içindeki
   * benzersiz string tanımlayıcısı. Bu anahtar, acenteye özel alanları şirket geneli alanlardan ayırır
   * ve acente düzeyinde API entegrasyon süreçlerinde alanı referans etmek için kullanılır.
   */
  readonly key: string;

  /**
   * The resource key for the user-facing label of this agent connection field.
   *
   * Localization resource key for the human-readable label that describes this agent-based connection
   * field in administrative interfaces. This provides multilingual support for Turkish and English labels
   * in agent configuration interfaces, helping agents understand the purpose of each configuration parameter.
   *
   * Bu acente bağlantı alanının kullanıcıya dönük etiketi için kaynak anahtarı.
   *
   * Bu acente tabanlı bağlantı alanını yönetim arayüzlerinde tanımlayan insan tarafından okunabilir
   * etiket için lokalizasyon kaynak anahtarı. Bu, acente yapılandırma arayüzlerinde Türkçe ve İngilizce
   * etiketler için çok dilli destek sağlar ve acentelerin her yapılandırma parametresinin amacını anlamalarına yardımcı olur.
   */
  readonly labelResourceKey: string;

  /**
   * The resource key for the optional description of this agent connection field.
   *
   * Optional localization resource key for detailed description text that provides additional context
   * about this agent-based connection field. Used in agent configuration interfaces to help insurance
   * agents understand complex integration parameters and their proper usage.
   *
   * Bu acente bağlantı alanının isteğe bağlı açıklaması için kaynak anahtarı.
   *
   * Bu acente tabanlı bağlantı alanı hakkında ek bağlam sağlayan detaylı açıklama metni için isteğe
   * bağlı lokalizasyon kaynak anahtarı. Sigorta acentelerinin karmaşık entegrasyon parametrelerini ve
   * bunların doğru kullanımını anlamalarına yardımcı olmak için acente yapılandırma arayüzlerinde kullanılır.
   */
  readonly descriptionResourceKey?: string | null;

  /**
   * Whether this agent connection field should be hidden in user interfaces.
   *
   * Boolean flag that determines whether this agent-based connection field should be hidden from
   * standard agent configuration interfaces. Hidden fields may contain sensitive agent credentials,
   * system-generated values, or advanced settings not intended for regular agent use.
   *
   * Bu acente bağlantı alanının kullanıcı arayüzlerinde gizlenip gizlenmeyeceği.
   *
   * Bu acente tabanlı bağlantı alanının standart acente yapılandırma arayüzlerinden gizlenip
   * gizlenmeyeceğini belirleyen boolean bayrağı. Gizli alanlar hassas acente kimlik bilgilerini,
   * sistem tarafından oluşturulan değerleri veya normal acente kullanımı için amaçlanmayan gelişmiş
   * ayarları içerebilir.
   */
  readonly hidden: boolean;
}

// ============================================================================
// RELEASE NOTES
// ============================================================================

/**
 * Represents a single release note item containing version and description information.
 *
 * Sürüm ve açıklama bilgilerini içeren tek bir sürüm notu öğesini temsil eder.
 */
export interface GetAllReleaseNotesResultItem {
  /**
   * The version identifier for this release.
   *
   * Bu sürüm için sürüm tanımlayıcısı.
   */
  readonly version: string;

  /**
   * The description of changes and updates in this release.
   *
   * Bu sürümdeki değişiklik ve güncellemelerin açıklaması.
   */
  readonly description: string;
}

// ============================================================================
// FINANCIAL INSTITUTIONS
// ============================================================================

/**
 * Represents a bank institution in the insurance system for financial operations and payment processing.
 * Banks are fundamental entities for managing insurance premiums, claim payments, and loss payee arrangements.
 *
 * Sigorta sisteminde finansal işlemler ve ödeme işlemleri için banka kurumunu temsil eder.
 * Bankalar sigorta primlerinin, hasar ödemelerinin ve zarar ziyanı alacaklısı düzenlemelerinin yönetilmesi için temel kurumlardır.
 *
 * **Bank Institution Model / Banka Kurumu Modeli**
 *
 * EN: Represents a banking institution that provides financial services for insurance operations.
 * Banks serve as critical financial partners in the insurance ecosystem, handling premium collections,
 * claim disbursements, and serving as loss payees for financed vehicles and properties.
 * This model captures the essential information needed to identify and work with banking institutions
 * in insurance-related financial transactions.
 *
 * TR: Sigorta operasyonları için finansal hizmetler sağlayan bir bankacılık kurumunu temsil eder.
 * Bankalar sigorta ekosisteminde kritik finansal ortaklar olarak hizmet verir, prim tahsilatlarını,
 * hasar ödemelerini gerçekleştirir ve finansmanlı araçlar ve konutlar için zarar ziyanı alacaklısı
 * olarak görev yapar. Bu model, sigorta ile ilgili finansal işlemlerde bankacılık kurumlarını
 * tanımlamak ve onlarla çalışmak için gerekli temel bilgileri yakalar.
 */
export interface Bank {
  /**
   * The unique identifier of the bank institution.
   *
   * System-generated unique identifier for the bank institution. This ID serves as the primary
   * reference for all banking-related operations in the insurance system, including premium processing,
   * claim payments, loss payee management, and financial reporting. Used to establish relationships
   * with bank branches and maintain consistent financial data across the platform.
   *
   * Banka kurumunun benzersiz tanımlayıcısı.
   *
   * Banka kurumu için sistem tarafından oluşturulan benzersiz tanımlayıcı. Bu ID, prim işleme,
   * hasar ödemeleri, zarar ziyanı alacaklısı yönetimi ve finansal raporlama dahil olmak üzere
   * sigorta sistemindeki tüm bankacılık ile ilgili işlemler için birincil referans görevi görür.
   * Banka şubeleri ile ilişki kurmak ve platform genelinde tutarlı finansal veriler sağlamak için kullanılır.
   */
  readonly id: string;

  /**
   * The name of the bank institution.
   *
   * The official name of the banking institution as registered with financial regulatory authorities.
   * This name is used for display purposes, financial documentation, policy documentation, and
   * customer communications. Essential for maintaining accurate financial records and ensuring
   * proper identification in all insurance-related banking transactions and correspondence.
   *
   * Banka kurumunun adı.
   *
   * Finansal düzenleyici otoriteler nezdinde kayıtlı olan bankacılık kurumunun resmi adı.
   * Bu ad görüntüleme amaçları, finansal belgelendirme, poliçe belgelendirmesi ve müşteri
   * iletişimi için kullanılır. Doğru finansal kayıtların tutulması ve tüm sigorta ile ilgili
   * bankacılık işlemlerinde ve yazışmalarında doğru tanımlamanın sağlanması için gereklidir.
   */
  readonly name: string;
}

/**
 * Represents a bank branch in the insurance system for financial operations and loss payee management.
 * Bank branches are essential for processing insurance premiums, claims payments, and managing financial relationships.
 *
 * Sigorta sisteminde finansal işlemler ve zarar ziyanı alacaklısı yönetimi için banka şubesini temsil eder.
 * Banka şubeleri sigorta primlerinin işlenmesi, hasar ödemelerinin yapılması ve finansal ilişkilerin yönetilmesi için gereklidir.
 *
 * **Bank Branch Model / Banka Şubesi Modeli**
 *
 * EN: Represents a specific branch location of a bank used in insurance operations. Bank branches are crucial
 * for processing insurance-related financial transactions, including premium payments, claim settlements,
 * and managing loss payee arrangements for financed vehicles or properties. Each branch has a unique identifier
 * and is associated with its parent bank institution.
 *
 * TR: Sigorta operasyonlarında kullanılan bir bankanın belirli şube lokasyonunu temsil eder. Banka şubeleri,
 * prim ödemeleri, hasar ödemeleri ve finansmanlı araçlar veya konutlar için zarar ziyanı alacaklısı düzenlemelerinin
 * yönetilmesi dahil olmak üzere sigorta ile ilgili finansal işlemlerin işlenmesi için kritiktir.
 * Her şubenin benzersiz bir tanımlayıcısı vardır ve ana banka kurumu ile ilişkilidir.
 */
export interface BankBranch {
  /**
   * The unique identifier of the bank branch.
   *
   * System-generated unique identifier for the bank branch. This ID is used throughout the insurance
   * system to reference specific branch locations for financial operations, loss payee assignments,
   * and payment processing. Essential for maintaining accurate financial records and branch-specific operations.
   *
   * Banka şubesinin benzersiz tanımlayıcısı.
   *
   * Banka şubesi için sistem tarafından oluşturulan benzersiz tanımlayıcı. Bu ID, finansal işlemler,
   * zarar ziyanı alacaklısı atamaları ve ödeme işlemleri için belirli şube lokasyonlarına referans vermek
   * üzere sigorta sistemi boyunca kullanılır. Doğru finansal kayıtların tutulması ve şubeye özel işlemler için gereklidir.
   */
  readonly id: string;

  /**
   * The name of the bank branch.
   *
   * The official name or designation of the bank branch, typically including location information
   * such as district, city, or landmark names. This human-readable identifier helps users and system
   * operators easily identify specific branch locations when processing insurance-related financial
   * transactions or managing loss payee relationships.
   *
   * Banka şubesinin adı.
   *
   * Banka şubesinin resmi adı veya tanımlaması, genellikle ilçe, şehir veya yer işareti adları gibi
   * konum bilgilerini içerir. Bu insan tarafından okunabilir tanımlayıcı, kullanıcıların ve sistem
   * operatörlerinin sigorta ile ilgili finansal işlemleri işlerken veya zarar ziyanı alacaklısı
   * ilişkilerini yönetirken belirli şube konumlarını kolayca tanımlamasına yardımcı olur.
   */
  readonly name: string;

  /**
   * The unique identifier of the parent bank that owns this branch.
   *
   * References the unique identifier of the parent bank institution that owns and operates this branch.
   * This relationship is crucial for understanding the banking hierarchy and ensuring proper financial
   * routing in insurance operations. Used to link branch-specific transactions to the parent bank's
   * policies, procedures, and financial systems.
   *
   * Bu şubeye sahip olan ana bankanın benzersiz tanımlayıcısı.
   *
   * Bu şubeye sahip olan ve işleten ana banka kurumunun benzersiz tanımlayıcısına referans verir.
   * Bu ilişki, bankacılık hiyerarşisini anlamak ve sigorta operasyonlarında doğru finansal yönlendirmeyi
   * sağlamak için kritiktir. Şubeye özel işlemleri ana bankanın politikaları, prosedürleri ve finansal
   * sistemleri ile ilişkilendirmek için kullanılır.
   */
  readonly bankId: string;
}

/**
 * Represents a financial institution in the insurance system, including banks, credit unions, and other financial service providers.
 * Financial institutions serve as critical partners for premium financing, claim settlements, and loss payee arrangements.
 *
 * Sigorta sisteminde bankalar, kredi birlikleri ve diğer finansal hizmet sağlayıcıları dahil olmak üzere finansal kurumu temsil eder.
 * Finansal kurumlar prim finansmanı, hasar ödemeleri ve zarar ziyanı alacaklısı düzenlemeleri için kritik ortaklar olarak hizmet verir.
 *
 * **Financial Institution Model / Finansal Kurum Modeli**
 *
 * EN: Represents any type of financial institution that participates in insurance-related financial operations.
 * This includes traditional banks, credit unions, financing companies, leasing companies, and other entities
 * that provide financial services for insurance transactions. Financial institutions may serve as premium
 * collectors, claim payment recipients, loss payees for financed assets, or financing providers for
 * insurance products. This broader category encompasses various types of financial service providers
 * beyond traditional banking institutions.
 *
 * TR: Sigorta ile ilgili finansal operasyonlara katılan her türlü finansal kurumu temsil eder.
 * Bu, geleneksel bankalar, kredi birlikleri, finansman şirketleri, leasing şirketleri ve sigorta
 * işlemleri için finansal hizmetler sağlayan diğer kuruluşları içerir. Finansal kurumlar prim
 * tahsildarları, hasar ödeme alıcıları, finansmanlı varlıklar için zarar ziyanı alacaklıları
 * veya sigorta ürünleri için finansman sağlayıcıları olarak hizmet verebilir. Bu daha geniş
 * kategori, geleneksel bankacılık kurumlarının ötesinde çeşitli finansal hizmet sağlayıcı türlerini kapsar.
 */
export interface FinancialInstitution {
  /**
   * The unique identifier of the financial institution.
   *
   * System-generated unique identifier for the financial institution. This ID is used across
   * the insurance platform to reference the institution in various financial operations including
   * premium financing arrangements, loss payee designations, claim payment processing, and
   * financial reporting. Essential for maintaining data integrity and establishing relationships
   * with other system entities such as policies, claims, and customer accounts.
   *
   * Finansal kurumun benzersiz tanımlayıcısı.
   *
   * Finansal kurum için sistem tarafından oluşturulan benzersiz tanımlayıcı. Bu ID, prim
   * finansman düzenlemeleri, zarar ziyanı alacaklısı tanımlamaları, hasar ödeme işlemleri ve
   * finansal raporlama dahil olmak üzere çeşitli finansal operasyonlarda kuruma referans vermek
   * için sigorta platformu genelinde kullanılır. Veri bütünlüğünü korumak ve poliçeler, hasarlar
   * ve müşteri hesapları gibi diğer sistem varlıkları ile ilişki kurmak için gereklidir.
   */
  readonly id: string;

  /**
   * The name of the financial institution.
   *
   * The official registered name of the financial institution as recognized by regulatory authorities.
   * This name appears in insurance policy documents, financial agreements, loss payee clauses,
   * and customer communications. Used for legal identification, compliance purposes, and ensuring
   * accurate financial transaction processing. The name must match official regulatory registrations
   * to maintain compliance with financial and insurance regulations.
   *
   * Finansal kurumun adı.
   *
   * Düzenleyici otoriteler tarafından tanınan finansal kurumun resmi kayıtlı adı.
   * Bu ad sigorta poliçesi belgelerinde, finansal anlaşmalarda, zarar ziyanı alacaklısı
   * maddelerinde ve müşteri iletişimlerinde görünür. Yasal tanımlama, uyumluluk amaçları
   * ve doğru finansal işlem işlemesini sağlamak için kullanılır. Ad, finansal ve sigorta
   * düzenlemelerine uyumu korumak için resmi düzenleyici kayıtlarıyla eşleşmelidir.
   */
  readonly name: string;
}
