/**
 * @fileoverview Vehicle-related contracts and types
 * @description Vehicle management contracts for the InsurUp platform including vehicle creation, updates, and lookups
 */

import type {
  Currency,
  VehicleUtilizationStyle,
  VehicleFuelType,
  VehicleFuel,
  VehiclePlate,
  VehicleDocumentSerial,
  VehicleModel,
  VehicleAccessory,
  VehicleOldPolicy,
  LossPayeeClause,
} from "./common.js";

// ============================================================================
// VEHICLE ENUMS AND TYPES - Now imported from common.ts
// ============================================================================
// Note: Vehicle-related enums and interfaces have been moved to common.ts
// to eliminate cross-contract imports and provide better organization.

// ============================================================================
// VEHICLE REQUEST CONTRACTS
// ============================================================================

/**
 * Request contract for creating a new customer vehicle record in the InsurUp system.
 * Contains comprehensive vehicle information including identification, specifications, and insurance history.
 *
 * InsurUp'da yeni müşteri araç kaydı oluşturmak için istek sözleşmesi.
 * Tanımlama, özellikler ve sigorta geçmişi dahil kapsamlı araç bilgilerini içerir.
 */
export interface CreateCustomerVehicleRequest {
  /**
   * The unique identifier (GUID) of the customer who owns or will own this vehicle.
   * Bu araca sahip olan veya sahip olacak müşterinin benzersiz tanımlayıcısı (GUID).
   */
  readonly customerId: string;

  /**
   * The official license plate number assigned to the vehicle by Turkish traffic authorities.
   * Türk trafik makamları tarafından araca atanan resmi plaka numarası.
   */
  readonly plate: VehiclePlate;

  /**
   * The manufacturing year of the vehicle as specified by the manufacturer.
   * Üretici tarafından belirtilen aracın üretim yılı.
   */
  readonly modelYear?: number | null;

  /**
   * Reference identifier for the vehicle brand (e.g., Toyota, BMW, Ford).
   * Araç markası için referans tanımlayıcı (örn: Toyota, BMW, Ford).
   */
  readonly brandReference?: string | null;

  /**
   * Reference identifier for the specific model type within the brand.
   * Marka içindeki belirli model türü için referans tanımlayıcı.
   */
  readonly modelTypeReference?: string | null;

  /**
   * Defines how the vehicle is primarily used.
   * Aracın öncelikle nasıl kullanıldığını tanımlar.
   */
  readonly utilizationStyle: VehicleUtilizationStyle;

  /**
   * The type of fuel used by the vehicle.
   * Araç tarafından kullanılan yakıt türü.
   */
  readonly fuel?: VehicleFuel | null;

  /**
   * The unique engine serial number that identifies the specific engine installed in the vehicle.
   * Araca monte edilmiş belirli motoru tanımlayan benzersiz motor seri numarası.
   */
  readonly engine?: string | null;

  /**
   * The unique chassis number that serves as the primary identification for the vehicle structure.
   * Araç yapısı için birincil kimlik olarak hizmet eden benzersiz şasi numarası.
   */
  readonly chassis?: string | null;

  /**
   * The serial number of the official vehicle registration document issued by Turkish authorities.
   * Türk makamları tarafından düzenlenen resmi araç tescil belgesinin seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;

  /**
   * The official date when the vehicle was first registered with Turkish traffic authorities.
   * Aracın Türk trafik makamlarına ilk tescil edildiği resmi tarih.
   */
  readonly registrationDate?: string | null;

  /**
   * The total number of seats available in the vehicle as specified by the manufacturer.
   * Üretici tarafından belirtilen araçta mevcut toplam koltuk sayısı.
   */
  readonly seatNumber?: number | null;

  /**
   * Array of additional accessories and modifications installed on the vehicle beyond standard equipment.
   * Standart donanımın ötesinde araca monte edilmiş ek aksesuar ve modifikasyonların dizisi.
   */
  readonly accessories: readonly VehicleAccessory[];

  /**
   * Information about the vehicle's previous comprehensive (Kasko) insurance policy, if any.
   * Aracın varsa önceki kasko sigorta poliçesi hakkında bilgiler.
   */
  readonly kaskoOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about the vehicle's previous mandatory traffic insurance policy.
   * Aracın önceki zorunlu trafik sigortası poliçesi hakkında bilgiler.
   */
  readonly trafikOldPolicy?: VehicleOldPolicy | null;

  /**
   * Specifies the financial institution or entity that has a financial interest in the vehicle.
   * Araçta mali çıkarı olan finansal kuruluşu veya varlığı belirtir.
   */
  readonly lossPayeeClause?: LossPayeeClause | null;
}

/**
 * Request contract for updating an existing customer vehicle record in the InsurUp system.
 * Contains updated vehicle information including specifications, accessories, and insurance history.
 *
 * InsurUp'da mevcut müşteri araç kaydını güncellemek için istek sözleşmesi.
 * Özellikler, aksesuarlar ve sigorta geçmişi dahil güncellenmiş araç bilgilerini içerir.
 */
export interface UpdateCustomerVehicleRequest {
  /**
   * The unique identifier (GUID) of the customer who owns the vehicle being updated.
   * Güncellenen araca sahip olan müşterinin benzersiz tanımlayıcısı (GUID).
   */
  readonly customerId: string;

  /**
   * The unique identifier (GUID) of the specific vehicle record that needs to be updated.
   * Güncellenmesi gereken belirli araç kaydının benzersiz tanımlayıcısı (GUID).
   */
  readonly vehicleId: string;

  /**
   * The updated license plate number assigned to the vehicle by Turkish traffic authorities.
   * Türk trafik makamları tarafından araca atanan güncellenmiş plaka numarası.
   */
  readonly plate: VehiclePlate;

  /**
   * The updated manufacturing year of the vehicle.
   * Aracın güncellenmiş üretim yılı.
   */
  readonly modelYear?: number | null;

  /**
   * The updated reference identifier for the vehicle brand.
   * Araç markası için güncellenmiş referans tanımlayıcı.
   */
  readonly brandReference?: string | null;

  /**
   * The updated reference identifier for the specific model type within the brand.
   * Marka içindeki belirli model türü için güncellenmiş referans tanımlayıcı.
   */
  readonly modelTypeReference?: string | null;

  /**
   * The updated classification of how the vehicle is primarily used.
   * Aracın öncelikle nasıl kullanıldığının güncellenmiş sınıflandırması.
   */
  readonly utilizationStyle: VehicleUtilizationStyle;

  /**
   * The updated type of fuel used by the vehicle.
   * Araç tarafından kullanılan güncellenmiş yakıt türü.
   */
  readonly fuel?: VehicleFuel | null;

  /**
   * The updated serial number of the vehicle registration document.
   * Araç tescil belgesinin güncellenmiş seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;

  /**
   * The updated official registration date of the vehicle.
   * Aracın güncellenmiş resmi tescil tarihi.
   */
  readonly registrationDate?: string | null;

  /**
   * The updated engine serial number.
   * Güncellenmiş motor seri numarası.
   */
  readonly engine?: string | null;

  /**
   * The updated total number of seats in the vehicle.
   * Araçtaki güncellenmiş toplam koltuk sayısı.
   */
  readonly seatNumber?: number | null;

  /**
   * The updated chassis number of the vehicle.
   * Aracın güncellenmiş şasi numarası.
   */
  readonly chassis?: string | null;

  /**
   * The updated array of additional accessories and modifications installed on the vehicle.
   * Araca monte edilmiş ek aksesuar ve modifikasyonların güncellenmiş dizisi.
   */
  readonly accessories: readonly VehicleAccessory[];

  /**
   * Updated information about the vehicle's previous comprehensive insurance policy.
   * Aracın önceki kasko sigorta poliçesi hakkında güncellenmiş bilgiler.
   */
  readonly kaskoOldPolicy?: VehicleOldPolicy | null;

  /**
   * Updated information about the vehicle's previous mandatory traffic insurance policy.
   * Aracın önceki zorunlu trafik sigortası poliçesi hakkında güncellenmiş bilgiler.
   */
  readonly trafikOldPolicy?: VehicleOldPolicy | null;

  /**
   * Updated loss payee information for financing situations.
   * Finansman durumları için güncellenmiş rehin alacaklısı bilgileri.
   */
  readonly lossPayeeClause?: LossPayeeClause | null;
}

/**
 * Request contract for retrieving detailed information about a specific customer vehicle.
 * Used to fetch comprehensive vehicle data for insurance quotes, policy management, and vehicle verification.
 *
 * Belirli bir müşteri aracı hakkında detaylı bilgi almak için istek sözleşmesi.
 * Sigorta teklifleri, poliçe yönetimi ve araç doğrulaması için kapsamlı araç verilerini getirmek için kullanılır.
 */
export interface GetCustomerVehicleRequest {
  /**
   * Unique identifier of the customer who owns the vehicle.
   * Araca sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  readonly customerId: string;

  /**
   * Unique identifier of the vehicle to retrieve.
   * Alınacak aracın benzersiz tanımlayıcısı.
   */
  readonly vehicleId: string;
}

/**
 * Request contract for retrieving all vehicles associated with a specific customer account.
 * Used to display customer vehicle portfolio and manage multiple vehicle policies.
 *
 * Belirli bir müşteri hesabıyla ilişkili tüm araçları almak için istek sözleşmesi.
 * Müşteri araç portföyünü görüntülemek ve birden fazla araç poliçesini yönetmek için kullanılır.
 */
export interface GetCustomerVehiclesRequest {
  /**
   * The unique identifier (GUID) of the customer for whom all registered vehicles will be retrieved.
   * Tüm kayıtlı araçları alınacak müşterinin benzersiz tanımlayıcısı (GUID).
   */
  readonly customerId: string;
}

/**
 * Request contract for performing external vehicle lookup to retrieve vehicle information from third-party services.
 * Used to automatically populate vehicle details based on plate number and document information.
 *
 * Üçüncü taraf hizmetlerden araç bilgilerini almak için harici araç arama yapmak üzere istek sözleşmesi.
 * Plaka numarası ve belge bilgilerine dayanarak araç detaylarını otomatik olarak doldurmak için kullanılır.
 */
export interface ExternalLookupVehicleRequest {
  /**
   * The unique identifier (GUID) of the customer who is requesting the vehicle lookup.
   * Araç aramasını talep eden müşterinin benzersiz tanımlayıcısı (GUID).
   */
  readonly customerId: string;

  /**
   * The license plate number of the vehicle to be looked up in external databases.
   * Harici veritabanlarında aranacak aracın plaka numarası.
   */
  readonly plate: VehiclePlate;

  /**
   * Optional serial number of the vehicle registration document.
   * İsteğe bağlı araç tescil belgesi seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;
}

/**
 * Request contract for querying available vehicle model types based on brand and manufacturing year.
 * Used to retrieve filtered model options for vehicle registration and insurance quote generation.
 *
 * Marka ve üretim yılına göre mevcut araç model türlerini sorgulamak için istek sözleşmesi.
 * Araç kaydı ve sigorta teklifi oluşturma için filtrelenmiş model seçeneklerini almak için kullanılır.
 */
export interface QueryVehicleModelTypesRequest {
  /**
   * The reference identifier or code that uniquely identifies a vehicle brand in the system.
   * Sistemde bir araç markasını benzersiz şekilde tanımlayan referans tanımlayıcı veya kod.
   */
  readonly brandReference: string;

  /**
   * The manufacturing year of the vehicle used to filter available model types.
   * Mevcut model türlerini filtrelemek için kullanılan aracın üretim yılı.
   */
  readonly year: number;
}

/**
 * Request contract for querying vehicle information by brand code from insurance services.
 * Used to retrieve vehicle model data for insurance quotation and policy creation processes.
 *
 * Sigorta hizmetlerinden marka koduna göre araç bilgilerini sorgulamak için istek sözleşmesi.
 * Sigorta teklifi ve poliçe oluşturma süreçleri için araç modeli verilerini almak için kullanılır.
 */
export interface QueryVehicleByBrandCodeRequest {
  /**
   * The standardized brand code used to identify vehicle manufacturers in insurance systems.
   * Sigorta sistemlerinde araç üreticilerini tanımlamak için kullanılan standartlaştırılmış marka kodu.
   */
  readonly brandCode: string;
}

// ============================================================================
// VEHICLE RESPONSE CONTRACTS
// ============================================================================

/**
 * Response contract containing the result of a successful customer vehicle creation operation.
 * Returns the unique identifier of the newly created vehicle record for further operations.
 *
 * Başarılı müşteri aracı oluşturma işleminin sonucunu içeren yanıt sözleşmesi.
 * İleri işlemler için yeni oluşturulan araç kaydının benzersiz tanımlayıcısını döndürür.
 */
export interface CreateCustomerVehicleResult {
  /**
   * The unique identifier (GUID) assigned to the newly created vehicle record in the customer's account.
   * Müşterinin hesabında yeni oluşturulan araç kaydına atanan benzersiz tanımlayıcı (GUID).
   */
  readonly id: string;
}

/**
 * Response contract containing comprehensive details of a specific customer vehicle.
 * Provides complete vehicle information for insurance operations, policy management, and vehicle verification.
 *
 * Belirli bir müşteri aracının kapsamlı detaylarını içeren yanıt sözleşmesi.
 * Sigorta operasyonları, poliçe yönetimi ve araç doğrulaması için tam araç bilgisi sağlar.
 */
export interface GetCustomerVehicleResult {
  /**
   * Unique identifier of the vehicle record.
   * Araç kaydının benzersiz tanımlayıcısı.
   */
  readonly id: string;

  /**
   * Unique identifier of the customer who owns this vehicle.
   * Bu araca sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  readonly customerId: string;

  /**
   * Boolean indicator showing whether the vehicle has a valid license plate assigned.
   * Aracın geçerli bir plakasının olup olmadığını gösteren boolean göstergesi.
   */
  readonly hasPlate: boolean;

  /**
   * The official license plate number assigned to the vehicle by Turkish traffic authorities.
   * Türk trafik makamları tarafından araca atanan resmi plaka numarası.
   */
  readonly plate: VehiclePlate;

  /**
   * Detailed vehicle model information including brand, model type, manufacturing year,
   * and technical specifications.
   * Marka, model türü, üretim yılı ve teknik özellikler dahil detaylı araç model bilgileri.
   */
  readonly model?: VehicleModel | null;

  /**
   * Defines the primary usage pattern of the vehicle.
   * Aracın birincil kullanım desenini tanımlar.
   */
  readonly utilizationStyle: VehicleUtilizationStyle;

  /**
   * The fuel type used by the vehicle.
   * Araç tarafından kullanılan yakıt türü.
   */
  readonly fuel?: VehicleFuel | null;

  /**
   * The unique serial number of the engine installed in the vehicle.
   * Araca monte edilmiş motorun benzersiz seri numarası.
   */
  readonly engineNumber?: string | null;

  /**
   * The unique chassis number that serves as the permanent structural identifier for the vehicle.
   * Araç için kalıcı yapısal tanımlayıcı görevi gören benzersiz şasi numarası.
   */
  readonly chassisNumber?: string | null;

  /**
   * The official date when the vehicle was first registered with Turkish traffic authorities.
   * Aracın Türk trafik makamlarına ilk tescil edildiği resmi tarih.
   */
  readonly registrationDate?: string | null;

  /**
   * The total number of seats available in the vehicle as specified by the manufacturer.
   * Üretici tarafından belirtilen araçta mevcut toplam koltuk sayısı.
   */
  readonly seatNumber?: number | null;

  /**
   * The serial number of the official vehicle registration document issued by Turkish authorities.
   * Türk makamları tarafından düzenlenen resmi araç tescil belgesinin seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;

  /**
   * Comprehensive array of additional accessories, equipment, and modifications installed on the vehicle.
   * Standart üretici özelliklerinin ötesinde araca monte edilmiş ek aksesuar, donanım ve
   * modifikasyonların kapsamlı dizisi.
   */
  readonly accessories: readonly VehicleAccessory[];

  /**
   * Detailed information about the vehicle's previous comprehensive (Kasko) insurance coverage.
   * Aracın önceki kasko sigorta teminatı hakkında detaylı bilgiler.
   */
  readonly kaskoOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about the vehicle's previous mandatory traffic insurance policy.
   * Aracın önceki zorunlu trafik sigortası poliçesi hakkında bilgiler.
   */
  readonly trafikOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about any financial institution or entity that holds a secured interest in the vehicle.
   * Araçta güvence altına alınmış çıkarı bulunan herhangi bir finansal kuruluş veya varlık hakkında bilgiler.
   */
  readonly lossPayeeClause?: LossPayeeClause | null;
}

/**
 * Response contract containing customer vehicle information for portfolio display and management.
 * Provides essential vehicle details for insurance operations and customer vehicle listings.
 *
 * Portföy görüntüleme ve yönetimi için müşteri araç bilgilerini içeren yanıt sözleşmesi.
 * Sigorta operasyonları ve müşteri araç listeleri için temel araç detaylarını sağlar.
 */
export interface GetCustomerVehiclesResult {
  /**
   * The unique identifier (GUID) of the vehicle record in the customer's portfolio.
   * Müşterinin portföyündeki araç kaydının benzersiz tanımlayıcısı (GUID).
   */
  readonly id: string;

  /**
   * The unique identifier (GUID) of the customer who owns this vehicle.
   * Bu araca sahip olan müşterinin benzersiz tanımlayıcısı (GUID).
   */
  readonly customerId: string;

  /**
   * Boolean flag indicating whether the vehicle has a valid license plate assigned.
   * Aracın geçerli bir plakasının olup olmadığını gösteren boolean değer.
   */
  readonly hasPlate: boolean;

  /**
   * The official license plate number assigned to the vehicle by Turkish traffic authorities.
   * Türk trafik makamları tarafından araca atanan resmi plaka numarası.
   */
  readonly plate: VehiclePlate;

  /**
   * Comprehensive model information including brand, model type, manufacturing year,
   * and technical specifications.
   * Marka, model türü, üretim yılı ve teknik özellikler dahil kapsamlı model bilgileri.
   */
  readonly model?: VehicleModel | null;

  /**
   * Defines the primary purpose and usage pattern of the vehicle.
   * Aracın birincil amacını ve kullanım desenini tanımlar.
   */
  readonly utilizationStyle: VehicleUtilizationStyle;

  /**
   * The type of fuel used by the vehicle.
   * Araç tarafından kullanılan yakıt türü.
   */
  readonly fuel?: VehicleFuel | null;

  /**
   * The unique serial number of the engine installed in the vehicle.
   * Araca monte edilmiş motorun benzersiz seri numarası.
   */
  readonly engineNumber?: string | null;

  /**
   * The unique chassis number that serves as the primary structural identifier for the vehicle.
   * Araç için birincil yapısal tanımlayıcı görevi gören benzersiz şasi numarası.
   */
  readonly chassisNumber?: string | null;

  /**
   * The official date when the vehicle was first registered with Turkish traffic authorities.
   * Aracın Türk trafik makamlarına ilk tescil edildiği resmi tarih.
   */
  readonly registrationDate?: string | null;

  /**
   * The total number of seats available in the vehicle as specified by the manufacturer.
   * Üretici tarafından belirtilen araçta mevcut toplam koltuk sayısı.
   */
  readonly seatNumber?: number | null;

  /**
   * The serial number of the official vehicle registration document issued by Turkish authorities.
   * Türk makamları tarafından düzenlenen resmi araç tescil belgesinin seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;

  /**
   * Information about the vehicle's previous comprehensive (Kasko) insurance policy.
   * Aracın önceki kasko sigorta poliçesi hakkında bilgiler.
   */
  readonly kaskoOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about the vehicle's previous mandatory traffic insurance policy.
   * Aracın önceki zorunlu trafik sigortası poliçesi hakkında bilgiler.
   */
  readonly trafikOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about any financial institution or entity that has a secured interest in the vehicle.
   * Araçta güvence altına alınmış çıkarı olan herhangi bir finansal kuruluş veya varlık hakkında bilgiler.
   */
  readonly lossPayeeClause?: LossPayeeClause | null;
}

/**
 * Response contract containing vehicle information retrieved from external data sources.
 * Provides comprehensive vehicle details obtained through third-party lookup services for registration purposes.
 *
 * Harici veri kaynaklarından alınan araç bilgilerini içeren yanıt sözleşmesi.
 * Kayıt amaçları için üçüncü taraf arama hizmetleri aracılığıyla elde edilen kapsamlı araç detaylarını sağlar.
 */
export interface ExternalLookupVehicleResult {
  /**
   * The official date when the vehicle was first registered with Turkish traffic authorities.
   * Harici devlet veritabanlarından alınan, aracın Türk trafik makamlarına ilk tescil edildiği resmi tarih.
   */
  readonly registrationDate?: string | null;

  /**
   * The license plate number of the vehicle as confirmed by external data sources.
   * Harici veri kaynakları tarafından onaylandığı şekliyle aracın plaka numarası.
   */
  readonly plate?: VehiclePlate | null;

  /**
   * The serial number of the vehicle registration document as retrieved from official records.
   * Resmi kayıtlardan alınan araç tescil belgesinin seri numarası.
   */
  readonly documentSerial?: VehicleDocumentSerial | null;

  /**
   * Detailed vehicle model information including brand, model type, manufacturing year,
   * and technical specifications as retrieved from external automotive databases.
   * Harici otomotiv veritabanlarından alınan marka, model türü, üretim yılı ve teknik
   * özellikler dahil detaylı araç model bilgileri.
   */
  readonly model?: VehicleModel | null;

  /**
   * The unique chassis number of the vehicle as verified through external data sources.
   * Harici veri kaynakları aracılığıyla doğrulanan aracın benzersiz şasi numarası.
   */
  readonly chassis?: string | null;

  /**
   * The engine serial number of the vehicle as retrieved from official records.
   * Resmi kayıtlardan alınan aracın motor seri numarası.
   */
  readonly engine?: string | null;

  /**
   * The type of fuel used by the vehicle as specified in external databases.
   * Harici veritabanlarında belirtilen araç tarafından kullanılan yakıt türü.
   */
  readonly fuelType?: VehicleFuelType | null;

  /**
   * The current market value of the vehicle as determined by external valuation services.
   * Harici değerleme hizmetleri tarafından belirlenen aracın mevcut pazar değeri.
   */
  readonly price?: number | null;

  /**
   * The currency in which the vehicle's market value is expressed.
   * Aracın pazar değerinin ifade edildiği para birimi.
   */
  readonly currency?: Currency | null;

  /**
   * Information about the vehicle's previous comprehensive insurance policy as found in external databases.
   * Harici veritabanlarında bulunan aracın önceki kasko sigorta poliçesi hakkında bilgiler.
   */
  readonly kaskoOldPolicy?: VehicleOldPolicy | null;

  /**
   * Information about the vehicle's previous mandatory traffic insurance policy from external sources.
   * Harici kaynaklardan aracın önceki zorunlu trafik sigortası poliçesi hakkında bilgiler.
   */
  readonly trafikOldPolicy?: VehicleOldPolicy | null;

  /**
   * The classification of how the vehicle is primarily used, as determined from external records.
   * Harici kayıtlardan belirlenen aracın öncelikle nasıl kullanıldığının sınıflandırması.
   */
  readonly utilizationStyle?: VehicleUtilizationStyle | null;

  /**
   * The total number of seats in the vehicle as specified in external databases.
   * Harici veritabanlarında belirtilen araçtaki toplam koltuk sayısı.
   */
  readonly seatNumber?: number | null;
}

/**
 * Response contract containing comprehensive vehicle model information retrieved by brand code query.
 * This response includes all vehicle specifications, classifications, and insurance-related attributes
 * necessary for premium calculations, coverage assessments, and policy creation.
 *
 * Marka kodu sorgusu ile alınan kapsamlı araç modeli bilgilerini içeren yanıt sözleşmesi.
 * Bu yanıt, prim hesaplamaları, teminat değerlendirmeleri ve poliçe oluşturma için gerekli
 * tüm araç özelliklerini, sınıflandırmalarını ve sigortayla ilgili nitelikleri içerir.
 */
export interface QueryVehicleByBrandCodeResult {
  /**
   * Complete vehicle model data including technical specifications, classification details,
   * insurance categories, and regulatory information.
   * Teknik özellikler, sınıflandırma detayları, sigorta kategorileri ve düzenleyici bilgiler
   * dahil olmak üzere eksiksiz araç modeli verileri.
   */
  readonly model: VehicleModel;
}
