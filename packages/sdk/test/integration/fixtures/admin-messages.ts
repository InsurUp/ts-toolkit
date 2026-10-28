import {
  InvestigationKind,
  InvestigationState,
  InvestigationTrigger,
  MessageBodyAvailability,
  MessageQueueKind,
  ParkedQueueState,
  ParkedQueueTimelineKind,
} from '@insurup/contracts';
import type {
  InvestigationSummaryResult,
  ListMessageQueuesResult,
  MessageTrackingSettingsResult,
  ParkedQueueResult,
  ParkedQueueSummaryResult,
  PeekMessagesResult,
} from '@insurup/contracts';

export const sampleParkedQueueId = '01920000-0000-7000-8000-000000000201';
export const sampleQueueInvestigationId = '01920000-0000-7000-8000-000000000202';
export const sampleErrorQueue = 'customer-consent-changed_error';

export const sampleQueues: ListMessageQueuesResult = {
  queues: [
    {
      name: 'customer-consent-changed',
      kind: MessageQueueKind.Main,
      queue: null,
      messages: 0,
      unacked: 2,
      consumers: 3,
      parkedQueueId: null,
    },
    {
      name: sampleErrorQueue,
      kind: MessageQueueKind.Error,
      queue: 'customer-consent-changed',
      messages: 510,
      unacked: 0,
      consumers: 0,
      parkedQueueId: sampleParkedQueueId,
    },
  ],
  metricsAt: '2026-10-28T19:30:00Z',
};

export const samplePeek: PeekMessagesResult = {
  messages: [
    {
      position: 1,
      messageId: '0b4c0000-1f2e-0a00-0000-08dcf1b2c3d4',
      correlationId: null,
      conversationId: '0b4c0000-1f2e-0a00-0000-08dcf1b2c3d5',
      messageType:
        'urn:message:CustomerManagement.Domain.Events:CustomerConsentChangedIntegrationEvent',
      sentAt: '2026-10-22T08:14:03Z',
      redelivered: true,
      sizeBytes: 1832,
      contentType: 'application/vnd.masstransit+json',
      headers: [{ name: 'MT-Fault-ExceptionType', value: 'System.NullReferenceException' }],
      fault: {
        exceptionType: 'System.NullReferenceException',
        message: 'Object reference not set to an instance of an object.',
        stackTrace: '   at CustomerManagement.Application.Consents.ConsentChangedConsumer.Consume',
        faultedAt: '2026-10-22T08:16:41Z',
        reason: 'fault',
        inputAddress: 'rabbitmq://rabbitmq/insurup/customer-consent-changed',
        host: 'core-2',
      },
      body: '{"customerId":"6a82c77f3b2fbfd5fd3d5a92","phone":"+90 5** *** ** 12"}',
      bodyAvailability: MessageBodyAvailability.Masked,
      bodyTruncated: false,
    },
  ],
  queueMessages: 510,
};

export const sampleParkedSummary: ParkedQueueSummaryResult = {
  id: sampleParkedQueueId,
  name: sampleErrorQueue,
  kind: MessageQueueKind.Error,
  queue: 'customer-consent-changed',
  state: ParkedQueueState.Parked,
  episodeStartedAt: '2026-10-22T08:16:41Z',
  messages: 510,
  firstSeenAt: '2026-10-22T08:16:41Z',
  lastSeenAt: '2026-10-28T19:30:00Z',
  latestInvestigation: {
    id: sampleQueueInvestigationId,
    state: InvestigationState.Completed,
    createdAt: '2026-10-28T19:31:00Z',
  },
};

export const sampleQueueInvestigation: InvestigationSummaryResult = {
  id: sampleQueueInvestigationId,
  kind: InvestigationKind.Queue,
  trigger: InvestigationTrigger.Manual,
  state: InvestigationState.Completed,
  requestedBy: { id: '01920000-0000-7000-8000-000000000203', name: 'Kerem Acer' },
  title: sampleErrorQueue,
  ruleId: null,
  notificationId: null,
  errorGroupId: null,
  parkedQueueId: sampleParkedQueueId,
  createdAt: '2026-10-28T19:31:00Z',
  startedAt: '2026-10-28T19:31:04Z',
  completedAt: '2026-10-28T19:34:12Z',
  pullRequestUrls: [],
  failure: null,
};

export const sampleParked: ParkedQueueResult = {
  ...sampleParkedSummary,
  timeline: [
    {
      at: '2026-10-28T19:34:12Z',
      kind: ParkedQueueTimelineKind.InvestigationCompleted,
      user: null,
      count: null,
      investigationId: sampleQueueInvestigationId,
      note: null,
    },
    {
      at: '2026-10-27T10:00:00Z',
      kind: ParkedQueueTimelineKind.Replayed,
      user: { id: '01920000-0000-7000-8000-000000000203', name: 'Kerem Acer' },
      count: 10,
      investigationId: null,
      note: null,
    },
    {
      at: '2026-10-22T08:16:41Z',
      kind: ParkedQueueTimelineKind.Parked,
      user: null,
      count: null,
      investigationId: null,
      note: null,
    },
  ],
  investigations: [sampleQueueInvestigation],
  findings: {
    investigationId: sampleQueueInvestigationId,
    cause: 'İYS onayı zaten var diye dönüyor; tüketici bunu hata sayıyor.',
    resolution: 'Düzeltme yayınlandıktan sonra mesajlar yeniden oynatılabilir.',
    completedAt: '2026-10-28T19:34:12Z',
  },
};

export const sampleMessageSettings: MessageTrackingSettingsResult = {
  investigateParkedQueues: false,
  maxPerHour: 5,
  maxPerDay: 20,
  updatedAt: null,
  updatedBy: null,
  investigatorAvailable: true,
  scanAvailable: true,
};
