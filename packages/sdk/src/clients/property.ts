/**
 * Property Management Client
 *
 * Provides comprehensive property management operations for handling customer properties, Turkish address hierarchy queries,
 * DASK earthquake insurance lookups, and property-based insurance operations within the real estate insurance ecosystem.
 *
 * Gayrimenkul sigorta ekosistemi içinde müşteri mülklerini yönetme, Türk adres hiyerarşisi sorguları, DASK deprem
 * sigortası aramaları ve mülk tabanlı sigorta operasyonları için kapsamlı mülk yönetimi işlemlerini sağlar.
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import type { InsuranceParameter } from '@insurup/contracts';
import type {
  // Address parameter requests
  QueryDistrictsRequest,
  QueryTownsRequest,
  QueryNeighbourhoodsRequest,
  QueryStreetsRequest,
  QueryBuildingsRequest,
  QueryApartmentsRequest,

  // Property management requests
  CreateCustomerPropertyRequest,
  UpdateCustomerPropertyRequest,
  GetPropertyAddressByPropertyNumberRequest,

  // Property management responses
  CreateCustomerPropertyResult,
  GetCustomerPropertyByIdResult,
  GetAllCustomerPropertiesResult,
  QueryPropertyByDaskOldPolicyResult,
} from '@insurup/contracts';
import type { PropertyAddress } from '@insurup/contracts';
import { addressParameters, properties } from '../core/endpoints.js';

/**
 * Property Management Client
 *
 * Specialized client for managing customer properties and Turkish address system integration within the InsurUp platform.
 * Handles the complete Turkish administrative address hierarchy (City→District→Town→Neighborhood→Street→Building→Apartment),
 * customer property lifecycle management, DASK earthquake insurance policy lookups, and property-based insurance operations.
 * Essential for agencies offering property insurance products including home insurance (Konut), earthquake insurance (DASK),
 * and commercial property coverage, requiring precise address validation and property identification within Turkey's
 * administrative structure.
 *
 * InsurUp platformu içinde müşteri mülkleri ve Türk adres sistemi entegrasyonunu yönetmek için özelleşmiş istemci.
 * Tam Türk idari adres hiyerarşisini (Şehir→İlçe→Kasaba→Mahalle→Sokak→Bina→Daire), müşteri mülk yaşam döngüsü yönetimini,
 * DASK deprem sigortası poliçe aramalarını ve mülk tabanlı sigorta operasyonlarını yönetir. Ev sigortası (Konut), deprem
 * sigortası (DASK) ve ticari mülk teminatı dahil mülk sigortası ürünleri sunan ve Türkiye'nin idari yapısı içinde hassas
 * adres doğrulaması ve mülk tanımlaması gerektiren acenteler için olmazsa olmazdır.
 */
export class InsurUpPropertyClient {
  constructor(private readonly http: HttpTransport) {}

  // ===== LOCATION/ADDRESS QUERY METHODS =====

  /**
   * Retrieves all cities (provinces) in Turkey for address selection and property location identification.
   *
   * Adres seçimi ve mülk konum tanımlaması için Türkiye'deki tüm şehirleri (illeri) getirir.
   *
   * @returns List of Turkish cities / Türk şehirleri listesi
   */
  async queryCities(options?: RequestOptions): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(addressParameters.queryCities, options);
  }

  /**
   * Retrieves all districts within a specific city following the Turkish administrative hierarchy.
   *
   * Türk idari hiyerarşisini takip ederek belirli bir şehir içindeki tüm ilçeleri getirir.
   *
   * @param request District query request with city selection / Şehir seçimi ile ilçe sorgu talebi
   * @returns List of districts in the selected city / Seçilen şehirdeki ilçeler listesi
   */
  async queryDistricts(
    request: QueryDistrictsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryDistricts.render(request),
      options
    );
  }

  /**
   * Retrieves all towns within a specific district for precise administrative location identification.
   *
   * Hassas idari konum tanımlaması için belirli bir ilçe içindeki tüm kasabaları getirir.
   *
   * @param request Town query request with district selection / İlçe seçimi ile kasaba sorgu talebi
   * @returns List of towns in the selected district / Seçilen ilçedeki kasabalar listesi
   */
  async queryTowns(
    request: QueryTownsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryTowns.render(request),
      options
    );
  }

  /**
   * Retrieves all neighborhoods within a specific administrative area for detailed address specification.
   *
   * Detaylı adres belirtimi için belirli bir idari alan içindeki tüm mahalleleri getirir.
   *
   * @param request Neighborhood query request / Mahalle sorgu talebi
   * @returns List of neighborhoods / Mahalleler listesi
   */
  async queryNeighborhoods(
    request: QueryNeighbourhoodsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryNeighbourhoods.render(request),
      options
    );
  }

  /**
   * Retrieves all streets within a specific neighborhood for complete address formation.
   *
   * Tam adres oluşturma için belirli bir mahalle içindeki tüm sokakları getirir.
   *
   * @param request Street query request / Sokak sorgu talebi
   * @returns List of streets / Sokaklar listesi
   */
  async queryStreets(
    request: QueryStreetsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryStreets.render(request),
      options
    );
  }

  /**
   * Retrieves all buildings on a specific street for precise property identification and addressing.
   *
   * Hassas mülk tanımlaması ve adresleme için belirli bir sokaktaki tüm binaları getirir.
   *
   * @param request Building query request / Bina sorgu talebi
   * @returns List of buildings / Binalar listesi
   */
  async queryBuildings(
    request: QueryBuildingsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryBuildings.render(request),
      options
    );
  }

  /**
   * Retrieves all apartments within a specific building for individual property unit identification.
   *
   * Bireysel mülk birimi tanımlaması için belirli bir bina içindeki tüm daireleri getirir.
   *
   * @param request Apartment query request / Daire sorgu talebi
   * @returns List of apartments / Daireler listesi
   */
  async queryApartments(
    request: QueryApartmentsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    return this.http.get<InsuranceParameter[]>(
      addressParameters.queryApartments.render(request),
      options
    );
  }

  // ===== PROPERTY MANAGEMENT METHODS =====

  /**
   * Creates a new customer property record with complete address information and property characteristics for insurance purposes.
   *
   * Sigorta amaçları için tam adres bilgileri ve mülk özellikleri ile yeni müşteri mülk kaydı oluşturur.
   *
   * @param request Property creation request with details / Detaylar ile mülk oluşturma talebi
   * @returns Created property information / Oluşturulan mülk bilgileri
   */
  async createCustomerProperty(
    request: CreateCustomerPropertyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateCustomerPropertyResult>> {
    return this.http.post<CreateCustomerPropertyResult>(
      properties.create.render(request.customerId),
      request,
      options
    );
  }

  /**
   * Updates existing customer property information including address changes, structural modifications, or usage updates.
   *
   * Adres değişiklikleri, yapısal değişiklikler veya kullanım güncellemeleri dahil mevcut müşteri mülk bilgilerini günceller.
   *
   * @param request Property update request / Mülk güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateCustomerProperty(
    request: UpdateCustomerPropertyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      properties.update.render(request.customerId, request.propertyId),
      request,
      options
    );
  }

  /**
   * Retrieves detailed information about a specific customer property including its insurance history and characteristics.
   *
   * Belirli bir müşteri mülkü hakkında sigorta geçmişi ve özellikleri dahil detaylı bilgileri getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param propertyId Unique identifier of the property / Mülkün benzersiz tanımlayıcısı
   * @returns Property details / Mülk detayları
   */
  async getCustomerPropertyById(
    customerId: string,
    propertyId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerPropertyByIdResult>> {
    return this.http.get<GetCustomerPropertyByIdResult>(
      properties.getById.render(customerId, propertyId),
      options
    );
  }

  /**
   * Retrieves all properties owned by a specific customer for comprehensive property portfolio management.
   *
   * Kapsamlı mülk portföy yönetimi için belirli bir müşterinin sahip olduğu tüm mülkleri getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @returns List of customer properties / Müşteri mülkleri listesi
   */
  async getCustomerProperties(
    customerId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAllCustomerPropertiesResult[]>> {
    return this.http.get<GetAllCustomerPropertiesResult[]>(
      properties.getAll.render(customerId),
      options
    );
  }

  /**
   * Permanently removes a customer property record from the system with proper data cleanup and insurance impact assessment.
   *
   * Uygun veri temizliği ve sigorta etki değerlendirmesi ile müşteri mülk kaydını sistemden kalıcı olarak kaldırır.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param propertyId Unique identifier of the property / Mülkün benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deleteCustomerProperty(
    customerId: string,
    propertyId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(properties.delete.render(customerId, propertyId), options);
  }

  /**
   * Retrieves property address information using the official Turkish property registration number for verification purposes.
   *
   * Doğrulama amaçları için resmi Türk mülk kayıt numarasını kullanarak mülk adres bilgilerini getirir.
   *
   * @param propertyNumber Official Turkish property registration number / Resmi Türk mülk kayıt numarası
   * @returns Property address information / Mülk adres bilgileri
   */
  async getPropertyAddressByPropertyNumber(
    propertyNumber: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<PropertyAddress>> {
    return this.http.post<PropertyAddress>(
      properties.getPropertyAddressByPropertyNumber,
      {
        propertyNumber,
      } satisfies GetPropertyAddressByPropertyNumberRequest,
      options
    );
  }

  /**
   * Queries property information using an existing DASK earthquake insurance policy number for cross-reference and continuity.
   *
   * Çapraz referans ve süreklilik için mevcut DASK deprem sigortası poliçe numarasını kullanarak mülk bilgilerini sorgular.
   *
   * @param daskPolicyNumber DASK earthquake insurance policy number / DASK deprem sigortası poliçe numarası
   * @returns Property information from DASK records / DASK kayıtlarından mülk bilgileri
   */
  async queryPropertyByDaskOldPolicy(
    daskPolicyNumber: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<QueryPropertyByDaskOldPolicyResult>> {
    return this.http.post<QueryPropertyByDaskOldPolicyResult>(
      properties.queryPropertyByDaskOldPolicy,
      { daskPolicyNumber },
      options
    );
  }
}
