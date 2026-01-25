import type { HttpTransport } from "../client/http.js";
import type { InsurUpResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { endpoints } from "../core/endpoints.js";
import type {
  ResourceKey,
  InsuranceCompany,
  InsuranceProduct,
  GetAgentBasedConnectionFieldsByCompanyIdResultItem,
  GetAllReleaseNotesResultItem,
  Bank,
  BankBranch,
  FinancialInstitution,
} from "@insurup/contracts";

/**
 * Provides comprehensive insurance industry data access for retrieving insurance companies, products, resource keys,
 * release notes, and financial institution information essential for platform operations and integrations.
 *
 * Platform operasyonları ve entegrasyonları için gerekli sigorta şirketleri, ürünler, kaynak anahtarları,
 * sürüm notları ve finansal kurum bilgilerini almak üzere kapsamlı sigorta sektörü veri erişimi sağlar.
 *
 * **Insurance Industry Data Client / Sigorta Sektörü Veri İstemcisi**
 *
 * EN: Central client for accessing comprehensive insurance industry reference data and platform configuration information.
 * Provides access to insurance companies, their products, localization resources, platform release notes, banking
 * institutions, and financial service providers. Essential for agencies that need to stay updated with insurance
 * market offerings, configure platform integrations, access multilingual resources, and integrate with banking
 * systems for premium collection and policy financing operations.
 *
 * TR: Kapsamlı sigorta sektörü referans verilerine ve platform yapılandırma bilgilerine erişim için merkezi istemci.
 * Sigorta şirketleri, ürünleri, yerelleştirme kaynakları, platform sürüm notları, bankacılık kurumları ve finansal
 * hizmet sağlayıcılarına erişim sağlar. Sigorta pazar teklifleri ile güncel kalması, platform entegrasyonlarını
 * yapılandırması, çok dilli kaynaklara erişmesi ve prim tahsilatı ile poliçe finansman operasyonları için bankacılık
 * sistemleri ile entegrasyon yapması gereken acenteler için olmazsa olmazdır.
 */
export class InsurUpInsuranceClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Retrieves all available resource keys for localization and multi-language support within the platform.
   *
   * Platform içinde yerelleştirme ve çoklu dil desteği için mevcut tüm kaynak anahtarlarını getirir.
   *
   * @returns List of resource keys for localization / Yerelleştirme için kaynak anahtarları listesi
   */
  async getResourceKeys(
    options?: RequestOptions,
  ): Promise<InsurUpResult<ResourceKey[]>> {
    return this.http.get<ResourceKey[]>(endpoints.resourceKeys.getAll, options);
  }

  /**
   * Retrieves all insurance companies available on the platform for agent partnerships and product offerings.
   *
   * Acente ortaklıkları ve ürün teklifleri için platformda bulunan tüm sigorta şirketlerini getirir.
   *
   * @returns List of insurance companies / Sigorta şirketleri listesi
   */
  async getInsuranceCompanies(
    options?: RequestOptions,
  ): Promise<InsurUpResult<InsuranceCompany[]>> {
    return this.http.get<InsuranceCompany[]>(
      endpoints.insuranceCompanies.getInsuranceCompanies,
      options,
    );
  }

  /**
   * Retrieves all insurance products offered by a specific insurance company including their features and coverage options.
   *
   * Belirli bir sigorta şirketinin sunduğu tüm sigorta ürünlerini özellikleri ve teminat seçenekleri dahil getirir.
   *
   * @param insuranceCompanyId Unique identifier of the insurance company / Sigorta şirketinin benzersiz tanımlayıcısı
   * @returns List of insurance products / Sigorta ürünleri listesi
   */
  async getInsuranceCompanyProducts(
    insuranceCompanyId: number,
    options?: RequestOptions,
  ): Promise<InsurUpResult<InsuranceProduct[]>> {
    const path =
      endpoints.insuranceCompanies.getInsuranceCompanyProducts.render(
        insuranceCompanyId,
      );
    return this.http.get<InsuranceProduct[]>(path, options);
  }

  /**
   * Retrieves all insurance products from all companies on the platform including their features and coverage options.
   *
   * Platformdaki tüm şirketlerden mevcut tüm sigorta ürünlerini özellikleri ve teminat seçenekleri dahil getirir.
   *
   * @returns List of all insurance products / Tüm sigorta ürünleri listesi
   */
  async getAllProducts(
    options?: RequestOptions,
  ): Promise<InsurUpResult<InsuranceProduct[]>> {
    return this.http.get<InsuranceProduct[]>(
      endpoints.insuranceCompanies.getAllProducts,
      options,
    );
  }

  /**
   * Retrieves agent-specific connection fields and requirements for integrating with a particular insurance company's systems.
   *
   * Belirli bir sigorta şirketinin sistemleri ile entegrasyon için acente özel bağlantı alanları ve gereksinimlerini getirir.
   *
   * @param insuranceCompanyId Unique identifier of the insurance company / Sigorta şirketinin benzersiz tanımlayıcısı
   * @returns Connection field requirements / Bağlantı alanı gereksinimleri
   */
  async getCompanyConnectionFields(
    insuranceCompanyId: number,
    options?: RequestOptions,
  ): Promise<
    InsurUpResult<GetAgentBasedConnectionFieldsByCompanyIdResultItem[]>
  > {
    const path =
      endpoints.insuranceCompanies.connectionFields.getAgentBasedConnectionFieldsByCompanyId.render(
        insuranceCompanyId,
      );
    return this.http.get<GetAgentBasedConnectionFieldsByCompanyIdResultItem[]>(
      path,
      options,
    );
  }

  /**
   * Retrieves all platform release notes including new features, bug fixes, and important updates for system awareness.
   *
   * Sistem farkındalığı için yeni özellikler, hata düzeltmeleri ve önemli güncellemeler dahil tüm platform sürüm notlarını getirir.
   *
   * @returns Platform release notes / Platform sürüm notları
   */
  async getAllReleaseNotes(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetAllReleaseNotesResultItem[]>> {
    return this.http.get<GetAllReleaseNotesResultItem[]>(
      endpoints.releaseNotes.getAll,
      options,
    );
  }

  /**
   * Retrieves all banks available for premium collection, policy financing, and customer payment processing operations.
   *
   * Prim tahsilatı, poliçe finansmanı ve müşteri ödeme işleme operasyonları için mevcut tüm bankaları getirir.
   *
   * @returns List of banks / Bankalar listesi
   */
  async getBanks(options?: RequestOptions): Promise<InsurUpResult<Bank[]>> {
    return this.http.get<Bank[]>(endpoints.banks.getAll, options);
  }

  /**
   * Retrieves all branches for a specific bank to enable precise payment routing and customer service location matching.
   *
   * Hassas ödeme yönlendirmesi ve müşteri hizmet konumu eşleştirmesi için belirli bir bankanın tüm şubelerini getirir.
   *
   * @param bankId Unique identifier of the bank / Bankanın benzersiz tanımlayıcısı
   * @returns List of bank branches / Banka şubeleri listesi
   */
  async getBankBranches(
    bankId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<BankBranch[]>> {
    const path = endpoints.banks.getBranches.render(bankId);
    return this.http.get<BankBranch[]>(path, options);
  }

  /**
   * Retrieves all financial institutions including banks, credit unions, and other financial service providers for comprehensive payment options.
   *
   * Kapsamlı ödeme seçenekleri için bankalar, kredi birlikleri ve diğer finansal hizmet sağlayıcıları dahil tüm finansal kurumları getirir.
   *
   * @returns List of financial institutions / Finansal kurumlar listesi
   */
  async getFinancialInstitutions(
    options?: RequestOptions,
  ): Promise<InsurUpResult<FinancialInstitution[]>> {
    return this.http.get<FinancialInstitution[]>(
      endpoints.financialInstitutions.getAll,
      options,
    );
  }
}
