/**
 * @fileoverview Coverage-related Types and Enums - Insurance coverage types and related structures
 * @description Coverage types, values, and choices used throughout the InsurUp platform for insurance coverage configuration
 */

import type { InsuranceProductType, ProductBranch } from './common.base.js';

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
  | { $type: 'NUMBER'; value: number }
  | { $type: 'PERCENT'; value: number }
  | { $type: 'LIMITLESS' }
  | { $type: 'HIGHEST_LIMIT' };

/**
 * Union type for all insurance coverage types.
 * Represents the different types of insurance coverage available in the system.
 *
 * Tüm sigorta teminat türleri için birleşim türü.
 * Sistemde mevcut farklı sigorta teminat türlerini temsil eder.
 */
export type Coverage =
  | KaskoCoverage
  | TrafikCoverage
  | KonutCoverage
  | ImmCoverage
  | TssCoverage
  | OssCoverage
  | SaglikCoverage
  | SeyahatSaglikCoverage
  | YabanciSaglikCoverage
  | EmptyCoverage;

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
  /** Glass repair preference (InsurGateway key 5137), e.g. for Türkiye Sigorta Kasko. */
  readonly camOnarimTercihi?: CamOnarimTercihi;
  /** Deductible ratio for Quick Sigorta Kasko products. */
  readonly muafiyetOrani?: CoverageValue;
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
  readonly enflasyon?: CoverageValue;
  readonly sigortaKapsami?: SigortaKapsami;
  readonly binaYanginYildirimInfilak?: CoverageValue;
  readonly yanginMaliMesuliyet?: CoverageValue;
  readonly firtina?: CoverageValue;
  readonly karAgirligi?: CoverageValue;
  readonly duman?: CoverageValue;
  readonly yerKaymasi?: CoverageValue;
  readonly dolu?: CoverageValue;
  readonly dahiliSu?: CoverageValue;
  readonly karaVeHavaTasitlariCarpmasi?: CoverageValue;
  readonly enkazKaldirmaMasraflari?: CoverageValue;
  readonly ferdiKaza?: CoverageValue;
  readonly hukuksalKoruma?: CoverageValue;
  readonly selSuBaskini?: CoverageValue;
  readonly camKirilmasi?: CoverageValue;
  readonly hirsizlik?: CoverageValue;
  readonly kiraKaybi?: CoverageValue;
  readonly ikametgahDegisikligiMasraflari?: CoverageValue;
  readonly elektronikCihaz?: CoverageValue;
  readonly izolasyon?: CoverageValue;
  readonly tesisatVeElektrikArizalari?: CoverageValue;
  readonly cilingirHizmetleri?: CoverageValue;
  readonly kombiVeKlimaBakimi?: CoverageValue;
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
  /** Optional assistance service (Asistans Hizmeti), modelled as a CoverageValue. */
  readonly asistansHizmeti?: CoverageValue;
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
  readonly disPaketi?: CoverageValue;
  readonly diyetisyenHizmeti?: CoverageValue;
  readonly yogunBakim?: CoverageValue;
  readonly checkUpHizmeti?: CoverageValue;
  readonly psikolojikDanismanlik?: CoverageValue;
  readonly fizikTedavi?: CoverageValue;
  readonly suniUzuv?: CoverageValue;
  readonly ambulans?: CoverageValue;
  readonly yatarakTedavi?: CoverageValue;
  readonly ayaktaTedavi?: CoverageValue;
  readonly doktorMuayene?: CoverageValue;
  readonly ameliyat?: CoverageValue;
  readonly ameliyatMalzeme?: CoverageValue;
  readonly kemoterapi?: CoverageValue;
  readonly radyoterapi?: CoverageValue;
  readonly diyaliz?: CoverageValue;
  readonly evdeBakim?: CoverageValue;
  readonly yediGun24SaatTibbiDanismanlik?: CoverageValue;
  readonly dogum?: CoverageValue;
  readonly kucukMudahale?: CoverageValue;
  readonly gozPaketi?: CoverageValue;
}

/**
 * Represents mandatory motor third-party liability insurance (Trafik Sigortası) in Turkish insurance system.
 *
 * Türk sigorta sisteminde zorunlu trafik (mali sorumluluk) sigortası teminatını temsil eder.
 */
export interface TrafikCoverage {
  readonly productBranch: ProductBranch.Trafik;
  readonly maddiHasarAracBasina?: CoverageValue;
  readonly maddiHasarKazaBasina?: CoverageValue;
  readonly sakatlanmaVeOlumKisiBasina?: CoverageValue;
  readonly sakatlanmaVeOlumKazaBasina?: CoverageValue;
  readonly tedaviSaglikGiderleriKisiBasina?: CoverageValue;
  readonly tedaviSaglikGiderleriKazaBasina?: CoverageValue;
  readonly hukuksalKorumaAracaBagli?: CoverageValue;
  readonly hukuksalKorumaSurucuyeBagli?: CoverageValue;
  readonly immKombine?: CoverageValue;
  readonly ferdiKaza?: CoverageValue;
  readonly acilSaglik?: CoverageValue;
  readonly cekiciHizmeti?: CoverageValue;
  readonly aracBakimPlani?: CoverageValue;
}

/**
 * Represents private health insurance (Özel Sağlık Sigortası) coverage.
 *
 * Özel Sağlık Sigortası (OSS) teminatını temsil eder.
 */
export interface OssCoverage {
  readonly productBranch: ProductBranch.Oss;
  readonly paketSecimi?: OssPaketSecimi;
  readonly networkSecimi?: OssNetworkSecimi;
  readonly dogumTeminati?: CoverageValue;
  readonly ferdiKaza?: CoverageValue;
  readonly disTeminati?: CoverageValue;
}

/**
 * Represents health insurance (Sağlık Sigortası) coverage (the "Doktorum" packages).
 *
 * Sağlık Sigortası teminatını temsil eder ("Doktorum" paketleri).
 */
export interface SaglikCoverage {
  readonly productBranch: ProductBranch.Saglik;
  readonly paket?: DoktorumPaket;
  readonly yatarakTedavi?: CoverageValue;
  readonly onlineDoktor?: CoverageValue;
  readonly onlineDiyetisen?: CoverageValue;
  readonly onlinePsikolog?: CoverageValue;
  readonly yerindeEvdeLaboratuvarHizmetleri?: CoverageValue;
  readonly yerindeLaboratuvarHizmetleri?: CoverageValue;
}

/**
 * Represents travel health insurance (Seyahat Sağlık Sigortası) coverage.
 *
 * Seyahat Sağlık Sigortası teminatını temsil eder.
 */
export interface SeyahatSaglikCoverage {
  readonly productBranch: ProductBranch.Seyahat;
  readonly tibbiTedavi?: CoverageValue;
  readonly tibbiAmacliNakil?: CoverageValue;
  readonly vefatCenazeNakli?: CoverageValue;
  readonly konaklamaSuresininUzatilmasi?: CoverageValue;
  readonly tibbiDanismanlik?: CoverageValue;
  readonly taburcuSonrasiDonus?: CoverageValue;
  readonly seyahatIptali?: CoverageValue;
  readonly bagajKaybiHasari?: CoverageValue;
  readonly acilMesajIletimi?: CoverageValue;
  readonly refakatciSeyahati?: CoverageValue;
  readonly hirsizlikGasp?: CoverageValue;
  readonly gidaZehirlenmesi?: CoverageValue;
  readonly ilacGonderimi?: CoverageValue;
  readonly hukukiDanismanlik?: CoverageValue;
  readonly bagajGecikmesi?: CoverageValue;
  readonly kefalet?: CoverageValue;
  readonly covidCoverage?: CoverageValue;
}

/**
 * Represents foreign health insurance (Yabancı Sağlık Sigortası) coverage.
 *
 * Yabancı Sağlık Sigortası teminatını temsil eder.
 */
export interface YabanciSaglikCoverage {
  readonly productBranch: ProductBranch.YabanciSaglik;
  readonly hastaneAgi?: HastaneAgi;
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
 * A single row of a {@link CoverageTable}: a coverage definition optionally scoped to a specific
 * insurance company and/or product integration type. Mirrors the backend `CoverageTableRow`.
 *
 * Bir {@link CoverageTable} satırı: isteğe bağlı olarak belirli bir sigorta şirketine ve/veya ürün
 * entegrasyon türüne bağlı teminat tanımı. Backend `CoverageTableRow` ile eşleşir.
 */
export interface CoverageTableRow {
  /** The insurance coverage definition for this row. */
  readonly coverage: Coverage;
  /** Optional insurance company this row applies to (null = generic). */
  readonly insuranceCompanyId?: number | null;
  /** Optional product integration type this row applies to (null = generic). */
  readonly type?: InsuranceProductType | null;
}

/**
 * A table of coverages organized by insurance company and product type (rows). All rows must belong
 * to the same product branch. Serializes as a flat array of {@link CoverageTableRow}, matching the
 * backend `CoverageTable` JSON shape.
 *
 * Sigorta şirketi ve ürün türüne göre düzenlenmiş teminat tablosu (satırlar). Tüm satırlar aynı ürün
 * branşına ait olmalıdır. Backend `CoverageTable` JSON şekliyle eşleşecek şekilde düz bir
 * {@link CoverageTableRow} dizisi olarak serileştirilir.
 */
export type CoverageTable = readonly CoverageTableRow[];

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
      yillikKullanimSayisi?: number | null;
      tekSeferlikGunSayisi?: number | null;
      /** Vehicle segment requirement; `null` means no specific segment ("Yok"). */
      aracSegment?: AracSegment | null;
      /** Parts coverage flag — true = "Pert Dahil", false = "Pert Hariç", null/undefined = standard. */
      pertDahil?: boolean | null;
      /** Special rental vehicle type requirements (electric, commercial). */
      kiralikAracTipler?: readonly KiralikAracTip[];
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
 * Special rental vehicle types for "Kiralık Araç" (rental vehicle) coverage.
 * Defines vehicle categories that may carry different rental terms or conditions.
 *
 * "Kiralık Araç" teminatı için özel araç türleri.
 * Farklı kiralama şartları veya koşulları olabilecek araç kategorilerini tanımlar.
 */
export enum KiralikAracTip {
  /**
   * Electric vehicle - powered by electric motors.
   * Elektrikli araç - elektrik motorları ile çalışan araçlar.
   */
  ElektrikliArac = 'ELEKTRIKLI_ARAC',

  /**
   * Commercial vehicle - designed for business or commercial use.
   * Ticari araç - iş veya ticari kullanım için tasarlanmış araçlar.
   */
  TicariArac = 'TICARI_ARAC',
}

/**
 * Glass repair service preference for Kasko coverage (InsurGateway key 5137).
 * Determines which type of glass repair service will be used, independently of the glass deductible.
 *
 * Kasko teminatı için cam onarım servisi tercihi (5137). Cam muafiyetinden bağımsız olarak
 * hangi tür cam onarım servisinin kullanılacağını belirler.
 */
export enum CamOnarimTercihi {
  /**
   * Unspecified/undefined glass repair preference.
   * Belirsiz/tanımsız cam onarım tercihi.
   */
  Belirsiz = 'BELIRSIZ',

  /**
   * Contracted glass repair service.
   * Anlaşmalı cam servisi.
   */
  AnlasmaliCamServisi = 'ANLASMALI_CAM_SERVISI',

  /**
   * No glass repair preference (coverage not requested).
   * Cam onarım tercihi yok.
   */
  Hayir = 'HAYIR',

  /**
   * Any glass repair service can be used.
   * Tüm servisler kullanılabilir.
   */
  TumServisler = 'TUM_SERVISLER',
}

/**
 * Insurance scope for home (Konut) insurance — whether the policy covers the building, the contents, or both.
 *
 * Konut sigortasında kapsam türü — poliçenin binayı, eşyayı veya her ikisini kapsadığını belirtir.
 */
export enum SigortaKapsami {
  /**
   * Unknown or undefined scope.
   * Bilinmeyen veya tanımlanmamış kapsam.
   */
  Bilinmiyor = 'BILINMIYOR',

  /**
   * Both the residential building and the household contents.
   * Hem konut (bina) hem de ev eşyası.
   */
  KonutVeEsya = 'KONUT_VE_ESYA',

  /**
   * Household contents only.
   * Yalnızca ev eşyası.
   */
  SadeceEsya = 'SADECE_ESYA',

  /**
   * Residential building only.
   * Yalnızca konut (bina).
   */
  SadeceKonut = 'SADECE_KONUT',
}

/**
 * Health insurance package selection for {@link SaglikCoverage} ("Doktorum" packages).
 *
 * {@link SaglikCoverage} için sağlık sigortası paketi seçimi ("Doktorum" paketleri).
 */
export enum DoktorumPaket {
  /** No package selected. / Paket seçilmemiş. */
  None = 'NONE',

  /** Package 1 — online doctor. / Paket 1 — online doktor. */
  Paket1OnlineDoktor = 'PAKET_1_ONLINE_DOKTOR',

  /** Package 2 — on-site laboratory services. / Paket 2 — yerinde laboratuvar hizmetleri. */
  Paket2YerindeLaboratuvar = 'PAKET_2_YERINDE_LABORATUVAR_HIZMETLERI',

  /** Package 3 — on-site/at-home laboratory services. / Paket 3 — yerinde/evde laboratuvar hizmetleri. */
  Paket3YerindeEvdeLaboratuvar = 'PAKET_3_YERINDE_EVDE_LABORATUVAR_HIZMETLERI',
}

/**
 * Package selection for private health insurance ({@link OssCoverage}).
 *
 * Özel sağlık sigortası ({@link OssCoverage}) için paket seçimi.
 */
export enum OssPaketSecimi {
  /** Not specified. / Belirtilmedi. */
  Belirtilmedi = 'BELIRTILMEDI',

  /** Inpatient. / Yatarak. */
  OssYatarak = 'OSS_YATARAK',

  /** Outpatient, unlimited. / Ayakta, limitsiz. */
  OssAyaktaLimitsiz = 'OSS_AYAKTA_LIMITSIZ',

  /** Outpatient, limited. / Ayakta, limitli. */
  OssAyaktaLimitli = 'OSS_AYAKTA_LIMITLI',

  /** Outpatient. / Ayakta. */
  OssAyakta = 'OSS_AYAKTA',

  /** Inpatient and outpatient. / Yatarak ve ayakta. */
  OssYatarakAyakta = 'OSS_YATARAK_AYAKTA',
}

/**
 * Hospital network selection for private health insurance ({@link OssCoverage}).
 *
 * Özel sağlık sigortası ({@link OssCoverage}) için network (hastane ağı) seçimi.
 */
export enum OssNetworkSecimi {
  /** Not specified. / Belirtilmedi. */
  Belirtilmedi = 'BELIRTILMEDI',

  /** Economic network. / Ekonomik network. */
  OssEkonomikNetwork = 'OSS_EKONOMIK_NETWORK',

  /** Standard network. / Standart network. */
  OssStandartNetwork = 'OSS_STANDART_NETWORK',

  /** Wide-coverage network. / Geniş kapsamlı network. */
  OssGenisKapsamliNetwork = 'OSS_GENIS_KAPSAMLI_NETWORK',

  /** Full network. / Full network. */
  OssFullNetwork = 'OSS_FULL_NETWORK',
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
