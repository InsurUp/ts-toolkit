/**
 * @fileoverview Coverage Management Contracts - Types and interfaces for coverage management operations
 * @description Contracts for managing insurance coverage configurations, coverage groups, and coverage choices
 */

import type {
  Coverage,
  CoverageChoices,
  CoverageValue,
  UserReference,
  OnarimServisTuru,
  YedekParcaTuru,
  KiralikArac,
  HastaneAgi,
  SaglikPaketi,
  TasinanYuk,
} from './common.js';

/**
 * Represents a request to create a new coverage group in the insurance system.
 * Used to organize and manage collections of insurance coverage definitions for administrative purposes.
 *
 * Sigorta sisteminde yeni bir teminat grubu oluşturmak için kullanılan talep.
 * İdari amaçlar için sigorta teminat tanımlarının koleksiyonlarını organize etmek ve yönetmek için kullanılır.
 */
export interface CreateCoverageGroupRequest {
  /**
   * The human-readable name for the coverage group being created. This name should be
   * descriptive and help administrators identify the purpose and scope of the coverage group.
   * Used in administrative interfaces and reporting for coverage management.
   *
   * Oluşturulan teminat grubu için insan tarafından okunabilir ad. Bu ad açıklayıcı olmalı
   * ve yöneticilerin teminat grubunun amacını ve kapsamını tanımlamasına yardımcı olmalıdır.
   * Teminat yönetimi için idari arayüzlerde ve raporlamada kullanılır.
   */
  readonly name: string;

  /**
   * The insurance coverage definition that will be included in this coverage group.
   * This defines the specific insurance protection, terms, conditions, and parameters
   * that make up this coverage. The coverage can include various insurance types such
   * as vehicle, property, health, or other specialized insurance coverages.
   *
   * Bu teminat grubuna dahil edilecek sigorta teminat tanımı. Bu, bu teminatı oluşturan
   * belirli sigorta koruması, koşullar, şartlar ve parametreleri tanımlar. Teminat, araç,
   * mülk, sağlık veya diğer özelleşmiş sigorta teminatları gibi çeşitli sigorta türlerini içerebilir.
   */
  readonly coverage: Coverage;
}

/**
 * Represents a request to update an existing coverage group in the insurance system.
 * Used to modify the name, coverage definitions, or other properties of established coverage groups.
 *
 * Sigorta sisteminde mevcut bir teminat grubunu güncellemek için kullanılan talep.
 * Kurulmuş teminat gruplarının adını, teminat tanımlarını veya diğer özelliklerini değiştirmek için kullanılır.
 */
export interface UpdateCoverageGroupRequest {
  /**
   * The unique identifier of the coverage group to be updated. This ID is used to locate
   * the specific coverage group in the system and ensure the update is applied to the correct entity.
   * The identifier remains unchanged during updates to maintain data integrity and references.
   *
   * Güncellenecek teminat grubunun benzersiz tanımlayıcısı. Bu kimlik, sistemde belirli
   * teminat grubunu bulmak ve güncellemenin doğru varlığa uygulandığından emin olmak için kullanılır.
   * Veri bütünlüğünü ve referansları korumak için tanımlayıcı güncellemeler sırasında değişmez.
   */
  readonly id: string;

  /**
   * The new name for the coverage group. This name should be descriptive and reflect
   * any changes in the group's purpose or scope. The updated name will be used in
   * administrative interfaces and reporting for coverage management.
   *
   * Teminat grubu için yeni ad. Bu ad açıklayıcı olmalı ve grubun amacındaki veya
   * kapsamındaki değişiklikleri yansıtmalıdır. Güncellenmiş ad, teminat yönetimi için
   * idari arayüzlerde ve raporlamada kullanılacaktır.
   */
  readonly name: string;

  /**
   * The updated insurance coverage definition for this coverage group. This replaces
   * the existing coverage definition with new terms, conditions, parameters, or coverage
   * types. Changes to coverage definitions should be made carefully as they may impact
   * existing policies and product configurations.
   *
   * Bu teminat grubu için güncellenmiş sigorta teminat tanımı. Bu, mevcut teminat
   * tanımını yeni koşullar, şartlar, parametreler veya teminat türleri ile değiştirir.
   * Mevcut poliçeleri ve ürün konfigürasyonlarını etkileyebileceği için teminat tanımlarındaki
   * değişiklikler dikkatli bir şekilde yapılmalıdır.
   */
  readonly coverage: Coverage;
}

/**
 * Represents a request to delete an existing coverage group from the insurance system.
 * Used to remove coverage groups that are no longer needed or have become obsolete.
 *
 * Sigorta sisteminden mevcut bir teminat grubunu silmek için kullanılan talep.
 * Artık gerekli olmayan veya eskimiş teminat gruplarını kaldırmak için kullanılır.
 */
export interface DeleteCoverageGroupRequest {
  /**
   * The unique identifier of the coverage group to be deleted from the system.
   * This ID is used to locate and remove the specific coverage group. The system
   * should perform validation to ensure the group is not referenced by active
   * policies or products before proceeding with deletion.
   *
   * Sistemden silinecek teminat grubunun benzersiz tanımlayıcısı. Bu kimlik,
   * belirli teminat grubunu bulmak ve kaldırmak için kullanılır. Sistem, silme
   * işlemine devam etmeden önce grubun aktif poliçeler veya ürünler tarafından
   * referans alınmadığından emin olmak için doğrulama yapmalıdır.
   */
  readonly id: string;
}

/**
 * Response containing comprehensive information about a specific coverage group retrieved by identifier.
 * Provides detailed coverage group data including metadata, audit information, and coverage definitions.
 *
 * Tanımlayıcı ile alınan belirli bir teminat grubu hakkında kapsamlı bilgi içeren yanıt.
 * Meta veriler, denetim bilgileri ve teminat tanımları dahil olmak üzere detaylı teminat grubu verisi sağlar.
 */
export interface GetCoverageGroupByIdResult {
  /**
   * The unique identifier of the coverage group within InsurUp's system.
   * This ID is used for all operations and references related to this coverage group.
   *
   * InsurUp'ın sistemindeki teminat grubunun benzersiz tanımlayıcısı.
   * Bu kimlik, bu teminat grubu ile ilgili tüm operasyonlar ve referanslar için kullanılır.
   */
  readonly id: string;

  /**
   * The human-readable name of the coverage group. This name helps administrators
   * identify the purpose and scope of the coverage group and is used in administrative
   * interfaces and reporting.
   *
   * Teminat grubunun insan tarafından okunabilir adı. Bu ad, yöneticilerin teminat
   * grubunun amacını ve kapsamını tanımlamasına yardımcı olur ve idari arayüzlerde ve
   * raporlamada kullanılır.
   */
  readonly name: string;

  /**
   * The date and time when the coverage group was initially created in the system.
   * Used for audit trails, system analysis, and tracking coverage group lifecycle.
   *
   * Teminat grubunun sistemde ilk oluşturulduğu tarih ve saat.
   * Denetim izleri, sistem analizi ve teminat grubu yaşam döngüsü takibi için kullanılır.
   */
  readonly createdAt: string;

  /**
   * The date and time when the coverage group was last modified. May be null
   * if the coverage group has never been updated since creation. Used for audit
   * trails and change tracking.
   *
   * Teminat grubunun son değiştirildiği tarih ve saat. Oluşturulduğundan beri
   * hiç güncellenmemişse null olabilir. Denetim izleri ve değişiklik takibi için kullanılır.
   */
  readonly updatedAt?: string;

  /**
   * Reference to the user who initially created this coverage group.
   * Includes user identification and role information for accountability and audit purposes.
   *
   * Bu teminat grubunu ilk oluşturan kullanıcıya referans.
   * Hesap verebilirlik ve denetim amaçları için kullanıcı tanımlama ve rol bilgilerini içerir.
   */
  readonly createdBy: UserReference;

  /**
   * Reference to the user who last modified this coverage group. May be null
   * if the coverage group has never been updated since creation. Used for tracking
   * changes and accountability.
   *
   * Bu teminat grubunu son değiştiren kullanıcıya referans. Oluşturulduğundan beri
   * hiç güncellenmemişse null olabilir. Değişiklikleri takip etmek ve hesap verebilirlik
   * için kullanılır.
   */
  readonly updatedBy?: UserReference;

  /**
   * The insurance coverage definition that is contained within this coverage group.
   * This defines the specific insurance protection, terms, conditions, and parameters
   * that make up this coverage. The coverage can include various insurance types such
   * as vehicle, property, health, or other specialized insurance coverages.
   *
   * Bu teminat grubunda yer alan sigorta teminat tanımı. Bu, bu teminatı oluşturan
   * belirli sigorta koruması, koşullar, şartlar ve parametreleri tanımlar. Teminat, araç,
   * mülk, sağlık veya diğer özelleşmiş sigorta teminatları gibi çeşitli sigorta türlerini içerebilir.
   */
  readonly coverage: Coverage;
}

/**
 * Response item containing summary information about a coverage group in a list of coverage groups.
 * Provides essential coverage group data for list displays, selection interfaces, and bulk operations.
 *
 * Teminat grupları listesindeki bir teminat grubu hakkında özet bilgi içeren yanıt öğesi.
 * Liste görünümleri, seçim arayüzleri ve toplu işlemler için temel teminat grubu verisi sağlar.
 */
export interface GetCoverageGroupsResultItem {
  /**
   * The unique identifier of the coverage group within InsurUp's system.
   * This ID is used for navigation, selection, and operations related to this coverage group.
   *
   * InsurUp'ın sistemindeki teminat grubunun benzersiz tanımlayıcısı.
   * Bu kimlik, bu teminat grubu ile ilgili navigasyon, seçim ve operasyonlar için kullanılır.
   */
  readonly id: string;

  /**
   * The human-readable name of the coverage group. This name is displayed in
   * administrative interfaces and helps administrators quickly identify and select
   * the appropriate coverage group from lists.
   *
   * Teminat grubunun insan tarafından okunabilir adı. Bu ad idari arayüzlerde
   * görüntülenir ve yöneticilerin listelerden uygun teminat grubunu hızlıca tanımlamasına
   * ve seçmesine yardımcı olur.
   */
  readonly name: string;

  /**
   * The date and time when the coverage group was initially created in the system.
   * Useful for sorting, filtering, and understanding the chronological order of coverage groups.
   *
   * Teminat grubunun sistemde ilk oluşturulduğu tarih ve saat.
   * Sıralama, filtreleme ve teminat gruplarının kronolojik sırasını anlama için faydalıdır.
   */
  readonly createdAt: string;

  /**
   * The date and time when the coverage group was last modified. May be null
   * if the coverage group has never been updated since creation. Useful for
   * tracking recent changes and maintenance activities.
   *
   * Teminat grubunun son değiştirildiği tarih ve saat. Oluşturulduğundan beri
   * hiç güncellenmemişse null olabilir. Son değişiklikleri ve bakım aktivitelerini
   * takip etmek için faydalıdır.
   */
  readonly updatedAt?: string;

  /**
   * Reference to the user who initially created this coverage group.
   * Provides accountability information and helps with access control and audit trails.
   *
   * Bu teminat grubunu ilk oluşturan kullanıcıya referans.
   * Hesap verebilirlik bilgisi sağlar ve erişim kontrolü ile denetim izlerine yardımcı olur.
   */
  readonly createdBy: UserReference;

  /**
   * Reference to the user who last modified this coverage group. May be null
   * if the coverage group has never been updated since creation. Helps track
   * who made recent changes for accountability and support purposes.
   *
   * Bu teminat grubunu son değiştiren kullanıcıya referans. Oluşturulduğundan beri
   * hiç güncellenmemişse null olabilir. Hesap verebilirlik ve destek amaçları için
   * son değişiklikleri kimin yaptığını takip etmeye yardımcı olur.
   */
  readonly updatedBy?: UserReference;

  /**
   * The insurance coverage definition that is contained within this coverage group.
   * This provides the essential coverage information for understanding what type of
   * insurance protection this group represents without requiring detailed retrieval.
   *
   * Bu teminat grubunda yer alan sigorta teminat tanımı. Bu, detaylı alma işlemi
   * gerektirmeden bu grubun ne tür sigorta korumasını temsil ettiğini anlamak için
   * temel teminat bilgisini sağlar.
   */
  readonly coverage: Coverage;
}

/**
 * Defines the available coverage choices for comprehensive vehicle insurance (Kasko) products.
 * Contains configuration options for all aspects of comprehensive vehicle coverage including liability, repairs, accessories, and personal accident benefits.
 *
 * Kapsamlı araç sigortası (Kasko) ürünleri için mevcut teminat seçeneklerini tanımlar.
 * Sorumluluk, onarım, aksesuarlar ve ferdi kaza faydaları dahil kapsamlı araç teminatının tüm yönleri için konfigürasyon seçeneklerini içerir.
 */
export interface KaskoCoverageChoices {
  /**
   * Available coverage limit options for voluntary financial liability included in comprehensive insurance.
   * These limits provide additional third-party liability protection beyond mandatory traffic insurance,
   * integrated into the comprehensive vehicle insurance policy for complete protection.
   *
   * Kapsamlı sigortaya dahil edilen ihtiyari mali mesuliyet için mevcut teminat limit seçenekleri.
   * Bu limitler, zorunlu trafik sigortasının ötesinde ek üçüncü şahıs sorumluluk koruması sağlar
   * ve tam koruma için kapsamlı araç sigortası poliçesine entegre edilir.
   */
  readonly immLimitiAyrimsiz: CoverageChoices<CoverageValue>;

  /**
   * Available options for repair service providers and quality levels.
   * Options typically include authorized dealer services, certified repair shops,
   * or general repair facilities, each offering different quality standards and cost levels.
   * The choice affects repair quality, warranty coverage, and claim settlement amounts.
   *
   * Onarım servis sağlayıcıları ve kalite seviyeleri için mevcut seçenekler.
   * Seçenekler genellikle yetkili bayi servisleri, sertifikalı onarım atölyeleri veya
   * genel onarım tesislerini içerir, her biri farklı kalite standartları ve maliyet seviyeleri sunar.
   * Seçim, onarım kalitesini, garanti kapsamını ve hasar ödeme tutarlarını etkiler.
   */
  readonly onarimServisTuru: CoverageChoices<OnarimServisTuru>;

  /**
   * Available options for the quality and type of spare parts used in repairs.
   * Options typically include original equipment manufacturer (OEM) parts, certified aftermarket parts,
   * or standard replacement parts. The choice affects repair quality, vehicle value retention,
   * and premium costs, with OEM parts providing the highest quality but at higher cost.
   *
   * Onarımlarda kullanılan yedek parçaların kalitesi ve türü için mevcut seçenekler.
   * Seçenekler genellikle orijinal ekipman üreticisi (OEM) parçaları, sertifikalı yan sanayi parçaları
   * veya standart yedek parçaları içerir. Seçim, onarım kalitesini, araç değer korunumunu ve
   * prim maliyetlerini etkiler; OEM parçalar en yüksek kaliteyi sağlar ancak daha yüksek maliyetle.
   */
  readonly yedekParcaTuru: CoverageChoices<YedekParcaTuru>;

  /**
   * Available options for rental vehicle coverage during repair or total loss periods.
   * This coverage provides temporary transportation while the insured vehicle is being repaired
   * or replaced. Options include different vehicle categories, daily rental limits,
   * maximum rental periods, and specific vehicle segments to match the insured vehicle.
   *
   * Onarım veya tam hasar süreleri boyunca kiralık araç teminatı için mevcut seçenekler.
   * Bu teminat, sigortalı araç onarım veya değişim sürecindeyken geçici ulaşım sağlar.
   * Seçenekler farklı araç kategorileri, günlük kiralama limitleri, maksimum kiralama süreleri
   * ve sigortalı araca uygun belirli araç segmentlerini içerir.
   */
  readonly kiralikArac: CoverageChoices<KiralikArac>;

  /**
   * Available coverage limits for vehicle key replacement and related costs.
   * This coverage handles expenses for replacing lost, stolen, or damaged vehicle keys,
   * including electronic key fobs, remote controls, and reprogramming costs.
   * Modern vehicle keys can be expensive to replace due to advanced security features.
   *
   * Araç anahtarı değişimi ve ilgili maliyetler için mevcut teminat limitleri.
   * Bu teminat, kaybolan, çalınan veya hasarlı araç anahtarlarının değişim masraflarını karşılar;
   * elektronik anahtar kumandalı, uzaktan kumandalar ve yeniden programlama maliyetleri dahil.
   * Modern araç anahtarları gelişmiş güvenlik özellikleri nedeniyle değiştirmesi pahalı olabilir.
   */
  readonly anahtarKaybi: CoverageChoices<CoverageValue>;

  /**
   * Available coverage limits for moral damages compensation.
   * This coverage provides compensation for non-material suffering and emotional distress
   * caused by accidents, helping to address the psychological impact of vehicle incidents
   * beyond physical damages and financial losses.
   *
   * Manevi tazminat telafisi için mevcut teminat limitleri. Bu teminat,
   * kazaların neden olduğu maddi olmayan acı ve duygusal sıkıntı için tazminat sağlar,
   * fiziksel hasarlar ve mali kayıpların ötesinde araç olaylarının psikolojik etkisini
   * ele almaya yardımcı olur.
   */
  readonly maneviTazminat: CoverageChoices<CoverageValue>;

  /**
   * Available deductible options for glass breakage coverage.
   * This deductible applies specifically to windshield, window, and other glass replacements.
   * Lower deductibles provide better customer experience for glass claims but may result
   * in higher premiums, while higher deductibles reduce premium costs.
   *
   * Cam kırılması teminatı için mevcut muafiyet seçenekleri. Bu muafiyet özellikle
   * ön cam, pencere ve diğer cam değişimlerine uygulanır. Düşük muafiyetler cam hasarları
   * için daha iyi müşteri deneyimi sağlar ancak daha yüksek primlerle sonuçlanabilir,
   * yüksek muafiyetler ise prim maliyetlerini azaltır.
   */
  readonly camKirilmaMuafeyeti: CoverageChoices<CoverageValue>;

  /**
   * Available options for comprehensive personal accident coverage bundles.
   * This bundle contains three related coverages in a specific sequence: death benefits,
   * permanent disability compensation, and medical treatment expenses. The bundle approach
   * ensures consistent coverage levels across all personal accident benefits and simplifies
   * the selection process for customers by offering pre-configured protection packages.
   *
   * Kapsamlı ferdi kaza teminat paketleri için mevcut seçenekler. Bu paket belirli bir
   * sırada üç ilgili teminatı içerir: vefat yardımı, sürekli sakatlık tazminatı ve
   * tıbbi tedavi masrafları. Paket yaklaşımı, tüm ferdi kaza yardımlarında tutarlı teminat
   * seviyeleri sağlar ve önceden yapılandırılmış koruma paketleri sunarak müşteriler için
   * seçim sürecini basitleştirir.
   */
  readonly ferdiKazaBundle: CoverageChoices<readonly CoverageValue[]>;
}

/**
 * Defines the available coverage choices for residential property insurance (Konut) products.
 * Contains configuration options for property protection including inflation adjustments and default coverage amounts for household contents.
 *
 * Konut sigortası ürünleri için mevcut teminat seçeneklerini tanımlar.
 * Enflasyon ayarlamaları ve ev eşyaları için varsayılan teminat tutarları dahil konut koruması için konfigürasyon seçeneklerini içerir.
 */
export interface KonutCoverageChoices {
  /**
   * Available options for automatic inflation adjustment rates applied to coverage amounts.
   * Inflation protection ensures that coverage limits increase over time to maintain adequate
   * protection against rising replacement costs for property and contents. Different rates
   * provide varying levels of protection against inflation erosion of coverage values.
   *
   * Teminat tutarlarına uygulanan otomatik enflasyon ayarlama oranları için mevcut seçenekler.
   * Enflasyon koruması, konut ve içerik için artan yeniden inşa maliyetlerine karşı yeterli
   * koruma sağlamak için teminat limitlerinin zaman içinde artmasını sağlar. Farklı oranlar,
   * teminat değerlerinin enflasyon erozyonuna karşı değişen koruma seviyeleri sağlar.
   */
  readonly enflasyon: CoverageChoices<CoverageValue>;

  /**
   * Standard default coverage amount for household contents including furniture, appliances,
   * personal belongings, and other movable property within the residence. This amount represents
   * the baseline protection for typical household contents and can be adjusted based on the
   * actual value of the insured's personal property inventory.
   *
   * Mobilya, ev aletleri, kişisel eşyalar ve konut içindeki diğer taşınabilir eşyalar
   * dahil ev eşyaları için standart varsayılan teminat tutarı. Bu tutar, tipik ev eşyaları
   * için temel korumayı temsil eder ve sigortalının kişisel mal envanterinin gerçek değerine
   * göre ayarlanabilir.
   */
  readonly esyaBedeliDefault: number;

  /**
   * Standard default coverage amount for electronic devices and equipment including computers,
   * televisions, audio systems, and other electronic appliances. Electronic devices often have
   * specific coverage needs due to their susceptibility to electrical damage and rapid
   * technological depreciation, requiring separate consideration from general household contents.
   *
   * Bilgisayarlar, televizyonlar, ses sistemleri ve diğer elektronik cihazlar dahil
   * elektronik cihaz ve ekipmanlar için standart varsayılan teminat tutarı. Elektronik cihazlar
   * genellikle elektriksel hasara duyarlılıkları ve hızlı teknolojik amortismanları nedeniyle
   * özel teminat ihtiyaçlarına sahiptir ve genel ev eşyalarından ayrı değerlendirme gerektirir.
   */
  readonly elektronikCihazBedeliDefault: number;

  /**
   * Standard default coverage amount for building insulation systems including thermal,
   * sound, and moisture insulation materials and installations. Insulation coverage is important
   * for maintaining energy efficiency and preventing water damage, with specific consideration
   * for modern insulation technologies and installation costs.
   *
   * Termal, ses ve nem izolasyon malzemeleri ve kurulumları dahil bina izolasyon sistemleri
   * için standart varsayılan teminat tutarı. İzolasyon teminatı, enerji verimliliğini korumak
   * ve su hasarını önlemek için önemlidir; modern izolasyon teknolojileri ve kurulum maliyetleri
   * için özel değerlendirme gerektirir.
   */
  readonly izolasyonBedeliDefault: number;

  /**
   * Standard default coverage amount for glass fixtures including windows, doors,
   * mirrors, and other glass installations within the property. Glass coverage addresses
   * the specific vulnerability of glass elements to breakage from various causes including
   * accidents, weather events, and vandalism.
   *
   * Pencereler, kapılar, aynalar ve konut içindeki diğer cam kurulumları dahil
   * cam armatürleri için standart varsayılan teminat tutarı. Cam teminatı, kazalar,
   * hava olayları ve vandalizm dahil çeşitli nedenlerden kaynaklanan kırılmaya karşı
   * cam elemanlarının belirli savunmasızlığını ele alır.
   */
  readonly camBedeliDefault: number;

  /**
   * Standard default construction cost per square meter used to calculate building value coverage.
   * This value is multiplied by the property's square meter to determine the building coverage amount.
   * The construction cost reflects current market rates for residential construction and is used
   * as a baseline for determining adequate building coverage.
   *
   * Bina değeri teminatını hesaplamak için kullanılan standart varsayılan metrekare başına inşa maliyeti.
   * Bu değer konutun metrekare ile çarpılarak bina teminat tutarı belirlenir. İnşa maliyeti, konut
   * inşaatı için mevcut piyasa oranlarını yansıtır ve yeterli bina teminatı belirlenmesi için
   * temel değer olarak kullanılır.
   */
  readonly metrekareInsaMaliyeti: number;
}

/**
 * Defines the available coverage choices for Complementary Health Insurance (TSS) products.
 * Contains configuration options for hospital network access levels and health package selections.
 *
 * Tamamlayıcı Sağlık Sigortası (TSS) ürünleri için mevcut teminat seçeneklerini tanımlar.
 * Hastane ağı erişim seviyeleri ve sağlık paketi seçimleri için konfigürasyon seçeneklerini içerir.
 */
export interface TssCoverageChoices {
  /**
   * Available options for hospital network access levels and quality tiers.
   * Hospital network options typically include different tiers such as basic public hospitals,
   * expanded networks including private hospitals, premium networks with top-tier medical facilities,
   * or comprehensive networks covering specialized treatment centers. Higher network tiers provide
   * access to better facilities and services but typically result in higher premium costs.
   *
   * Hastane ağı erişim seviyeleri ve kalite katmanları için mevcut seçenekler.
   * Hastane ağı seçenekleri genellikle temel kamu hastaneleri, özel hastaneleri içeren genişletilmiş
   * ağlar, üst düzey tıbbi tesislere sahip premium ağlar veya özel tedavi merkezlerini kapsayan
   * kapsamlı ağlar gibi farklı katmanları içerir. Daha yüksek ağ katmanları daha iyi tesislere
   * ve hizmetlere erişim sağlar ancak genellikle daha yüksek prim maliyetleriyle sonuçlanır.
   */
  readonly hastaneAgi: CoverageChoices<HastaneAgi>;

  /**
   * Available options for comprehensive health package configurations and benefit levels.
   * Health packages typically bundle various medical services, treatments, and benefits into
   * structured offerings such as basic packages covering essential medical services, comprehensive
   * packages including preventive care and specialist consultations, or premium packages with
   * advanced treatments and wellness programs. Package selection determines the scope of covered
   * medical services and benefit limits.
   *
   * Kapsamlı sağlık paketi konfigürasyonları ve fayda seviyeleri için mevcut seçenekler.
   * Sağlık paketleri genellikle çeşitli tıbbi hizmetleri, tedavileri ve faydaları yapılandırılmış
   * teklifler halinde paketler; temel tıbbi hizmetleri kapsayan temel paketler, koruyucu bakım
   * ve uzman konsültasyonlarını içeren kapsamlı paketler veya gelişmiş tedaviler ve sağlıklı yaşam
   * programları ile premium paketler. Paket seçimi, kapsanan tıbbi hizmetlerin kapsamını ve
   * fayda limitlerini belirler.
   */
  readonly saglikPaketi: CoverageChoices<SaglikPaketi>;
}

/**
 * Defines the available coverage choices for Voluntary Financial Liability (İMM) insurance products.
 * Contains configuration options for liability limits, rental vehicle coverage, and cargo type selections.
 *
 * İhtiyari Mali Mesuliyet (İMM) sigorta ürünleri için mevcut teminat seçeneklerini tanımlar.
 * Sorumluluk limitleri, kiralık araç teminatı ve kargo türü seçimleri için konfigürasyon seçeneklerini içerir.
 */
export interface ImmCoverageChoices {
  /**
   * Available coverage limit options for voluntary financial liability insurance.
   * These limits represent the maximum amount the insurance will pay for third-party
   * bodily injury and property damage claims beyond mandatory traffic insurance coverage.
   * Higher limits provide better protection but typically result in higher premiums.
   *
   * İhtiyari mali mesuliyet sigortası için mevcut teminat limit seçenekleri.
   * Bu limitler, zorunlu trafik sigortası teminatının ötesinde üçüncü şahıs bedeni zarar
   * ve mal zararı talepleri için sigortanın ödeyeceği maksimum tutarı temsil eder.
   * Daha yüksek limitler daha iyi koruma sağlar ancak genellikle daha yüksek primlerle sonuçlanır.
   */
  readonly immLimitiAyrimsiz: CoverageChoices<CoverageValue>;

  /**
   * Available options for rental vehicle coverage during repair periods.
   * This coverage provides a temporary replacement vehicle when the insured vehicle
   * is being repaired following a covered claim. Options may include different
   * vehicle categories, daily limits, and maximum rental periods.
   *
   * Onarım süreleri boyunca kiralık araç teminatı için mevcut seçenekler.
   * Bu teminat, sigortalı araç kapsanan bir hasar sonrası onarım sürecindeyken
   * geçici ikame araç sağlar. Seçenekler farklı araç kategorileri, günlük limitler
   * ve maksimum kiralama sürelerini içerebilir.
   */
  readonly kiralikArac: CoverageChoices<KiralikArac>;

  /**
   * Available classifications for the type of cargo or goods being transported
   * by the insured vehicle. Different cargo types may have varying risk profiles
   * and liability exposures, affecting coverage terms and premium calculations.
   * This classification helps ensure appropriate coverage for specific transportation needs.
   *
   * Sigortalı araç tarafından taşınan kargo veya malların türü için mevcut sınıflandırmalar.
   * Farklı kargo türleri değişen risk profilleri ve sorumluluk maruziyetlerine sahip olabilir,
   * teminat şartlarını ve prim hesaplamalarını etkiler. Bu sınıflandırma, belirli taşımacılık
   * ihtiyaçları için uygun teminatın sağlanmasına yardımcı olur.
   */
  readonly tasinanYuk: CoverageChoices<TasinanYuk>;
}

// ============================================================================
// COMPANY COVERAGE CHOICES WRAPPER
// ============================================================================

/**
 * Wrapper for coverage choices grouped by insurance company
 */
export interface CompanyCoverageChoices<T> {
  readonly insuranceCompanyId: number;
  readonly insuranceCompanyName: string;
  readonly choices: T;
}
