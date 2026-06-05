/**
 * @fileoverview Coverage Management Client - Client for managing insurance coverage configurations
 * @description Provides coverage management operations for configuring insurance product coverages, managing coverage groups, and retrieving available coverage options
 */

import type { HttpTransport } from '../client/http.js';
import type { InsurUpResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import { coverageGroups, coverageChoices } from '../core/endpoints.js';
import type {
  CreateCoverageGroupRequest,
  UpdateCoverageGroupRequest,
  DeleteCoverageGroupRequest,
  GetCoverageGroupByIdResult,
  GetCoverageGroupsResultItem,
  KaskoCoverageChoices,
  KonutCoverageChoices,
  TssCoverageChoices,
  ImmCoverageChoices,
  OssCoverageChoices,
  SeyahatSaglikCoverageChoices,
  YabanciSaglikCoverageChoices,
  CompanyCoverageChoices,
} from '@insurup/contracts';
import type { VehicleUtilizationStyle, CoverageTable } from '@insurup/contracts';

/**
 * Re-serializes a value so the polymorphic `$type` discriminator leads every object at every depth.
 *
 * The deployed backend models coverages (`Coverage`, `CoverageValue`, `KiralikArac`) as .NET
 * polymorphic types whose deserializer demands `$type` as the **first** property of each object. A
 * missing or out-of-order discriminator throws server-side and surfaces as an HTTP 500. Consumers
 * routinely build coverages via spreads, field-by-field edits, or `mergeCoverage`, none of which
 * guarantee key order, so the SDK normalizes the outgoing coverage table here (see issue #67).
 */
function withDiscriminatorFirst<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => withDiscriminatorFirst(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>;
    const ordered: Record<string, unknown> = {};

    if ('$type' in source) {
      ordered['$type'] = source['$type'];
    }

    for (const key of Object.keys(source)) {
      if (key === '$type') {
        continue;
      }
      ordered[key] = withDiscriminatorFirst(source[key]);
    }

    return ordered as T;
  }

  return value;
}

/**
 * Provides coverage management operations for configuring insurance product coverages, managing coverage groups,
 * and retrieving available coverage options for different insurance branches within the InsurUp platform.
 *
 * InsurUp platformu içinde sigorta ürün teminatlarını yapılandırma, teminat gruplarını yönetme ve farklı
 * sigorta dalları için mevcut teminat seçeneklerini alma konularında teminat yönetimi işlemlerini sağlar.
 */
export class InsurUpCoverageClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Creates a new coverage group to organize and standardize coverage offerings across multiple insurance products.
   *
   * Birden fazla sigorta ürününde teminat tekliflerini organize etmek ve standartlaştırmak için yeni teminat grubu oluşturur.
   *
   * @param request Coverage group creation request / Teminat grubu oluşturma talebi
   * @returns Operation result / İşlem sonucu
   */
  async createCoverageGroup(
    request: CreateCoverageGroupRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const body = {
      ...request,
      coverageTable: withDiscriminatorFirst<CoverageTable>(request.coverageTable),
    };
    return this.http.postNoContent(coverageGroups.create, body, options);
  }

  /**
   * Updates an existing coverage group's configuration, coverage options, or applicable insurance products.
   *
   * Mevcut bir teminat grubunun yapılandırmasını, teminat seçeneklerini veya uygulanabilir sigorta ürünlerini günceller.
   *
   * @param request Coverage group update request / Teminat grubu güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateCoverageGroup(
    request: UpdateCoverageGroupRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    const body = {
      ...request,
      coverageTable: withDiscriminatorFirst<CoverageTable>(request.coverageTable),
    };
    return this.http.putNoContent(coverageGroups.update.render(request.id), body, options);
  }

  /**
   * Removes a coverage group from the system, ensuring proper cleanup of associated coverage configurations.
   *
   * Sistemden bir teminat grubunu kaldırır ve ilişkili teminat yapılandırmalarının düzgün temizlenmesini sağlar.
   *
   * @param request Coverage group deletion request / Teminat grubu silme talebi
   * @returns Operation result / İşlem sonucu
   */
  async deleteCoverageGroup(
    request: DeleteCoverageGroupRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.deleteNoContent(coverageGroups.delete.render(request.id), options);
  }

  /**
   * Retrieves detailed information about a specific coverage group including its coverage options and configurations.
   *
   * Belirli bir teminat grubu hakkında teminat seçenekleri ve yapılandırmaları dahil detaylı bilgileri getirir.
   *
   * @param coverageGroupId Unique identifier of the coverage group / Teminat grubunun benzersiz tanımlayıcısı
   * @returns Coverage group details / Teminat grubu detayları
   */
  async getCoverageGroupById(
    coverageGroupId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCoverageGroupByIdResult>> {
    return this.http.get(coverageGroups.getById.render(coverageGroupId), options);
  }

  /**
   * Retrieves all available coverage groups within the agency for comprehensive coverage management overview.
   *
   * Kapsamlı teminat yönetimi genel bakışı için acente içindeki tüm mevcut teminat gruplarını getirir.
   *
   * @returns List of all coverage groups / Tüm teminat grupları listesi
   */
  async getAllCoverageGroups(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetCoverageGroupsResultItem[]>> {
    return this.http.get(coverageGroups.getAll, options);
  }

  /**
   * Retrieves available Kasko (comprehensive vehicle insurance) coverage options and configurations for proposal generation.
   *
   * Teklif oluşturma için mevcut Kasko (kasko araç sigortası) teminat seçenekleri ve yapılandırmalarını getirir.
   *
   * @param vehicleUtilizationStyle Optional vehicle utilization style filter / İsteğe bağlı araç kullanım stili filtresi
   * @returns Kasko coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış Kasko teminat seçenekleri
   */
  async getKaskoCoverageChoices(
    vehicleUtilizationStyle?: VehicleUtilizationStyle,
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<KaskoCoverageChoices>[]>> {
    const endpoint = coverageChoices.getKaskoCoverageChoices.render(vehicleUtilizationStyle);
    return this.http.get<CompanyCoverageChoices<KaskoCoverageChoices>[]>(endpoint, options);
  }

  /**
   * Retrieves available Konut (home/property insurance) coverage options including DASK earthquake insurance configurations.
   *
   * DASK deprem sigortası yapılandırmaları dahil mevcut Konut (ev/mülk sigortası) teminat seçeneklerini getirir.
   *
   * @returns Konut coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış Konut teminat seçenekleri
   */
  async getKonutCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<KonutCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<KonutCoverageChoices>[]>(
      coverageChoices.getKonutCoverageChoices.render(),
      options
    );
  }

  /**
   * Retrieves available TSS (Traffic Insurance) coverage options for mandatory and voluntary vehicle liability insurance.
   *
   * Zorunlu ve ihtiyari araç sorumluluk sigortası için mevcut TSS (Trafik Sigortası) teminat seçeneklerini getirir.
   *
   * @returns TSS coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış TSS teminat seçenekleri
   */
  async getTssCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<TssCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<TssCoverageChoices>[]>(
      coverageChoices.getTssCoverageChoices.render(),
      options
    );
  }

  /**
   * Retrieves available IMM (Voluntary Financial Liability) coverage options for extended liability protection beyond mandatory insurance.
   *
   * Zorunlu sigortanın ötesinde genişletilmiş sorumluluk koruması için mevcut İMM (İhtiyari Mali Mesuliyet) teminat seçeneklerini getirir.
   *
   * @returns IMM coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış İMM teminat seçenekleri
   */
  async getImmCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<ImmCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<ImmCoverageChoices>[]>(
      coverageChoices.getImmCoverageChoices.render(),
      options
    );
  }

  /**
   * Retrieves available OSS (private health insurance / Özel Sağlık) coverage options and configurations.
   *
   * Mevcut OSS (Özel Sağlık Sigortası) teminat seçenekleri ve yapılandırmalarını getirir.
   *
   * @returns OSS coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış OSS teminat seçenekleri
   */
  async getOssCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<OssCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<OssCoverageChoices>[]>(
      coverageChoices.getOssCoverageChoices.render(),
      options
    );
  }

  /**
   * Retrieves available Seyahat Sağlık (travel health insurance) coverage options and configurations.
   *
   * Mevcut Seyahat Sağlık (seyahat sağlık sigortası) teminat seçenekleri ve yapılandırmalarını getirir.
   *
   * @returns Travel health coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış seyahat sağlık teminat seçenekleri
   */
  async getSeyahatSaglikCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<SeyahatSaglikCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<SeyahatSaglikCoverageChoices>[]>(
      coverageChoices.getSeyahatSaglikCoverageChoices.render(),
      options
    );
  }

  /**
   * Retrieves available Yabancı Sağlık (foreign health insurance) coverage options and configurations.
   *
   * Mevcut Yabancı Sağlık (yabancı sağlık sigortası) teminat seçenekleri ve yapılandırmalarını getirir.
   *
   * @returns Foreign health coverage choices grouped by insurance company / Sigorta şirketine göre gruplanmış yabancı sağlık teminat seçenekleri
   */
  async getYabanciSaglikCoverageChoices(
    options?: RequestOptions
  ): Promise<InsurUpResult<CompanyCoverageChoices<YabanciSaglikCoverageChoices>[]>> {
    return this.http.get<CompanyCoverageChoices<YabanciSaglikCoverageChoices>[]>(
      coverageChoices.getYabanciSaglikCoverageChoices.render(),
      options
    );
  }
}
