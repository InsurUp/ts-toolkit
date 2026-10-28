import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { NotificationChannelKind } from '@insurup/contracts';
import type {
  CreateAlertSilenceRequest,
  CreateNotificationChannelRequest,
  GetAlertHistoryRequest,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, problemResponse, setupIntegrationTest, validationError } from './setup';
import {
  sampleAlert,
  sampleAlertHistory,
  sampleAlertRule,
  sampleAlertsResult,
  sampleChannel,
  sampleChannelId,
  samplePreview,
  sampleRuleDefinition,
  sampleRuleId,
  sampleSilence,
  sampleSilenceId,
} from './fixtures/admin-alerts';

const t = setupIntegrationTest();
const ALERTS = `${BASE_URL}/observability/alerts`;

describe('AdminAlertsClient', () => {
  describe('alerts', () => {
    it('getAlerts GETs /observability/alerts and returns the alerts and alerting state', async () => {
      let methodSeen: string | undefined;
      server.use(
        http.get(ALERTS, ({ request }) => {
          methodSeen = request.method;
          return HttpResponse.json(sampleAlertsResult);
        })
      );

      const result = await t.client.admin.alerts.getAlerts();

      expect(methodSeen).toBe('GET');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.enabled).toBe(true);
        expect(result.data.alerts[0]?.state).toBe('FIRING');
      }
    });

    it('getHistory POSTs the range to /observability/alerts/history', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/history`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleAlertHistory);
        })
      );
      const request: GetAlertHistoryRequest = {
        from: '2026-10-22T00:00:00+03:00',
        to: '2026-10-23T00:00:00+03:00',
        ruleId: sampleRuleId,
        limit: 50,
      };

      const result = await t.client.admin.alerts.getHistory(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.events[0]?.kind).toBe('FIRING');
        expect(result.data.nextCursor).toBe('history-2');
      }
    });

    it('acknowledge POSTs the fingerprint and comment to the rule acknowledge route', async () => {
      let ruleIdSeen: unknown;
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/rules/:ruleId/acknowledge`, async ({ request, params }) => {
          ruleIdSeen = params.ruleId;
          receivedBody = await request.json();
          return HttpResponse.json({
            ...sampleAlert,
            acknowledgement: {
              by: 'admin@insurup.com',
              at: '2026-10-23T09:00:00+03:00',
              comment: 'On it',
            },
          });
        })
      );

      const result = await t.client.admin.alerts.acknowledge(sampleRuleId, {
        fingerprint: 'route=proposals',
        comment: 'On it',
      });

      expect(ruleIdSeen).toBe(sampleRuleId);
      expect(receivedBody).toEqual({ fingerprint: 'route=proposals', comment: 'On it' });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.acknowledgement?.comment).toBe('On it');
      }
    });
  });

  describe('rules', () => {
    it('getRules GETs /observability/alerts/rules and returns the { rules } wrapper', async () => {
      server.use(
        http.get(`${ALERTS}/rules`, () => HttpResponse.json({ rules: [sampleAlertRule] }))
      );

      const result = await t.client.admin.alerts.getRules();

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.rules).toHaveLength(1);
        expect(result.data.rules[0]?.definition.metric?.signal).toBe('HTTP_SERVER');
      }
    });

    it('getRule embeds the rule ID in the path and returns the rule', async () => {
      let ruleIdSeen: unknown;
      server.use(
        http.get(`${ALERTS}/rules/:ruleId`, ({ params }) => {
          ruleIdSeen = params.ruleId;
          return HttpResponse.json(sampleAlertRule);
        })
      );

      const result = await t.client.admin.alerts.getRule(sampleRuleId);

      expect(ruleIdSeen).toBe(sampleRuleId);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.health).toBe('OK');
        expect(result.data.definition).toEqual(sampleRuleDefinition);
      }
    });

    it('getRule maps 404 to ResourceNotFound', async () => {
      server.use(http.get(`${ALERTS}/rules/:ruleId`, () => notFound()));

      const result = await t.client.admin.alerts.getRule('missing');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
        expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
      }
    });

    it('createRule POSTs { definition } to /observability/alerts/rules and returns the rule', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/rules`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleAlertRule);
        })
      );

      const result = await t.client.admin.alerts.createRule({ definition: sampleRuleDefinition });

      expect(receivedBody).toEqual({ definition: sampleRuleDefinition });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.id).toBe(sampleRuleId);
      }
    });

    it('createRule sends the investigate flag inside the definition', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/rules`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({
            ...sampleAlertRule,
            definition: { ...sampleRuleDefinition, investigate: true },
          });
        })
      );

      const result = await t.client.admin.alerts.createRule({
        definition: { ...sampleRuleDefinition, investigate: true },
      });

      expect(receivedBody).toEqual({ definition: { ...sampleRuleDefinition, investigate: true } });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.definition.investigate).toBe(true);
      }
    });

    it('createRule maps 400 with validationErrors to InputValidation', async () => {
      server.use(
        http.post(`${ALERTS}/rules`, () =>
          validationError([
            {
              propertyName: 'Definition.Name',
              errorMessage: 'The name must be 1 to 150 characters.',
            },
          ])
        )
      );

      const result = await t.client.admin.alerts.createRule({
        definition: { ...sampleRuleDefinition, name: '' },
      });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(400);
        expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
        expect(result.validationErrors[0]?.propertyName).toBe('Definition.Name');
      }
    });

    it('updateRule PUTs { definition } to the rule path', async () => {
      let ruleIdSeen: unknown;
      let receivedBody: unknown;
      server.use(
        http.put(`${ALERTS}/rules/:ruleId`, async ({ request, params }) => {
          ruleIdSeen = params.ruleId;
          receivedBody = await request.json();
          return HttpResponse.json(sampleAlertRule);
        })
      );
      const definition = { ...sampleRuleDefinition, enabled: false };

      const result = await t.client.admin.alerts.updateRule(sampleRuleId, { definition });

      expect(ruleIdSeen).toBe(sampleRuleId);
      expect(receivedBody).toEqual({ definition });
      expect(result.kind).toBe('success');
    });

    it('deleteRule sends DELETE to the rule path and succeeds on 204', async () => {
      let methodSeen: string | undefined;
      let ruleIdSeen: unknown;
      server.use(
        http.delete(`${ALERTS}/rules/:ruleId`, ({ request, params }) => {
          methodSeen = request.method;
          ruleIdSeen = params.ruleId;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await t.client.admin.alerts.deleteRule(sampleRuleId);

      expect(methodSeen).toBe('DELETE');
      expect(ruleIdSeen).toBe(sampleRuleId);
      expect(result.kind).toBe('success');
    });

    it('deleteRule also succeeds on 200 with an empty body', async () => {
      server.use(
        http.delete(`${ALERTS}/rules/:ruleId`, () => new HttpResponse(null, { status: 200 }))
      );

      const result = await t.client.admin.alerts.deleteRule(sampleRuleId);

      expect(result.kind).toBe('success');
    });

    it('previewRule POSTs { definition } to /observability/alerts/rules/preview', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/rules/preview`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(samplePreview);
        })
      );

      const result = await t.client.admin.alerts.previewRule({ definition: sampleRuleDefinition });

      expect(receivedBody).toEqual({ definition: sampleRuleDefinition });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.samples[0]?.breaching).toBe(true);
        expect(result.data.series[0]?.points[0]?.value).toBe(12.5);
      }
    });
  });

  describe('notification channels', () => {
    it('getChannels GETs /observability/alerts/channels and returns the { channels } wrapper', async () => {
      server.use(
        http.get(`${ALERTS}/channels`, () => HttpResponse.json({ channels: [sampleChannel] }))
      );

      const result = await t.client.admin.alerts.getChannels();

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.channels[0]?.kind).toBe('SLACK');
        expect(result.data.channels[0]?.usedBy).toEqual(['Core 5xx rate']);
      }
    });

    it('createChannel POSTs the channel to /observability/alerts/channels', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/channels`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleChannel);
        })
      );
      const request: CreateNotificationChannelRequest = {
        name: 'On-call Slack',
        kind: NotificationChannelKind.Slack,
        slackWebhookUrl: 'https://hooks.slack.com/services/T000/B000/secret',
      };

      const result = await t.client.admin.alerts.createChannel(request);

      expect(receivedBody).toEqual({
        name: 'On-call Slack',
        kind: 'SLACK',
        slackWebhookUrl: 'https://hooks.slack.com/services/T000/B000/secret',
      });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.slackWebhook).toBe('https://hooks.slack.com/services/T000/B000/****');
      }
    });

    it('updateChannel PUTs the changes to the channel path without the ID in the body', async () => {
      let channelIdSeen: unknown;
      let receivedBody: unknown;
      server.use(
        http.put(`${ALERTS}/channels/:channelId`, async ({ request, params }) => {
          channelIdSeen = params.channelId;
          receivedBody = await request.json();
          return HttpResponse.json({ ...sampleChannel, name: 'Renamed' });
        })
      );

      const result = await t.client.admin.alerts.updateChannel(sampleChannelId, {
        name: 'Renamed',
        slackWebhookUrl: null,
      });

      expect(channelIdSeen).toBe(sampleChannelId);
      expect(receivedBody).toEqual({ name: 'Renamed', slackWebhookUrl: null });
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.name).toBe('Renamed');
      }
    });

    it('deleteChannel sends DELETE to the channel path', async () => {
      let channelIdSeen: unknown;
      server.use(
        http.delete(`${ALERTS}/channels/:channelId`, ({ params }) => {
          channelIdSeen = params.channelId;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await t.client.admin.alerts.deleteChannel(sampleChannelId);

      expect(channelIdSeen).toBe(sampleChannelId);
      expect(result.kind).toBe('success');
    });

    it('deleteChannel maps 422 to BusinessValidation when rules still send to the channel', async () => {
      server.use(
        http.delete(`${ALERTS}/channels/:channelId`, () =>
          problemResponse({
            status: 422,
            type: 'https://api.insurup.com/problems/business-validation',
            title: 'Business Validation Error',
            detail: 'Rules send to the channel.',
          })
        )
      );

      const result = await t.client.admin.alerts.deleteChannel(sampleChannelId);

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(422);
        expect(result.type).toBe(InsurUpServerErrorType.BusinessValidation);
      }
    });

    it('testChannel POSTs to the channel test route with no body', async () => {
      let channelIdSeen: unknown;
      let bodySeen: string | undefined;
      let contentTypeSeen: string | null | undefined;
      server.use(
        http.post(`${ALERTS}/channels/:channelId/test`, async ({ request, params }) => {
          channelIdSeen = params.channelId;
          bodySeen = await request.text();
          contentTypeSeen = request.headers.get('content-type');
          return HttpResponse.json({ delivered: false, error: 'Slack answered 404' });
        })
      );

      const result = await t.client.admin.alerts.testChannel(sampleChannelId);

      expect(channelIdSeen).toBe(sampleChannelId);
      expect(bodySeen).toBe('');
      expect(contentTypeSeen).toBeNull();
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual({ delivered: false, error: 'Slack answered 404' });
      }
    });
  });

  describe('silences', () => {
    it('getSilences GETs /observability/alerts/silences without a query by default', async () => {
      let searchSeen: string | undefined;
      server.use(
        http.get(`${ALERTS}/silences`, ({ request }) => {
          searchSeen = new URL(request.url).search;
          return HttpResponse.json({ silences: [sampleSilence] });
        })
      );

      const result = await t.client.admin.alerts.getSilences();

      expect(searchSeen).toBe('');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.silences[0]?.id).toBe(sampleSilenceId);
      }
    });

    it('getSilences(true) sends includeExpired=true in the query', async () => {
      let includeExpiredSeen: string | null | undefined;
      server.use(
        http.get(`${ALERTS}/silences`, ({ request }) => {
          includeExpiredSeen = new URL(request.url).searchParams.get('includeExpired');
          return HttpResponse.json({ silences: [] });
        })
      );

      const result = await t.client.admin.alerts.getSilences(true);

      expect(includeExpiredSeen).toBe('true');
      expect(result.kind).toBe('success');
    });

    it('createSilence POSTs the silence to /observability/alerts/silences', async () => {
      let receivedBody: unknown;
      server.use(
        http.post(`${ALERTS}/silences`, async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(sampleSilence);
        })
      );
      const request: CreateAlertSilenceRequest = {
        ruleId: sampleRuleId,
        matchers: { route: 'proposals' },
        endsAt: '2026-10-23T11:00:00+03:00',
        comment: 'Deploy window',
      };

      const result = await t.client.admin.alerts.createSilence(request);

      expect(receivedBody).toEqual(request);
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.active).toBe(true);
      }
    });

    it('expireSilence POSTs to the silence expire route with no body', async () => {
      let silenceIdSeen: unknown;
      let bodySeen: string | undefined;
      server.use(
        http.post(`${ALERTS}/silences/:silenceId/expire`, async ({ request, params }) => {
          silenceIdSeen = params.silenceId;
          bodySeen = await request.text();
          return HttpResponse.json({ ...sampleSilence, active: false });
        })
      );

      const result = await t.client.admin.alerts.expireSilence(sampleSilenceId);

      expect(silenceIdSeen).toBe(sampleSilenceId);
      expect(bodySeen).toBe('');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.active).toBe(false);
      }
    });
  });
});
