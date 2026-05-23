/**
 * @fileoverview Common Vehicle Types - Vehicle-related types and enums
 * @description Vehicle data structures, models, and enums used throughout the InsurUp platform
 */

import type { InsuranceParameter } from './common.base.js';
import type { LossPayeeClause } from './common.property.js';

// ============================================================================
// VEHICLE-RELATED ENUMS
// ============================================================================

/**
 * Vehicle Utilization Styles
 *
 * Comprehensive classification of vehicle usage patterns that determines insurance risk profiles,
 * premium calculations, and regulatory requirements. Different utilization styles have varying risk
 * factors including commercial vs. private use, passenger capacity, cargo types, and operational
 * environments. This classification is essential for proper underwriting and compliance with Turkish
 * traffic and insurance regulations.
 *
 * Sigorta risk profillerini, prim hesaplamalarını ve yasal gereksinimleri belirleyen araç
 * kullanım şekillerinin kapsamlı sınıflandırması. Farklı kullanım tarzları ticari vs. özel kullanım,
 * yolcu kapasitesi, kargo türleri ve operasyonel ortamlar dahil değişen risk faktörlerine sahiptir.
 * Bu sınıflandırma uygun sigorta aracılık hizmetleri ve Türk trafik ve sigorta yönetmeliklerine
 * uyum için gereklidir.
 */
export enum VehicleUtilizationStyle {
  /**
   * Vehicle utilization style is unknown or not yet determined.
   * Araç kullanım tarzı bilinmiyor veya henüz belirlenmedi.
   */
  Unknown = 'UNKNOWN',

  /**
   * Private passenger car for personal transportation.
   * Kişisel ulaşım için özel binek otomobil.
   */
  PrivateCar = 'PRIVATE_CAR',

  /**
   * Commercial taxi service for passenger transportation.
   * Yolcu taşımacılığı için ticari taksi hizmeti.
   */
  Taxi = 'TAXI',

  /**
   * Route-based minibus service for scheduled passenger transport.
   * Planlı yolcu taşımacılığı için güzergah bazlı minibüs hizmeti.
   */
  RouteBasedMinibus = 'ROUTE_BASED_MINIBUS',

  /**
   * Medium-sized bus for passenger transportation.
   * Yolcu taşımacılığı için orta boy otobüs.
   */
  MediumBus = 'MEDIUM_BUS',

  /**
   * Large bus for high-capacity passenger transportation.
   * Yüksek kapasiteli yolcu taşımacılığı için büyük otobüs.
   */
  LargeBus = 'LARGE_BUS',

  /**
   * Pickup truck for cargo and utility purposes.
   * Kargo ve hizmet amaçları için kamyonet.
   */
  PickupTruck = 'PICKUP_TRUCK',

  /**
   * Panel van for cargo transportation.
   * Kargo taşımacılığı için panel van.
   */
  PanelVan = 'PANEL_VAN',

  /**
   * Truck for heavy cargo transportation.
   * Ağır kargo taşımacılığı için kamyon.
   */
  Truck = 'TRUCK',

  /**
   * Tractor unit for pulling trailers.
   * Römork çekmek için çekici.
   */
  Tractor = 'TRACTOR',

  /**
   * Motorcycle for personal transportation.
   * Kişisel ulaşım için motosiklet.
   */
  Motorcycle = 'MOTORCYCLE',

  /**
   * Rental car for temporary use.
   * Geçici kullanım için kiralık araç.
   */
  RentalCar = 'RENTAL_CAR',

  /**
   * Armored vehicle for security and protection services.
   * Güvenlik ve koruma hizmetleri için zırhlı araç.
   */
  ArmoredVehicle = 'ARMORED_VEHICLE',

  /**
   * Shared taxi minibus (dolmuş) for public transportation.
   * Toplu taşıma için dolmuş minibüs.
   */
  MinibusSharedTaxi = 'MINIBUS_SHARED_TAXI',

  /**
   * Jeep for off-road and general purpose use.
   * Arazi ve genel amaçlı kullanım için jeep.
   */
  Jeep = 'JEEP',

  /**
   * Sport Activity Vehicle (SAV) jeep for recreational use.
   * Rekreasyonel kullanım için Spor Aktivite Aracı (SAV) jeep.
   */
  JeepSAV = 'JEEP_SAV',

  /**
   * Sport Utility Vehicle (SUV) jeep for versatile use.
   * Çok amaçlı kullanım için Spor Kullanım Aracı (SUV) jeep.
   */
  JeepSUV = 'JEEP_SUV',

  /**
   * Hearse for funeral services.
   * Cenaze hizmetleri için cenaze arabası.
   */
  Hearse = 'HEARSE',

  /**
   * Rental car with chauffeur service.
   * Şoförlü kiralık araç hizmeti.
   */
  ChauffeuredRentalCar = 'CHAUFFEURED_RENTAL_CAR',

  /**
   * Operational rental for business fleet use.
   * İş filo kullanımı için operasyonel kiralık araç.
   */
  OperationalRental = 'OPERATIONAL_RENTAL',

  /**
   * Private minibus for personal or family use.
   * Kişisel veya aile kullanımı için özel minibüs.
   */
  PrivateMinibus = 'PRIVATE_MINIBUS',

  /**
   * Route minibus for scheduled public transportation.
   * Planlı toplu taşıma için güzergah minibüsü.
   */
  RouteMinibus = 'ROUTE_MINIBUS',

  /**
   * Service minibus for employee or student transportation.
   * Çalışan veya öğrenci taşımacılığı için servis minibüsü.
   */
  ServiceMinibus = 'SERVICE_MINIBUS',
}

/**
 * Vehicle Fuel Types
 *
 * Defines the various fuel types that vehicles can use, which affects insurance risk assessment,
 * premium calculations, and coverage terms. Different fuel types have varying risk profiles,
 * environmental considerations, and replacement costs that insurers must account for when
 * determining coverage and pricing.
 *
 * Araçların kullanabileceği çeşitli yakıt türlerini tanımlar, bu da sigorta risk değerlendirmesi,
 * prim hesaplamaları ve kapsam koşullarını etkiler. Farklı yakıt türlerinin değişen risk profilleri,
 * çevresel faktörleri ve ikame maliyetleri vardır, sigortacıların kapsam ve fiyatlandırma belirlerken
 * hesaba katması gereken faktörlerdir.
 */
export enum VehicleFuelType {
  /**
   * Gasoline-powered vehicles using petrol fuel.
   * Benzin yakıtı kullanan benzinli araçlar.
   */
  Gasoline = 'GASOLINE',

  /**
   * Diesel-powered vehicles using diesel fuel.
   * Dizel yakıtı kullanan dizel araçlar.
   */
  Diesel = 'DIESEL',

  /**
   * LPG (Liquefied Petroleum Gas) powered vehicles.
   * LPG (Sıvılaştırılmış Petrol Gazı) yakıtlı araçlar.
   */
  Lpg = 'LPG',

  /**
   * Electric vehicles powered by battery systems.
   * Batarya sistemleri ile çalışan elektrikli araçlar.
   */
  Electric = 'ELECTRIC',

  /**
   * Vehicles with both LPG and gasoline fuel systems.
   * Hem LPG hem benzin yakıt sistemine sahip araçlar.
   */
  LpgGasoline = 'LPG_GASOLINE',

  /**
   * Hybrid vehicles combining electric and conventional fuel systems.
   * Elektrik ve geleneksel yakıt sistemlerini birleştiren hibrit araçlar.
   */
  Hybrid = 'HYBRID',
}

/**
 * Vehicle Accessory Types
 *
 * Defines the categories of aftermarket accessories that can be added to vehicles and covered under
 * insurance policies. These accessories add value to the vehicle and require separate coverage consideration
 * for comprehensive insurance protection. Proper categorization helps determine accurate replacement costs.
 *
 * Araçlara eklenebilecek ve sigorta poliçeleri kapsamında kapsanabilecek sonradan eklenen aksesuar
 * kategorilerini tanımlar. Bu aksesuarlar araca değer katar ve kapsamlı sigorta koruması için ayrı
 * kapsam değerlendirmesi gerektirir. Uygun kategorizasyon doğru ikame maliyetlerini belirlemeye yardımcı olur.
 */
export enum VehicleAccessoryType {
  /**
   * Audio systems and sound equipment installed in the vehicle.
   * Araca monte edilen ses sistemleri ve ses ekipmanları.
   */
  Audio = 'audio',

  /**
   * Display screens and navigation systems installed in the vehicle.
   * Araca monte edilen ekran ve navigasyon sistemleri.
   */
  Display = 'display',

  /**
   * Other types of vehicle accessories not classified as audio or display systems.
   * Ses veya ekran sistemleri olarak sınıflandırılmayan diğer araç aksesuar türleri.
   */
  Other = 'other',
}

// ============================================================================
// VEHICLE-RELATED INTERFACES
// ============================================================================

/**
 * Vehicle fuel information
 *
 * Comprehensive fuel system information for vehicles including fuel type and LPG-specific
 * configurations. LPG vehicles require additional details such as whether the system is custom-installed
 * and the installation cost, which affects insurance coverage and premium calculations. This information
 * is crucial for proper risk assessment and coverage determination.
 *
 * Yakıt türü ve LPG'ye özgü konfigürasyonlar dahil araçlar için kapsamlı yakıt sistemi bilgileri.
 * LPG araçlar sistemin özel olarak monte edilip edilmediği ve montaj maliyeti gibi ek detaylar gerektirir,
 * bu da sigorta kapsamını ve prim hesaplamalarını etkiler. Bu bilgiler uygun risk değerlendirmesi ve
 * kapsam belirlenmesi için kritiktir.
 */
export interface VehicleFuel {
  /**
   * The fuel type of the vehicle.
   * Aracın yakıt türü.
   */
  readonly type: VehicleFuelType;

  /**
   * Whether the vehicle has a custom LPG installation (applicable for LPG and LPG-Gasoline vehicles).
   * Aracın özel LPG montajına sahip olup olmadığı (LPG ve LPG-Benzin araçları için geçerlidir).
   */
  readonly customLpg?: boolean | null;

  /**
   * The price of custom LPG installation if applicable.
   * Varsa özel LPG montajının fiyatı.
   */
  readonly customLpgPrice?: number | null;
}

/**
 * Vehicle license plate information
 *
 * Represents the Turkish vehicle license plate system consisting of a city code (1-81 representing
 * Turkish provinces) and an optional alphanumeric plate code (up to 6 characters). The city code
 * indicates the province where the vehicle was first registered. This information is essential for
 * vehicle identification, insurance coverage determination, and compliance with Turkish traffic regulations.
 *
 * Şehir kodu (Türk illerini temsil eden 1-81) ve isteğe bağlı alfanümerik plaka kodundan
 * (6 karaktere kadar) oluşan Türk araç plaka sistemini temsil eder. Şehir kodu, aracın ilk tescil
 * edildiği ili gösterir. Bu bilgiler araç tanımlaması, sigorta kapsamı belirlenmesi ve Türk trafik
 * yönetmeliklerine uyum için gereklidir.
 */
export interface VehiclePlate {
  /**
   * Turkish city code (1-81 representing provinces).
   * Türk şehir kodunu (illeri temsil eden 1-81).
   */
  readonly city: number;

  /**
   * Optional alphanumeric plate code (up to 6 characters).
   * İsteğe bağlı alfanümerik plaka kodu (6 karaktere kadar).
   */
  readonly code?: string | null;
}

/**
 * Vehicle registration document serial information
 *
 * Represents the serial number of vehicle registration documents used in the Turkish vehicle registration
 * system. This unique identifier consists of a 2-letter alphabetic code followed by a 6-digit numeric sequence.
 * The document serial is essential for vehicle identification in insurance processes, helping to verify the
 * legitimacy of vehicle registration and prevent fraud. It serves as a secondary identification method
 * alongside the chassis number.
 *
 * Türk araç tescil sisteminde kullanılan araç tescil belgelerinin seri numarasını temsil eder. Bu benzersiz
 * tanımlayıcı, 2 harfli alfabetik kod ve ardından 6 haneli sayısal diziden oluşur. Belge seri numarası,
 * sigorta süreçlerinde araç tanımlaması için gereklidir, araç tescilinin meşruiyetini doğrulamaya ve
 * dolandırıcılığı önlemeye yardımcı olur. Şasi numarasının yanında ikincil tanımlama yöntemi olarak hizmet eder.
 */
export interface VehicleDocumentSerial {
  /**
   * The 2-letter alphabetic code of the document serial.
   * Belge seri numarasının 2 harfli alfabetik kodu.
   */
  readonly code: string;

  /**
   * The 6-digit numeric part of the document serial.
   * Belge seri numarasının 6 haneli sayısal kısmı.
   */
  readonly number: string;
}

/**
 * Vehicle model information
 *
 * Complete vehicle identification including manufacturing year, brand, and specific model type.
 * This information is essential for insurance underwriting as it determines vehicle value, safety
 * ratings, theft risk, repair costs, and appropriate coverage terms. The combination of year,
 * brand, and type creates a unique vehicle profile for accurate risk assessment and pricing.
 *
 * Üretim yılı, marka ve belirli model türü dahil eksiksiz araç tanımlaması. Bu bilgiler,
 * araç değeri, güvenlik puanları, hırsızlık riski, tamir maliyetleri ve uygun kapsam koşullarını
 * belirlediği için sigorta aracılık hizmetleri için gereklidir. Yıl, marka ve tip kombinasyonu
 * doğru risk değerlendirmesi ve fiyatlandırma için benzersiz araç profili oluşturur.
 */
export interface VehicleModel {
  /**
   * The vehicle brand information.
   * Araç marka bilgileri.
   */
  readonly brand: InsuranceParameter;

  /**
   * The manufacturing year of the vehicle (must be between 1900 and current year).
   * Aracın üretim yılı (1900 ile mevcut yıl arasında olmalıdır).
   */
  readonly year: number;

  /**
   * The specific vehicle type/model information.
   * Belirli araç türü/model bilgileri.
   */
  readonly type: InsuranceParameter;
}

/**
 * Vehicle accessory base interface
 *
 * Base interface that defines the common structure for all types of vehicle accessories.
 * Vehicle accessories are aftermarket additions that increase the vehicle's value and may require
 * separate insurance coverage. This interface ensures proper categorization and value tracking for
 * insurance purposes.
 *
 * Tüm araç aksesuarı türleri için ortak yapıyı tanımlayan temel arayüz. Araç aksesuarları
 * aracın değerini artıran ve ayrı sigorta kapsamı gerektirebilecek sonradan eklenen ürünlerdir.
 * Bu arayüz sigorta amaçları için uygun kategorizasyon ve değer takibini sağlar.
 */
export interface VehicleAccessory {
  /**
   * The type of vehicle accessory.
   * Araç aksesuarının türü.
   *
   * Discriminated by `type`. The SDK client maps this to/from the backend's
   * `$type` discriminator on the wire.
   */
  readonly type: VehicleAccessoryType;

  /**
   * The total price/value of the accessory for insurance coverage calculation.
   * Sigorta kapsamı hesaplaması için aksesuarın toplam fiyatı/değeri.
   */
  readonly price: number;
}

/**
 * Vehicle previous insurance policy information
 *
 * Contains complete information about a vehicle's previous insurance coverage including policy numbers,
 * renewal information, insurance company details, and agent information. This data is crucial for
 * maintaining insurance continuity, determining no-claims bonuses, assessing risk history, and
 * preventing insurance fraud. Required for policy transfers and renewals in the Turkish insurance market.
 *
 * Poliçe numaraları, yenileme bilgileri, sigorta şirketi detayları ve acente bilgileri dahil
 * aracın önceki sigorta kapsamı hakkında eksiksiz bilgileri içerir. Bu veriler sigorta sürekliliğini
 * korumak, hasarsızlık indirimi belirlemek, risk geçmişini değerlendirmek ve sigorta dolandırıcılığını
 * önlemek için kritiktir. Türk sigorta piyasasında poliçe devri ve yenilemeler için gereklidir.
 */
export interface VehicleOldPolicy {
  /**
   * Insurance company's policy number (6-20 digit string; leading zeros preserved).
   * Sigorta şirketinin poliçe numarası (6-20 haneli string; baştaki sıfırlar korunur).
   */
  readonly insuranceCompanyPolicyNumber: string;

  /**
   * Insurance company's renewal number (0-9).
   * Sigorta şirketinin yenileme numarası (0-9).
   */
  readonly insuranceCompanyRenewalNumber: number;

  /**
   * Insurance company's reference code.
   * Sigorta şirketinin referans kodu.
   */
  readonly insuranceCompanyReference: string;

  /**
   * Agent number associated with the policy (3-18 alphanumeric characters,
   * with an optional single internal slash).
   * Poliçe ile ilişkili acente numarası (3-18 alfanümerik karakter,
   * isteğe bağlı tek iç slash içerebilir).
   */
  readonly agentNumber: string;

  /**
   * Policy end date if available.
   * Varsa poliçe bitiş tarihi.
   */
  readonly endDate?: string | null;
}

/**
 * Vehicle Engine Information
 * Araç Motor Bilgileri
 *
 * Represents a vehicle engine number for unique engine identification and vehicle verification.
 * Used in insurance systems to accurately identify and track vehicle engines for coverage and claims.
 */
export interface VehicleEngine {
  /**
   * The engine number of the vehicle (6-40 characters)
   * Aracın motor numarası (6-40 karakter)
   */
  readonly number: string;
}

/**
 * Vehicle Chassis Information
 * Araç Şasi Bilgileri
 *
 * Represents a vehicle chassis number for unique vehicle identification.
 * Used in insurance systems to properly identify and track vehicles across policies and claims.
 */
export interface VehicleChassis {
  /**
   * The chassis number of the vehicle (4-17 characters)
   * Aracın şasi numarası (4-17 karakter)
   */
  readonly number: string;
}

/**
 * Vehicle Registration Date
 * Araç Tescil Tarihi
 *
 * Represents the official registration date of a vehicle in the Turkish vehicle registration system.
 * Used for determining vehicle age, depreciation calculations, and insurance coverage eligibility.
 */
export interface VehicleRegistrationDate {
  /**
   * The registration date value
   * Tescil tarihi değeri
   */
  readonly value: string; // DateOnly in C# - using string for JSON compatibility
}

/**
 * Vehicle Seat Number
 * Araç Koltuk Sayısı
 *
 * Represents the number of seats in a vehicle for insurance classification and premium calculation.
 * Used to determine vehicle category and appropriate coverage terms based on passenger capacity.
 */
export interface VehicleSeatNumber {
  /**
   * Number of seats in the vehicle (1-50)
   * Araçtaki koltuk sayısı (1-50)
   */
  readonly value: number; // byte in C# but number in TypeScript
}

/**
 * Vehicle information snapshot for proposals
 * Teklifler için araç bilgisi anlık görüntüsü
 *
 * Represents comprehensive vehicle information captured in insurance proposal snapshots.
 * Contains all physical, technical, and legal characteristics of a vehicle required for insurance underwriting.
 *
 * NOTE: This interface should match the exact C# ProposalSnapshotVehicle structure.
 * Individual property types should be properly defined based on their C# counterparts.
 */
export interface ProposalSnapshotVehicle {
  /**
   * Unique identifier for the vehicle
   * Araç için benzersiz tanımlayıcı
   */
  readonly id: string;

  /**
   * Vehicle license plate information
   * Araç plaka bilgileri
   */
  readonly plate: VehiclePlate;

  /**
   * Vehicle model information including make, model, and year
   * Marka, model ve yıl dahil araç model bilgileri
   */
  readonly model: VehicleModel;

  /**
   * How the vehicle is utilized (personal, commercial, taxi, etc.)
   * Aracın nasıl kullanıldığı (kişisel, ticari, taksi, vb.)
   */
  readonly utilizationStyle: VehicleUtilizationStyle;

  /**
   * Vehicle fuel type
   * Araç yakıt tipi
   */
  readonly fuel?: VehicleFuel;

  /**
   * Vehicle engine information
   * Araç motor bilgileri
   */
  readonly engine: VehicleEngine;

  /**
   * Vehicle chassis information
   * Araç şasi bilgileri
   */
  readonly chassis: VehicleChassis;

  /**
   * Vehicle registration date
   * Araç tescil tarihi
   */
  readonly registrationDate: VehicleRegistrationDate;

  /**
   * The date when the vehicle was first issued to traffic. May differ from
   * `registrationDate` for re-registered or transferred vehicles.
   *
   * Aracın ilk trafiğe çıkış tarihi. Yeniden tescil edilen veya devredilen
   * araçlar için `registrationDate` değerinden farklı olabilir.
   */
  readonly firstRegistrationDate?: VehicleRegistrationDate | null;

  /**
   * Number of seats in the vehicle
   * Araçtaki koltuk sayısı
   */
  readonly seatNumber: VehicleSeatNumber;

  /**
   * Vehicle accessories and additional equipment
   * Araç aksesuarları ve ek donanım
   */
  readonly accessories: VehicleAccessory[];

  /**
   * Vehicle document serial number
   * Araç belge seri numarası
   */
  readonly documentSerial?: VehicleDocumentSerial;

  /**
   * Information about existing vehicle insurance policy
   * Mevcut araç sigorta poliçesi bilgileri
   */
  readonly oldPolicy?: VehicleOldPolicy;

  /**
   * Loss payee clause for financing arrangements
   * Finansman düzenlemeleri için lehtar klozu
   */
  readonly lossPayeeClause?: LossPayeeClause;

  /**
   * Whether the vehicle has a valid license plate and document serial number
   * Aracın geçerli bir plakası ve belge seri numarası olup olmadığı
   */
  readonly hasPlate: boolean;

  /**
   * Whether the vehicle is designated as a disabled vehicle.
   * Aracın engelli aracı olarak belirlenip belirlenmediği.
   */
  readonly isDisabledVehicle?: boolean | null;
}
