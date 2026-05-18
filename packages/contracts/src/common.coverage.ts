/**
 * @fileoverview Coverage-related Types and Enums - Insurance coverage types and related structures
 * @description Coverage types, values, and choices used throughout the InsurUp platform for insurance coverage configuration
 */

import type { ProductBranch } from './common.base.js';

/**
 * Represents different types of coverage values in insurance policies.
 * Used to define how coverage limits and benefits are calculated or applied.
 *
 * Sigorta poliçelerinde farklı teminat değeri türlerini temsil eder.
 * Teminat limitlerinin ve faydalarının nasıl hesaplandığını veya uygulandığını tanımlar.
 */
export type CoverageValue =
  | { $type: 'UNDEFINED' }
  | { $type: 'INCLUDED' }
  | { $type: 'NOT_INCLUDED' }
  | { $type: 'MARKET_VALUE' }
  | { $type: 'DECIMAL'; value: number }
  | { $type: 'PERCENT'; value: number }
  | { $type: 'LIMITLESS' }
  | { $type: 'HIGHEST_LIMIT' };

/**
 * Generic class representing a collection of coverage options with a default selection.
 * Provides a standardized structure for defining available choices and default values for insurance coverage configurations.
 *
 * Varsayılan seçim ile teminat seçenekleri koleksiyonunu temsil eden genel sınıf.
 * Sigorta teminatı konfigürasyonları için mevcut seçenekleri ve varsayılan değerleri tanımlamak için standartlaştırılmış yapı sağlar.
 */
export interface CoverageChoices<T> {
  /**
   * The recommended default coverage option that is pre-selected for customers.
   * This value represents the most commonly chosen or recommended coverage level
   * based on risk assessment, regulatory requirements, or business strategy.
   * Customers can change this selection, but it serves as a starting point.
   *
   * Müşteriler için önceden seçilen önerilen varsayılan teminat seçeneği.
   * Bu değer, risk değerlendirmesi, düzenleyici gereksinimler veya iş stratejisine
   * dayalı olarak en yaygın seçilen veya önerilen teminat seviyesini temsil eder.
   * Müşteriler bu seçimi değiştirebilir, ancak başlangıç noktası olarak hizmet eder.
   */
  readonly default: T;

  /**
   * Complete array of all available coverage options that customers can choose from.
   * This includes the default option and all alternative coverage levels or types.
   * The array defines the full range of choices available for a specific coverage aspect,
   * enabling customers to customize their insurance according to their needs and budget.
   *
   * Müşterilerin seçebileceği tüm mevcut teminat seçeneklerinin tam dizisi.
   * Bu varsayılan seçeneği ve tüm alternatif teminat seviyelerini veya türlerini içerir.
   * Dizi, belirli bir teminat yönü için mevcut seçeneklerin tam aralığını tanımlar
   * ve müşterilerin ihtiyaçlarına ve bütçelerine göre sigortalarını özelleştirmelerini sağlar.
   */
  readonly values: readonly T[];
}

/**
 * Union type for all insurance coverage types.
 * Represents the different types of insurance coverage available in the system.
 *
 * Tüm sigorta teminat türleri için birleşim türü.
 * Sistemde mevcut farklı sigorta teminat türlerini temsil eder.
 */
export type Coverage = KaskoCoverage | KonutCoverage | ImmCoverage | TssCoverage | EmptyCoverage;

/**
 * Represents comprehensive auto insurance coverage (Kasko) in Turkish insurance system.
 * Kasko is a comprehensive coverage that protects against various risks including theft, collision, and damage.
 *
 * Türk sigorta sisteminde kapsamlı otomobil sigortası (Kasko) temsilini yapar.
 * Kasko, hırsızlık, çarpışma ve hasar dahil çeşitli risklere karşı koruyan kapsamlı bir teminattır.
 */
export interface KaskoCoverage {
  readonly productBranch: ProductBranch.Kasko;
  readonly immLimitiAyrimsiz?: CoverageValue;
  readonly ferdiKazaVefat?: CoverageValue;
  readonly ferdiKazaSakatlik?: CoverageValue;
  readonly ferdiKazaTedaviMasraflari?: CoverageValue;
  readonly anahtarKaybi?: CoverageValue;
  readonly maneviTazminat?: CoverageValue;
  readonly onarimServisTuru?: OnarimServisTuru;
  readonly yedekParcaTuru?: YedekParcaTuru;
  readonly camKirilmaMuafeyeti?: CoverageValue;
  readonly kiralikArac?: KiralikArac;
  readonly hukuksalKorumaAracaBagli?: CoverageValue;
  readonly ozelEsya?: CoverageValue;
  readonly sigaraMaddeZarari?: CoverageValue;
  readonly patlayiciMaddeZarari?: CoverageValue;
  readonly kemirgenZarari?: CoverageValue;
  readonly yukKaymasiZarari?: CoverageValue;
  readonly eskime?: CoverageValue;
  readonly hasarsizlikIndirimKoruma?: CoverageValue;
  readonly yurtdisiKasko?: CoverageValue;
  readonly aracCalinmasi?: CoverageValue;
  readonly anahtarCalinmasi?: CoverageValue;
  readonly hukuksalKorumaSurucuyeBagli?: CoverageValue;
  readonly miniOnarim?: CoverageValue;
  readonly yolYardim?: CoverageValue;
  readonly yanlisAkaryakitDolumu?: CoverageValue;
  readonly yanma?: CoverageValue;
  readonly carpma?: CoverageValue;
  readonly carpisma?: CoverageValue;
  readonly glkhhTeror?: CoverageValue;
  readonly grevLokavt?: CoverageValue;
  readonly dogalAfetler?: CoverageValue;
  readonly hirsizlik?: CoverageValue;
}

/**
 * Represents home insurance coverage (Konut Sigortası) in Turkish insurance system.
 * Home insurance provides comprehensive protection for residential properties and their contents against various risks.
 *
 * Türk sigorta sisteminde konut sigortası teminatını temsil eder.
 * Konut sigortası, konut konutları ve içeriklerini çeşitli risklere karşı kapsamlı koruma sağlar.
 */
export interface KonutCoverage {
  readonly productBranch: ProductBranch.Konut;
  readonly binaBedeli?: CoverageValue;
  readonly esyaBedeli?: CoverageValue;
  readonly elektronikCihazBedeli?: CoverageValue;
  readonly izolasyonBedeli?: CoverageValue;
  readonly camBedeli?: CoverageValue;
  readonly enflasyon?: CoverageValue;
  readonly metrekareInsaMaliyeti?: CoverageValue;
}

/**
 * Represents Voluntary Financial Liability (İMM - İhtiyari Mali Mesuliyet) insurance coverage in Turkish insurance system.
 * IMM provides additional liability coverage beyond the mandatory traffic insurance requirements.
 *
 * Türk sigorta sisteminde İhtiyari Mali Mesuliyet (İMM) sigortası teminatını temsil eder.
 * İMM, zorunlu trafik sigortası gereksinimlerinin ötesinde ek sorumluluk teminatı sağlar.
 */
export interface ImmCoverage {
  readonly productBranch: ProductBranch.Imm;
  readonly immLimitiAyrimsiz?: CoverageValue;
  readonly kiralikArac?: KiralikArac;
  readonly tasinanYuk?: TasinanYuk;
}

/**
 * Represents Turkish Complementary Health Insurance (TSS - Tamamlayıcı Sağlık Sigortası) coverage.
 * TSS provides additional coverage beyond the basic SGK (Social Security Institution) benefits,
 * offering enhanced access to private healthcare services and reduced out-of-pocket expenses.
 *
 * Türk Tamamlayıcı Sağlık Sigortası (TSS) teminatını temsil eder.
 * TSS, temel SGK (Sosyal Güvenlik Kurumu) faydalarının ötesinde ek teminat sağlar,
 * özel sağlık hizmetlerine gelişmiş erişim ve düşük cepten ödemeler sunar.
 */
export interface TssCoverage {
  readonly productBranch: ProductBranch.Tss;
  readonly hastaneAgi?: HastaneAgi;
  readonly saglikPaketi?: SaglikPaketi;
}

/**
 * Represents an empty coverage placeholder that contains no actual coverage benefits.
 * Used as a default or null object pattern implementation for coverage scenarios where no specific coverage is defined.
 *
 * Gerçek teminat faydaları içermeyen boş bir teminat yer tutucusunu temsil eder.
 * Belirli bir teminatın tanımlanmadığı teminat senaryoları için varsayılan veya null nesne deseni uygulaması olarak kullanılır.
 */
export interface EmptyCoverage {
  readonly productBranch: string;
}

/**
 * Types of repair services in Turkish insurance industry.
 * These terms are specific to Turkish insurance regulations and practices.
 *
 * Türk sigorta sektöründeki onarım servis türleri.
 * Bu terimler Türk sigorta düzenlemeleri ve uygulamalarına özeldir.
 */
export enum OnarimServisTuru {
  /**
   * Unspecified/undefined repair service type
   * Belirsiz/tanımsız onarım servis türü
   */
  Belirsiz = 'BELIRSIZ',

  /**
   * Contracted private service - Private repair shops with insurance company contracts
   * Anlaşmalı özel servis - Sigorta şirketi ile anlaşmalı özel onarım atölyeleri
   */
  AnlasmaliOzelServis = 'ANLASMALI_OZEL_SERVIS',

  /**
   * Contracted authorized service - Brand authorized services with insurance contracts
   * Anlaşmalı yetkili servis - Sigorta şirketi ile anlaşmalı marka yetkili servisleri
   */
  AnlasmaliYetkiliServis = 'ANLASMALI_YETKILI_SERVIS',

  /**
   * Authorized service - Official brand authorized service centers
   * Yetkili servis - Resmi marka yetkili servis merkezleri
   */
  YetkiliServis = 'YETKILI_SERVIS',

  /**
   * Private service - Independent repair shops
   * Özel servis - Bağımsız onarım atölyeleri
   */
  OzelServis = 'OZEL_SERVIS',

  /**
   * Insured determines - Policy holder chooses the repair service
   * Sigortalı belirler - Poliçe sahibi onarım servisini kendisi seçer
   */
  SigortaliBelirler = 'SIGORTALI_BELIRLER',
}

/**
 * Types of spare parts in Turkish insurance industry.
 * These classifications are specific to Turkish insurance regulations.
 *
 * Türk sigorta sektöründeki yedek parça türleri.
 * Bu sınıflandırmalar Türk sigorta düzenlemelerine özeldir.
 */
export enum YedekParcaTuru {
  /**
   * Unspecified/undefined spare part type
   * Belirsiz/tanımsız yedek parça türü
   */
  Belirsiz = 'BELIRSIZ',

  /**
   * Original parts - Genuine manufacturer parts (OEM)
   * Orijinal parçalar - Gerçek üretici parçaları (OEM)
   */
  OrijinalParca = 'ORIJINAL_PARCA',

  /**
   * Equivalent parts - Compatible aftermarket parts with equivalent quality
   * Eşdeğer parçalar - Eşdeğer kalitede uyumlu yan sanayi parçaları
   */
  EsdegerParca = 'ESDEGER_PARCA',
}

/**
 * Represents rental vehicle information in Turkish insurance context.
 * "Kiralık Araç" is a specific concept in Turkish motor insurance.
 *
 * Türk sigorta bağlamında kiralık araç bilgilerini temsil eder.
 * "Kiralık Araç" Türk motorlu taşıt sigortasında özel bir kavramdır.
 */
export type KiralikArac =
  | { $type: 'NONE' }
  | { $type: 'UNDEFINED' }
  | {
      $type: 'DEFINED';
      yillikKullanimSayisi?: number;
      tekSeferlikGunSayisi?: number;
      aracSegment?: AracSegment;
    };

/**
 * Represents car classification segments used internationally in automotive industry.
 * The A-F classification system is a European standard adopted globally.
 *
 * Sigorta sınıflandırmasında kullanılan araç segmentlerini temsil eder.
 * Segmentler genellikle aracın boyutuna, fiyatına ve kategorisine göre belirlenir.
 */
export enum AracSegment {
  /**
   * A Segment - Mini and city cars (e.g., Fiat 500, Renault Twingo, Volkswagen Up)
   * A Segmenti - Mini ve şehir arabaları
   */
  A = 'A',

  /**
   * B Segment - Small class cars (e.g., Ford Fiesta, Volkswagen Polo, Renault Clio)
   * B Segmenti - Küçük sınıf arabalar
   */
  B = 'B',

  /**
   * C Segment - Mid-size cars (e.g., Volkswagen Golf, Ford Focus, Toyota Corolla)
   * C Segmenti - Orta sınıf arabalar
   */
  C = 'C',

  /**
   * D Segment - Upper mid-size cars (e.g., Volkswagen Passat, Ford Mondeo, BMW 3 Series)
   * D Segmenti - Üst orta sınıf arabalar
   */
  D = 'D',

  /**
   * E Segment - Upper class cars (e.g., BMW 5 Series, Mercedes E Series, Audi A6)
   * E Segmenti - Üst sınıf arabalar
   */
  E = 'E',

  /**
   * F Segment - Luxury class cars (e.g., BMW 7 Series, Mercedes S Series, Audi A8)
   * F Segmenti - Lüks sınıf arabalar
   */
  F = 'F',

  /**
   * The replacement vehicle must be in the same segment as the insured vehicle
   * Sigortalı aracın segmenti ne ise, ikame aracın da aynı segmentte olması gerekir
   */
  SegmenteSegment = 'SEGMENTE_SEGMENT',
}

/**
 * Represents hospital network coverage levels in Turkish health insurance system.
 * Different network types provide varying levels of hospital partnerships and service coverage.
 *
 * Türk sağlık sigortası sisteminde hastane ağı kapsam seviyelerini temsil eder.
 * Farklı ağ türleri değişen hastane ortaklığı ve hizmet kapsam seviyeleri sunar.
 */
export enum HastaneAgi {
  /**
   * Unknown or undefined hospital network coverage.
   * Bilinmeyen veya tanımlanmamış hastane ağı kapsamı.
   */
  Bilinmiyor = 'BILINMIYOR',

  /**
   * Narrow coverage hospital network with basic health services.
   * Temel sağlık hizmeti sunan dar kapsam hastane ağı.
   */
  DarKapsam = 'DAR_KAPSAM',

  /**
   * Standard coverage hospital network with moderate service variety.
   * Orta düzeyde hizmet çeşitliliği sunan standart kapsam hastane ağı.
   */
  StandartKapsam = 'STANDART_KAPSAM',

  /**
   * Wide coverage hospital network with comprehensive healthcare services.
   * Kapsamlı sağlık hizmetleri sunan geniş kapsam hastane ağı.
   */
  GenisKapsam = 'GENIS_KAPSAM',
}

/**
 * Represents treatment types for Turkish complementary health insurance packages.
 * Defines whether coverage applies to inpatient-only or combined inpatient+outpatient treatment modalities.
 *
 * Türk tamamlayıcı sağlık sigortası paketleri için tedavi türlerini temsil eder.
 * Teminatın yatarak veya yatarak + ayakta tedavi modalitesinde geçerli olup olmadığını tanımlar.
 */
export enum SaglikPaketiTedaviSekli {
  /**
   * Unknown or undefined treatment type.
   * Bilinmeyen veya tanımlanmamış tedavi türü.
   */
  Bilinmiyor = 'BILINMIYOR',

  /**
   * Inpatient treatment coverage only.
   * Sadece yatarak tedavi kapsamı.
   */
  Yatarak = 'YATARAK',

  /**
   * Combined inpatient and outpatient treatment coverage.
   * Yatarak ve ayakta tedavi kapsamının birleşimi.
   */
  YatarakAyakta = 'YATARAK_AYAKTA',
}

/**
 * Represents a health insurance package configuration for Turkish complementary health insurance.
 * Defines treatment coverage types and annual outpatient treatment limits.
 *
 * Türk tamamlayıcı sağlık sigortası için sağlık sigortası paketi konfigürasyonunu temsil eder.
 * Tedavi kapsam türlerini ve yıllık ayakta tedavi limitlerini tanımlar.
 */
export interface SaglikPaketi {
  /**
   * The treatment type covered by this health package.
   * Bu sağlık paketi tarafından kapsanan tedavi türü.
   */
  readonly tedaviSekli: SaglikPaketiTedaviSekli;

  /**
   * The annual limit for outpatient treatments.
   * Ayakta tedaviler için yıllık limit.
   */
  readonly ayaktaYillikTedaviSayisi?: number;
}

/**
 * Represents types of transported cargo for Turkish cargo insurance.
 *
 * Türk kargo sigortası için taşınan yük türlerini temsil eder.
 */
export enum TasinanYuk {
  /**
   * Undefined cargo type.
   * Belirsiz yük türü.
   */
  Belirsiz = 'BELIRSIZ',

  /**
   * No specific cargo type.
   * Belirli bir yük türü yok.
   */
  Yok = 'YOK',

  /**
   * Wood logs and lumber.
   * Ağaç kütükleri ve kereste.
   */
  AgacKutukleriveKereste = 'AGAC_KUTUKLERIVE_KERESTE',

  /**
   * Fuel and petroleum products.
   * Akaryakıt ve petrol ürünleri.
   */
  Akaryakit = 'AKARYAKIT',

  /**
   * Shoes and leather goods.
   * Ayakkabı ve saraciye ürünleri.
   */
  AyakkabiSaraciye = 'AYAKKABI_SARACIYE',

  /**
   * Grocery and delicatessen products.
   * Bakkaliye ve şarküteri ürünleri.
   */
  BakkaliyeveSharkuteriUrunleri = 'BAKKALIYE_VE_SHARKUTERI_URUNLERI',

  /**
   * All kinds of stationery materials.
   * Bilumum kırtasiye malzemeleri.
   */
  BilumumKirtasiyeMalzemeleri = 'BILUMUM_KIRTASIYE_MALZEMELERI',

  /**
   * Bulk water and milk.
   * Dökme su ve süt.
   */
  DokmeSuveSut = 'DOKME_SU_VE_SUT',

  /**
   * Carpet and rugs.
   * Halı ve kilim.
   */
  HaliveKilim = 'HALI_VE_KILIM',

  /**
   * Raw, semi-finished and finished paper products.
   * Ham, yarı mamül ve mamül kağıt ürünleri.
   */
  HamYariMamulveMamulKagit = 'HAM_YARI_MAMUL_VE_MAMUL_KAGIT',

  /**
   * Ready-mix concrete.
   * Hazır beton.
   */
  HazirBeton = 'HAZIR_BETON',

  /**
   * All kinds of household appliances.
   * Her nevi ev aletleri.
   */
  HerNeviEvAletleri = 'HER_NEVI_EV_ALETLERI',

  /**
   * All kinds of bulk coal and wood.
   * Her türlü dökme kömür ve odun.
   */
  HerTurluDokmeKomurvOdun = 'HER_TURLU_DOKME_KOMUR_V_ODUN',

  /**
   * Cereals and legumes.
   * Hububat ve bakliyat.
   */
  HububatveBakliyat = 'HUBUBAT_VE_BAKLIYAT',

  /**
   * Rough construction materials.
   * Kaba inşaat malzemeleri.
   */
  KabaInsaatMalzemeleri = 'KABA_INSAAT_MALZEMELERI',

  /**
   * Tire and rubber products.
   * Lastik ve kauçuk ürünleri.
   */
  LastikKaucukUrunleri = 'LASTIK_KAUCUK_URUNLERI',

  /**
   * Liquid chemical substances.
   * Likid kimyevi maddeler.
   */
  LikidKimyeviMadde = 'LIKID_KIMYEVI_MADDE',

  /**
   * LPG gas cylinders.
   * LPG gaz tüpleri.
   */
  LpgGazTupu = 'LPG_GAZ_TUPU',

  /**
   * Machine parts and spare parts.
   * Makine aksam ve yedekleri.
   */
  MakineAksamveYedekleri = 'MAKINE_AKSAM_VE_YEDEKLERI',

  /**
   * Furniture materials.
   * Mobilya malzemesi.
   */
  MobilyaMalzemesi = 'MOBILYA_MALZEMESI',

  /**
   * Various household items.
   * Muhtelif ev eşyası.
   */
  MuhtelifEvEsyasi = 'MUHTELIF_EV_ESYASI',

  /**
   * Auto spare parts.
   * Oto yedek parçaları.
   */
  OtoYedekParcalari = 'OTO_YEDEK_PARCALARI',

  /**
   * Plastic products.
   * Plastik mamülleri.
   */
  PlastikMamulleri = 'PLASTIK_MAMULLERI',

  /**
   * Synthetic fiber products.
   * Sentetik elyaf ürünleri.
   */
  SentetikElyafUrunleri = 'SENTETIK_ELYAF_URUNLERI',

  /**
   * Synthetic plastic paint products.
   * Sentetik plastik boya ürünleri.
   */
  SentetikPlastikBoyaUrunleri = 'SENTETIK_PLASTIK_BOYA_URUNLERI',

  /**
   * Textile products.
   * Tekstil ürünleri.
   */
  TekstilUrunleri = 'TEKSTIL_URUNLERI',

  /**
   * Cleaning materials.
   * Temizlik maddeleri.
   */
  TemizlikMaddeleri = 'TEMIZLIK_MADDELERI',

  /**
   * Fresh fruits and vegetables.
   * Yaş meyve ve sebze.
   */
  YasMeyveveSebze = 'YAS_MEYVE_VE_SEBZE',
}

/**
 * Checks if a value is a CoverageValue type
 */
function isCoverageValue(value: unknown): value is CoverageValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    '$type' in value &&
    typeof (value as { $type: unknown }).$type === 'string'
  );
}

/**
 * Dynamically merges coverage objects of the same product branch.
 * Handles UNDEFINED coverage values by giving precedence to non-UNDEFINED values.
 * Ensures all coverages have the same productBranch.
 */
export function mergeCoverage(...coverages: Coverage[]): Coverage {
  if (coverages.length === 0) {
    throw new Error('Cannot merge empty coverage array');
  }

  // Filter out any null/undefined coverages
  const validCoverages = coverages.filter((coverage): coverage is Coverage => coverage != null);

  if (validCoverages.length === 0) {
    throw new Error('No valid coverages to merge');
  }

  // Get the product branch from the first coverage
  const firstCoverage = validCoverages[0]!;
  const productBranch = firstCoverage.productBranch;

  // Validate that all coverages have the same product branch
  for (const coverage of validCoverages) {
    if (coverage.productBranch !== productBranch) {
      throw new Error(
        `All coverages must have the same productBranch. Expected: ${productBranch}, but found: ${coverage.productBranch}`
      );
    }
  }

  // Helper function to merge coverage values with precedence rules
  const mergeCoverageValue = (values: (CoverageValue | undefined)[]): CoverageValue | undefined => {
    const definedValues = values.filter((value): value is CoverageValue => value != null);

    if (definedValues.length === 0) {
      return undefined;
    }

    // Priority order: non-UNDEFINED values take precedence over UNDEFINED
    // If multiple non-UNDEFINED values exist, use the last one (later coverages override earlier ones)
    const nonUndefinedValues = definedValues.filter((value) => value.$type !== 'UNDEFINED');

    if (nonUndefinedValues.length > 0) {
      // Return the last non-UNDEFINED value
      return nonUndefinedValues[nonUndefinedValues.length - 1];
    }

    // If all values are UNDEFINED, return UNDEFINED
    return { $type: 'UNDEFINED' };
  };

  // Helper function to merge non-CoverageValue properties (use last defined value)
  const mergeProperty = <T>(values: (T | undefined)[]): T | undefined => {
    const definedValues = values.filter((value): value is T => value != null);
    return definedValues.length > 0 ? definedValues[definedValues.length - 1] : undefined;
  };

  // Get all unique property keys from all coverages (excluding productBranch)
  const allKeys = new Set<string>();
  for (const coverage of validCoverages) {
    Object.keys(coverage).forEach((key) => {
      if (key !== 'productBranch') {
        allKeys.add(key);
      }
    });
  }

  // Create the merged coverage object dynamically
  const merged: Record<string, unknown> = {
    productBranch,
  };

  // Merge each property dynamically
  for (const key of allKeys) {
    const values = validCoverages.map(
      (coverage) => (coverage as unknown as Record<string, unknown>)[key]
    );

    // Check if this property contains CoverageValue objects
    const sampleValue = values.find((v) => v != null);

    if (isCoverageValue(sampleValue)) {
      // Use CoverageValue merging logic
      merged[key] = mergeCoverageValue(values as (CoverageValue | undefined)[]);
    } else {
      // Use regular property merging logic
      merged[key] = mergeProperty(values);
    }
  }

  return merged as unknown as Coverage;
}
