/**
 * @fileoverview Proposal Client - Comprehensive proposal management operations
 * @description Provides comprehensive proposal management operations for creating insurance proposals, managing proposal lifecycle,
 * document generation, product purchasing, and comparison tools within the insurance sales process.
 */

import type { HttpTransport } from "../client/http.js";
import type { GraphQLTransport } from "../client/graphql.js";
import type { InsurUpResult, InsurUpGraphQLResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { endpoints } from "../core/endpoints.js";
import {
  ALL_PROPOSAL_FIELDS,
  type ProposalFieldKey,
  type GetProposalsOptions,
  type ProposalsConnection,
} from "@insurup/contracts";
import { buildFieldSelection } from "@insurup/contracts";
import type {
  CreateProposalRequest,
  CreateProposalResult,
  GetProposalByIdResult,
  GetProposalProductPremiumDetailResult,
  PurchaseProposalProductSyncRequest,
  PurchaseProposalProductSyncResult,
  PurchaseProposalProductAsyncRequest,
  PurchaseProposalProductAsyncResult,
  GetProposalProductCoverageResult,
  ReviseProposalRequest,
  ReviseProposalResult,
  ReviseProposalProductRequest,
  FetchProposalProductDocumentRequest,
  FetchProposalProductDocumentResult,
  FetchProposalInformationFormDocumentRequest,
  FetchProposalInformationFormDocumentResult,
  SendProposalProductDocumentRequest,
  SendProposalInformationFormDocumentRequest,
  GenerateCompareProposalProductsPdfRequest,
  GenerateCompareProposalProductsPdfResult,
  SendCompareProposalProductsPdfRequest,
  SetProposalRepresentativeRequest,
  RetryFailedProposalProductRequest,
  GenerateCustomerProposalDocumentPdfRequest,
  GenerateCustomerProposalDocumentPdfResult,
  SetProposalBranchRequest,
  GetProposalConversionTrendRequest,
  GetProposalConversionTrendResult,
} from "@insurup/contracts";

/**
 * Proposal Management Client / Teklif Yönetimi İstemcisi
 *
 * Central client for managing the complete insurance proposal lifecycle from creation to policy conversion. Handles
 * proposal generation, product comparison, premium calculations, document management, customer communication, and the
 * purchasing process for various insurance products. Provides both synchronous and asynchronous purchasing options,
 * comprehensive document generation including comparison PDFs, and proposal revision capabilities. Essential for
 * agencies that need to create competitive insurance proposals, manage customer decision processes, and convert
 * proposals into active policies while maintaining detailed audit trails and customer communication records.
 *
 * Oluşturmadan poliçe dönüştürmeye kadar tam sigorta teklif yaşam döngüsünü yönetmek için merkezi istemci.
 * Teklif oluşturma, ürün karşılaştırması, prim hesaplamaları, belge yönetimi, müşteri iletişimi ve çeşitli sigorta
 * ürünleri için satın alma sürecini yönetir. Hem senkron hem de asenkron satın alma seçenekleri, karşılaştırma PDF'leri
 * dahil kapsamlı belge oluşturma ve teklif revizyon yetenekleri sağlar. Rekabetçi sigorta teklifleri oluşturması,
 * müşteri karar süreçlerini yönetmesi ve detaylı denetim izleri ile müşteri iletişim kayıtlarını korurken teklifleri
 * aktif poliçelere dönüştürmesi gereken acenteler için olmazsa olmazdır.
 */
export class InsurUpProposalClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport,
  ) {}

  /**
   * Creates a new insurance proposal with customer information, coverage selections, and product options for quotation.
   *
   * Fiyat teklifi için müşteri bilgileri, teminat seçimleri ve ürün seçenekleri ile yeni sigorta teklifi oluşturur.
   *
   * @param request - Proposal creation request with customer and coverage details / Müşteri ve teminat detayları ile teklif oluşturma talebi
   * @returns Created proposal information / Oluşturulan teklif bilgileri
   */
  async createProposal(
    request: CreateProposalRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<CreateProposalResult>> {
    return this.http.post<CreateProposalResult>(
      endpoints.proposals.create,
      request,
      options,
    );
  }

  /**
   * Retries a failed proposal product calculation or processing to attempt resolution of temporary issues.
   *
   * Geçici sorunların çözümünü denemek için başarısız teklif ürün hesaplama veya işlemesini yeniden dener.
   *
   * @param proposalId - Unique identifier of the proposal / Teklifin benzersiz tanımlayıcısı
   * @param proposalProductId - Unique identifier of the proposal product / Teklif ürününün benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async retryFailedProposalProduct(
    proposalId: string,
    proposalProductId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const request: RetryFailedProposalProductRequest = {
      proposalId,
      proposalProductId,
    };
    return this.http.postNoContent(
      endpoints.proposals.retryFailedProposalProduct.render(
        proposalId,
        proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Retrieves comprehensive details of a specific proposal including all products, coverage options, and pricing information.
   *
   * Tüm ürünler, teminat seçenekleri ve fiyatlandırma bilgileri dahil belirli bir teklifin kapsamlı detaylarını getirir.
   *
   * @param proposalId - Unique identifier of the proposal / Teklifin benzersiz tanımlayıcısı
   * @returns Detailed proposal information / Detaylı teklif bilgileri
   */
  async getProposalDetail(
    proposalId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetProposalByIdResult>> {
    return this.http.get<GetProposalByIdResult>(
      endpoints.proposals.getProposalById.render(proposalId),
      options,
    );
  }

  /**
   * Retrieves detailed premium breakdown information for a specific proposal product including installment options.
   *
   * Taksit seçenekleri dahil belirli bir teklif ürünü için detaylı prim dağılım bilgilerini getirir.
   *
   * @param proposalId - Unique identifier of the proposal / Teklifin benzersiz tanımlayıcısı
   * @param proposalProductId - Unique identifier of the proposal product / Teklif ürününün benzersiz tanımlayıcısı
   * @param installmentNumber - Installment option number / Taksit seçenek numarası
   * @returns Premium breakdown details / Prim dağılım detayları
   */
  async getProposalProductPremiumDetail(
    proposalId: string,
    proposalProductId: string,
    installmentNumber: number,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetProposalProductPremiumDetailResult>> {
    return this.http.get<GetProposalProductPremiumDetailResult>(
      endpoints.proposals.getProposalProductPremiumDetail.render(
        proposalId,
        proposalProductId,
        installmentNumber,
      ),
      options,
    );
  }

  /**
   * Purchases a proposal product synchronously, converting it to an active policy with immediate confirmation.
   *
   * Teklif ürününü senkron olarak satın alır ve anında onay ile aktif poliçeye dönüştürür.
   *
   * @param request - Synchronous purchase request / Senkron satın alma talebi
   * @returns Purchase confirmation with policy details / Poliçe detayları ile satın alma onayı
   */
  async purchaseProposalProductSync(
    request: PurchaseProposalProductSyncRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<PurchaseProposalProductSyncResult>> {
    return this.http.post<PurchaseProposalProductSyncResult>(
      endpoints.proposals.purchaseProposalProductSync.render(
        request.proposalId,
        request.proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Initiates an asynchronous purchase process for a proposal product, allowing for background processing and later confirmation.
   *
   * Arka plan işleme ve sonraki onay için teklif ürünü için asenkron satın alma sürecini başlatır.
   *
   * @param request - Asynchronous purchase request / Asenkron satın alma talebi
   * @returns Purchase initiation confirmation / Satın alma başlatma onayı
   */
  async purchaseProposalProductAsync(
    request: PurchaseProposalProductAsyncRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<PurchaseProposalProductAsyncResult>> {
    return this.http.post<PurchaseProposalProductAsyncResult>(
      endpoints.proposals.purchaseProposalProductAsync.render(
        request.proposalId,
        request.proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Retrieves detailed coverage configuration for a specific proposal product including all coverage options and limits.
   *
   * Tüm teminat seçenekleri ve limitleri dahil belirli bir teklif ürünü için detaylı teminat yapılandırmasını getirir.
   *
   * @param proposalId - Unique identifier of the proposal / Teklifin benzersiz tanımlayıcısı
   * @param proposalProductId - Unique identifier of the proposal product / Teklif ürününün benzersiz tanımlayıcısı
   * @returns Coverage configuration details / Teminat yapılandırma detayları
   */
  async getProposalProductCoverage(
    proposalId: string,
    proposalProductId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetProposalProductCoverageResult>> {
    return this.http.get<GetProposalProductCoverageResult>(
      endpoints.proposals.getProposalProductCoverage.render(
        proposalId,
        proposalProductId,
      ),
      options,
    );
  }

  /**
   * Creates a revised version of an existing proposal with updated information, coverage changes, or customer modifications.
   *
   * Güncellenmiş bilgiler, teminat değişiklikleri veya müşteri değişiklikleri ile mevcut teklifin revize edilmiş versiyonunu oluşturur.
   *
   * @param request - Proposal revision request / Teklif revizyon talebi
   * @returns Revised proposal information / Revize edilmiş teklif bilgileri
   */
  async reviseProposal(
    request: ReviseProposalRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<ReviseProposalResult>> {
    return this.http.post<ReviseProposalResult>(
      endpoints.proposals.reviseProposal.render(request.proposalId),
      request,
      options,
    );
  }

  /**
   * Revises a specific product within a proposal with updated coverage options, limits, or pricing parameters.
   *
   * Güncellenmiş teminat seçenekleri, limitler veya fiyatlandırma parametreleri ile teklif içindeki belirli ürünü revize eder.
   *
   * @param request - Product revision request / Ürün revizyon talebi
   * @returns Operation result / İşlem sonucu
   */
  async reviseProposalProduct(
    request: ReviseProposalProductRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.reviseProposalProduct.render(
        request.proposalId,
        request.proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Fetches the official proposal document for a specific product from the insurance company's systems.
   *
   * Sigorta şirketinin sistemlerinden belirli bir ürün için resmi teklif belgesini getirir.
   *
   * @param request - Document fetch request / Belge getirme talebi
   * @returns Proposal document data / Teklif belgesi verisi
   */
  async fetchProposalProductDocument(
    request: FetchProposalProductDocumentRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<FetchProposalProductDocumentResult>> {
    return this.http.get<FetchProposalProductDocumentResult>(
      endpoints.proposals.fetchProposalProductDocument.render(
        request.proposalId,
        request.proposalProductId,
      ),
      options,
    );
  }

  /**
   * Fetches the information form document that contains detailed product information and terms for customer review.
   *
   * Müşteri incelemesi için detaylı ürün bilgileri ve şartları içeren bilgi formu belgesini getirir.
   *
   * @param request - Information form document request / Bilgi formu belgesi talebi
   * @returns Information form document data / Bilgi formu belgesi verisi
   */
  async fetchProposalInformationFormDocument(
    request: FetchProposalInformationFormDocumentRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<FetchProposalInformationFormDocumentResult>> {
    return this.http.get<FetchProposalInformationFormDocumentResult>(
      endpoints.proposals.fetchProposalInformationFormDocument.render(
        request.proposalId,
        request.proposalProductId,
      ),
      options,
    );
  }

  /**
   * Sends the proposal product document directly to the customer via email or other communication channels.
   *
   * Teklif ürün belgesini e-posta veya diğer iletişim kanalları aracılığıyla doğrudan müşteriye gönderir.
   *
   * @param request - Document delivery request / Belge teslim talebi
   * @returns Operation result / İşlem sonucu
   */
  async sendProposalProductDocument(
    request: SendProposalProductDocumentRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.sendProposalProductDocument.render(
        request.proposalId,
        request.proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Sends the information form document to the customer for detailed product review and decision making.
   *
   * Detaylı ürün incelemesi ve karar verme için bilgi formu belgesini müşteriye gönderir.
   *
   * @param request - Information form delivery request / Bilgi formu teslim talebi
   * @returns Operation result / İşlem sonucu
   */
  async sendProposalInformationFormDocument(
    request: SendProposalInformationFormDocumentRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.sendProposalInformationFormDocument.render(
        request.proposalId,
        request.proposalProductId,
      ),
      request,
      options,
    );
  }

  /**
   * Generates a comparative PDF document showing multiple proposal products side-by-side for customer decision support.
   *
   * Müşteri karar desteği için birden fazla teklif ürününü yan yana gösteren karşılaştırmalı PDF belgesi oluşturur.
   *
   * @param request - Comparison PDF generation request / Karşılaştırma PDF oluşturma talebi
   * @returns Generated comparison document / Oluşturulan karşılaştırma belgesi
   */
  async generateCompareProposalProductsPdf(
    request: GenerateCompareProposalProductsPdfRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GenerateCompareProposalProductsPdfResult>> {
    return this.http.post<GenerateCompareProposalProductsPdfResult>(
      endpoints.proposals.generateCompareProposalProductsPdf.render(
        request.proposalId,
      ),
      request,
      options,
    );
  }

  /**
   * Sends the proposal comparison PDF document to the customer to facilitate informed decision making between insurance options.
   *
   * Sigorta seçenekleri arasında bilinçli karar vermeyi kolaylaştırmak için teklif karşılaştırma PDF belgesini müşteriye gönderir.
   *
   * @param request - Comparison PDF delivery request / Karşılaştırma PDF teslim talebi
   * @returns Operation result / İşlem sonucu
   */
  async sendCompareProposalProductsPdf(
    request: SendCompareProposalProductsPdfRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.sendCompareProposalProductsPdf.render(
        request.proposalId,
      ),
      request,
      options,
    );
  }

  /**
   * Generates a professional PDF document containing selected proposal products for customer presentation.
   *
   * Müşteri sunumu için seçilen teklif ürünlerini içeren profesyonel bir PDF belgesi oluşturur.
   *
   * @param request Customer proposal document generation request / Müşteri teklif belgesi oluşturma talebi
   * @returns Generated document URL / Oluşturulan belge URL'i
   */
  async generateCustomerProposalDocumentPdf(
    request: GenerateCustomerProposalDocumentPdfRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GenerateCustomerProposalDocumentPdfResult>> {
    return this.http.post<GenerateCustomerProposalDocumentPdfResult>(
      endpoints.proposals.generateCustomerProposalDocumentPdf.render(
        request.proposalId,
      ),
      request,
      options,
    );
  }

  /**
   * Assigns or changes the branch for a proposal to organize proposal segmentation and reporting.
   *
   * Teklif segmentasyonu ve raporlama için teklifin şubesini atar veya değiştirir.
   *
   * @param request Branch assignment request / Şube atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setProposalBranch(
    request: SetProposalBranchRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.setProposalBranch.render(request.proposalId),
      request,
      options,
    );
  }

  /**
   * Retrieves proposal-to-policy conversion trend analytics as a time series.
   *
   * Tekliften poliçeye dönüşüm trendi analitiğini zaman serisi olarak getirir.
   *
   * @param request Conversion trend analytics request / Dönüşüm trendi analitik isteği
   * @returns Conversion trend analytics response / Dönüşüm trendi analitiği yanıtı
   */
  async getProposalConversionTrend(
    request: GetProposalConversionTrendRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetProposalConversionTrendResult>> {
    return this.http.post<GetProposalConversionTrendResult>(
      endpoints.proposals.getProposalConversionTrend.definition,
      request,
      options,
    );
  }

  /**
   * Assigns or updates the representative responsible for managing a specific proposal and customer relationship.
   *
   * Belirli bir teklifi ve müşteri ilişkisini yönetmekten sorumlu temsilciyi atar veya günceller.
   *
   * @param request - Representative assignment request / Temsilci atama talebi
   * @returns Operation result / İşlem sonucu
   */
  async setProposalRepresentative(
    request: SetProposalRepresentativeRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    return this.http.postNoContent(
      endpoints.proposals.setProposalRepresentative.render(request.proposalId),
      request,
      options,
    );
  }

  // ============================================================================
  // GRAPHQL QUERIES
  // ============================================================================

  /**
   * Queries proposals using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak teklifleri sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.proposals.getProposals({ first: 10 });
   *
   * @example
   * // Type-safe field selection
   * const result = await client.proposals.getProposals({
   *   select: ['id', 'productBranch', 'state', 'insuredCustomerName'] as const,
   *   first: 10,
   *   filter: { state: { eq: ProposalState.Active } }
   * });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of proposals with type-narrowed fields
   */
  async getProposals<const TFields extends ProposalFieldKey[]>(
    requestOptions?: GetProposalsOptions<TFields>,
    options?: RequestOptions,
  ): Promise<InsurUpGraphQLResult<ProposalsConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        "GraphQL transport is not available. Ensure the client is properly initialized.",
      );
    }

    const fields = (requestOptions?.select ??
      ALL_PROPOSAL_FIELDS) as ProposalFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;

    const query = `
      query GetProposals(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryProposalsResultFilterInput
        $filter: filtering_QueryProposalsResultFilterInput
        $order: [sorting_QueryProposalsResultSortInput!]
      ) {
        proposalsNew(
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
          ${hasFieldSelection ? `edges {
            cursor
            node {
              ${fieldSelection}
            }
          }` : ""}
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
      proposalsNew: Omit<ProposalsConnection, "nodes">;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<ProposalsConnection<TFields>>;
    }

    // Derive nodes from edges
    const edges = result.data.proposalsNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.proposalsNew,
        nodes,
      },
    } as InsurUpGraphQLResult<ProposalsConnection<TFields>>;
  }
}
