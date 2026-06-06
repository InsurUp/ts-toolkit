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
   * Unknown / Bilinmeyen
   */
  Unknown = 'UNKNOWN',

  /**
   * Private Car / Özel Otomobil
   */
  PrivateCar = 'PRIVATE_CAR',

  /**
   * Taxi / Taksi
   */
  Taxi = 'TAXI',

  /**
   * Route-Based Minibus / Güzergah Bazlı Minibüs
   */
  RouteBasedMinibus = 'ROUTE_BASED_MINIBUS',

  /**
   * Medium Bus / Orta Boy Otobüs
   */
  MediumBus = 'MEDIUM_BUS',

  /**
   * Large Bus / Büyük Otobüs
   */
  LargeBus = 'LARGE_BUS',

  /**
   * Pickup Truck / Pikap
   */
  PickupTruck = 'PICKUP_TRUCK',

  /**
   * Closed-Bed Pickup / Kapalı Kasa Pikap
   */
  ClosedBedPickup = 'CLOSED_BED_PICKUP',

  /**
   * Truck / Kamyon
   */
  Truck = 'TRUCK',

  /**
   * Construction Machinery / İnşaat Makinesi
   */
  ConstructionMachinery = 'CONSTRUCTION_MACHINERY',

  /**
   * Tractor / Traktör
   */
  Tractor = 'TRACTOR',

  /**
   * Trailer / Römork
   */
  Trailer = 'TRAILER',

  /**
   * Motorcycle / Motosiklet
   */
  Motorcycle = 'MOTORCYCLE',

  /**
   * Tanker / Tanker
   */
  Tanker = 'TANKER',

  /**
   * Tow Truck / Çekici
   */
  TowTruck = 'TOW_TRUCK',

  /**
   * Motorized Caravan / Motorlu Karavan
   */
  MotorizedCaravan = 'MOTORIZED_CARAVAN',

  /**
   * Towable Caravan / Çekilebilir Karavan
   */
  TowableCaravan = 'TOWABLE_CARAVAN',

  /**
   * Agricultural Machine (Excluding Tractor) / Traktör Hariç Tarım Makinesi
   */
  AgriculturalMachineExcludingTractor = 'AGRICULTURAL_MACHINE_EXCLUDING_TRACTOR',

  /**
   * Open-Body Truck / Açık Kasa Kamyon
   */
  OpenBodyTruck = 'OPEN_BODY_TRUCK',

  /**
   * Rental Car / Kiralık Otomobil
   */
  RentalCar = 'RENTAL_CAR',

  /**
   * Armored Vehicle / Zırhlı Araç
   */
  ArmoredVehicle = 'ARMORED_VEHICLE',

  /**
   * Shared Taxi (Dolmuş) / Dolmuş
   */
  MinibusSharedTaxi = 'MINIBUS_SHARED_TAXI',

  /**
   * Jeep / Cip
   */
  Jeep = 'JEEP',

  /**
   * Jeep Sport Activity Vehicle (SAV) / Cip Spor Aktivite Aracı (SAV)
   */
  JeepSAV = 'JEEP_SAV',

  /**
   * Jeep Sport Utility Vehicle (SUV) / Cip Spor Kullanım Aracı (SUV)
   */
  JeepSUV = 'JEEP_SUV',

  /**
   * Rental Jeep / Kiralık Cip
   */
  JeepRental = 'JEEP_RENTAL',

  /**
   * Jeep Used as Taxi / Taksi Olarak Kullanılan Cip
   */
  JeepTaxi = 'JEEP_TAXI',

  /**
   * Ambulance / Ambulans
   */
  Ambulance = 'AMBULANCE',

  /**
   * Fire Department Vehicle / İtfaiye Aracı
   */
  FirefighterCar = 'FIREFIGHTER_CAR',

  /**
   * Hearse / Cenaze Aracı
   */
  Hearse = 'HEARSE',

  /**
   * Chauffeured Rental Car / Şoförlü Kiralık Araç
   */
  ChauffeuredRentalCar = 'CHAUFFEURED_RENTAL_CAR',

  /**
   * Operational Rental / Operasyonel Kiralık Araç
   */
  OperationalRental = 'OPERATIONAL_RENTAL',

  /**
   * Private Minibus / Özel Minibüs
   */
  PrivateMinibus = 'PRIVATE_MINIBUS',

  /**
   * Route Minibus / Güzergah Minibüsü
   */
  RouteMinibus = 'ROUTE_MINIBUS',

  /**
   * Service Minibus / Servis Minibüsü
   */
  ServiceMinibus = 'SERVICE_MINIBUS',

  /**
   * Company Minibus / Şirket Minibüsü
   */
  CompanyMinibus = 'COMPANY_MINIBUS',

  /**
   * Rental Minibus / Kiralık Minibüs
   */
  RentalMinibus = 'RENTAL_MINIBUS',

  /**
   * Ambulance Minibus / Ambulans Minibüsü
   */
  AmbulanceMinibus = 'AMBULANCE_MINIBUS',

  /**
   * Minibus for Broadcasting / Yayın Minibüsü
   */
  MinibusBroadcastingVehicle = 'MINIBUS_BROADCASTING_VEHICLE',

  /**
   * Armored Transport Minibus / Zırhlı Nakliye Minibüsü
   */
  MinibusArmoredTransport = 'MINIBUS_ARMORED_TRANSPORT',

  /**
   * Small Bus (15-35 Passengers) / 15-35 Yolcu Kapasiteli Küçük Otobüs
   */
  SmallBus1535Passengers = 'SMALL_BUS_15_35_PASSENGERS',

  /**
   * Small Bus for Service / Servis için Küçük Otobüs
   */
  SmallBusService = 'SMALL_BUS_SERVICE',

  /**
   * Small Bus for City / Şehir içi Küçük Otobüs
   */
  SmallBusCity = 'SMALL_BUS_CITY',

  /**
   * Small Bus for Route / Güzergah için Küçük Otobüs
   */
  SmallBusRoute = 'SMALL_BUS_ROUTE',

  /**
   * Large Bus (Over 36 Passengers) / 36'dan Fazla Yolcu Kapasiteli Büyük Otobüs
   */
  LargeBus36Plus = 'LARGE_BUS_36_PLUS',

  /**
   * Dump Truck / Damperli Kamyon
   */
  DumpTruck = 'DUMP_TRUCK',

  /**
   * Refrigerated Truck / Frigorifik Kamyon
   */
  RefrigeratedTruck = 'REFRIGERATED_TRUCK',

  /**
   * Truck with Concrete Mixer / Beton Mikseri Kamyonu
   */
  TruckWithConcreteMixer = 'TRUCK_WITH_CONCRETE_MIXER',

  /**
   * Silo Truck / Silo Kamyonu
   */
  SiloTruck = 'SILO_TRUCK',

  /**
   * Truck with Concrete Pump / Beton Pompası Kamyonu
   */
  TruckWithConcretePump = 'TRUCK_WITH_CONCRETE_PUMP',

  /**
   * Rock Truck / Kaya Kamyonu
   */
  RockTruck = 'ROCK_TRUCK',

  /**
   * Truck with Crane / Vinçli Kamyon
   */
  TruckWithCrane = 'TRUCK_WITH_CRANE',

  /**
   * Heavy Machinery / Ağır Makineler
   */
  HeavyMachinery = 'HEAVY_MACHINERY',

  /**
   * Excavator / Ekskavatör
   */
  Excavator = 'EXCAVATOR',

  /**
   * Loader / Yükleyici
   */
  Loader = 'LOADER',

  /**
   * Bulldozer / Buldozer
   */
  Bulldozer = 'BULLDOZER',

  /**
   * Scraper / Skreyper
   */
  Scraper = 'SCRAPER',

  /**
   * Grader / Greyder
   */
  Grader = 'GRADER',

  /**
   * Road Roller / Yol Silindiri
   */
  RoadRoller = 'ROAD_ROLLER',

  /**
   * Mobile Crane / Mobil Vinç
   */
  MobileCrane = 'MOBILE_CRANE',

  /**
   * Indoor Forklift / İç mekan forklift
   */
  IndoorForklift = 'INDOOR_FORKLIFT',

  /**
   * Outdoor Forklift / Dış mekan forklift
   */
  OutdoorForklift = 'OUTDOOR_FORKLIFT',

  /**
   * Mobile Compressor / Mobil Kompresör
   */
  MobileCompressor = 'MOBILE_COMPRESSOR',

  /**
   * Mobile Pump / Mobil Pompa
   */
  MobilePump = 'MOBILE_PUMP',

  /**
   * Mobile Welding Machine / Mobil Kaynak Makinesi
   */
  MobileWeldingMachine = 'MOBILE_WELDING_MACHINE',

  /**
   * Combine Harvester / Biçerdöver
   */
  CombineHarvester = 'COMBINE_HARVESTER',

  /**
   * Tanker Acid Carrier / Asit Taşıyıcı Tanker
   */
  TankerAcidCarrier = 'TANKER_ACID_CARRIER',

  /**
   * Tanker Water/Fuel Carrier / Su/yakıt Taşıyıcı Tanker
   */
  TankerWaterFuelCarrier = 'TANKER_WATER_FUEL_CARRIER',

  /**
   * Tanker Explosive/Flammable Carrier / Patlayıcı/yanıcı madde Taşıyıcı Tanker
   */
  TankerExplosiveFlammable = 'TANKER_EXPLOSIVE_FLAMMABLE',

  /**
   * Tow Truck with Tractor / Çekici Traktör
   */
  TowTruckTractor = 'TOW_TRUCK_TRACTOR',

  /**
   * Tow Truck with Tanker / Tanker Çekici
   */
  TowTruckTanker = 'TOW_TRUCK_TANKER',

  /**
   * Panel/Glass Van Pickup / Panel/Camlı Van Kamyonet
   */
  PanelGlassVanKamyonet = 'PANEL_GLASS_VAN_MINUBUS',
}

/**
 * Maps each {@link VehicleUtilizationStyle} to the integer ordinal the backend
 * expects when the value is supplied as a query-string parameter.
 *
 * The backend enum is decorated with `[JsonStringEnumConverter]`, so the wire
 * string (e.g. `PRIVATE_CAR`) only binds for JSON request bodies. ASP.NET
 * query-string model binding instead parses the C# member name or the integer
 * value, so query params must send the ordinal — mirroring
 * `InsurUpApiEndpoints.cs` which renders `?vehicleUtilizationStyle={(int)value}`.
 *
 * Ordinals match the C# enum's explicit values (0-71, in declaration order).
 *
 * Her {@link VehicleUtilizationStyle} değerini, query-string parametresi olarak
 * gönderildiğinde backend'in beklediği tamsayı ordinaline eşler.
 */
export const VehicleUtilizationStyleOrdinal: Record<VehicleUtilizationStyle, number> = {
  [VehicleUtilizationStyle.Unknown]: 0,
  [VehicleUtilizationStyle.PrivateCar]: 1,
  [VehicleUtilizationStyle.Taxi]: 2,
  [VehicleUtilizationStyle.RouteBasedMinibus]: 3,
  [VehicleUtilizationStyle.MediumBus]: 4,
  [VehicleUtilizationStyle.LargeBus]: 5,
  [VehicleUtilizationStyle.PickupTruck]: 6,
  [VehicleUtilizationStyle.ClosedBedPickup]: 7,
  [VehicleUtilizationStyle.Truck]: 8,
  [VehicleUtilizationStyle.ConstructionMachinery]: 9,
  [VehicleUtilizationStyle.Tractor]: 10,
  [VehicleUtilizationStyle.Trailer]: 11,
  [VehicleUtilizationStyle.Motorcycle]: 12,
  [VehicleUtilizationStyle.Tanker]: 13,
  [VehicleUtilizationStyle.TowTruck]: 14,
  [VehicleUtilizationStyle.MotorizedCaravan]: 15,
  [VehicleUtilizationStyle.TowableCaravan]: 16,
  [VehicleUtilizationStyle.AgriculturalMachineExcludingTractor]: 17,
  [VehicleUtilizationStyle.OpenBodyTruck]: 18,
  [VehicleUtilizationStyle.RentalCar]: 19,
  [VehicleUtilizationStyle.ArmoredVehicle]: 20,
  [VehicleUtilizationStyle.MinibusSharedTaxi]: 21,
  [VehicleUtilizationStyle.Jeep]: 22,
  [VehicleUtilizationStyle.JeepSAV]: 23,
  [VehicleUtilizationStyle.JeepSUV]: 24,
  [VehicleUtilizationStyle.JeepRental]: 25,
  [VehicleUtilizationStyle.JeepTaxi]: 26,
  [VehicleUtilizationStyle.Ambulance]: 27,
  [VehicleUtilizationStyle.FirefighterCar]: 28,
  [VehicleUtilizationStyle.Hearse]: 29,
  [VehicleUtilizationStyle.ChauffeuredRentalCar]: 30,
  [VehicleUtilizationStyle.OperationalRental]: 31,
  [VehicleUtilizationStyle.PrivateMinibus]: 32,
  [VehicleUtilizationStyle.RouteMinibus]: 33,
  [VehicleUtilizationStyle.ServiceMinibus]: 34,
  [VehicleUtilizationStyle.CompanyMinibus]: 35,
  [VehicleUtilizationStyle.RentalMinibus]: 36,
  [VehicleUtilizationStyle.AmbulanceMinibus]: 37,
  [VehicleUtilizationStyle.MinibusBroadcastingVehicle]: 38,
  [VehicleUtilizationStyle.MinibusArmoredTransport]: 39,
  [VehicleUtilizationStyle.SmallBus1535Passengers]: 40,
  [VehicleUtilizationStyle.SmallBusService]: 41,
  [VehicleUtilizationStyle.SmallBusCity]: 42,
  [VehicleUtilizationStyle.SmallBusRoute]: 43,
  [VehicleUtilizationStyle.LargeBus36Plus]: 44,
  [VehicleUtilizationStyle.DumpTruck]: 45,
  [VehicleUtilizationStyle.RefrigeratedTruck]: 46,
  [VehicleUtilizationStyle.TruckWithConcreteMixer]: 47,
  [VehicleUtilizationStyle.SiloTruck]: 48,
  [VehicleUtilizationStyle.TruckWithConcretePump]: 49,
  [VehicleUtilizationStyle.RockTruck]: 50,
  [VehicleUtilizationStyle.TruckWithCrane]: 51,
  [VehicleUtilizationStyle.HeavyMachinery]: 52,
  [VehicleUtilizationStyle.Excavator]: 53,
  [VehicleUtilizationStyle.Loader]: 54,
  [VehicleUtilizationStyle.Bulldozer]: 55,
  [VehicleUtilizationStyle.Scraper]: 56,
  [VehicleUtilizationStyle.Grader]: 57,
  [VehicleUtilizationStyle.RoadRoller]: 58,
  [VehicleUtilizationStyle.MobileCrane]: 59,
  [VehicleUtilizationStyle.IndoorForklift]: 60,
  [VehicleUtilizationStyle.OutdoorForklift]: 61,
  [VehicleUtilizationStyle.MobileCompressor]: 62,
  [VehicleUtilizationStyle.MobilePump]: 63,
  [VehicleUtilizationStyle.MobileWeldingMachine]: 64,
  [VehicleUtilizationStyle.CombineHarvester]: 65,
  [VehicleUtilizationStyle.TankerAcidCarrier]: 66,
  [VehicleUtilizationStyle.TankerWaterFuelCarrier]: 67,
  [VehicleUtilizationStyle.TankerExplosiveFlammable]: 68,
  [VehicleUtilizationStyle.TowTruckTractor]: 69,
  [VehicleUtilizationStyle.TowTruckTanker]: 70,
  [VehicleUtilizationStyle.PanelGlassVanKamyonet]: 71,
};

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
   */
  readonly $type: VehicleAccessoryType;

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
