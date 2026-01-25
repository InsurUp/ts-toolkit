/**
 * @fileoverview Case Management Client - Direct port from DefaultInsurUpClient.Case.cs
 * @description TypeScript client for case management operations
 */

import { cases } from "../core/endpoints.js";
import type { InsurUpResult, InsurUpGraphQLResult } from "../core/result.js";
import type { HttpTransport } from "../client/http.js";
import type { GraphQLTransport } from "../client/graphql.js";
import type { RequestOptions } from "../core/options.js";
import {
  ALL_CASE_FIELDS,
  type CaseFieldKey,
  type GetCasesOptions,
  type CasesConnection,
} from "@insurup/contracts";
import { buildFieldSelection } from "@insurup/contracts";
import type {
  // Request types
  AssignCaseRepresentativeRequest,
  ChangeCaseChannelRequest,
  ChangeCaseStateRequest,
  CreateCancelCaseRequest,
  CreateComplaintCaseRequest,
  CreateCrossSaleOpportunityCaseRequest,
  CreateEndorsementCaseRequest,
  CreateNewSaleOpportunityCaseRequest,
  AddNoteToCaseRequest,
  SetCaseAssetRequest,
  SetCaseBranchRequest,
  GetSalesOpportunityFunnelAnalyticsRequest,
  GetOpenCaseBacklogPivotAnalyticsRequest,
  GetFailedCasesReasonDistributionRequest,
  // Response types
  GetCaseByRefResult,
  CasePolicyResult,
  CaseActivityResult,
  CaseProposalResult,
  GetSalesOpportunityFunnelAnalyticsResult,
  GetOpenCaseBacklogPivotAnalyticsResult,
  GetFailedCasesReasonDistributionResult,
  CaseCommunicationAutomationResult,
  GetCasePriorityTemplatesResult,
} from "@insurup/contracts";

/**
 * Case Management Client
 *
 * Central client for managing all types of customer cases and requests within the InsurUp platform. Handles various
 * case types including policy cancellations, customer complaints, cross-sale opportunities, endorsement requests, and
 * new sale opportunities. Provides comprehensive workflow management including case representative assignment, status tracking, activity
 * logging, and representative management. Essential for agencies that need to maintain organized customer service operations
 * and ensure proper follow-up on all customer interactions and business opportunities.
 *
 * InsurUp platformu içinde her türlü müşteri talebi ve isteğini yönetmek için merkezi istemci. Poliçe iptalleri,
 * müşteri şikayetleri, çapraz satış fırsatları, zeyilname talepleri ve yeni satış fırsatları dahil çeşitli talep türlerini
 * yönetir. Talep atama, durum takibi, aktivite kaydı ve temsilci yönetimi dahil kapsamlı iş akışı yönetimi sağlar.
 * Düzenli müşteri hizmet operasyonlarını sürdürmesi ve tüm müşteri etkileşimleri ile iş fırsatlarında uygun takibi
 * sağlaması gereken acenteler için olmazsa olmazdır.
 */
export class InsurUpCaseClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport,
  ) {}

  /**
   * Assigns a case representative to handle a specific customer case, ensuring proper ownership and accountability.
   *
   * Belirli bir müşteri talebini ele almak için talep temsilcisi atar ve uygun sahiplik ile hesap verebilirliği sağlar.
   *
   * @param request Case representative assignment request with representative details / Temsilci detayları ile talep atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async assignCaseRepresentative(
    request: AssignCaseRepresentativeRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.assignRepresentative.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Changes the communication channel for a case to redirect it to appropriate department or platform.
   *
   * Bir talebin iletişim kanalını değiştirerek uygun departman veya platforma yönlendirir.
   *
   * @param request Channel change request / Kanal değişiklik talebi
   * @returns Operation result / İşlem sonucu
   */
  async changeCaseChannel(
    request: ChangeCaseChannelRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.changeChannel.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Updates the status of a case to reflect its current progress in the resolution workflow.
   *
   * Çözüm iş akışındaki mevcut ilerlemesini yansıtmak için talebin durumunu günceller.
   *
   * @param request Status change request / Durum değişiklik talebi
   * @returns Operation result / İşlem sonucu
   */
  async changeCaseState(
    request: ChangeCaseStateRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.changeState.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Creates a policy cancellation case when a customer requests to terminate their insurance coverage.
   *
   * Müşteri sigorta teminatını sonlandırma talebinde bulunduğunda poliçe iptal talebi oluşturur.
   *
   * @param request Cancellation case creation request / İptal talebi oluşturma talebi
   * @returns Created case identifier / Oluşturulan talep tanımlayıcısı
   */
  async createCancelCase(
    request: CreateCancelCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return await this.http.post<string>(cases.createCancel, request, options);
  }

  /**
   * Creates a complaint case to handle customer dissatisfaction or service issues requiring resolution.
   *
   * Müşteri memnuniyetsizliği veya çözüm gerektiren hizmet sorunlarını ele almak için şikayet talebi oluşturur.
   *
   * @param request Complaint case creation request / Şikayet talebi oluşturma talebi
   * @returns Created case identifier / Oluşturulan talep tanımlayıcısı
   */
  async createComplaintCase(
    request: CreateComplaintCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return await this.http.post<string>(
      cases.createComplaint,
      request,
      options,
    );
  }

  /**
   * Creates a cross-sale opportunity case to track potential additional insurance products for existing customers.
   *
   * Mevcut müşteriler için potansiyel ek sigorta ürünlerini takip etmek üzere çapraz satış fırsatı talebi oluşturur.
   *
   * @param request Cross-sale opportunity creation request / Çapraz satış fırsatı oluşturma talebi
   * @returns Created case identifier / Oluşturulan talep tanımlayıcısı
   */
  async createCrossSaleOpportunityCase(
    request: CreateCrossSaleOpportunityCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return await this.http.post<string>(
      cases.createCrossSaleOpportunity,
      request,
      options,
    );
  }

  /**
   * Creates an endorsement case for policy modifications or updates requested by the customer.
   *
   * Müşteri tarafından talep edilen poliçe değişiklikleri veya güncellemeler için zeyilname talebi oluşturur.
   *
   * @param request Endorsement case creation request / Zeyilname talebi oluşturma talebi
   * @returns Created case identifier / Oluşturulan talep tanımlayıcısı
   */
  async createEndorsementCase(
    request: CreateEndorsementCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return await this.http.post<string>(
      cases.createEndorsement,
      request,
      options,
    );
  }

  /**
   * Creates a new sale opportunity case to track potential insurance sales to prospective customers.
   *
   * Potansiyel müşterilere olası sigorta satışlarını takip etmek için yeni satış fırsatı talebi oluşturur.
   *
   * @param request New sale opportunity creation request / Yeni satış fırsatı oluşturma talebi
   * @returns Created case identifier / Oluşturulan talep tanımlayıcısı
   */
  async createNewSaleOpportunityCase(
    request: CreateNewSaleOpportunityCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<string>> {
    return await this.http.post<string>(
      cases.createNewSaleOpportunity,
      request,
      options,
    );
  }

  /**
   * Retrieves all policies associated with a specific case for comprehensive case context and decision making.
   *
   * Kapsamlı talep bağlamı ve karar verme için belirli bir talep ile ilişkili tüm poliçeleri getirir.
   *
   * @param ref Case reference identifier / Talep referans tanımlayıcısı
   * @returns Associated policies / İlişkili poliçeler
   */
  async getCasePolicies(
    ref: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<CasePolicyResult[]>> {
    const endpoint = cases.getPolicies.render(ref);
    return await this.http.get<CasePolicyResult[]>(endpoint, options);
  }

  /**
   * Retrieves the complete activity history for a case showing all actions, updates, and communications.
   *
   * Tüm eylemleri, güncellemeleri ve iletişimleri gösteren talep için tam aktivite geçmişini getirir.
   *
   * @param ref Case reference identifier / Talep referans tanımlayıcısı
   * @returns Case activity history / Talep aktivite geçmişi
   */
  async getCaseActivities(
    ref: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<CaseActivityResult[]>> {
    const endpoint = cases.getActivities.render(ref);
    return await this.http.get<CaseActivityResult[]>(endpoint, options);
  }

  /**
   * Retrieves detailed information about a specific case including status, assigned representative, and progress.
   *
   * Belirli bir talep hakkında durum, atanan temsilci ve ilerleme dahil detaylı bilgileri getirir.
   *
   * @param ref Case reference identifier / Talep referans tanımlayıcısı
   * @returns Detailed case information / Detaylı talep bilgileri
   */
  async getCaseByRef(
    ref: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetCaseByRefResult>> {
    const endpoint = cases.getCaseByRef.render(ref);
    return await this.http.get<GetCaseByRefResult>(endpoint, options);
  }

  /**
   * Retrieves all proposals associated with a specific case to understand related insurance quotations.
   *
   * İlgili sigorta tekliflerini anlamak için belirli bir talep ile ilişkili tüm teklifleri getirir.
   *
   * @param ref Case reference identifier / Talep referans tanımlayıcısı
   * @returns Associated proposals / İlişkili teklifler
   */
  async getCaseProposals(
    ref: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<CaseProposalResult[]>> {
    const endpoint = cases.getProposals.render(ref);
    return await this.http.get<CaseProposalResult[]>(endpoint, options);
  }

  /**
   * Adds a note or comment to a case for documentation, communication, or progress tracking purposes.
   *
   * Dokümantasyon, iletişim veya ilerleme takibi amaçları için talepe not veya yorum ekler.
   *
   * @param request Note addition request / Not ekleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async addNoteToCase(
    request: AddNoteToCaseRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.addNoteToCase.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Sets or updates the asset associated with a case for proper tracking and management.
   *
   * Uygun takip ve yönetim için taleple ilişkili varlığı ayarlar veya günceller.
   *
   * @param request Asset assignment request / Varlık atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setCaseAsset(
    request: SetCaseAssetRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.setAsset.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Assigns or changes the branch for a case to organize case segmentation and reporting.
   *
   * Talep segmentasyonu ve raporlama için talebin şubesini atar veya değiştirir.
   *
   * @param request Branch assignment request / Şube atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setCaseBranch(
    request: SetCaseBranchRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = cases.setBranch.render(request.ref);
    return await this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Retrieves analytics for the New Sales Opportunity Lifecycle Funnel dashboard widget.
   *
   * Yeni Satış Fırsatı Yaşam Döngüsü Hunisi gösterge paneli bileşeni için analitik verileri getirir.
   *
   * @param request Analytics request with filtering options / Filtreleme seçenekleri içeren analitik isteği
   * @returns Funnel analytics response / Huni analitiği yanıtı
   */
  async getSalesOpportunityFunnelAnalytics(
    request: GetSalesOpportunityFunnelAnalyticsRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetSalesOpportunityFunnelAnalyticsResult>> {
    return await this.http.post<GetSalesOpportunityFunnelAnalyticsResult>(
      cases.getSalesOpportunityFunnelAnalytics.definition,
      request,
      options,
    );
  }

  /**
   * Retrieves backlog analytics that pivot open cases by type and subtype for dashboard reporting.
   *
   * Gösterge paneli raporlaması için açık talepleri tür ve alt tür bazında pivotlayan backlog analitiğini getirir.
   *
   * @param request Backlog pivot analytics request / Backlog pivot analitiği isteği
   * @returns Backlog pivot analytics response / Backlog pivot analitiği yanıtı
   */
  async getOpenCaseBacklogPivotAnalytics(
    request: GetOpenCaseBacklogPivotAnalyticsRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetOpenCaseBacklogPivotAnalyticsResult>> {
    return await this.http.post<GetOpenCaseBacklogPivotAnalyticsResult>(
      cases.getOpenCaseBacklogPivotAnalytics.definition,
      request,
      options,
    );
  }

  /**
   * Retrieves failed cases reason distribution analytics for conversion improvement analysis.
   *
   * Dönüşüm iyileştirme analizi için başarısız taleplerin neden dağılımı analitiğini getirir.
   *
   * @param request Failed cases reason distribution analytics request / Başarısız talep neden dağılımı analitiği isteği
   * @returns Failed cases reason distribution analytics response / Başarısız talep neden dağılımı analitiği yanıtı
   */
  async getFailedCasesReasonDistribution(
    request: GetFailedCasesReasonDistributionRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetFailedCasesReasonDistributionResult>> {
    return await this.http.post<GetFailedCasesReasonDistributionResult>(
      cases.getFailedCasesReasonDistribution.definition,
      request,
      options,
    );
  }

  /**
   * Retrieves all available case communication automation configurations with their argument definitions.
   *
   * Argüman tanımları ile birlikte mevcut tüm talep iletişim otomasyonu yapılandırmalarını getirir.
   *
   * @returns Available communication automations / Mevcut iletişim otomasyonları
   */
  async getAllCaseCommunicationAutomations(
    options?: RequestOptions,
  ): Promise<InsurUpResult<CaseCommunicationAutomationResult[]>> {
    return await this.http.get<CaseCommunicationAutomationResult[]>(
      cases.communicationAutomations.getAll,
      options,
    );
  }

  /**
   * Retrieves all available case priority templates for agent configuration.
   *
   * Acente yapılandırması için mevcut tüm talep öncelik şablonlarını getirir.
   *
   * @returns Available case priority templates / Mevcut talep öncelik şablonları
   */
  async getCasePriorityTemplates(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetCasePriorityTemplatesResult>> {
    return await this.http.get<GetCasePriorityTemplatesResult>(
      cases.getPriorityTemplates,
      options,
    );
  }

  // ============================================================================
  // GRAPHQL QUERIES
  // ============================================================================

  /**
   * Queries cases using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak talepleri sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.cases.getCases({ first: 10 });
   *
   * @example
   * // Type-safe field selection
   * const result = await client.cases.getCases({
   *   select: ['id', 'ref', 'type', 'status', 'mainState'] as const,
   *   first: 10,
   *   filter: { type: { eq: CaseType.NewSaleOpportunity } }
   * });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of cases with type-narrowed fields
   */
  async getCases<const TFields extends CaseFieldKey[]>(
    requestOptions?: GetCasesOptions<TFields>,
    options?: RequestOptions,
  ): Promise<InsurUpGraphQLResult<CasesConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        "GraphQL transport is not available. Ensure the client is properly initialized.",
      );
    }

    const fields = (requestOptions?.select ??
      ALL_CASE_FIELDS) as CaseFieldKey[];
    const fieldSelection = buildFieldSelection(fields);

    const query = `
      query GetCases(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryCaseModelFilterInput
        $filter: filtering_QueryCaseModelFilterInput
        $order: [sorting_QueryCaseModelSortInput!]
      ) {
        casesNew(
          first: $first
          after: $after
          last: $last
          before: $before
          search: $search
          filter: $filter
          order: $order
        ) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
          edges {
            cursor
            node {
              ${fieldSelection}
            }
          }
        }
      }
    `;

    const variables = {
      first: requestOptions?.first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      search: requestOptions?.search,
      filter: requestOptions?.filter,
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      casesNew: Omit<CasesConnection, "nodes">;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<CasesConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.casesNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.casesNew,
        nodes,
      },
    } as InsurUpGraphQLResult<CasesConnection<TFields>>;
  }
}
