import {
  AuthorKind,
  ErrorGroupStatus,
  ErrorTimelineKind,
  InvestigationKind,
  InvestigationState,
  InvestigationTrigger,
} from '@insurup/contracts';
import type {
  ErrorGroupResult,
  ErrorGroupSummaryResult,
  ErrorTrackingSettingsResult,
  InvestigationResult,
  InvestigationSummaryResult,
} from '@insurup/contracts';

export const sampleErrorGroupId = '01920000-0000-7000-8000-000000000101';
export const sampleInvestigationId = '01920000-0000-7000-8000-000000000102';
export const sampleNotificationId = '01920000-0000-7000-8000-000000000103';

export const sampleErrorGroupSummary: ErrorGroupSummaryResult = {
  id: sampleErrorGroupId,
  fingerprint: 'd966ae903977451b',
  service: 'core',
  exceptionType: 'System.InvalidOperationException',
  culprit:
    'InsuranceServices.InsurGateway.Application.Features.Proposals.Requests.CreateProposal.Base.CreateInsuranceProposalRequestHandlerBase.Handle',
  template: null,
  logger: 'InsuranceUp.Apps.WebApi.ExceptionHandlers.UnknownExceptionHandler',
  title: 'InvalidOperationException · CreateInsuranceProposalRequestHandlerBase.Handle',
  status: ErrorGroupStatus.Open,
  regressed: false,
  firstSeenAt: '2026-10-26T12:18:25Z',
  lastSeenAt: '2026-10-27T09:10:13Z',
  count24h: 12,
  count7d: 117,
  hasCause: true,
  hasResolution: false,
  latestInvestigation: {
    id: sampleInvestigationId,
    state: InvestigationState.Completed,
    createdAt: '2026-10-26T12:19:00Z',
  },
};

export const sampleErrorInvestigation: InvestigationSummaryResult = {
  id: sampleInvestigationId,
  kind: InvestigationKind.Error,
  trigger: InvestigationTrigger.Automatic,
  state: InvestigationState.Completed,
  requestedBy: null,
  title: sampleErrorGroupSummary.title,
  ruleId: null,
  notificationId: null,
  errorGroupId: sampleErrorGroupId,
  createdAt: '2026-10-26T12:19:00Z',
  startedAt: '2026-10-26T12:19:05Z',
  completedAt: '2026-10-26T12:27:40Z',
  pullRequestUrl: 'https://github.com/InsurUp/core/pull/1900',
  failure: null,
};

export const sampleErrorGroup: ErrorGroupResult = {
  ...sampleErrorGroupSummary,
  cause: {
    text: 'Teklif ürünü olmayan bir şirkete gönderiliyor.',
    author: { kind: AuthorKind.Ai, user: null, investigationId: sampleInvestigationId },
    at: '2026-10-26T12:27:40Z',
  },
  resolution: null,
  sampleTraceId: '4bf92f3577b34da6a3ce929d0e0e4736',
  timeline: [
    {
      at: '2026-10-26T12:27:40Z',
      kind: ErrorTimelineKind.CauseWritten,
      author: { kind: AuthorKind.Ai, user: null, investigationId: sampleInvestigationId },
      status: null,
      investigationId: null,
      note: null,
    },
    {
      at: '2026-10-26T12:18:25Z',
      kind: ErrorTimelineKind.FirstSeen,
      author: null,
      status: null,
      investigationId: null,
      note: null,
    },
  ],
  investigations: [sampleErrorInvestigation],
};

export const sampleInvestigation: InvestigationResult = {
  ...sampleErrorInvestigation,
  report:
    '*Neden tetiklendi* 117 hata\n*Kaynak* `CreateInsuranceProposalRequestHandlerBase.Handle`',
  cause: 'Teklif ürünü olmayan bir şirkete gönderiliyor.',
  resolution: null,
  model: 'anthropic/claude-sonnet-5.5',
  costUsd: 0.42,
};

export const sampleSettings: ErrorTrackingSettingsResult = {
  investigateNewErrors: false,
  maxPerHour: 5,
  maxPerDay: 20,
  updatedAt: null,
  updatedBy: null,
};
