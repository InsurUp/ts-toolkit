import type { HttpTransport } from "../client/http.js";
import type { GraphQLTransport } from "../client/graphql.js";
import type { InsurUpResult, InsurUpGraphQLResult } from "../core/result.js";
import type { RequestOptions } from "../core/options.js";
import { webhooks } from "../core/endpoints.js";
import {
  ALL_WEBHOOK_DELIVERY_FIELDS,
  type WebhookDeliveryFieldKey,
  type GetWebhookDeliveriesOptions,
  type WebhookDeliveriesConnection,
} from "@insurup/contracts";
import { buildFieldSelection } from "@insurup/contracts";
import type {
  CreateWebhookRequest,
  CreateWebhookResult,
  GetWebhookByIdResult,
  GetWebhooksResult,
  UpdateWebhookRequest,
  GetWebhookDeliveryResult,
} from "@insurup/contracts";

/**
 * Provides comprehensive webhook management operations for configuring event notifications, monitoring delivery status,
 * and managing external system integrations within the InsurUp platform ecosystem.
 *
 * InsurUp platform ekosistemi içinde olay bildirimlerini yapılandırma, teslimat durumunu izleme ve
 * harici sistem entegrasyonlarını yönetmek için kapsamlı webhook yönetimi işlemlerini sağlar.
 */
export class InsurUpWebhookClient {
  constructor(
    private readonly http: HttpTransport,
    private readonly graphql?: GraphQLTransport,
  ) {}

  /**
   * Creates a new webhook configuration to receive event notifications from the InsurUp platform.
   *
   * InsurUp platformundan olay bildirimleri almak için yeni webhook yapılandırması oluşturur.
   *
   * @param request Webhook creation request with endpoint and event configurations / Endpoint ve olay yapılandırmaları ile webhook oluşturma talebi
   * @returns Created webhook information / Oluşturulan webhook bilgileri
   */
  async createWebhook(
    request: CreateWebhookRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult<CreateWebhookResult>> {
    return this.http.post<CreateWebhookResult>(
      webhooks.create,
      request,
      options,
    );
  }

  /**
   * Retrieves detailed information about a specific webhook including its configuration and current status.
   *
   * Belirli bir webhook hakkında yapılandırması ve mevcut durumu dahil detaylı bilgileri getirir.
   *
   * @param webhookId Unique identifier of the webhook / Webhook'un benzersiz tanımlayıcısı
   * @returns Webhook configuration details / Webhook yapılandırma detayları
   */
  async getWebhookById(
    webhookId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetWebhookByIdResult>> {
    const endpoint = webhooks.getById.render(webhookId);
    return this.http.get<GetWebhookByIdResult>(endpoint, options);
  }

  /**
   * Retrieves all webhooks configured for the current agent or organization for comprehensive webhook management.
   *
   * Kapsamlı webhook yönetimi için mevcut acente veya organizasyon için yapılandırılmış tüm webhook'ları getirir.
   *
   * @returns List of configured webhooks / Yapılandırılmış webhook'lar listesi
   */
  async getWebhooks(
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetWebhooksResult[]>> {
    return this.http.get<GetWebhooksResult[]>(webhooks.getAll, options);
  }

  /**
   * Updates an existing webhook configuration including endpoint URL, event subscriptions, or authentication settings.
   *
   * Endpoint URL'si, olay abonelikleri veya kimlik doğrulama ayarları dahil mevcut webhook yapılandırmasını günceller.
   *
   * @param request Webhook update request with modified configuration / Değiştirilmiş yapılandırma ile webhook güncelleme talebi
   * @returns Operation result / İşlem sonucu
   */
  async updateWebhook(
    request: UpdateWebhookRequest,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = webhooks.update.render(request.id);
    return this.http.putNoContent(endpoint, request, options);
  }

  /**
   * Permanently removes a webhook configuration, stopping all future event notifications to the specified endpoint.
   *
   * Webhook yapılandırmasını kalıcı olarak kaldırır ve belirtilen endpoint'e gelecekteki tüm olay bildirimlerini durdurur.
   *
   * @param webhookId Unique identifier of the webhook to delete / Silinecek webhook'un benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async deleteWebhook(
    webhookId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = webhooks.delete.render(webhookId);
    return this.http.deleteNoContent(endpoint, options);
  }

  /**
   * Retrieves detailed information about a specific webhook delivery including delivery status, response, and timing.
   *
   * Teslimat durumu, yanıt ve zamanlama dahil belirli bir webhook teslimatı hakkında detaylı bilgileri getirir.
   *
   * @param webhookId Unique identifier of the webhook / Webhook'un benzersiz tanımlayıcısı
   * @param webhookDeliveryId Unique identifier of the delivery attempt / Teslimat denemesinin benzersiz tanımlayıcısı
   * @returns Webhook delivery details / Webhook teslimat detayları
   */
  async getWebhookDelivery(
    webhookId: string,
    webhookDeliveryId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult<GetWebhookDeliveryResult>> {
    const endpoint = webhooks.deliveries.getById.render(
      webhookId,
      webhookDeliveryId,
    );
    return this.http.get<GetWebhookDeliveryResult>(endpoint, options);
  }

  /**
   * Manually retries a failed webhook event delivery to attempt successful notification delivery.
   *
   * Başarılı bildirim teslimatını denemek için başarısız webhook olay teslimatını manuel olarak yeniden dener.
   *
   * @param webhookId Unique identifier of the webhook / Webhook'un benzersiz tanımlayıcısı
   * @param webhookDeliveryId Unique identifier of the delivery to retry / Yeniden denenecek teslimatın benzersiz tanımlayıcısı
   * @returns Operation result / İşlem sonucu
   */
  async redeliverWebhookEvent(
    webhookId: string,
    webhookDeliveryId: string,
    options?: RequestOptions,
  ): Promise<InsurUpResult> {
    const endpoint = webhooks.deliveries.redeliver.render(
      webhookId,
      webhookDeliveryId,
    );
    return this.http.postNoContent(endpoint, undefined, options);
  }

  // ============================================================================
  // GRAPHQL QUERIES
  // ============================================================================

  /**
   * Queries webhook deliveries using GraphQL with advanced filtering, searching, sorting, and field selection.
   * Supports cursor-based pagination and type-safe field selection.
   *
   * Gelişmiş filtreleme, arama, sıralama ve alan seçimi ile GraphQL kullanarak webhook teslimatlarını sorgular.
   * İmleç tabanlı sayfalama ve tip-güvenli alan seçimini destekler.
   *
   * @example
   * // Basic query with all fields
   * const result = await client.webhooks.getWebhookDeliveries({ first: 10 });
   *
   * @example
   * // Type-safe field selection with filter
   * const result = await client.webhooks.getWebhookDeliveries({
   *   select: ['id', 'webhookId', 'event', 'state'] as const,
   *   first: 10,
   *   filter: { state: { eq: WebhookDeliveryState.Failed } }
   * });
   *
   * @param requestOptions Query options including pagination, filters, search, and field selection
   * @returns Paginated connection of webhook deliveries with type-narrowed fields
   */
  async getWebhookDeliveries<const TFields extends WebhookDeliveryFieldKey[]>(
    requestOptions?: GetWebhookDeliveriesOptions<TFields>,
    options?: RequestOptions,
  ): Promise<InsurUpGraphQLResult<WebhookDeliveriesConnection<TFields>>> {
    if (!this.graphql) {
      throw new Error(
        "GraphQL transport is not available. Ensure the client is properly initialized.",
      );
    }

    const fields = (requestOptions?.select ??
      ALL_WEBHOOK_DELIVERY_FIELDS) as WebhookDeliveryFieldKey[];
    const fieldSelection = buildFieldSelection(fields);
    const hasFieldSelection = fieldSelection.length > 0;

    const query = `
      query GetWebhookDeliveries(
        $first: Int
        $after: String
        $last: Int
        $before: String
        $search: searching_QueryWebhookDeliveryResultFilterInput
        $filter: filtering_QueryWebhookDeliveryResultFilterInput
        $order: [sorting_QueryWebhookDeliveryResultSortInput!]
      ) {
        webhookDeliveriesNew(
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
      webhookDeliveriesNew: Omit<WebhookDeliveriesConnection, "nodes">;
    }>(query, variables, options);

    if (!result.isSuccess) {
      return result as InsurUpGraphQLResult<
        WebhookDeliveriesConnection<TFields>
      >;
    }

    // Derive nodes from edges
    const edges = result.data.webhookDeliveriesNew.edges;
    const nodes = edges?.map((edge) => edge?.node ?? null) ?? null;

    return {
      ...result,
      data: {
        ...result.data.webhookDeliveriesNew,
        nodes,
      },
    } as InsurUpGraphQLResult<WebhookDeliveriesConnection<TFields>>;
  }
}
