/**
 * @fileoverview Admin Alerts Contracts - Alert rules, alerts, notification channels and silences
 * @description TypeScript contracts for the admin panel's `observability/alerts/*` endpoints. A rule watches a
 * metric or counts log entries; each series its query finds, one per combination of the grouped labels, is an
 * alert of its own, told to the rule's notification channels unless a silence covers it.
 */

import type {
  LogCategory,
  LogGroupField,
  LogSeverity,
  MetricDimension,
  MetricFilterRequest,
  MetricMeasure,
  MetricPointResult,
  MetricSignal,
} from './observability.js';

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/**
 * How urgent an alert rule's alerts are.
 *
 * Bir alarm kuralının alarmlarının ne kadar acil olduğu.
 */
export enum AlertSeverity {
  /** Worth knowing; nothing needs doing now. */
  Info = 'INFO',
  /** Something is going wrong and should be looked at. */
  Warning = 'WARNING',
  /** Something is broken and needs someone now. */
  Critical = 'CRITICAL',
}

/**
 * How a rule's value is compared with its threshold.
 *
 * Bir kuralın değerinin eşik değeriyle nasıl karşılaştırıldığı.
 */
export enum AlertComparison {
  /** The rule breaches while the value is above the threshold. */
  Above = 'ABOVE',
  /** The rule breaches while the value is at or above the threshold. */
  AtOrAbove = 'AT_OR_ABOVE',
  /** The rule breaches while the value is below the threshold. */
  Below = 'BELOW',
  /** The rule breaches while the value is at or below the threshold. */
  AtOrBelow = 'AT_OR_BELOW',
}

/**
 * What a rule does when its query finds nothing to compare.
 *
 * Bir kuralın, sorgusu karşılaştırılacak bir şey bulamadığında ne yaptığı.
 */
export enum AlertNoDataBehavior {
  /** Nothing to compare is not a breach. */
  Normal = 'NORMAL',
  /** Nothing to compare is a breach: for a signal that should always be there. */
  Firing = 'FIRING',
}

/**
 * Where an alert stands.
 *
 * Bir alarmın durumu.
 */
export enum AlertState {
  /** The rule breaches, but not yet for as long as it must before it fires. */
  Pending = 'PENDING',
  /** The rule has breached for as long as it must, and its channels are told. */
  Firing = 'FIRING',
}

/**
 * What happened to an alert, as its history records it.
 *
 * Bir alarma ne olduğu, geçmişinin kaydettiği şekliyle.
 */
export enum AlertEventKind {
  /** The alert started firing. */
  Firing = 'FIRING',
  /** A firing alert stopped breaching. */
  Resolved = 'RESOLVED',
  /** The alert was still firing at its rule's repeat interval, and the channels were told again. */
  Reminder = 'REMINDER',
  /** The rule could not be evaluated for some minutes. */
  EvaluationFailed = 'EVALUATION_FAILED',
  /** A rule that could not be evaluated could be again. */
  EvaluationRecovered = 'EVALUATION_RECOVERED',
  /** Someone acknowledged the alert. */
  Acknowledged = 'ACKNOWLEDGED',
  /** A test notification. */
  Test = 'TEST',
}

/**
 * How a rule's last evaluation went.
 *
 * Bir kuralın son değerlendirmesinin nasıl geçtiği.
 */
export enum AlertRuleHealth {
  /** The rule hasn't been evaluated yet. */
  Unknown = 'UNKNOWN',
  /** The query ran and found values. */
  Ok = 'OK',
  /** The query ran and found nothing to compare. */
  NoData = 'NO_DATA',
  /** The query could not run. */
  Error = 'ERROR',
}

/**
 * Where a notification channel sends.
 *
 * Bir bildirim kanalının nereye gönderdiği.
 */
export enum NotificationChannelKind {
  /** E-mail to a list of addresses. */
  Email = 'EMAIL',
  /** A Slack channel, through an incoming webhook. */
  Slack = 'SLACK',
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

/**
 * The metric an alert rule watches, as the dashboards measure it.
 *
 * Bir alarm kuralının izlediği metrik, panolardaki ölçümle aynı şekilde.
 */
export interface AlertMetricQuery {
  /** The service, by its `job`; one of the capabilities' `metricServices` (`core` by default). */
  readonly service: string;
  /** What the metric is about. */
  readonly signal: MetricSignal;
  /** What is measured. */
  readonly measure: MetricMeasure;
  /** The labels whose every combination is an alert of its own, at most three. */
  readonly groupBy: readonly MetricDimension[];
  /** Label values every counted sample must have, at most five. */
  readonly filters: readonly MetricFilterRequest[];
}

/**
 * The log entries an alert rule counts over its window.
 *
 * Bir alarm kuralının penceresi boyunca saydığı log kayıtları.
 */
export interface AlertLogQuery {
  /** The services to count, by `service.name`; empty counts every configured service. */
  readonly services: readonly string[];
  /** The severities to count; empty counts all of them. */
  readonly severities: readonly LogSeverity[];
  /** The agencies to count, by their logged name. */
  readonly agents: readonly string[];
  /** A phrase the message must contain. Masked in the API's own request log. */
  readonly text: string | null;
  /**
   * An extra LogsQL filter expression, without pipes; saving it needs the raw-query permission. Masked in the
   * API's own request log.
   */
  readonly rawFilter: string | null;
  /** The kind of entry to count (`ALL` by default). */
  readonly category: LogCategory;
  /** The fields whose every combination of values is an alert of its own, at most three. */
  readonly groupBy: readonly LogGroupField[];
  /** Whether only the entries that logged a `duration` count: one per finished operation. */
  readonly timedOnly: boolean;
  /**
   * Keeps only the groups none of whose entries were logged in this many days before the window, 1 to 30: grouped by
   * `ERROR_KIND`, a rule that tells when something starts failing in a new way. Null keeps every group.
   */
  readonly unseenDays?: number | null;
}

/**
 * What an alert rule watches, when it fires and whom it tells: sent to create, change or preview a rule, and
 * returned with it. The rule watches either `metric` or `log` (set one, leave the other null).
 *
 * Bir alarm kuralının neyi izlediği, ne zaman tetiklendiği ve kime haber verdiği: kural oluşturulurken,
 * değiştirilirken veya önizlenirken gönderilir ve kuralla birlikte döner. Kural ya `metric` ya da `log` izler
 * (birini doldurun, diğerini null bırakın).
 */
export interface AlertRuleDefinition {
  /** The rule's name: 1 to 150 characters. */
  readonly name: string;
  /** What the rule means and what to do when it fires. */
  readonly description: string | null;
  /** How urgent its alerts are (`WARNING` by default). */
  readonly severity: AlertSeverity;
  /** Whether it is evaluated. */
  readonly enabled: boolean;
  /** The metric it watches; set this or `log`. */
  readonly metric: AlertMetricQuery | null;
  /** The log entries it counts; set this or `metric`. */
  readonly log: AlertLogQuery | null;
  /** How a value is compared with `threshold` (`ABOVE` by default). */
  readonly comparison: AlertComparison;
  /** The value a series breaches at, in the measure's unit. */
  readonly threshold: number;
  /** The minutes the query looks back over: 1 to 1440. */
  readonly windowMinutes: number;
  /** How often it is evaluated, in minutes: 1 to 60. */
  readonly intervalMinutes: number;
  /** For how many minutes a series must breach before it fires: 0 to 1440. */
  readonly pendingMinutes: number;
  /** What it does when its query finds nothing to compare (`NORMAL` by default). */
  readonly noData: AlertNoDataBehavior;
  /** The notification channels told when an alert fires and resolves, at most ten. */
  readonly channelIds: readonly string[];
  /** Every how many minutes (5 to 10080) a firing, unacknowledged alert is told again; null tells once. */
  readonly repeatMinutes: number | null;
  /** Whether the channels are told when a firing alert resolves. */
  readonly notifyResolved: boolean;
  /** A page that says what to do when the rule fires. */
  readonly runbookUrl: string | null;
  /**
   * For a metric's error percent only: a series with fewer requests than this over the window is left out, so a
   * rarely used route failing once doesn't read as 100%; null weighs every series.
   */
  readonly minimumCount: number | null;
  /**
   * Whether the AI investigates the rule's alerts when they fire, and answers in the alert's Slack thread. Absent from
   * cores that predate it, which read it as false.
   */
  readonly investigate?: boolean;
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

/**
 * Who acknowledged an alert, and when.
 *
 * Bir alarmı kimin, ne zaman onayladığı.
 */
export interface AlertAcknowledgementResult {
  /** Who. */
  readonly by: string;
  /** When (ISO-8601). */
  readonly at: string;
  /** What they said is being done. */
  readonly comment: string | null;
}

/**
 * One alert: a series of one rule that breaches.
 *
 * Tek bir alarm: bir kuralın eşiği aşan bir serisi.
 */
export interface AlertResult {
  /** The alert's rule. */
  readonly ruleId: string;
  /** The rule's name. */
  readonly ruleName: string;
  /** The rule's severity. */
  readonly severity: AlertSeverity;
  /** What tells this alert from the rule's others; send it back to acknowledge the alert. */
  readonly fingerprint: string;
  /** Where it stands. */
  readonly state: AlertState;
  /** The grouped labels' values, keyed by the label's name in camel case. */
  readonly labels: Readonly<Record<string, string>>;
  /** The value at the last evaluation; null when there was nothing to compare. */
  readonly value: number | null;
  /** The rule's threshold. */
  readonly threshold: number;
  /** How the rule compares the value with the threshold. */
  readonly comparison: AlertComparison;
  /** When the series started breaching (ISO-8601). */
  readonly activeSince: string;
  /** When it started firing (ISO-8601); null while it is pending. */
  readonly firingSince: string | null;
  /** When its channels were last told (ISO-8601); null when they haven't been. */
  readonly lastNotifiedAt: string | null;
  /** Whether a silence covers it, so its channels aren't told. */
  readonly silenced: boolean;
  /** Who acknowledged it, when it is acknowledged. */
  readonly acknowledgement: AlertAcknowledgementResult | null;
}

/**
 * Every pending and firing alert, and how alerting stands.
 *
 * Bekleyen ve tetiklenmiş tüm alarmlar ile alarm sisteminin durumu.
 */
export interface GetAlertsResult {
  /** Whether this environment evaluates alert rules. */
  readonly enabled: boolean;
  /** When a rule was last evaluated (ISO-8601); null when none has been yet. */
  readonly lastEvaluatedAt: string | null;
  /** How many rules could not be evaluated the last time. */
  readonly failingRules: number;
  /** The alerts: firing first, then by severity and how long they have been active. */
  readonly alerts: readonly AlertResult[];
}

/**
 * Marks a pending or firing alert as being looked at: its channels get no more reminders. The rule comes from the
 * route.
 *
 * Bekleyen veya tetiklenmiş bir alarmı ilgilenildi olarak işaretler: kanallarına artık hatırlatma gönderilmez.
 * Kural, yoldan (route) alınır.
 */
export interface AcknowledgeAlertRequest {
  /** The alert, by its fingerprint; empty for the alert of a rule that groups nothing. */
  readonly fingerprint: string;
  /** What is being done about it, at most 500 characters. */
  readonly comment?: string | null;
}

/**
 * Reads what happened to alerts over a time range, newest first, one page at a time.
 *
 * Bir zaman aralığında alarmlara ne olduğunu, en yeniden başlayarak sayfa sayfa okur.
 */
export interface GetAlertHistoryRequest {
  /** The start of the time range, inclusive (ISO-8601). */
  readonly from: string;
  /** The end of the time range, exclusive (ISO-8601); at most 91 days after `from`. */
  readonly to: string;
  /** The rule whose history to read; null reads every rule's. */
  readonly ruleId?: string | null;
  /** Where the previous page ended: its `nextCursor`. */
  readonly cursor?: string | null;
  /** How many events to return, 1 to 500; 100 when left out. */
  readonly limit?: number;
}

/**
 * One thing that happened to an alert, or to its rule.
 *
 * Bir alarma veya kuralına olan tek bir olay.
 */
export interface AlertEventResult {
  /** The event's ID. */
  readonly id: string;
  /** The rule. */
  readonly ruleId: string;
  /** The rule's name at the time. */
  readonly ruleName: string;
  /** The rule's severity at the time. */
  readonly severity: AlertSeverity;
  /** What happened. */
  readonly kind: AlertEventKind;
  /** The alert's labels; empty for an event about the rule itself. */
  readonly labels: Readonly<Record<string, string>>;
  /** The value at the time. */
  readonly value: number | null;
  /** The rule's threshold at the time. */
  readonly threshold: number;
  /** How the rule compared the value with the threshold. */
  readonly comparison: AlertComparison;
  /** When it happened (ISO-8601). */
  readonly at: string;
  /** When the alert started firing (ISO-8601). */
  readonly firingSince: string | null;
  /** Whether a silence kept the channels from being told. */
  readonly silenced: boolean;
  /** How many channels were told. */
  readonly notifiedChannels: number;
  /** Why the rule could not be evaluated. */
  readonly error: string | null;
  /** Who acknowledged the alert. */
  readonly by: string | null;
  /** What they said. */
  readonly comment: string | null;
}

/**
 * One page of alert history.
 *
 * Alarm geçmişinin bir sayfası.
 */
export interface GetAlertHistoryResult {
  /** The events, newest first. */
  readonly events: readonly AlertEventResult[];
  /** Where the next page starts; null on the last page. */
  readonly nextCursor: string | null;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

/**
 * An alert rule, how its last evaluation went and its alerts.
 *
 * Bir alarm kuralı, son değerlendirmesinin nasıl geçtiği ve alarmları.
 */
export interface AlertRuleResult {
  /** The rule's ID. */
  readonly id: string;
  /** Its definition. */
  readonly definition: AlertRuleDefinition;
  /** How its last evaluation went. */
  readonly health: AlertRuleHealth;
  /** When it was last evaluated (ISO-8601). */
  readonly lastEvaluatedAt: string | null;
  /** Why the last evaluation failed, when it did. */
  readonly lastError: string | null;
  /** Its pending and firing alerts, firing first. */
  readonly alerts: readonly AlertResult[];
  /** Who created it. */
  readonly createdBy: string;
  /** When it was created (ISO-8601). */
  readonly createdAt: string;
  /** Who last changed it. */
  readonly updatedBy: string;
  /** When it was last changed (ISO-8601). */
  readonly updatedAt: string;
}

/**
 * Every alert rule, by name.
 *
 * Ada göre sıralı tüm alarm kuralları.
 */
export interface ListAlertRulesResult {
  /** The rules. */
  readonly rules: readonly AlertRuleResult[];
}

/**
 * Creates an alert rule.
 *
 * Bir alarm kuralı oluşturur.
 */
export interface CreateAlertRuleRequest {
  /** The rule. */
  readonly definition: AlertRuleDefinition;
}

/**
 * Replaces an alert rule's definition; disabling it drops its alerts. The rule comes from the route.
 *
 * Bir alarm kuralının tanımını değiştirir; kuralı devre dışı bırakmak alarmlarını düşürür. Kural, yoldan (route)
 * alınır.
 */
export interface UpdateAlertRuleRequest {
  /** Its new definition. */
  readonly definition: AlertRuleDefinition;
}

/**
 * Evaluates a rule's definition now without saving it.
 *
 * Bir kural tanımını kaydetmeden şimdi değerlendirir.
 */
export interface PreviewAlertRuleRequest {
  /** The definition. */
  readonly definition: AlertRuleDefinition;
}

/**
 * One series' value now.
 *
 * Bir serinin şu anki değeri.
 */
export interface AlertPreviewSampleResult {
  /** The grouped labels' values. */
  readonly labels: Readonly<Record<string, string>>;
  /** The value; null when there was nothing to compute it from. */
  readonly value: number | null;
  /** Whether it breaches the threshold. */
  readonly breaching: boolean;
}

/**
 * One series over the recent past.
 *
 * Yakın geçmişteki bir seri.
 */
export interface AlertPreviewSeriesResult {
  /** The grouped labels' values. */
  readonly labels: Readonly<Record<string, string>>;
  /** Its points, oldest first. */
  readonly points: readonly MetricPointResult[];
}

/**
 * What evaluating a definition now found.
 *
 * Bir tanımı şimdi değerlendirmenin bulduğu sonuç.
 */
export interface PreviewAlertRuleResult {
  /** The query the rule runs, PromQL or LogsQL. */
  readonly query: string;
  /** The value of every series now and whether it breaches, breaching first. */
  readonly samples: readonly AlertPreviewSampleResult[];
  /** The series over the recent past. */
  readonly series: readonly AlertPreviewSeriesResult[];
  /** The distance between two points of a series, in seconds. */
  readonly stepSeconds: number;
  /** Whether more series matched than are returned. */
  readonly truncated: boolean;
}

// ---------------------------------------------------------------------------
// Notification channels
// ---------------------------------------------------------------------------

/**
 * A notification channel, its Slack webhook's secret part masked.
 *
 * Slack webhook'unun gizli kısmı maskelenmiş bir bildirim kanalı.
 */
export interface NotificationChannelResult {
  /** The channel's ID. */
  readonly id: string;
  /** Its name. */
  readonly name: string;
  /** Where it sends. */
  readonly kind: NotificationChannelKind;
  /** The addresses an e-mail channel sends to; returned in clear, masked in the API's own request log. */
  readonly recipients: readonly string[];
  /** A Slack channel's webhook with its secret part masked. */
  readonly slackWebhook: string | null;
  /** The names of the rules that send to it. */
  readonly usedBy: readonly string[];
  /** When it was created (ISO-8601). */
  readonly createdAt: string;
  /** When it was last changed (ISO-8601). */
  readonly updatedAt: string;
}

/**
 * Every notification channel, by name.
 *
 * Ada göre sıralı tüm bildirim kanalları.
 */
export interface ListNotificationChannelsResult {
  /** The channels. */
  readonly channels: readonly NotificationChannelResult[];
}

/**
 * Creates a notification channel.
 *
 * Bir bildirim kanalı oluşturur.
 */
export interface CreateNotificationChannelRequest {
  /** The channel's name, 1 to 100 characters. */
  readonly name: string;
  /** Where it sends. */
  readonly kind: NotificationChannelKind;
  /** The addresses an e-mail channel sends to, 1 to 20. Masked in the API's own request log. */
  readonly recipients?: readonly string[];
  /** A Slack channel's incoming webhook URL. It is a secret: stored encrypted, never returned. */
  readonly slackWebhookUrl?: string | null;
}

/**
 * Changes a notification channel's name and where it sends; its kind stays. The channel comes from the route.
 *
 * Bir bildirim kanalının adını ve gönderdiği yeri değiştirir; türü aynı kalır. Kanal, yoldan (route) alınır.
 */
export interface UpdateNotificationChannelRequest {
  /** The channel's name. */
  readonly name: string;
  /** The addresses an e-mail channel sends to. Masked in the API's own request log. */
  readonly recipients?: readonly string[];
  /** A Slack channel's new webhook URL; null keeps the one it has. */
  readonly slackWebhookUrl?: string | null;
}

/**
 * Whether a test notification went.
 *
 * Bir test bildiriminin gidip gitmediği.
 */
export interface TestNotificationChannelResult {
  /** Whether the channel's e-mail server or Slack took it. */
  readonly delivered: boolean;
  /** Why it didn't, when it didn't. */
  readonly error: string | null;
}

// ---------------------------------------------------------------------------
// Silences
// ---------------------------------------------------------------------------

/**
 * A silence: the alerts it matches fire and show, but nobody is told.
 *
 * Bir susturma: eşleştiği alarmlar tetiklenir ve görünür, ancak kimseye haber verilmez.
 */
export interface AlertSilenceResult {
  /** The silence's ID. */
  readonly id: string;
  /** The rule whose alerts it silences; null for every rule. */
  readonly ruleId: string | null;
  /** That rule's name, while the rule exists. */
  readonly ruleName: string | null;
  /** The label values an alert must all have to be silenced. */
  readonly matchers: Readonly<Record<string, string>>;
  /** When it starts (ISO-8601). */
  readonly startsAt: string;
  /** When it ends (ISO-8601). */
  readonly endsAt: string;
  /** Why the alerts are silenced. */
  readonly comment: string;
  /** Who created it. */
  readonly createdBy: string;
  /** When it was created (ISO-8601). */
  readonly createdAt: string;
  /** Whether it silences now. */
  readonly active: boolean;
}

/**
 * The listed silences, the latest ending first.
 *
 * Listelenen susturmalar, en son biteninden başlayarak.
 */
export interface ListAlertSilencesResult {
  /** The silences. */
  readonly silences: readonly AlertSilenceResult[];
}

/**
 * Silences the alerts that match, from a start until an end: they fire and show, but nobody is told.
 *
 * Eşleşen alarmları bir başlangıçtan bitişe kadar susturur: tetiklenir ve görünürler, ancak kimseye haber
 * verilmez.
 */
export interface CreateAlertSilenceRequest {
  /** The rule whose alerts to silence; null silences every rule's alerts that match. */
  readonly ruleId?: string | null;
  /** Label values an alert must all have, at most ten; empty matches every alert of the rule. */
  readonly matchers?: Readonly<Record<string, string>>;
  /** When the silence starts (ISO-8601); null starts it now. */
  readonly startsAt?: string | null;
  /** When it ends (ISO-8601), at most 90 days from now. */
  readonly endsAt: string;
  /** Why the alerts are silenced, 1 to 500 characters. */
  readonly comment: string;
}
