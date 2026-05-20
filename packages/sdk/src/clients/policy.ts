/**
 * @fileoverview Policy Management Client - Comprehensive policy operations
 * @description Provides comprehensive policy management operations for handling active insurance policies,
 * document generation, customer communications, representative assignments, and policy transfer processes
 */

import type { HttpTransport } from '../client/http.js';
import type { GraphQLTransport } from '../client/graphql.js';
import type { InsurUpResult, InsurUpGraphQLResult } from '../core/result.js';
import type { RequestOptions } from '../core/options.js';
import type {
  GetPolicyDetailRequest,
  GetPolicyDetailResult,
  FetchPolicyDocumentRequest,
  FetchPolicyDocumentResult,
  SendPolicyDocumentRequest,
  SetPolicyRepresentativeRequest,
  SetPolicyBranchRequest,
  CreateManualPolicyRequest,
  CreateManualPolicyResult,
  UpdateManualPolicyRequest,
  GetPolicyCountAndPremiumAnalyticsRequest,
  GetPolicyCountAndPremiumAnalyticsResult,
  GetPolicyRenewalAnalyticsRequest,
  GetPolicyRenewalAnalyticsResult,
  GetPolicyDistributionByBranchRequest,
  GetPolicyDistributionByBranchResult,
  GetRepresentativeEarningsAnalyticsRequest,
  GetRepresentativeEarningsAnalyticsResult,
} from '@insurup/contracts';
import type {
  GetPolicyTransferDetailRequest,
  GetPolicyTransferDetailResult,
  GetPolicyTransferTriggerDetailRequest,
  GetPolicyTransferTriggerDetailResult,
  CreatePolicyTransferRequest,
  TriggerPolicyTransferRequest,
  CreateFilePolicyTransferRequest,
  GetFilePolicyTransferDetailRequest,
  GetFilePolicyTransferDetailResult,
} from '@insurup/contracts';
import { endpoints } from '../core/endpoints.js';
import {
  ALL_POLICY_FIELDS,
  type PolicyFieldKey,
  type GetPoliciesOptions,
  type PoliciesConnection,
} from '@insurup/contracts';
import {
  ALL_POLICY_TRANSFER_FIELDS,
  type PolicyTransferFieldKey,
  type GetPolicyTransfersOptions,
  type PolicyTransfersConnection,
} from '@insurup/contracts';
import {
  ALL_FILE_POLICY_TRANSFER_FIELDS,
  type FilePolicyTransferFieldKey,
  type GetFilePolicyTransfersOptions,
  type FilePolicyTransfersConnection,
} from '@insurup/contracts';
import { buildFieldSelection } from '@insurup/contracts';
import { buildFilterSearchVariables } from './_internal/with-unified-filter.js';

/**
 * Policy Management Client / Poliçe Yönetimi İstemcisi
 *
 * Central client for managing active insurance policies throughout their lifecycle from issuance to expiration.
 * Handles policy documentation, customer communication, representative management, and complex policy transfer operations
 * including bulk transfers and file-based transfers. Essential for agencies that need to maintain comprehensive policy
 * administration, ensure proper documentation delivery to customers, manage policy ownership changes, and coordinate
 * policy transfers between different systems or agents while maintaining audit trails and regulatory compliance.
 *
 * Düzenlenmesinden sona ermesine kadar aktif sigorta poliçelerini yaşam döngüleri boyunca yönetmek için merkezi istemci.
 * Poliçe dokümantasyonu, müşteri iletişimi, temsilci yönetimi ve toplu transferler ile dosya tabanlı transferler dahil
 * karmaşık poliçe transfer operasyonlarını yönetir. Kapsamlı poliçe yönetimi sürdürmesi, müşterilere uygun dokümantasyon
 * teslimatını sağlaması, poliçe sahiplik değişikliklerini yönetmesi ve denetim izleri ile düzenleyici uyumu korurken
 * farklı sistemler veya acenteler arasında poliçe transferlerini koordine etmesi gereken acenteler için olmazsa olmazdır.
 */
export class InsurUpPolicyClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport
  ) {}

  /**
   * Retrieves comprehensive details of a specific policy including coverage information, premium details, and current status.
   *
   * Teminat bilgileri, prim detayları ve mevcut durum dahil belirli bir poliçenin kapsamlı detaylarını getirir.
   *
   * @param request - Policy detail request with policy ID
   * @returns Detailed policy information
   */
  async getPolicyDetail(
    request: GetPolicyDetailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyDetailResult>> {
    return this.http.get<GetPolicyDetailResult>(
      endpoints.policies.getPolicyDetail.render(request.policyId),
      options
    );
  }

  /**
   * Fetches the official policy document from the insurance company's systems for customer delivery or records.
   *
   * Müşteri teslimatı veya kayıtlar için sigorta şirketinin sistemlerinden resmi poliçe belgesini getirir.
   *
   * @param request - Policy document fetch request with policy ID
   * @returns Policy document data
   */
  async fetchPolicyDocument(
    request: FetchPolicyDocumentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<FetchPolicyDocumentResult>> {
    return this.http.get<FetchPolicyDocumentResult>(
      endpoints.policies.fetchPolicyDocument.render(request.policyId),
      options
    );
  }

  /**
   * Sends the policy document directly to the customer via email or other communication channels for their records.
   *
   * Poliçe belgesini müşterinin kayıtları için e-posta veya diğer iletişim kanalları aracılığıyla doğrudan müşteriye gönderir.
   *
   * @param request - Document delivery request
   * @returns Operation result
   */
  async sendPolicyDocumentToCustomer(
    request: SendPolicyDocumentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.policies.sendPolicyDocument.render(request.policyId),
      request,
      options
    );
  }

  /**
   * Assigns or updates the representative responsible for managing a specific policy and customer relationship.
   *
   * Belirli bir poliçeyi ve müşteri ilişkisini yönetmekten sorumlu temsilciyi atar veya günceller.
   *
   * @param request - Representative assignment request
   * @returns Operation result
   */
  async setPolicyRepresentative(
    request: SetPolicyRepresentativeRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.policies.setPolicyRepresentative.render(request.policyId),
      request,
      options
    );
  }

  /**
   * Assigns or changes the branch for a policy to organize policy segmentation and reporting.
   *
   * Poliçe segmentasyonu ve raporlama için poliçenin şubesini atar veya değiştirir.
   *
   * @param request Branch assignment request / Şube atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setPolicyBranch(
    request: SetPolicyBranchRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.policies.setPolicyBranch.render(request.policyId),
      request,
      options
    );
  }

  /**
   * Creates a new manual policy through the agent panel without insurance services integration.
   *
   * Sigorta hizmetleri entegrasyonu olmadan acente paneli üzerinden yeni manuel poliçe oluşturur.
   *
   * @param request Manual policy creation request / Manuel poliçe oluşturma talebi
   * @returns Created policy identifier / Oluşturulan poliçe tanımlayıcısı
   */
  async createManualPolicy(
    request: CreateManualPolicyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CreateManualPolicyResult>> {
    return this.http.post<CreateManualPolicyResult>(
      endpoints.policies.createManualPolicy.definition,
      request,
      options
    );
  }

  /**
   * Updates an existing manual policy through the agent panel and creates a new policy version for tracking changes.
   *
   * Acente paneli üzerinden mevcut manuel poliçeyi günceller ve değişiklikleri takip etmek için yeni poliçe versiyonu oluşturur.
   *
   * @param request Manual policy update request / Manuel poliçe güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateManualPolicy(
    request: UpdateManualPolicyRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.putNoContent(
      endpoints.policies.updateManualPolicy.render(request.policyId),
      request,
      options
    );
  }

  /**
   * Retrieves comprehensive policy count and gross premium analytics with flexible filtering and grouping options.
   * Provides time series data, summary KPIs, and optional grouping by product branch or insurance company.
   *
   * Esnek filtreleme ve gruplama seçenekleri ile kapsamlı poliçe adedi ve brüt prim analitiği getirir.
   * Zaman serisi verileri, özet KPI'lar ve isteğe bağlı ürün branşı veya sigorta şirketine göre gruplama sağlar.
   *
   * @param request Analytics request with filters and grouping options / Filtreler ve gruplama seçenekleri ile analitik talebi
   * @returns Comprehensive analytics data including KPIs, time series, and grouped data / KPI'lar, zaman serisi ve gruplanmış veriler dahil kapsamlı analitik verileri
   */
  async getPolicyCountAndPremiumAnalytics(
    request: GetPolicyCountAndPremiumAnalyticsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyCountAndPremiumAnalyticsResult>> {
    return this.http.post<GetPolicyCountAndPremiumAnalyticsResult>(
      endpoints.policies.getPolicyCountAndPremiumAnalytics.definition,
      request,
      options
    );
  }

  /**
   * Retrieves stacked daily renewal analytics for policies with RenewalNumber greater than zero.
   * Provides branch segmented counts together with total and peak KPIs.
   *
   * RenewalNumber değeri sıfırdan büyük olan poliçeler için günlük yenileme analitiği sağlar.
   * Branş bazlı yığılmış adetler ile toplam ve pik KPI değerlerini döner.
   *
   * @param request Renewal analytics request with filtering options / Filtre seçenekleri ile yenileme analitiği isteği
   * @returns Renewal analytics response / Yenileme analitiği yanıtı
   */
  async getPolicyRenewalAnalytics(
    request: GetPolicyRenewalAnalyticsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyRenewalAnalyticsResult>> {
    return this.http.post<GetPolicyRenewalAnalyticsResult>(
      endpoints.policies.getPolicyRenewalAnalytics.definition,
      request,
      options
    );
  }

  /**
   * Retrieves policy distribution by branch analytics data.
   * Provides aggregated counts, gross premiums, and percentage shares grouped by product branch.
   *
   * Branş bazında poliçe dağılımı analitik verilerini getirir.
   * Ürün branşına göre gruplanmış toplam adetler, brüt primler ve yüzde payları sağlar.
   *
   * @param request Distribution analytics request with filtering options / Filtre seçenekleri ile dağılım analitiği isteği
   * @returns Distribution analytics response / Dağılım analitiği yanıtı
   */
  async getPolicyDistributionByBranch(
    request: GetPolicyDistributionByBranchRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyDistributionByBranchResult>> {
    return this.http.post<GetPolicyDistributionByBranchResult>(
      endpoints.policies.getPolicyDistributionByBranch.definition,
      request,
      options
    );
  }

  /**
   * Retrieves representative earnings analytics data.
   * Provides earnings breakdown grouped by representative for performance tracking.
   *
   * Temsilci kazanç analitik verilerini getirir.
   * Performans takibi için temsilciye göre gruplanmış kazanç dökümü sağlar.
   *
   * @param request Representative earnings analytics request with filtering options / Filtre seçenekleri ile temsilci kazanç analitiği isteği
   * @returns Representative earnings analytics response / Temsilci kazanç analitiği yanıtı
   */
  async getRepresentativeEarningsAnalytics(
    request: GetRepresentativeEarningsAnalyticsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetRepresentativeEarningsAnalyticsResult>> {
    return this.http.post<GetRepresentativeEarningsAnalyticsResult>(
      endpoints.policies.getRepresentativeEarningsAnalytics.definition,
      request,
      options
    );
  }

  /**
   * Retrieves detailed information about a specific policy transfer process including status and progress tracking.
   *
   * Durum ve ilerleme takibi dahil belirli bir poliçe transfer süreciyle ilgili detaylı bilgileri getirir.
   *
   * @param request - Policy transfer detail request
   * @returns Policy transfer details
   */
  async getPolicyTransferDetail(
    request: GetPolicyTransferDetailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyTransferDetailResult>> {
    return this.http.get<GetPolicyTransferDetailResult>(
      endpoints.policyTransfers.getPolicyTransferDetail.render(request.policyTransferId),
      options
    );
  }

  /**
   * Retrieves specific trigger details for a policy transfer process to understand execution conditions and timing.
   *
   * Yürütme koşulları ve zamanlamasını anlamak için poliçe transfer sürecinin belirli tetikleyici detaylarını getirir.
   *
   * @param request - Policy transfer trigger detail request
   * @returns Transfer trigger details
   */
  async getPolicyTransferTriggerDetail(
    request: GetPolicyTransferTriggerDetailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetPolicyTransferTriggerDetailResult>> {
    return this.http.get<GetPolicyTransferTriggerDetailResult>(
      endpoints.policyTransfers.getPolicyTransferTriggerDetail.render(
        request.policyTransferId,
        request.policyTransferTriggerId
      ),
      options
    );
  }

  /**
   * Creates a new policy transfer request to move policies between agents, agencies, or systems with proper validation.
   *
   * Uygun doğrulama ile poliçeleri acenteler, acenteler veya sistemler arasında taşımak için yeni poliçe transfer talebi oluşturur.
   *
   * @param request - Policy transfer creation request
   * @returns Created transfer identifier
   */
  async createPolicyTransfer(
    request: CreatePolicyTransferRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<string>> {
    return this.http.post<string>(endpoints.policyTransfers.create, request, options);
  }

  /**
   * Executes a prepared policy transfer, initiating the actual movement of policies according to the transfer configuration.
   *
   * Hazırlanmış poliçe transferini yürütür ve transfer yapılandırmasına göre poliçelerin gerçek hareketini başlatır.
   *
   * @param request - Policy transfer trigger request
   * @returns Operation result
   */
  async triggerPolicyTransfer(
    request: TriggerPolicyTransferRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.policyTransfers.triggerPolicyTransfer.render(request.policyTransferId),
      request,
      options
    );
  }

  /**
   * Creates a file-based policy transfer by uploading a file containing policy information for bulk transfer operations.
   *
   * Toplu transfer işlemleri için poliçe bilgilerini içeren dosya yükleyerek dosya tabanlı poliçe transferi oluşturur.
   *
   * @param request - File-based transfer request
   * @param file - File containing policy data
   * @param fileName - Name of the uploaded file
   * @returns Operation result
   */
  async createFilePolicyTransfer(
    request: CreateFilePolicyTransferRequest,
    file: File,
    fileName: string,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    // Create FormData for multipart file upload
    const formData = new FormData();
    formData.append('insuranceCompanyId', request.insuranceCompanyId.toString());
    formData.append('file', file, fileName);

    return this.http.postNoContent(endpoints.filePolicyTransfers.create, formData, options);
  }

  /**
   * Retrieves detailed information about a file-based policy transfer including processing status and results.
   *
   * İşleme durumu ve sonuçları dahil dosya tabanlı poliçe transferi hakkında detaylı bilgileri getirir.
   *
   * @param request - File policy transfer detail request
   * @returns File transfer details
   */
  async getFilePolicyTransferDetail(
    request: GetFilePolicyTransferDetailRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetFilePolicyTransferDetailResult>> {
    return this.http.get<GetFilePolicyTransferDetailResult>(
      endpoints.filePolicyTransfers.getFilePolicyTransferDetail.render(
        request.filePolicyTransferId
      ),
      options
    );
  }

  // ============================================================================
  // GRAPHQL QUERIES
  // ============================================================================

  /**
   * Queries policies using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak poliçeleri sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.policies.getPolicies({ first: 10 });
   *
   * @example
   * // Type-safe field selection
   * const result = await client.policies.getPolicies({
   *   select: ['id', 'productBranch', 'grossPremium', 'state'] as const,
   *   first: 10,
   *   filter: { state: { eq: PolicyState.Active } }
   * });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of policies with type-narrowed fields
   */
  async getPolicies<const TFields extends PolicyFieldKey[]>(
    requestOptions?: GetPoliciesOptions<TFields>,
    options?: RequestOptions
  ): Promise<InsurUpGraphQLResult<PoliciesConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        'GraphQL transport is not available. Ensure the client is properly initialized.'
      );
    }

    const fields = (requestOptions?.select ?? ALL_POLICY_FIELDS) as PolicyFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;
    const includeTotalCount = requestOptions?.includeTotalCount !== false;

    const query = `
      query GetPolicies(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryPoliciesResultFilterInput
        $filter: filtering_QueryPoliciesResultFilterInput
        $order: [sorting_QueryPoliciesResultSortInput!]
      ) {
        policiesNew(
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
          ${includeTotalCount ? 'totalCount' : ''}
          ${
            hasFieldSelection
              ? `edges {
            cursor
            node {
              ${fieldSelection}
            }
          }`
              : ''
          }
        }
      }
    `;

    const variables = {
      first: requestOptions?.first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      ...buildFilterSearchVariables(requestOptions?.filter),
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      policiesNew: Omit<PoliciesConnection, 'nodes'>;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<PoliciesConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.policiesNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.policiesNew,
        nodes,
      },
    } as InsurUpGraphQLResult<PoliciesConnection<TFields>>;
  }

  /**
   * Queries policy transfers using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak poliçe transferlerini sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.policies.getPolicyTransfers({ first: 10 });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of policy transfers with type-narrowed fields
   */
  async getPolicyTransfers<const TFields extends PolicyTransferFieldKey[]>(
    requestOptions?: GetPolicyTransfersOptions<TFields>,
    options?: RequestOptions
  ): Promise<InsurUpGraphQLResult<PolicyTransfersConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        'GraphQL transport is not available. Ensure the client is properly initialized.'
      );
    }

    const fields = (requestOptions?.select ??
      ALL_POLICY_TRANSFER_FIELDS) as PolicyTransferFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;

    const query = `
      query GetPolicyTransfers(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryPolicyTransfersResultFilterInput
        $filter: filtering_QueryPolicyTransfersResultFilterInput
        $order: [sorting_QueryPolicyTransfersResultSortInput!]
      ) {
        policyTransfersNew(
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
          ${
            hasFieldSelection
              ? `edges {
            cursor
            node {
              ${fieldSelection}
            }
          }`
              : ''
          }
        }
      }
    `;

    const variables = {
      first: requestOptions?.first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      ...buildFilterSearchVariables(requestOptions?.filter),
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      policyTransfersNew: Omit<PolicyTransfersConnection, 'nodes'>;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<PolicyTransfersConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.policyTransfersNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.policyTransfersNew,
        nodes,
      },
    } as InsurUpGraphQLResult<PolicyTransfersConnection<TFields>>;
  }

  /**
   * Queries file policy transfers using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak dosya bazlı poliçe transferlerini sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.policies.getFilePolicyTransfers({ first: 10 });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of file policy transfers with type-narrowed fields
   */
  async getFilePolicyTransfers<const TFields extends FilePolicyTransferFieldKey[]>(
    requestOptions?: GetFilePolicyTransfersOptions<TFields>,
    options?: RequestOptions
  ): Promise<InsurUpGraphQLResult<FilePolicyTransfersConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        'GraphQL transport is not available. Ensure the client is properly initialized.'
      );
    }

    const fields = (requestOptions?.select ??
      ALL_FILE_POLICY_TRANSFER_FIELDS) as FilePolicyTransferFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;

    const query = `
      query GetFilePolicyTransfers(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryFilePolicyTransfersResultFilterInput
        $filter: filtering_QueryFilePolicyTransfersResultFilterInput
        $order: [sorting_QueryFilePolicyTransfersResultSortInput!]
      ) {
        filePolicyTransfersNew(
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
          ${
            hasFieldSelection
              ? `edges {
            cursor
            node {
              ${fieldSelection}
            }
          }`
              : ''
          }
        }
      }
    `;

    const variables = {
      first: requestOptions?.first,
      after: requestOptions?.after,
      last: requestOptions?.last,
      before: requestOptions?.before,
      ...buildFilterSearchVariables(requestOptions?.filter),
      order: requestOptions?.order,
    };

    const result = await this.graphql.query<{
      filePolicyTransfersNew: Omit<FilePolicyTransfersConnection, 'nodes'>;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<FilePolicyTransfersConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.filePolicyTransfersNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.filePolicyTransfersNew,
        nodes,
      },
    } as InsurUpGraphQLResult<FilePolicyTransfersConnection<TFields>>;
  }
}
