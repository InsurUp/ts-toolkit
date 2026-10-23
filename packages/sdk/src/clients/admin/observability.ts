/**
 * @fileoverview Admin Observability Client - Logs, metrics, traces, InsurGateway calls and database statistics
 * @description The admin panel's window onto the platform's logs, metrics and traces, InsurGateway's call log and
 * the database's slow queries and collection statistics
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  CountLogsRequest,
  CountLogsResult,
  GetDatabaseCollectionResult,
  GetDatabaseCollectionsResult,
  GetIgwCallResult,
  GetIgwIndexStatusResult,
  GetLogFieldValuesRequest,
  GetLogFieldValuesResult,
  GetLogHistogramRequest,
  GetLogHistogramResult,
  GetSlowQueriesRequest,
  GetSlowQueriesResult,
  GetSlowQueryRequest,
  GetSlowQueryResult,
  GetSlowQuerySampleRequest,
  GetSlowQuerySampleResult,
  GetTraceOperationsResult,
  GetTraceResult,
  GetTraceSpanResult,
  GroupLogsRequest,
  GroupLogsResult,
  ObservabilityCapabilitiesResult,
  QueryMetricsRequest,
  QueryMetricsResult,
  ResolveLogCorrelationRequest,
  ResolveLogCorrelationResult,
  SearchLogsRequest,
  SearchLogsResult,
  SearchTracesRequest,
  SearchTracesResult,
} from '@insurup/contracts';

/**
 * Reads the platform's logs, metrics and traces, InsurGateway's calls to insurance companies, and the database's
 * slow queries and collection statistics. An endpoint whose backend isn't configured in the environment answers
 * with a `FeatureNotSupported` error; `getCapabilities` says which are.
 *
 * Platformun loglarını, metriklerini ve trace'lerini, InsurGateway'in sigorta şirketlerine yaptığı çağrıları ve
 * veritabanının yavaş sorgularıyla koleksiyon istatistiklerini okur. Altyapısı ortamda yapılandırılmamış bir uç
 * nokta `FeatureNotSupported` hatası döner; hangilerinin yapılandırıldığını `getCapabilities` söyler.
 */
export class InsurUpAdminObservabilityClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Which observability backends this environment is connected to, and the services each can read.
   *
   * Bu ortamın hangi gözlemlenebilirlik altyapılarına bağlı olduğu ve her birinin okuyabildiği servisler.
   */
  async getCapabilities(
    options?: RequestOptions
  ): Promise<InsurUpResult<ObservabilityCapabilitiesResult>> {
    return this.http.get<ObservabilityCapabilitiesResult>(
      admin.observability.getCapabilities,
      options
    );
  }

  /**
   * Reads one page of the platform's log entries, newest first.
   *
   * Platformun log kayıtlarının bir sayfasını en yeniden başlayarak okur.
   */
  async searchLogs(
    request: SearchLogsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<SearchLogsResult>> {
    return this.http.post<SearchLogsResult>(admin.observability.searchLogs, request, options);
  }

  /**
   * Counts every log entry a filter matches, in total and per category.
   *
   * Bir filtreyle eşleşen tüm log kayıtlarını toplamda ve kategori bazında sayar.
   */
  async countLogs(
    request: CountLogsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<CountLogsResult>> {
    return this.http.post<CountLogsResult>(admin.observability.countLogs, request, options);
  }

  /**
   * Counts the matching log entries per time bucket, with the errors among them.
   *
   * Eşleşen log kayıtlarını zaman dilimi başına, aralarındaki hatalarla birlikte sayar.
   */
  async getLogHistogram(
    request: GetLogHistogramRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetLogHistogramResult>> {
    return this.http.post<GetLogHistogramResult>(
      admin.observability.getLogHistogram,
      request,
      options
    );
  }

  /**
   * Lists the distinct values a log field takes among the matching entries, most frequent first.
   *
   * Bir log alanının eşleşen kayıtlarda aldığı farklı değerleri en sık olandan başlayarak listeler.
   */
  async getLogFieldValues(
    request: GetLogFieldValuesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetLogFieldValuesResult>> {
    return this.http.post<GetLogFieldValuesResult>(
      admin.observability.getLogFieldValues,
      request,
      options
    );
  }

  /**
   * Finds the records an identifier leads to, across every agency, and when a log search for it should look.
   *
   * Bir tanımlayıcının tüm acentelerde ulaştığı kayıtları ve onun için yapılacak log aramasının hangi zaman
   * aralığına bakması gerektiğini bulur.
   */
  async resolveLogCorrelation(
    request: ResolveLogCorrelationRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<ResolveLogCorrelationResult>> {
    return this.http.post<ResolveLogCorrelationResult>(
      admin.observability.resolveLogCorrelation,
      request,
      options
    );
  }

  /**
   * Counts the matching log entries per combination of some fields' values, most first.
   *
   * Eşleşen log kayıtlarını bazı alanların değer kombinasyonlarına göre, en çoktan başlayarak sayar.
   */
  async groupLogs(
    request: GroupLogsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GroupLogsResult>> {
    return this.http.post<GroupLogsResult>(admin.observability.groupLogs, request, options);
  }

  /**
   * Runs metric queries over one service and time range; the backend builds the PromQL.
   *
   * Tek bir servis ve zaman aralığı üzerinde metrik sorguları çalıştırır; PromQL'i backend oluşturur.
   */
  async queryMetrics(
    request: QueryMetricsRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<QueryMetricsResult>> {
    return this.http.post<QueryMetricsResult>(admin.observability.queryMetrics, request, options);
  }

  /**
   * Finds the traces of one service that match some conditions, newest first.
   *
   * Bir servisin koşullara uyan trace'lerini en yeniden başlayarak bulur.
   */
  async searchTraces(
    request: SearchTracesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<SearchTracesResult>> {
    return this.http.post<SearchTracesResult>(admin.observability.searchTraces, request, options);
  }

  /**
   * Lists the span names a service has recorded, for picking a trace search's operation.
   *
   * Bir servisin kaydettiği span adlarını listeler; trace aramasında işlem seçmek için kullanılır.
   *
   * @param service The service, by its `service.name` / Servis (`service.name` değeriyle)
   */
  async getTraceOperations(
    service: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetTraceOperationsResult>> {
    return this.http.get<GetTraceOperationsResult>(
      admin.observability.getTraceOperations.render(service),
      options
    );
  }

  /**
   * Reads one trace: its spans across every service and how many log entries each wrote. A trace the backend
   * doesn't hold (yet: one shows up about a minute after it ends) answers `ResourceNotFound`.
   *
   * Tek bir trace'i okur: tüm servislerdeki span'leri ve her birinin yazdığı log kaydı sayısı. Altyapının
   * (henüz) tutmadığı bir trace `ResourceNotFound` döner; bir trace bittikten yaklaşık bir dakika sonra görünür.
   *
   * @param traceId The trace ID: 32 hexadecimal digits, or 16 / Trace kimliği: 32 veya 16 onaltılık basamak
   */
  async getTrace(
    traceId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetTraceResult>> {
    return this.http.get<GetTraceResult>(admin.observability.getTrace.render(traceId), options);
  }

  /**
   * Reads one span of a trace in full, with the log entries it wrote.
   *
   * Bir trace'in tek bir span'ini, yazdığı log kayıtlarıyla birlikte eksiksiz okur.
   *
   * @param traceId The trace ID / Trace kimliği
   * @param spanId The span ID: 16 hexadecimal digits / Span kimliği: 16 onaltılık basamak
   */
  async getTraceSpan(
    traceId: string,
    spanId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetTraceSpanResult>> {
    return this.http.get<GetTraceSpanResult>(
      admin.observability.getTraceSpan.render(traceId, spanId),
      options
    );
  }

  /**
   * How far InsurGateway's call log has been indexed.
   *
   * InsurGateway çağrı logunun ne kadarının indekslendiği.
   */
  async getIgwIndexStatus(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetIgwIndexStatusResult>> {
    return this.http.get<GetIgwIndexStatusResult>(admin.observability.getIgwIndexStatus, options);
  }

  /**
   * Reads one InsurGateway call to an insurance company, both sides, with every secret masked; the read is logged.
   *
   * InsurGateway'in bir sigorta şirketine yaptığı tek bir çağrıyı, her iki tarafıyla ve tüm gizli bilgileri
   * maskelenmiş olarak okur; okuma loglanır.
   *
   * @param logId The call's log ID (`igw.log_id`) / Çağrının log kimliği (`igw.log_id`)
   */
  async getIgwCall(
    logId: number,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetIgwCallResult>> {
    return this.http.get<GetIgwCallResult>(
      admin.observability.getIgwCall.render(String(logId)),
      options
    );
  }

  /**
   * Lists the queries the database logged as slow over a range, grouped by collection, shape and plan.
   *
   * Veritabanının bir aralıkta yavaş olarak logladığı sorguları koleksiyon, şekil ve plana göre gruplayarak
   * listeler.
   */
  async getSlowQueries(
    request: GetSlowQueriesRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetSlowQueriesResult>> {
    return this.http.post<GetSlowQueriesResult>(
      admin.observability.getSlowQueries,
      request,
      options
    );
  }

  /**
   * Reads one group of slow queries: its runs over time, the latest ones and its shape.
   *
   * Bir yavaş sorgu grubunu okur: zaman içindeki çalışmaları, en sonuncuları ve şekli.
   */
  async getSlowQuery(
    request: GetSlowQueryRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetSlowQueryResult>> {
    return this.http.post<GetSlowQueryResult>(admin.observability.getSlowQuery, request, options);
  }

  /**
   * Reads one slow run's command with its values; needs `observability:db-query-read`, and the read is logged.
   *
   * Bir yavaş çalışmanın komutunu değerleriyle okur; `observability:db-query-read` yetkisi gerekir ve okuma
   * loglanır.
   */
  async getSlowQuerySample(
    request: GetSlowQuerySampleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetSlowQuerySampleResult>> {
    return this.http.post<GetSlowQuerySampleResult>(
      admin.observability.getSlowQuerySample,
      request,
      options
    );
  }

  /**
   * Every collection's statistics: documents, sizes, indexes and the operations run on it.
   *
   * Her koleksiyonun istatistikleri: dokümanlar, boyutlar, indeksler ve üzerinde çalışan işlemler.
   */
  async getDatabaseCollections(
    options?: RequestOptions
  ): Promise<InsurUpResult<GetDatabaseCollectionsResult>> {
    return this.http.get<GetDatabaseCollectionsResult>(
      admin.observability.getDatabaseCollections,
      options
    );
  }

  /**
   * One collection's indexes: keys, options, size and how often each was used.
   *
   * Bir koleksiyonun indeksleri: anahtarlar, seçenekler, boyut ve her birinin ne sıklıkla kullanıldığı.
   *
   * @param database The database, as the collection list names it / Koleksiyon listesindeki adıyla veritabanı
   * @param collection The collection / Koleksiyon
   */
  async getDatabaseCollection(
    database: string,
    collection: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetDatabaseCollectionResult>> {
    return this.http.get<GetDatabaseCollectionResult>(
      admin.observability.getDatabaseCollection.render(database, collection),
      options
    );
  }
}
