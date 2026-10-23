/**
 * @fileoverview Admin Alerts Client - Alert rules, alerts, notification channels and silences
 * @description Alerting over the platform's metrics and logs: the rules, their pending and firing alerts and
 * history, the channels they notify and the silences that quiet them
 */

import type { HttpTransport } from '../../client/http.js';
import type { InsurUpResult } from '../../core/result.js';
import type { RequestOptions } from '../../core/options.js';
import { admin } from '../../core/endpoints.js';
import type {
  AcknowledgeAlertRequest,
  AlertResult,
  AlertRuleResult,
  AlertSilenceResult,
  CreateAlertRuleRequest,
  CreateAlertSilenceRequest,
  CreateNotificationChannelRequest,
  GetAlertHistoryRequest,
  GetAlertHistoryResult,
  GetAlertsResult,
  ListAlertRulesResult,
  ListAlertSilencesResult,
  ListNotificationChannelsResult,
  NotificationChannelResult,
  PreviewAlertRuleRequest,
  PreviewAlertRuleResult,
  TestNotificationChannelResult,
  UpdateAlertRuleRequest,
  UpdateNotificationChannelRequest,
} from '@insurup/contracts';

/**
 * Alert rules over the platform's metrics and logs, their alerts and history, the notification channels they tell
 * and the silences that quiet them. Where the environment doesn't evaluate rules, the history answers with a
 * `FeatureNotSupported` error and `getAlerts` reports `enabled: false`.
 *
 * Platformun metrikleri ve logları üzerindeki alarm kuralları, alarmları ve geçmişleri, haber verdikleri bildirim
 * kanalları ve onları susturan susturmalar. Ortam kuralları değerlendirmiyorsa geçmiş `FeatureNotSupported`
 * hatası döner ve `getAlerts` `enabled: false` bildirir.
 */
export class InsurUpAdminAlertsClient {
  constructor(private readonly http: HttpTransport) {}

  /**
   * Every pending and firing alert across every rule, and whether this environment evaluates rules at all.
   *
   * Tüm kurallardaki bekleyen ve tetiklenmiş alarmlar ile bu ortamın kuralları değerlendirip değerlendirmediği.
   */
  async getAlerts(options?: RequestOptions): Promise<InsurUpResult<GetAlertsResult>> {
    return this.http.get<GetAlertsResult>(admin.alerts.getAlerts, options);
  }

  /**
   * Reads what happened to alerts over a time range, newest first, one page at a time.
   *
   * Bir zaman aralığında alarmlara ne olduğunu en yeniden başlayarak sayfa sayfa okur.
   */
  async getHistory(
    request: GetAlertHistoryRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<GetAlertHistoryResult>> {
    return this.http.post<GetAlertHistoryResult>(admin.alerts.getHistory, request, options);
  }

  /**
   * Marks a pending or firing alert as being looked at: its channels get no more reminders.
   *
   * Bekleyen veya tetiklenmiş bir alarmı ilgilenildi olarak işaretler: kanallarına artık hatırlatma gönderilmez.
   *
   * @param ruleId The alert's rule / Alarmın kuralı
   * @returns The acknowledged alert / Onaylanan alarm
   */
  async acknowledge(
    ruleId: string,
    request: AcknowledgeAlertRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<AlertResult>> {
    return this.http.post<AlertResult>(admin.alerts.acknowledge.render(ruleId), request, options);
  }

  /**
   * Every alert rule, by name, with how its last evaluation went and its alerts.
   *
   * Ada göre sıralı tüm alarm kuralları; son değerlendirmelerinin nasıl geçtiği ve alarmlarıyla birlikte.
   */
  async getRules(options?: RequestOptions): Promise<InsurUpResult<ListAlertRulesResult>> {
    return this.http.get<ListAlertRulesResult>(admin.alerts.rules, options);
  }

  /**
   * One alert rule with how its last evaluation went and its alerts.
   *
   * Tek bir alarm kuralı; son değerlendirmesinin nasıl geçtiği ve alarmlarıyla birlikte.
   *
   * @param ruleId The rule / Kural
   */
  async getRule(ruleId: string, options?: RequestOptions): Promise<InsurUpResult<AlertRuleResult>> {
    return this.http.get<AlertRuleResult>(admin.alerts.rule.render(ruleId), options);
  }

  /**
   * Creates an alert rule, evaluated from the next minute on.
   *
   * Bir sonraki dakikadan itibaren değerlendirilecek bir alarm kuralı oluşturur.
   */
  async createRule(
    request: CreateAlertRuleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<AlertRuleResult>> {
    return this.http.post<AlertRuleResult>(admin.alerts.rules, request, options);
  }

  /**
   * Replaces an alert rule's definition; disabling it drops its alerts.
   *
   * Bir alarm kuralının tanımını değiştirir; kuralı devre dışı bırakmak alarmlarını düşürür.
   *
   * @param ruleId The rule / Kural
   */
  async updateRule(
    ruleId: string,
    request: UpdateAlertRuleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<AlertRuleResult>> {
    return this.http.put<AlertRuleResult>(admin.alerts.rule.render(ruleId), request, options);
  }

  /**
   * Deletes an alert rule and its alerts; its history stays until it expires.
   *
   * Bir alarm kuralını ve alarmlarını siler; geçmişi süresi dolana kadar kalır.
   *
   * @param ruleId The rule / Kural
   */
  async deleteRule(ruleId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.alerts.rule.render(ruleId), options);
  }

  /**
   * Evaluates a rule's definition now without saving it, with its series over the recent past.
   *
   * Bir kural tanımını kaydetmeden şimdi değerlendirir ve yakın geçmişteki serilerini döner.
   */
  async previewRule(
    request: PreviewAlertRuleRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<PreviewAlertRuleResult>> {
    return this.http.post<PreviewAlertRuleResult>(admin.alerts.previewRule, request, options);
  }

  /**
   * Every notification channel, by name, its Slack webhook masked, with the rules that send to it.
   *
   * Ada göre sıralı tüm bildirim kanalları; Slack webhook'u maskelenmiş ve ona gönderen kurallarla birlikte.
   */
  async getChannels(
    options?: RequestOptions
  ): Promise<InsurUpResult<ListNotificationChannelsResult>> {
    return this.http.get<ListNotificationChannelsResult>(admin.alerts.channels, options);
  }

  /**
   * Creates a notification channel.
   *
   * Bir bildirim kanalı oluşturur.
   */
  async createChannel(
    request: CreateNotificationChannelRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<NotificationChannelResult>> {
    return this.http.post<NotificationChannelResult>(admin.alerts.channels, request, options);
  }

  /**
   * Changes a notification channel's name and where it sends; its kind stays.
   *
   * Bir bildirim kanalının adını ve gönderdiği yeri değiştirir; türü aynı kalır.
   *
   * @param channelId The channel / Kanal
   */
  async updateChannel(
    channelId: string,
    request: UpdateNotificationChannelRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<NotificationChannelResult>> {
    return this.http.put<NotificationChannelResult>(
      admin.alerts.channel.render(channelId),
      request,
      options
    );
  }

  /**
   * Deletes a notification channel no rule sends to; one a rule still sends to is refused.
   *
   * Hiçbir kuralın göndermediği bir bildirim kanalını siler; hâlâ bir kuralın gönderdiği kanal reddedilir.
   *
   * @param channelId The channel / Kanal
   */
  async deleteChannel(channelId: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.http.deleteNoContent(admin.alerts.channel.render(channelId), options);
  }

  /**
   * Sends a test notification through a channel now.
   *
   * Bir kanal üzerinden şimdi bir test bildirimi gönderir.
   *
   * @param channelId The channel / Kanal
   * @returns Whether it went, and why not / Gidip gitmediği ve gitmediyse nedeni
   */
  async testChannel(
    channelId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<TestNotificationChannelResult>> {
    return this.http.post<TestNotificationChannelResult>(
      admin.alerts.testChannel.render(channelId),
      undefined,
      options
    );
  }

  /**
   * The silences that are active or still to come, the latest ending first.
   *
   * Etkin olan veya henüz başlamamış susturmalar, en son biteninden başlayarak.
   *
   * @param includeExpired Whether the silences that ended in the last thirty days are listed too / Son otuz günde
   * biten susturmaların da listelenip listelenmeyeceği
   */
  async getSilences(
    includeExpired?: boolean,
    options?: RequestOptions
  ): Promise<InsurUpResult<ListAlertSilencesResult>> {
    return this.http.get<ListAlertSilencesResult>(
      admin.alerts.getSilences.render(includeExpired),
      options
    );
  }

  /**
   * Silences the alerts that match, from a start until an end: they fire and show, but nobody is told.
   *
   * Eşleşen alarmları bir başlangıçtan bitişe kadar susturur: tetiklenir ve görünürler, ancak kimseye haber
   * verilmez.
   */
  async createSilence(
    request: CreateAlertSilenceRequest,
    options?: RequestOptions
  ): Promise<InsurUpResult<AlertSilenceResult>> {
    return this.http.post<AlertSilenceResult>(admin.alerts.createSilence, request, options);
  }

  /**
   * Ends a silence now.
   *
   * Bir susturmayı hemen sonlandırır.
   *
   * @param silenceId The silence / Susturma
   * @returns The ended silence / Sonlandırılan susturma
   */
  async expireSilence(
    silenceId: string,
    options?: RequestOptions
  ): Promise<InsurUpResult<AlertSilenceResult>> {
    return this.http.post<AlertSilenceResult>(
      admin.alerts.expireSilence.render(silenceId),
      undefined,
      options
    );
  }
}
