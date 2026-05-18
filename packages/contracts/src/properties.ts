/**
 * Property Management Contracts
 *
 * Property management operations for handling customer properties, Turkish address hierarchy queries,
 * DASK earthquake insurance lookups, and property-based insurance operations within the real estate insurance ecosystem.
 *
 * Gayrimenkul sigorta ekosistemi içinde müşteri mülklerini yönetme, Türk adres hiyerarşisi sorguları, DASK deprem
 * sigortası aramaları ve mülk tabanlı sigorta operasyonları için kapsamlı mülk yönetimi işlemlerini sağlar.
 */

import type {
  PropertyStructure,
  PropertyDamageStatus,
  PropertyUtilizationStyle,
  PropertyOwnershipType,
  PropertyFloor,
  PropertyAddress,
  DaskOldPolicy,
  LossPayeeClause,
} from './common.js';

// ===== PROPERTY ENUMS AND TYPES - Now imported from common.ts =====
// Note: Property-related enums and interfaces have been moved to common.ts
// to eliminate cross-contract imports and provide better organization.

// ===== ADDRESS PARAMETER REQUESTS =====

/**
 * Request to query districts within a specific city for address selection.
 * Used to retrieve districts available in a city for property insurance registration.
 *
 * Adres seçimi için belirli bir şehir içindeki ilçeleri sorgulama talebi.
 * Konut sigortası kaydı için bir şehirde bulunan ilçeleri almak için kullanılır.
 */
export interface QueryDistrictsRequest {
  /**
   * The unique reference identifier of the city containing the districts to query.
   *
   * Sorgulanacak ilçeleri içeren şehrin benzersiz referans tanımlayıcısı.
   */
  cityReference: string;
}

/**
 * Request to query towns within a specific district for address selection.
 * Used to retrieve towns available in a district for property insurance registration.
 *
 * Adres seçimi için belirli bir ilçe içindeki kasabaları sorgulama talebi.
 * Konut sigortası kaydı için bir ilçede bulunan kasabaları almak için kullanılır.
 */
export interface QueryTownsRequest {
  /**
   * The unique reference identifier of the district containing the towns to query.
   *
   * Sorgulanacak kasabaları içeren ilçenin benzersiz referans tanımlayıcısı.
   */
  districtReference: string;
}

/**
 * Request to query neighbourhoods within a specific town for address selection.
 * Used to retrieve neighbourhoods available in a town for property insurance registration.
 *
 * Adres seçimi için belirli bir kasaba içindeki mahalleleri sorgulama talebi.
 * Konut sigortası kaydı için bir kasabada bulunan mahalleleri almak için kullanılır.
 */
export interface QueryNeighbourhoodsRequest {
  /**
   * The unique reference identifier of the town containing the neighbourhoods to query.
   *
   * Sorgulanacak mahalleleri içeren kasabanın benzersiz referans tanımlayıcısı.
   */
  townReference: string;
}

/**
 * Request to query streets within a specific neighbourhood for address selection.
 * Used to retrieve streets available in a neighbourhood for property insurance registration.
 *
 * Adres seçimi için belirli bir mahalle içindeki sokakları sorgulama talebi.
 * Konut sigortası kaydı için bir mahallede bulunan sokakları almak için kullanılır.
 */
export interface QueryStreetsRequest {
  /**
   * The unique reference identifier of the neighbourhood containing the streets to query.
   *
   * Sorgulanacak sokakları içeren mahallenin benzersiz referans tanımlayıcısı.
   */
  neighbourhoodReference: string;
}

/**
 * Request to query buildings on a specific street for address selection.
 * Used to retrieve buildings available on a street for property insurance registration.
 *
 * Adres seçimi için belirli bir sokaktaki binaları sorgulama talebi.
 * Konut sigortası kaydı için bir sokakta bulunan binaları almak için kullanılır.
 */
export interface QueryBuildingsRequest {
  /**
   * The unique reference identifier of the street containing the buildings to query.
   *
   * Sorgulanacak binaları içeren sokağın benzersiz referans tanımlayıcısı.
   */
  streetReference: string;
}

/**
 * Request to query apartments within a specific building for address selection.
 * Used to retrieve apartment units available in a building for property insurance registration.
 *
 * Adres seçimi için belirli bir bina içindeki daireleri sorgulama talebi.
 * Konut sigortası kaydı için bir binada bulunan daire birimlerini almak için kullanılır.
 */
export interface QueryApartmentsRequest {
  /**
   * The unique reference identifier of the building containing the apartments to query.
   *
   * Sorgulanacak daireleri içeren binanın benzersiz referans tanımlayıcısı.
   */
  buildingReference: string;
}

// ===== PROPERTY MANAGEMENT REQUESTS =====

/**
 * Request to create a new property record for a customer.
 * Used to register a new property in the customer's portfolio for insurance coverage.
 *
 * Müşteri için yeni bir konut kaydı oluşturma talebi.
 * Sigorta teminatı için müşterinin portföyüne yeni bir konut kaydetmek için kullanılır.
 */
export interface CreateCustomerPropertyRequest {
  /**
   * The unique identifier of the customer who will own this property.
   *
   * Bu konuta sahip olacak müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;

  /**
   * The unique property number assigned to identify this property.
   *
   * Bu konutu tanımlamak için atanan benzersiz konut numarası.
   */
  number: number;

  /**
   * The old DASK policy number if the property was previously insured under DASK.
   *
   * Konut daha önce DASK kapsamında sigortalıysa eski DASK poliçe numarası.
   */
  daskOldPolicyNumber: number | null;

  /**
   * The total living area of the property in square meters.
   *
   * Konutun metrekare cinsinden toplam yaşam alanı.
   */
  squareMeter: number | null;

  /**
   * The year when the property construction was completed.
   *
   * Konut inşaatının tamamlandığı yıl.
   */
  constructionYear: number | null;

  /**
   * Loss payee clause information for financing or ownership arrangements.
   *
   * Finansman veya sahiplik düzenlemeleri için lehtar klozu bilgileri.
   */
  lossPayeeClause: LossPayeeClause | null;

  /**
   * Current damage status of the property.
   *
   * Konutun mevcut hasar durumu.
   */
  damageStatus: PropertyDamageStatus;

  /**
   * Floor information of the property within the building.
   *
   * Bina içindeki konutun kat bilgileri.
   */
  floor: PropertyFloor;

  /**
   * Structural characteristics of the property.
   *
   * Konutun yapısal özellikleri.
   */
  structure: PropertyStructure;

  /**
   * How the property is utilized or occupied.
   *
   * Konutun nasıl kullanıldığı veya işgal edildiği.
   */
  utilizationStyle: PropertyUtilizationStyle;

  /**
   * Legal ownership type of the property.
   *
   * Konutun yasal sahiplik türü.
   */
  ownershipType: PropertyOwnershipType;
}

/**
 * Request to update an existing customer property with modified information.
 * Used to modify property characteristics, ownership details, and insurance-related attributes.
 *
 * Mevcut bir müşteri konutunu değiştirilmiş bilgilerle güncelleme talebi.
 * Konut özelliklerini, sahiplik detaylarını ve sigortayla ilgili nitelikleri değiştirmek için kullanılır.
 */
export interface UpdateCustomerPropertyRequest {
  /**
   * The unique identifier of the property to be updated.
   *
   * Güncellenecek konutun benzersiz tanımlayıcısı.
   */
  propertyId: string;

  /**
   * The unique identifier of the customer who owns the property.
   *
   * Konuta sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;

  /**
   * The total living area of the property in square meters.
   *
   * Konutun metrekare cinsinden toplam yaşam alanı.
   */
  squareMeter: number | null;

  /**
   * The old DASK policy number if the property was previously insured under DASK.
   *
   * Konut daha önce DASK kapsamında sigortalıysa eski DASK poliçe numarası.
   */
  daskOldPolicyNumber: number | null;

  /**
   * The year when the property construction was completed.
   *
   * Konut inşaatının tamamlandığı yıl.
   */
  constructionYear: number | null;

  /**
   * Loss payee clause information for financing or ownership arrangements.
   *
   * Finansman veya sahiplik düzenlemeleri için lehtar klozu bilgileri.
   */
  lossPayeeClause: LossPayeeClause | null;

  /**
   * Current damage status of the property.
   *
   * Konutun mevcut hasar durumu.
   */
  damageStatus: PropertyDamageStatus;

  /**
   * Floor information of the property within the building.
   *
   * Bina içindeki konutun kat bilgileri.
   */
  floor: PropertyFloor;

  /**
   * Structural characteristics of the property.
   *
   * Konutun yapısal özellikleri.
   */
  structure: PropertyStructure;

  /**
   * How the property is utilized or occupied.
   *
   * Konutun nasıl kullanıldığı veya işgal edildiği.
   */
  utilizationStyle: PropertyUtilizationStyle;

  /**
   * Legal ownership type of the property.
   *
   * Konutun yasal sahiplik türü.
   */
  ownershipType: PropertyOwnershipType;
}

/**
 * Request to retrieve a specific property owned by a customer using both customer and property identifiers.
 * Used to fetch detailed property information within the customer's property portfolio.
 *
 * Müşteri ve konut tanımlayıcıları kullanarak müşteriye ait belirli bir konutu alma talebi.
 * Müşterinin konut portföyü içinde detaylı konut bilgilerini getirmek için kullanılır.
 */
export interface GetCustomerPropertyByIdRequest {
  /**
   * The unique identifier of the customer who owns the property.
   *
   * Konuta sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;

  /**
   * The unique identifier of the property to retrieve.
   *
   * Alınacak konutun benzersiz tanımlayıcısı.
   */
  propertyId: string;
}

/**
 * Request to retrieve all properties owned by a specific customer.
 * Used to fetch the complete property portfolio for customer management and overview purposes.
 *
 * Belirli bir müşteriye ait tüm konutları alma talebi.
 * Müşteri yönetimi ve genel bakış amaçları için tam konut portföyünü getirmek için kullanılır.
 */
export interface GetAllCustomerPropertiesRequest {
  /**
   * The unique identifier of the customer whose properties should be retrieved.
   *
   * Konutları alınması gereken müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;
}

/**
 * Request to retrieve property address information using the property number.
 * Used to fetch complete address details for a specific property in InsurUp.
 *
 * Konut numarası kullanarak konut adres bilgilerini alma talebi.
 * InsurUp'da belirli bir konutun tam adres detaylarını getirmek için kullanılır.
 */
export interface GetPropertyAddressByPropertyNumberRequest {
  /**
   * The unique property number used to identify the property in the system.
   *
   * Sistemde konutu tanımlamak için kullanılan benzersiz konut numarası.
   */
  propertyNumber: number;
}

// ===== PROPERTY MANAGEMENT RESPONSES =====

/**
 * Response containing the identifier of the newly created customer property.
 * Returned after successful property creation to provide the system-generated property ID.
 *
 * Yeni oluşturulan müşteri konutunun tanımlayıcısını içeren yanıt.
 * Başarılı konut oluşturma sonrası sistem tarafından oluşturulan konut ID'sini sağlamak için döndürülür.
 */
export interface CreateCustomerPropertyResult {
  /**
   * The unique identifier assigned to the newly created property.
   *
   * Yeni oluşturulan konuta atanan benzersiz tanımlayıcı.
   */
  newPropertyId: string;
}

/**
 * Response containing comprehensive information about a specific customer property.
 * Returns detailed property data for a single property including all characteristics and related information.
 *
 * Belirli bir müşteri konutu hakkında kapsamlı bilgiler içeren yanıt.
 * Tüm özellikler ve ilgili bilgiler dahil olmak üzere tek bir konut için detaylı konut verilerini döndürür.
 */
export interface GetCustomerPropertyByIdResult {
  /**
   * The unique identifier of this property.
   *
   * Bu konutun benzersiz tanımlayıcısı.
   */
  id: string;

  /**
   * The unique property number assigned to this property.
   *
   * Bu konuta atanan benzersiz konut numarası.
   */
  number: number;

  /**
   * Complete address information of the property.
   *
   * Konutun tam adres bilgileri.
   */
  address: PropertyAddress;

  /**
   * The total living area of the property in square meters.
   *
   * Konutun metrekare cinsinden toplam yaşam alanı.
   */
  squareMeter: number | null;

  /**
   * Information about the previous DASK policy associated with this property, if any.
   *
   * Bu konutla ilişkili önceki DASK poliçesi hakkında bilgiler, varsa.
   */
  daskOldPolicy: DaskOldPolicy | null;

  /**
   * The year when the property construction was completed.
   *
   * Konut inşaatının tamamlandığı yıl.
   */
  constructionYear: number | null;

  /**
   * Current damage status of the property.
   *
   * Konutun mevcut hasar durumu.
   */
  damageStatus: PropertyDamageStatus;

  /**
   * Floor information of the property within the building.
   *
   * Bina içindeki konutun kat bilgileri.
   */
  floor: PropertyFloor;

  /**
   * Structural characteristics of the property.
   *
   * Konutun yapısal özellikleri.
   */
  structure: PropertyStructure;

  /**
   * How the property is utilized or occupied.
   *
   * Konutun nasıl kullanıldığı veya işgal edildiği.
   */
  utilizationStyle: PropertyUtilizationStyle;

  /**
   * Legal ownership type of the property.
   *
   * Konutun yasal sahiplik türü.
   */
  ownershipType: PropertyOwnershipType;

  /**
   * Loss payee clause information for financing or ownership arrangements.
   *
   * Finansman veya sahiplik düzenlemeleri için lehtar klozu bilgileri.
   */
  lossPayeeClause: LossPayeeClause | null;

  /**
   * The unique identifier of the customer who owns this property.
   *
   * Bu konuta sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;
}

/**
 * Response containing summary information about a customer property in a property portfolio list.
 * Used to provide overview information for each property owned by a customer.
 *
 * Konut portföyü listesindeki bir müşteri konutu hakkında özet bilgiler içeren yanıt.
 * Müşteriye ait her konut için genel bakış bilgileri sağlamak için kullanılır.
 */
export interface GetAllCustomerPropertiesResult {
  /**
   * The unique identifier of this property.
   *
   * Bu konutun benzersiz tanımlayıcısı.
   */
  id: string;

  /**
   * The unique property number assigned to this property.
   *
   * Bu konuta atanan benzersiz konut numarası.
   */
  number: number;

  /**
   * Complete address information of the property.
   *
   * Konutun tam adres bilgileri.
   */
  address: PropertyAddress;

  /**
   * The total living area of the property in square meters.
   *
   * Konutun metrekare cinsinden toplam yaşam alanı.
   */
  squareMeter: number | null;

  /**
   * The year when the property construction was completed.
   *
   * Konut inşaatının tamamlandığı yıl.
   */
  constructionYear: number | null;

  /**
   * Current damage status of the property.
   *
   * Konutun mevcut hasar durumu.
   */
  damageStatus: PropertyDamageStatus;

  /**
   * Floor information of the property within the building.
   *
   * Bina içindeki konutun kat bilgileri.
   */
  floor: PropertyFloor;

  /**
   * Structural characteristics of the property.
   *
   * Konutun yapısal özellikleri.
   */
  structure: PropertyStructure;

  /**
   * How the property is utilized or occupied.
   *
   * Konutun nasıl kullanıldığı veya işgal edildiği.
   */
  utilizationStyle: PropertyUtilizationStyle;

  /**
   * Legal ownership type of the property.
   *
   * Konutun yasal sahiplik türü.
   */
  ownershipType: PropertyOwnershipType;

  /**
   * Loss payee clause information for financing or ownership arrangements.
   *
   * Finansman veya sahiplik düzenlemeleri için lehtar klozu bilgileri.
   */
  lossPayeeClause: LossPayeeClause | null;

  /**
   * The unique identifier of the customer who owns this property.
   *
   * Bu konuta sahip olan müşterinin benzersiz tanımlayıcısı.
   */
  customerId: string;
}

/**
 * Response containing property information retrieved using DASK old policy number.
 * Returns comprehensive property details associated with a previous DASK earthquake insurance policy.
 *
 * DASK eski poliçe numarası kullanarak alınan konut bilgilerini içeren yanıt.
 * Önceki DASK deprem sigortası poliçesi ile ilişkili kapsamlı konut detaylarını döndürür.
 */
export interface QueryPropertyByDaskOldPolicyResult {
  /**
   * Information about the previous DASK policy associated with this property.
   *
   * Bu konutla ilişkili önceki DASK poliçesi hakkında bilgiler.
   */
  daskOldPolicy: DaskOldPolicy;

  /**
   * The unique property number that identifies this property in the system.
   *
   * Sistemde bu konutu tanımlayan benzersiz konut numarası.
   */
  propertyNumber: number;

  /**
   * Complete address information of the property.
   *
   * Konutun tam adres bilgileri.
   */
  address: PropertyAddress;

  /**
   * Floor information of the property within the building structure.
   *
   * Bina yapısı içindeki konutun kat bilgileri.
   */
  floor: PropertyFloor | null;

  /**
   * The year when the property construction was completed.
   *
   * Konut inşaatının tamamlandığı yıl.
   */
  constructionYear: number | null;

  /**
   * Structural characteristics of the property as recorded in DASK data.
   *
   * DASK verilerinde kayıtlı olduğu şekliyle konutun yapısal özellikleri.
   */
  structure: PropertyStructure | null;

  /**
   * Current damage status of the property as known from DASK records.
   *
   * DASK kayıtlarından bilindiği şekliyle konutun mevcut hasar durumu.
   */
  damageStatus: PropertyDamageStatus | null;

  /**
   * How the property was utilized during the DASK coverage period.
   *
   * DASK teminat döneminde konutun nasıl kullanıldığı.
   */
  utilizationStyle: PropertyUtilizationStyle | null;

  /**
   * Legal ownership type of the property as recorded in DASK data.
   *
   * DASK verilerinde kayıtlı olduğu şekliyle konutun yasal sahiplik türü.
   */
  ownershipType: PropertyOwnershipType | null;

  /**
   * The total living area of the property in square meters as recorded in DASK data.
   *
   * DASK verilerinde kayıtlı olduğu şekliyle konutun metrekare cinsinden toplam yaşam alanı.
   */
  squareMeter: number | null;
}
