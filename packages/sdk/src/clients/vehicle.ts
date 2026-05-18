/**
 * @fileoverview Vehicle Client Implementation
 * @description Provides comprehensive vehicle management operations for handling customer vehicles, vehicle data lookups,
 * brand and model queries, and vehicle-based insurance operations within the automotive insurance ecosystem.
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import type { InsuranceParameter } from '@insurup/contracts';
import type {
  CreateCustomerVehicleRequest,
  CreateCustomerVehicleResult,
  UpdateCustomerVehicleRequest,
  GetCustomerVehicleResult,
  GetCustomerVehiclesRequest,
  GetCustomerVehiclesResult,
  ExternalLookupVehicleRequest,
  ExternalLookupVehicleResult,
  QueryVehicleModelTypesRequest,
  QueryVehicleByBrandCodeRequest,
  QueryVehicleByBrandCodeResult,
} from '@insurup/contracts';
import { endpoints } from '../core/endpoints.js';

/**
 * Vehicle Management Client
 *
 * Specialized client for managing customer vehicles and automotive industry data within the InsurUp platform.
 * Handles vehicle lifecycle management, chassis number validations, external vehicle data lookups, brand and model
 * queries, and vehicle-based insurance operations. Essential for agencies offering vehicle insurance products including
 * Kasko (comprehensive vehicle insurance), TSS (traffic insurance), and IMM (voluntary financial liability) coverage,
 * requiring accurate vehicle identification, validation, and market data integration for proper risk assessment and pricing.
 *
 * InsurUp platformu içinde müşteri araçları ve otomotiv sektörü verilerini yönetmek için özelleşmiş istemci.
 * Araç yaşam döngüsü yönetimi, şasi numarası doğrulamaları, harici araç veri aramaları, marka ve model sorguları ve
 * araç tabanlı sigorta operasyonlarını yönetir. Kasko (kasko araç sigortası), TSS (trafik sigortası) ve İMM (ihtiyari
 * mali mesuliyet) teminatı dahil araç sigortası ürünleri sunan ve uygun risk değerlendirmesi ile fiyatlandırma için
 * doğru araç tanımlaması, doğrulama ve pazar veri entegrasyonu gerektiren acenteler için olmazsa olmazdır.
 */
export class InsurUpVehicleClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Adds a new vehicle to a customer's profile with complete vehicle information including chassis number and specifications.
   *
   * Şasi numarası ve özellikler dahil tam araç bilgileri ile müşterinin profiline yeni araç ekler.
   *
   * @param request Vehicle creation request with vehicle details / Araç detayları ile araç oluşturma talebi
   * @returns Created vehicle information / Oluşturulan araç bilgileri
   */
  async addCustomerVehicle(
    request: CreateCustomerVehicleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateCustomerVehicleResult>> {
    const path = endpoints.vehicles.create.render(request.customerId);
    return this.http.post<CreateCustomerVehicleResult>(path, request, options);
  }

  /**
   * Updates existing customer vehicle information including modifications, ownership changes, or specification updates.
   *
   * Modifikasyonlar, sahiplik değişiklikleri veya özellik güncellemeleri dahil mevcut müşteri araç bilgilerini günceller.
   *
   * @param request Vehicle update request / Araç güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateCustomerVehicle(
    request: UpdateCustomerVehicleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const path = endpoints.vehicles.update.render(request.customerId, request.vehicleId);
    return this.http.putNoContent(path, request, options);
  }

  /**
   * Retrieves detailed information about a specific customer vehicle including its insurance history and current status.
   *
   * Belirli bir müşteri aracı hakkında sigorta geçmişi ve mevcut durumu dahil detaylı bilgileri getirir.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param vehicleId Unique identifier of the vehicle / Aracın benzersiz tanımlayıcısı
   * @returns Vehicle details / Araç detayları
   */
  async getCustomerVehicle(
    customerId: string,
    vehicleId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerVehicleResult>> {
    const path = endpoints.vehicles.get.render(customerId, vehicleId);
    return this.http.get<GetCustomerVehicleResult>(path, options);
  }

  /**
   * Retrieves all vehicles owned by a specific customer for comprehensive vehicle portfolio management.
   *
   * Kapsamlı araç portföy yönetimi için belirli bir müşterinin sahip olduğu tüm araçları getirir.
   *
   * @param request Customer vehicles query request / Müşteri araçları sorgu talebi
   * @returns List of customer vehicles / Müşteri araçları listesi
   */
  async getCustomerVehicles(
    request: GetCustomerVehiclesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCustomerVehiclesResult[]>> {
    const path = endpoints.vehicles.getCustomerVehicles.render(request.customerId);
    return this.http.get<GetCustomerVehiclesResult[]>(path, options);
  }

  /**
   * Permanently removes a customer vehicle record from the system with proper data cleanup and insurance impact assessment.
   *
   * Uygun veri temizliği ve sigorta etki değerlendirmesi ile müşteri araç kaydını sistemden kalıcı olarak kaldırır.
   *
   * @param customerId Unique identifier of the customer / Müşterinin benzersiz tanımlayıcısı
   * @param vehicleId Unique identifier of the vehicle / Aracın benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deleteCustomerVehicle(
    customerId: string,
    vehicleId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const path = endpoints.vehicles.delete.render(customerId, vehicleId);
    return this.http.deleteNoContent(path, options);
  }

  /**
   * Performs external vehicle data lookup using chassis number or license plate to retrieve official vehicle information.
   *
   * Resmi araç bilgilerini almak için şasi numarası veya plaka kullanarak harici araç veri araması yapar.
   *
   * @param request External vehicle lookup request / Harici araç arama talebi
   * @returns External vehicle data / Harici araç verileri
   */
  async externalLookupVehicle(
    request: ExternalLookupVehicleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ExternalLookupVehicleResult>> {
    const path = endpoints.vehicles.externalLookup.render(request.customerId);
    return this.http.post<ExternalLookupVehicleResult>(path, request, options);
  }

  /**
   * Retrieves all available vehicle brands for vehicle selection and registration purposes.
   *
   * Araç seçimi ve kayıt amaçları için mevcut tüm araç markalarını getirir.
   *
   * @returns List of vehicle brands / Araç markaları listesi
   */
  async queryVehicleBrands(options?: RequestOptions): Promise<InsurUpResult<InsuranceParameter[]>> {
    const path = endpoints.vehicleParameters.queryBrands;
    return this.http.get<InsuranceParameter[]>(path, options);
  }

  /**
   * Retrieves all vehicle models for a specific brand including different model years and specifications.
   *
   * Farklı model yılları ve özellikler dahil belirli bir marka için tüm araç modellerini getirir.
   *
   * @param request Vehicle model query request / Araç modeli sorgu talebi
   * @returns List of vehicle models / Araç modelleri listesi
   */
  async queryVehicleModels(
    request: QueryVehicleModelTypesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<InsuranceParameter[]>> {
    const path = endpoints.vehicleParameters.queryModels.render(request);
    return this.http.get<InsuranceParameter[]>(path, options);
  }

  /**
   * Queries vehicle information using a specific brand code to retrieve detailed brand and model specifications.
   *
   * Detaylı marka ve model özelliklerini almak için belirli bir marka kodu kullanarak araç bilgilerini sorgular.
   *
   * @param brandCode Vehicle brand code for query / Sorgu için araç marka kodu
   * @returns Vehicle brand information / Araç marka bilgileri
   */
  async queryVehicleByBrandCode(
    brandCode: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<QueryVehicleByBrandCodeResult>> {
    const path = endpoints.insuranceServices.queryVehicleByBrandCode;
    const request: QueryVehicleByBrandCodeRequest = { brandCode };
    return this.http.post<QueryVehicleByBrandCodeResult>(path, request, options);
  }
}
