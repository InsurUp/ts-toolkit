/**
 * @fileoverview Common Property Types - Property-related types and enums
 * @description Property data structures, models, and enums used throughout the InsurUp platform
 */

import type { InsuranceParameter } from './common.base.js';

// ============================================================================
// SHARED VALUE OBJECTS
// ============================================================================

/**
 * Discriminated union representing a numeric quantity that can be expressed
 * as an exact value, a range (min/max), or a value exceeding a threshold.
 *
 * Bir sayısal niceliği temsil eder; kesin bir değer, bir aralık (min/max)
 * veya bir eşiği aşan değer olarak ifade edilebilir.
 *
 * Discriminated by `type`. The SDK client maps this to/from the backend's
 * `$type` discriminator on the wire.
 */
export type NumericQuantity = RangeQuantity | ExactQuantity | ExceedingQuantity;

/**
 * Range of integer values (inclusive). Min must be strictly less than Max.
 *
 * Tamsayı aralığı (içerir). Min, Max'tan kesinlikle küçük olmalıdır.
 */
export interface RangeQuantity {
  /** @wire $type */
  readonly type: 'range';
  readonly min: number;
  readonly max: number;
}

/**
 * Exact integer value.
 *
 * Kesin tamsayı değeri.
 */
export interface ExactQuantity {
  /** @wire $type */
  readonly type: 'exact';
  readonly value: number;
}

/**
 * Value that exceeds some defined upper bound.
 *
 * Tanımlanan bir üst sınırı aşan değer.
 */
export interface ExceedingQuantity {
  /** @wire $type */
  readonly type: 'exceeding';
  readonly value: number;
}

// ============================================================================
// PROPERTY-RELATED ENUMS
// ============================================================================

/**
 * Represents the construction material and structural type of a building.
 * Used to assess risk levels, determine insurance premiums, and evaluate earthquake resistance.
 *
 * Bir binanın yapı malzemesi ve yapısal türünü temsil eder.
 * Risk seviyelerini değerlendirmek, sigorta primlerini belirlemek ve deprem direncini değerlendirmek için kullanılır.
 */
export enum PropertyStructure {
  /**
   * Construction type is unknown or not yet determined.
   *
   * Yapı türü bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * Steel-reinforced concrete construction - highest earthquake resistance.
   *
   * Betonarme yapı - en yüksek deprem direnci.
   */
  SteelReinforcedConcrete = 'STEEL_REINFORCED_CONCRETE',

  /**
   * Other construction types including wood, brick, stone, or mixed materials.
   *
   * Ahşap, tuğla, taş veya karışık malzemeler dahil diğer yapı türleri.
   */
  Other = 'OTHER',
}

/**
 * Represents the damage assessment levels for property structures.
 * Used to categorize the extent of damage sustained by buildings or properties.
 *
 * Konut yapıları için hasar değerlendirme seviyelerini temsil eder.
 * Binalar veya konutlar tarafından uğranılan hasarın boyutunu kategorize etmek için kullanılır.
 */
export enum PropertyDamageStatus {
  /**
   * Damage status is unknown or has not been assessed yet.
   *
   * Hasar durumu bilinmiyor veya henüz değerlendirilmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * No damage detected or property is in perfect condition.
   *
   * Hasar tespit edilmedi veya konut mükemmel durumda.
   */
  None = 'NONE',

  /**
   * Minor damage that does not affect structural integrity.
   *
   * Yapısal bütünlüğü etkilemeyen küçük hasar.
   */
  SlightlyDamaged = 'SLIGHTLY_DAMAGED',

  /**
   * Moderate damage requiring significant repairs but structure remains sound.
   *
   * Önemli onarım gerektiren orta derecede hasar ancak yapı sağlam kalır.
   */
  ModeratelyDamaged = 'MODERATELY_DAMAGED',

  /**
   * Severe damage compromising structural integrity and safety.
   *
   * Yapısal bütünlük ve güvenliği tehlikeye atan ciddi hasar.
   */
  SeverelyDamaged = 'SEVERELY_DAMAGED',
}

/**
 * Represents how a property is utilized or occupied.
 * Defines the primary use case of the property which affects insurance risk assessment and premium calculation.
 *
 * Bir konutun nasıl kullanıldığını veya işgal edildiğini temsil eder.
 * Sigorta risk değerlendirmesini ve prim hesaplamasını etkileyen konutun birincil kullanım durumunu tanımlar.
 */
export enum PropertyUtilizationStyle {
  /**
   * Property usage is unknown or not yet determined.
   *
   * Konut kullanımı bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * Residential property used as a home or dwelling.
   *
   * Ev veya yaşam yeri olarak kullanılan konut amaçlı konut.
   */
  House = 'HOUSE',

  /**
   * Commercial property used for business operations.
   *
   * İş operasyonları için kullanılan ticari konut.
   */
  Business = 'BUSINESS',

  /**
   * Other usage types including mixed-use, industrial, agricultural, or special purposes.
   *
   * Karma kullanım, sanayi, tarım veya özel amaçlar dahil diğer kullanım türleri.
   */
  Other = 'OTHER',
}

/**
 * Represents the ownership relationship between a person and a property.
 * Defines whether the person owns the property or occupies it under a rental agreement.
 *
 * Bir kişi ile konut arasındaki konutiyet ilişkisini temsil eder.
 * Kişinin konutun sahibi olup olmadığını veya kira sözleşmesi kapsamında oturduğunu tanımlar.
 */
export enum PropertyOwnershipType {
  /**
   * Ownership type is unknown or not yet determined.
   *
   * Sahiplik türü bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * The person legally owns the property and holds the title deed.
   *
   * Kişi konutun yasal sahibidir ve tapu senedine sahiptir.
   */
  Proprietor = 'PROPRIETOR',

  /**
   * The person rents or leases the property under a rental agreement.
   *
   * Kişi kira sözleşmesi kapsamında konuta kiralar veya leasing yapar.
   */
  Tenant = 'TENANT',
}

/**
 * Represents the types of financial institutions that can be designated as loss payees in insurance policies.
 * Used to specify who should receive insurance claim payments when there are outstanding loans or financing.
 *
 * Sigorta poliçelerinde hasar alacaklısı olarak belirlenebilecek finansal kurum türlerini temsil eder.
 * Ödenmemiş krediler veya finansman olduğunda sigorta hasar ödemelerini kimin alacağını belirtmek için kullanılır.
 */
/**
 * Represents the physical placement category of a property within a building or area.
 * Used to classify the property type for insurance risk assessment.
 *
 * Bir konutun bina veya alan içindeki fiziksel yerleşim kategorisini temsil eder.
 * Sigorta risk değerlendirmesi için konut tipini sınıflandırmak amacıyla kullanılır.
 */
export enum PropertyLocationType {
  /**
   * Location type is unknown or not yet determined.
   *
   * Konum tipi bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * Summer house or vacation home.
   *
   * Yazlık konut veya tatil evi.
   */
  SummerHouse = 'SUMMER_HOUSE',

  /**
   * Detached building or standalone structure.
   *
   * Müstakil bina veya bağımsız yapı.
   */
  DetachedBuilding = 'DETACHED_BUILDING',

  /**
   * Apartment unit within a multi-story building.
   *
   * Çok katlı bir bina içindeki apartman dairesi.
   */
  Apartment = 'APARTMENT',
}

/**
 * Represents the vertical position of a property unit within a building.
 * Floor position affects exposure to specific perils such as flooding,
 * break-in risk, and earthquake damage patterns.
 *
 * Bir konut biriminin bina içindeki dikey konumunu temsil eder.
 * Kat konumu, su baskını, hırsızlık riski ve deprem hasar kalıpları gibi
 * belirli tehlikelere maruziyeti etkiler.
 */
export enum PropertyPosition {
  /**
   * Position is unknown or not yet determined.
   *
   * Konum bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * Basement floor, below ground level.
   *
   * Bodrum kat, zemin seviyesinin altında.
   */
  Basement = 'BASEMENT',

  /**
   * Ground floor at street level.
   *
   * Sokak seviyesinde giriş kat.
   */
  GroundFloor = 'GROUND_FLOOR',

  /**
   * First floor above the entrance level.
   *
   * Giriş katının üstündeki birinci kat.
   */
  AboveEntrance = 'ABOVE_ENTRANCE',

  /**
   * Middle floor, between ground and top floors.
   *
   * Ara kat, zemin ve üst katlar arasında.
   */
  MiddleFloor = 'MIDDLE_FLOOR',

  /**
   * Detached building, standalone structure without shared floors.
   *
   * Müstakil bina, paylaşılmış katları olmayan bağımsız yapı.
   */
  DetachedBuilding = 'DETACHED_BUILDING',
}

export enum LossPayeeClauseType {
  /**
   * Bank as loss payee.
   *
   * Hasar alacaklısı olarak banka.
   */
  Bank = 'BANK',

  /**
   * Financial institution as loss payee.
   *
   * Hasar alacaklısı olarak finansal kurum.
   */
  FinancialInstitution = 'FINANCIAL_INSTITUTION',
}

// ============================================================================
// PROPERTY-RELATED INTERFACES
// ============================================================================

/**
 * Represents floor information for a property including total floors in the building and the specific floor where the property is located.
 * Floor information is important for risk assessment, accessibility evaluation, and emergency evacuation planning.
 *
 * Binadaki toplam kat sayısı ve konutun bulunduğu belirli katı içeren bir konut için kat bilgilerini temsil eder.
 * Kat bilgileri risk değerlendirmesi, erişilebilirlik değerlendirmesi ve acil tahliye planlaması için önemlidir.
 */
export interface PropertyFloor {
  /**
   * The total number of floors in the building. Can be an exact value, a range,
   * or a value that exceeds a defined threshold.
   *
   * Binadaki toplam kat sayısı. Kesin değer, aralık veya tanımlı bir eşiği
   * aşan değer olabilir.
   */
  totalFloors: NumericQuantity | null;

  /**
   * The specific floor where the property is located.
   *
   * Konutun bulunduğu belirli kat.
   */
  currentFloor: number | null;
}

/**
 * Represents a complete address structure for insured properties with hierarchical administrative divisions.
 * Property addresses are essential for risk assessment, policy issuance, and emergency response coordination.
 *
 * Sigortalı konutlar için hiyerarşik idari bölümlerle tam adres yapısını temsil eder.
 * Konut adresleri risk değerlendirmesi, poliçe düzenleme ve acil durum müdahale koordinasyonu için gereklidir.
 */
export interface PropertyAddress {
  /**
   * The city (il) where the property is located.
   *
   * Konutun bulunduğu il.
   */
  city: InsuranceParameter;

  /**
   * The district (ilçe) where the property is located.
   *
   * Konutun bulunduğu ilçe.
   */
  district: InsuranceParameter;

  /**
   * The town or municipality (belde) where the property is located.
   *
   * Konutun bulunduğu belde veya belediye.
   */
  town: InsuranceParameter;

  /**
   * The neighborhood (mahalle) where the property is located.
   *
   * Konutun bulunduğu mahalle.
   */
  neighborhood: InsuranceParameter;

  /**
   * The street where the property is located.
   *
   * Konutun bulunduğu sokak.
   */
  street: InsuranceParameter;

  /**
   * The building identifier where the property is located.
   *
   * Konutun bulunduğu bina tanımlayıcısı.
   */
  building: InsuranceParameter;

  /**
   * The apartment or unit identifier within the building.
   *
   * Bina içindeki daire veya birim tanımlayıcısı.
   */
  apartment: InsuranceParameter;
}

/**
 * Represents an existing DASK (Compulsory Earthquake Insurance) policy from Turkey's National Disaster Insurance Institution.
 * Used to reference previous earthquake insurance coverage when creating new policies or managing property records.
 *
 * Türkiye Doğal Afet Sigortaları Kurumu'ndan mevcut bir DASK (Zorunlu Deprem Sigortası) poliçesini temsil eder.
 * Yeni poliçeler oluştururken veya konut kayıtlarını yönetirken önceki deprem sigortası kapsamına referans vermek için kullanılır.
 */
export interface DaskOldPolicy {
  /**
   * The DASK policy number. Must be a positive number with maximum 15 digits.
   *
   * DASK poliçe numarası. Maksimum 15 haneli pozitif bir sayı olmalıdır.
   */
  number: number;

  /**
   * The end date of the existing DASK policy.
   *
   * Mevcut DASK poliçesinin bitiş tarihi.
   */
  endDate: string | null;
}

/**
 * Bank institution reference used in loss payee arrangements.
 *
 * Hasar alacaklısı düzenlemelerinde kullanılan banka kurumu referansı.
 */
export interface BankModel {
  /**
   * The unique identifier of the bank institution.
   *
   * Banka kurumunun benzersiz tanımlayıcısı.
   */
  id: string;

  /**
   * The official name of the bank institution.
   *
   * Banka kurumunun resmi adı.
   */
  name: string;
}

/**
 * Bank branch reference used in loss payee arrangements.
 *
 * Hasar alacaklısı düzenlemelerinde kullanılan banka şubesi referansı.
 */
export interface BankBranchModel {
  /**
   * The unique identifier of the bank branch.
   *
   * Banka şubesinin benzersiz tanımlayıcısı.
   */
  id: string;

  /**
   * The name of the bank branch.
   *
   * Banka şubesinin adı.
   */
  name: string;

  /**
   * The unique identifier of the parent bank that owns this branch.
   *
   * Bu şubeye sahip olan ana bankanın benzersiz tanımlayıcısı.
   */
  bankId: string;
}

/**
 * Financial institution reference (non-bank lender) used in loss payee arrangements.
 *
 * Hasar alacaklısı düzenlemelerinde kullanılan finansal kurum (banka dışı) referansı.
 */
export interface FinancialInstitutionModel {
  /**
   * The unique identifier of the financial institution.
   *
   * Finansal kurumun benzersiz tanımlayıcısı.
   */
  id: string;

  /**
   * The official name of the financial institution.
   *
   * Finansal kurumun resmi adı.
   */
  name: string;
}

/**
 * Represents a loss payee clause that designates a financial institution as beneficiary for insurance claim payments.
 * Used when insured assets have outstanding financing to protect the lender's financial interest.
 *
 * Sigorta hasar ödemeleri için finansal kurumu lehtar olarak belirleyen hasar alacaklısı klozunu temsil eder.
 * Sigortalı varlıkların ödenmemiş finansmanı olduğunda borç verenin finansal çıkarını korumak için kullanılır.
 */
export interface LossPayeeClause {
  /**
   * Gets the type of loss payee clause.
   *
   * Hasar alacaklısı kloz türünü alır.
   */
  type: LossPayeeClauseType;

  /**
   * Bank information (set when type is Bank).
   *
   * Banka bilgileri (tür Bank olduğunda doludur).
   */
  bank: BankModel | null;

  /**
   * Bank branch information (set when type is Bank).
   *
   * Banka şube bilgileri (tür Bank olduğunda doludur).
   */
  bankBranch: BankBranchModel | null;

  /**
   * Financial institution information (set when type is FinancialInstitution).
   *
   * Finansal kurum bilgileri (tür FinancialInstitution olduğunda doludur).
   */
  financialInstitution: FinancialInstitutionModel | null;

  /**
   * Credit agreement number if specified (6-20 alphanumeric characters when set).
   *
   * Belirtilmişse kredi sözleşme numarası (ayarlandığında 6-20 alfanümerik karakter).
   */
  creditAgreementNumber: string | null;
}

/**
 * Property Number
 * Konut Numarası
 *
 * Represents a unique property identification number used for official property registration and insurance documentation.
 * Property numbers are essential for precise property identification in government records and insurance systems.
 */
export interface PropertyNumber {
  /**
   * The 10-digit property identification number
   * 10 haneli konut kimlik numarası
   */
  readonly value: number; // long in C# but number in TypeScript
}

/**
 * Property Square Meter
 * Konut Metrekaresi
 *
 * Represents the square meter area of a property for insurance coverage calculation and risk assessment.
 * Property size is a fundamental factor in determining insurance premiums, coverage limits, and risk exposure.
 */
export interface PropertySquareMeter {
  /**
   * Square meter area value (10-10,000)
   * Metrekare alan değeri (10-10,000)
   */
  readonly value: number;
}

/**
 * Property Construction Year
 * Konut Yapım Yılı
 *
 * Represents the construction year of a property for insurance risk assessment and premium calculation.
 * Construction year is a critical factor in determining building standards, earthquake resistance, and overall structural integrity.
 */
export interface PropertyConstructionYear {
  /**
   * The construction year value (0 to current year)
   * Yapım yılı değeri (0 ile mevcut yıl arası)
   */
  readonly value: number;
}

/**
 * Property information snapshot for proposals
 * Teklifler için konut bilgisi anlık görüntüsü
 *
 * Represents comprehensive property information captured in insurance proposal snapshots.
 * Contains all physical, legal, and risk-related characteristics of a residential property.
 *
 * NOTE: This interface should match the exact C# ProposalSnapshotProperty structure.
 * Individual property types should be properly defined based on their C# counterparts.
 */
export interface ProposalSnapshotProperty {
  /**
   * Unique identifier for the property
   * Konut için benzersiz tanımlayıcı
   */
  readonly id: string;

  /**
   * Official property number for identification and legal purposes
   * Tanımlama ve yasal amaçlar için resmi konut numarası
   */
  readonly number: PropertyNumber;

  /**
   * Complete address information of the property
   * Konutun tam adres bilgileri
   */
  readonly address: PropertyAddress;

  /**
   * Total area of the property in square meters
   * Konutun metrekare cinsinden toplam alanı
   */
  readonly squareMeter: PropertySquareMeter;

  /**
   * Year when the property was constructed
   * Konutun inşa edildiği yıl
   */
  readonly constructionYear: PropertyConstructionYear;

  /**
   * Current damage status of the property
   * Konutun mevcut hasar durumu
   */
  readonly damageStatus: PropertyDamageStatus;

  /**
   * Floor information of the property within the building
   * Bina içindeki konutun kat bilgileri
   */
  readonly floor: PropertyFloor;

  /**
   * Structural characteristics and construction type
   * Yapısal özellikler ve inşaat tipi
   */
  readonly structure: PropertyStructure;

  /**
   * How the property is utilized
   * Konutun nasıl kullanıldığı
   */
  readonly utilizationStyle: PropertyUtilizationStyle;

  /**
   * Loss payee clause for financing arrangements
   * Finansman düzenlemeleri için lehtar klozu
   */
  readonly lossPayeeClause?: LossPayeeClause;

  /**
   * Ownership type of the property
   * Konutun sahiplik türü
   */
  readonly ownershipType: PropertyOwnershipType;

  /**
   * The location type of the property.
   * Konutun konum tipi.
   */
  readonly locationType?: PropertyLocationType | null;

  /**
   * The vertical position of the property within the building.
   * Konutun bina içindeki dikey konumu.
   */
  readonly position?: PropertyPosition | null;

  /**
   * DASK old policy information
   * DASK eski poliçe bilgileri
   */
  readonly daskOldPolicy?: DaskOldPolicy;
}
