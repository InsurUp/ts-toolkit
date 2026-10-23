import {
  AlertComparison,
  AlertEventKind,
  AlertNoDataBehavior,
  AlertRuleHealth,
  AlertSeverity,
  AlertState,
  MetricDimension,
  MetricMeasure,
  MetricSignal,
  NotificationChannelKind,
} from '@insurup/contracts';
import type {
  AlertResult,
  AlertRuleDefinition,
  AlertRuleResult,
  AlertSilenceResult,
  GetAlertHistoryResult,
  GetAlertsResult,
  NotificationChannelResult,
  PreviewAlertRuleResult,
} from '@insurup/contracts';

export const sampleRuleId = '01920000-0000-7000-8000-000000000001';
export const sampleChannelId = '01920000-0000-7000-8000-000000000002';
export const sampleSilenceId = '01920000-0000-7000-8000-000000000003';

export const sampleRuleDefinition: AlertRuleDefinition = {
  name: 'Core 5xx rate',
  description: null,
  severity: AlertSeverity.Critical,
  enabled: true,
  metric: {
    service: 'core',
    signal: MetricSignal.HttpServer,
    measure: MetricMeasure.ErrorPercent,
    groupBy: [MetricDimension.Route],
    filters: [{ dimension: MetricDimension.Method, value: 'POST' }],
  },
  log: null,
  comparison: AlertComparison.Above,
  threshold: 5,
  windowMinutes: 5,
  intervalMinutes: 1,
  pendingMinutes: 2,
  noData: AlertNoDataBehavior.Normal,
  channelIds: [sampleChannelId],
  repeatMinutes: null,
  notifyResolved: true,
  runbookUrl: null,
  minimumCount: 20,
};

export const sampleAlert: AlertResult = {
  ruleId: sampleRuleId,
  ruleName: 'Core 5xx rate',
  severity: AlertSeverity.Critical,
  fingerprint: 'route=proposals',
  state: AlertState.Firing,
  labels: { route: 'proposals' },
  value: 12.5,
  threshold: 5,
  comparison: AlertComparison.Above,
  activeSince: '2026-10-23T08:00:00+03:00',
  firingSince: '2026-10-23T08:02:00+03:00',
  lastNotifiedAt: '2026-10-23T08:02:00+03:00',
  silenced: false,
  acknowledgement: null,
};

export const sampleAlertsResult: GetAlertsResult = {
  enabled: true,
  lastEvaluatedAt: '2026-10-23T08:59:00+03:00',
  failingRules: 0,
  alerts: [sampleAlert],
};

export const sampleAlertHistory: GetAlertHistoryResult = {
  events: [
    {
      id: '01920000-0000-7000-8000-000000000010',
      ruleId: sampleRuleId,
      ruleName: 'Core 5xx rate',
      severity: AlertSeverity.Critical,
      kind: AlertEventKind.Firing,
      labels: { route: 'proposals' },
      value: 12.5,
      threshold: 5,
      comparison: AlertComparison.Above,
      at: '2026-10-23T08:02:00+03:00',
      firingSince: '2026-10-23T08:02:00+03:00',
      silenced: false,
      notifiedChannels: 1,
      error: null,
      by: null,
      comment: null,
    },
  ],
  nextCursor: 'history-2',
};

export const sampleAlertRule: AlertRuleResult = {
  id: sampleRuleId,
  definition: sampleRuleDefinition,
  health: AlertRuleHealth.Ok,
  lastEvaluatedAt: '2026-10-23T08:59:00+03:00',
  lastError: null,
  alerts: [sampleAlert],
  createdBy: 'admin@insurup.com',
  createdAt: '2026-10-01T10:00:00+03:00',
  updatedBy: 'admin@insurup.com',
  updatedAt: '2026-10-20T10:00:00+03:00',
};

export const samplePreview: PreviewAlertRuleResult = {
  query: 'sum(rate(http_server_request_duration_seconds_count[5m]))',
  samples: [{ labels: { route: 'proposals' }, value: 12.5, breaching: true }],
  series: [
    {
      labels: { route: 'proposals' },
      points: [{ time: '2026-10-23T08:00:00+03:00', value: 12.5 }],
    },
  ],
  stepSeconds: 60,
  truncated: false,
};

export const sampleChannel: NotificationChannelResult = {
  id: sampleChannelId,
  name: 'On-call Slack',
  kind: NotificationChannelKind.Slack,
  recipients: [],
  slackWebhook: 'https://hooks.slack.com/services/T000/B000/****',
  usedBy: ['Core 5xx rate'],
  createdAt: '2026-10-01T10:00:00+03:00',
  updatedAt: '2026-10-01T10:00:00+03:00',
};

export const sampleSilence: AlertSilenceResult = {
  id: sampleSilenceId,
  ruleId: sampleRuleId,
  ruleName: 'Core 5xx rate',
  matchers: { route: 'proposals' },
  startsAt: '2026-10-23T09:00:00+03:00',
  endsAt: '2026-10-23T11:00:00+03:00',
  comment: 'Deploy window',
  createdBy: 'admin@insurup.com',
  createdAt: '2026-10-23T08:55:00+03:00',
  active: true,
};
