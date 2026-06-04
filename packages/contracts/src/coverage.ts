/**
 * @fileoverview Coverage Management Contracts - Types and interfaces for coverage management operations
 * @description Contracts for managing insurance coverage configurations, coverage groups, and coverage choices
 */

import type {
  CoverageTable,
  CoverageValue,
  UserReference,
  OnarimServisTuru,
  YedekParcaTuru,
  KiralikArac,
  HastaneAgi,
  SaglikPaketi,
  TasinanYuk,
  CamOnarimTercihi,
  SigortaKapsami,
  OssPaketSecimi,
  OssNetworkSecimi,
  InsuranceProductType,
  ProductBranch,
  VehicleUtilizationStyle,
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
   * Optional descriptive text explaining the purpose, scope, or intended customers of the coverage group.
   *
   * Teminat grubunun amacını, kapsamını veya hedef müşterilerini açıklayan isteğe bağlı metin.
   */
  readonly description?: string | null;

  /**
   * The product branch (Kasko, Konut, İMM, TSS, ...) this coverage group belongs to.
   *
   * Bu teminat grubunun ait olduğu ürün dalı (Kasko, Konut, İMM, TSS, ...).
   */
  readonly productBranch: ProductBranch;

  /**
   * The coverage definitions for this group, as a multi-row table keyed by insurance company and
   * product type. Each row carries a coverage plus optional company/product scoping.
   *
   * Bu grup için teminat tanımları; sigorta şirketi ve ürün türüne göre çok satırlı tablo olarak.
   * Her satır bir teminat ile birlikte isteğe bağlı şirket/ürün kapsamını taşır.
   */
  readonly coverageTable: CoverageTable;

  /**
   * Optional vehicle utilization style constraint for Kasko coverage groups.
   *
   * Kasko teminat grupları için isteğe bağlı araç kullanım stili kısıtı.
   */
  readonly vehicleUtilizationStyle?: VehicleUtilizationStyle | null;

  /**
   * Whether this is the default coverage group for the product branch (auto-selected for new proposals).
   *
   * Bu teminat grubunun ürün dalı için varsayılan grup olup olmadığı (yeni tekliflerde otomatik seçilir).
   */
  readonly isDefault?: boolean;
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
   * Optional descriptive text explaining the intent, scope, or notes for the coverage group.
   *
   * Teminat grubunun niyetini, kapsamını veya notlarını açıklayan isteğe bağlı metin.
   */
  readonly description?: string | null;

  /**
   * The updated coverage definitions for this group, as a multi-row table keyed by insurance company
   * and product type. Changes may impact existing policies and product configurations.
   *
   * Bu grup için güncellenmiş teminat tanımları; sigorta şirketi ve ürün türüne göre çok satırlı tablo.
   * Değişiklikler mevcut poliçeleri ve ürün konfigürasyonlarını etkileyebilir.
   */
  readonly coverageTable: CoverageTable;

  /**
   * Optional vehicle utilization style constraint for Kasko coverage groups.
   *
   * Kasko teminat grupları için isteğe bağlı araç kullanım stili kısıtı.
   */
  readonly vehicleUtilizationStyle?: VehicleUtilizationStyle | null;

  /**
   * Whether this is the default coverage group for the product branch (auto-selected for new proposals).
   *
   * Bu teminat grubunun ürün dalı için varsayılan grup olup olmadığı (yeni tekliflerde otomatik seçilir).
   */
  readonly isDefault?: boolean;
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
   * Optional descriptive text explaining the purpose, scope, or configuration guidance for the group.
   *
   * Teminat grubunun amacını, kapsamını veya konfigürasyon rehberini açıklayan isteğe bağlı metin.
   */
  readonly description?: string | null;

  /**
   * The product branch (Kasko, Konut, İMM, TSS, ...) this coverage group belongs to.
   *
   * Bu teminat grubunun ait olduğu ürün dalı (Kasko, Konut, İMM, TSS, ...).
   */
  readonly productBranch: ProductBranch;

  /**
   * The coverage definitions contained in this group, as a multi-row table keyed by insurance company
   * and product type. Each row carries a coverage plus optional company/product scoping.
   *
   * Bu grupta yer alan teminat tanımları; sigorta şirketi ve ürün türüne göre çok satırlı tablo.
   * Her satır bir teminat ile birlikte isteğe bağlı şirket/ürün kapsamını taşır.
   */
  readonly coverageTable: CoverageTable;

  /**
   * Optional vehicle utilization style constraint for Kasko coverage groups.
   *
   * Kasko teminat grupları için isteğe bağlı araç kullanım stili kısıtı.
   */
  readonly vehicleUtilizationStyle?: VehicleUtilizationStyle | null;

  /**
   * Whether this is the default coverage group for the product branch (auto-selected for new proposals).
   *
   * Bu teminat grubunun ürün dalı için varsayılan grup olup olmadığı (yeni tekliflerde otomatik seçilir).
   */
  readonly isDefault: boolean;
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
   * Optional descriptive text explaining the purpose, scope, or usage guidance for the group.
   *
   * Teminat grubunun amacını, kapsamını veya kullanım rehberini açıklayan isteğe bağlı metin.
   */
  readonly description?: string | null;

  /**
   * The product branch (Kasko, Konut, İMM, TSS, ...) this coverage group belongs to.
   *
   * Bu teminat grubunun ait olduğu ürün dalı (Kasko, Konut, İMM, TSS, ...).
   */
  readonly productBranch: ProductBranch;

  /**
   * The coverage definitions contained in this group, as a multi-row table keyed by insurance company
   * and product type. Each row carries a coverage plus optional company/product scoping.
   *
   * Bu grupta yer alan teminat tanımları; sigorta şirketi ve ürün türüne göre çok satırlı tablo.
   * Her satır bir teminat ile birlikte isteğe bağlı şirket/ürün kapsamını taşır.
   */
  readonly coverageTable: CoverageTable;

  /**
   * Optional vehicle utilization style constraint for Kasko coverage groups.
   *
   * Kasko teminat grupları için isteğe bağlı araç kullanım stili kısıtı.
   */
  readonly vehicleUtilizationStyle?: VehicleUtilizationStyle | null;

  /**
   * Whether this is the default coverage group for the product branch (auto-selected for new proposals).
   *
   * Bu teminat grubunun ürün dalı için varsayılan grup olup olmadığı (yeni tekliflerde otomatik seçilir).
   */
  readonly isDefault: boolean;
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
  readonly immLimitiAyrimsiz: readonly CoverageValue[];

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
  readonly onarimServisTuru: readonly OnarimServisTuru[];

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
  readonly yedekParcaTuru: readonly YedekParcaTuru[];

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
  readonly kiralikArac: readonly KiralikArac[];

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
  readonly anahtarKaybi: readonly CoverageValue[];

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
  readonly maneviTazminat: readonly CoverageValue[];

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
  readonly camKirilmaMuafeyeti: readonly CoverageValue[];

  /**
   * Available glass repair preference options (InsurGateway key 5137), e.g. for Türkiye Sigorta Kasko.
   *
   * Mevcut cam onarım tercihi seçenekleri (5137), örn. Türkiye Sigorta Kasko.
   */
  readonly camOnarimTercihi: readonly CamOnarimTercihi[];

  /**
   * Available deductible ratio options for Quick Sigorta Kasko products.
   *
   * Quick Sigorta Kasko ürünleri için mevcut muafiyet oranı seçenekleri.
   */
  readonly muafiyetOrani: readonly CoverageValue[];

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
  readonly ferdiKazaBundle: readonly (readonly CoverageValue[])[];
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
   * protection against rising replacement costs for property and contents.
   *
   * Teminat tutarlarına uygulanan otomatik enflasyon ayarlama oranları için mevcut seçenekler.
   * Enflasyon koruması, konut ve içerik için artan yeniden inşa maliyetlerine karşı yeterli
   * koruma sağlamak için teminat limitlerinin zaman içinde artmasını sağlar.
   */
  readonly enflasyon: readonly CoverageValue[];

  /**
   * Available insurance scope options (building, contents, or both). Plain values that must be sent as-is.
   *
   * Mevcut sigorta kapsamı seçenekleri (bina, eşya veya her ikisi). Aynen gönderilmesi gereken düz değerler.
   */
  readonly sigortaKapsami: readonly SigortaKapsami[];
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
  readonly hastaneAgi: readonly HastaneAgi[];

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
  readonly saglikPaketi: readonly SaglikPaketi[];
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
  readonly immLimitiAyrimsiz: readonly CoverageValue[];

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
  readonly kiralikArac: readonly KiralikArac[];

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
  readonly tasinanYuk: readonly TasinanYuk[];

  /**
   * Available assistance service (Asistans Hizmeti) options. Empty for companies/products that do not
   * support this flag.
   *
   * Mevcut asistans hizmeti seçenekleri. Bu özelliği desteklemeyen şirket/ürünlerde boştur.
   */
  readonly asistansHizmeti: readonly CoverageValue[];
}

/**
 * Defines the available coverage choices for private health insurance (Özel Sağlık / OSS) products.
 *
 * Özel Sağlık Sigortası (OSS) ürünleri için mevcut teminat seçeneklerini tanımlar.
 */
export interface OssCoverageChoices {
  /** Available package selection options. / Mevcut paket seçimi seçenekleri. */
  readonly paketSecimi: readonly OssPaketSecimi[];

  /** Available hospital-network selection options. / Mevcut network (hastane ağı) seçimi seçenekleri. */
  readonly networkSecimi: readonly OssNetworkSecimi[];

  /** Available maternity (doğum) coverage options. / Mevcut doğum teminatı seçenekleri. */
  readonly dogumTeminati: readonly CoverageValue[];

  /** Available personal-accident coverage options. / Mevcut ferdi kaza seçenekleri. */
  readonly ferdiKaza: readonly CoverageValue[];

  /** Available dental (diş) coverage options. / Mevcut diş teminatı seçenekleri. */
  readonly disTeminati: readonly CoverageValue[];
}

/**
 * Defines the available coverage choices for travel health insurance (Seyahat Sağlık) products.
 *
 * Seyahat Sağlık Sigortası ürünleri için mevcut teminat seçeneklerini tanımlar.
 */
export interface SeyahatSaglikCoverageChoices {
  /** Available Covid-19 coverage options (typically Included / NotIncluded). */
  readonly covidTeminati: readonly CoverageValue[];
}

/**
 * Defines the available coverage choices for foreign health insurance (Yabancı Sağlık) products.
 *
 * Yabancı Sağlık Sigortası ürünleri için mevcut teminat seçeneklerini tanımlar.
 */
export interface YabanciSaglikCoverageChoices {
  /** Available hospital-network coverage level options. / Mevcut hastane ağı seviyesi seçenekleri. */
  readonly hastaneAgi: readonly HastaneAgi[];
}

// ============================================================================
// COMPANY COVERAGE CHOICES WRAPPER
// ============================================================================

/**
 * Coverage choices provided by a specific insurance company, along with the product integration type.
 *
 * Belirli bir sigorta şirketi tarafından sağlanan teminat seçenekleri ve ürün entegrasyon türü.
 */
export interface CompanyCoverageChoices<T> {
  /** Unique identifier of the insurance company that offers these coverage choices. */
  readonly insuranceCompanyId: number;

  /** Technical integration type (WebService or Robot) used for this product. */
  readonly productType: InsuranceProductType;

  /** The coverage choices configuration for the specific insurance product type. */
  readonly coverageChoices: T;
}
