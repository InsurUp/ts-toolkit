/**
 * @fileoverview Admin Insights Client - How agencies use the platform
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  GetInsightsAgentRequest,
  GetInsightsAgentResult,
  GetInsightsAgentsRequest,
  GetInsightsAgentsResult,
  GetInsightsAssistantRequest,
  GetInsightsAssistantResult,
  GetInsightsChannelsRequest,
  GetInsightsChannelsResult,
  GetInsightsFeaturesRequest,
  GetInsightsFeaturesResult,
  GetInsightsOperationsRequest,
  GetInsightsOperationsResult,
  GetInsightsOverviewRequest,
  GetInsightsOverviewResult,
  GetInsightsSalesRequest,
  GetInsightsSalesResult,
} from '@insurup/contracts';

/**
 * Business insights over a range: the platform overview, every agency's activity, one agency's users, the feature
 * matrix, sales, channels, case operations and assistant usage. Ranges start at the start of an Istanbul day and end
 * exclusively.
 *
 * Bir aralıktaki iş içgörüleri: platform özeti, tüm acentelerin etkinliği, tek bir acentenin kullanıcıları, özellik
 * matrisi, satışlar, kanallar, talep operasyonları ve asistan kullanımı. Aralıklar bir İstanbul gününün başında başlar
 * ve bitişi hariçtir.
 */
export class InsurUpAdminInsightsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * What happened on the platform, or at one agency, over a range of at most 366 days, with the range before it to
   * compare.
   *
   * En fazla 366 günlük bir aralıkta platformda veya tek bir acentede olanlar, karşılaştırma için önceki aralıkla
   * birlikte.
   */
  async getOverview(
    req: GetInsightsOverviewRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsOverviewResult>> {
    return this.http.post<GetInsightsOverviewResult>(admin.insights.getOverview, req, options);
  }

  /**
   * Every agency's activity over a range of at most 93 days, the most proposals first.
   *
   * En fazla 93 günlük bir aralıkta tüm acentelerin etkinliği; en çok teklif açan önce.
   */
  async getAgents(
    req: GetInsightsAgentsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsAgentsResult>> {
    return this.http.post<GetInsightsAgentsResult>(admin.insights.getAgents, req, options);
  }

  /**
   * One agency's users and the agent panel screens they opened over a range of at most 93 days.
   *
   * Tek bir acentenin kullanıcıları ve en fazla 93 günlük bir aralıkta açtıkları acente paneli ekranları.
   */
  async getAgent(
    req: GetInsightsAgentRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsAgentResult>> {
    return this.http.post<GetInsightsAgentResult>(admin.insights.getAgent, req, options);
  }

  /**
   * Which features each agency is entitled to, has set up and used over a range of at most 93 days.
   *
   * Her acentenin en fazla 93 günlük bir aralıkta hangi özelliklere hakkı olduğu, hangilerini kurduğu ve kullandığı.
   */
  async getFeatures(
    req: GetInsightsFeaturesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsFeaturesResult>> {
    return this.http.post<GetInsightsFeaturesResult>(admin.insights.getFeatures, req, options);
  }

  /**
   * The sales over a range of at most 93 days: insurance companies' quotes, premium, renewals ahead and endorsements.
   *
   * En fazla 93 günlük bir aralıktaki satışlar: sigorta şirketlerinin fiyatları, prim, yaklaşan yenilemeler ve
   * zeyiller.
   */
  async getSales(
    req: GetInsightsSalesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsSalesResult>> {
    return this.http.post<GetInsightsSalesResult>(admin.insights.getSales, req, options);
  }

  /**
   * Where the business came from over a range of at most 93 days.
   *
   * En fazla 93 günlük bir aralıkta işin nereden geldiği.
   */
  async getChannels(
    req: GetInsightsChannelsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsChannelsResult>> {
    return this.http.post<GetInsightsChannelsResult>(admin.insights.getChannels, req, options);
  }

  /**
   * How the cases were worked over a range of at most 93 days.
   *
   * En fazla 93 günlük bir aralıkta taleplerin nasıl işlendiği.
   */
  async getOperations(
    req: GetInsightsOperationsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsOperationsResult>> {
    return this.http.post<GetInsightsOperationsResult>(admin.insights.getOperations, req, options);
  }

  /**
   * How the assistant was used over a range of at most 31 days.
   *
   * En fazla 31 günlük bir aralıkta asistanın nasıl kullanıldığı.
   */
  async getAssistant(
    req: GetInsightsAssistantRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetInsightsAssistantResult>> {
    return this.http.post<GetInsightsAssistantResult>(admin.insights.getAssistant, req, options);
  }
}
