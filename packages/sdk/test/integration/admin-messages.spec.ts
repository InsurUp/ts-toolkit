import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  InvestigationKind,
  MessageBodyAvailability,
  MessageQueueKind,
  ParkedQueueState,
  ParkedQueueTimelineKind,
} from '@insurup/contracts';
import type { UpdateMessageTrackingSettingsRequest } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest, validationError } from './setup';
import {
  sampleErrorQueue,
  sampleMessageSettings,
  sampleParked,
  sampleParkedQueueId,
  sampleParkedSummary,
  samplePeek,
  sampleQueueInvestigation,
  sampleQueues,
} from './fixtures/admin-messages';

const t = setupIntegrationTest();
const MESSAGES = `${BASE_URL}/observability/messages`;
const QUEUES = `${MESSAGES}/queues`;
const PARKED = `${MESSAGES}/parked`;
const SETTINGS = `${MESSAGES}/settings`;
const INVESTIGATIONS = `${BASE_URL}/observability/investigations`;

describe('AdminMessagesClient', () => {
  it('listQueues GETs /observability/messages/queues without a query when no filter is set', async () => {
    let search: string | undefined;
    server.use(
      http.get(QUEUES, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json(sampleQueues);
      })
    );

    const result = await t.client.admin.messages.listQueues();

    expect(search).toBe('');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.queues[1]?.kind).toBe(MessageQueueKind.Error);
      expect(result.data.queues[1]?.queue).toBe('customer-consent-changed');
      expect(result.data.metricsAt).toBe('2026-10-28T19:30:00Z');
    }
  });

  it('listQueues sends the kind and the search', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(QUEUES, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ queues: [], metricsAt: null });
      })
    );

    await t.client.admin.messages.listQueues({ kind: MessageQueueKind.Skipped, search: 'consent' });

    expect(params?.get('kind')).toBe('SKIPPED');
    expect(params?.get('search')).toBe('consent');
  });

  it('peek POSTs the count and raw to the queue, encoding its name', async () => {
    let path: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${QUEUES}/:name/peek`, async ({ request }) => {
        path = new URL(request.url).pathname;
        receivedBody = await request.json();
        return HttpResponse.json(samplePeek);
      })
    );

    const result = await t.client.admin.messages.peek('odd name_error', { count: 5, raw: false });

    expect(path).toBe('/api/observability/messages/queues/odd%20name_error/peek');
    expect(receivedBody).toEqual({ count: 5, raw: false });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      const message = result.data.messages[0];
      expect(message?.bodyAvailability).toBe(MessageBodyAvailability.Masked);
      expect(message?.fault?.exceptionType).toBe('System.NullReferenceException');
      expect(message?.redelivered).toBe(true);
      expect(result.data.queueMessages).toBe(510);
    }
  });

  it('peek sends an empty body when no option is given', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${QUEUES}/:name/peek`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ messages: [], queueMessages: 0 });
      })
    );

    await t.client.admin.messages.peek(sampleErrorQueue);

    expect(receivedBody).toEqual({});
  });

  it('peek maps a 403 for raw bodies to an error result', async () => {
    server.use(
      http.post(`${QUEUES}/:name/peek`, () =>
        HttpResponse.json(
          { title: 'Forbidden', status: 403, codes: ['ACCESS_DENIED'] },
          { status: 403 }
        )
      )
    );

    const result = await t.client.admin.messages.peek(sampleErrorQueue, { raw: true });

    expect(result.kind).not.toBe('success');
  });

  it('replay POSTs the selection and returns the counts', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${QUEUES}/:name/replay`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ replayed: 2, failed: 0, notFound: 1, remaining: 508 });
      })
    );

    const result = await t.client.admin.messages.replay(sampleErrorQueue, {
      messageIds: ['a', 'b', 'c'],
    });

    expect(receivedBody).toEqual({ messageIds: ['a', 'b', 'c'] });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.replayed).toBe(2);
      expect(result.data.notFound).toBe(1);
      expect(result.data.remaining).toBe(508);
    }
  });

  it('replay sends force for a skipped queue with no consumer', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${QUEUES}/:name/replay`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ replayed: 4, failed: 0, notFound: 0, remaining: 0 });
      })
    );

    await t.client.admin.messages.replay('customer-consent-changed_skipped', {
      all: true,
      force: true,
    });

    expect(receivedBody).toEqual({ all: true, force: true });
  });

  it('replay maps a 400 with validation errors to InputValidation', async () => {
    server.use(
      http.post(`${QUEUES}/:name/replay`, () =>
        validationError([{ propertyName: 'Count', errorMessage: 'Sadece biri verilmeli.' }])
      )
    );

    const result = await t.client.admin.messages.replay(sampleErrorQueue, { count: 5, all: true });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('purge POSTs the selection and returns the counts', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${QUEUES}/:name/purge`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ purged: 510, notFound: 0, remaining: 0 });
      })
    );

    const result = await t.client.admin.messages.purge(sampleErrorQueue, { all: true });

    expect(receivedBody).toEqual({ all: true });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.purged).toBe(510);
    }
  });

  it('listParked GETs /observability/messages/parked with the state', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(PARKED, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [sampleParkedSummary] });
      })
    );

    const result = await t.client.admin.messages.listParked({ state: ParkedQueueState.Parked });

    expect(params?.get('state')).toBe('PARKED');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.items[0]?.messages).toBe(510);
    }
  });

  it('getParked GETs one parked queue with its timeline and findings', async () => {
    server.use(http.get(`${PARKED}/:parkedQueueId`, () => HttpResponse.json(sampleParked)));

    const result = await t.client.admin.messages.getParked(sampleParkedQueueId);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.timeline.map((entry) => entry.kind)).toEqual([
        ParkedQueueTimelineKind.InvestigationCompleted,
        ParkedQueueTimelineKind.Replayed,
        ParkedQueueTimelineKind.Parked,
      ]);
      expect(result.data.timeline[1]?.count).toBe(10);
      expect(result.data.findings?.resolution).toContain('yeniden oynatılabilir');
      expect(result.data.investigations[0]?.kind).toBe(InvestigationKind.Queue);
    }
  });

  it('getParked maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${PARKED}/:parkedQueueId`, () => notFound()));

    const result = await t.client.admin.messages.getParked('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('investigate POSTs an empty body to the parked queue investigate route', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${PARKED}/:parkedQueueId/investigate`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(sampleQueueInvestigation);
      })
    );

    const result = await t.client.admin.messages.investigate(sampleParkedQueueId);

    expect(receivedBody).toEqual({});
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.parkedQueueId).toBe(sampleParkedQueueId);
    }
  });

  it('getSettings GETs /observability/messages/settings', async () => {
    server.use(http.get(SETTINGS, () => HttpResponse.json(sampleMessageSettings)));

    const result = await t.client.admin.messages.getSettings();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.investigateParkedQueues).toBe(false);
      expect(result.data.scanAvailable).toBe(true);
    }
  });

  it('updateSettings PUTs the switch and the limits', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(SETTINGS, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({ ...sampleMessageSettings, investigateParkedQueues: true });
      })
    );

    const request: UpdateMessageTrackingSettingsRequest = {
      investigateParkedQueues: true,
      maxPerHour: 3,
      maxPerDay: 10,
    };
    const result = await t.client.admin.messages.updateSettings(request);

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual(request);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.investigateParkedQueues).toBe(true);
    }
  });

  it('the investigations list filters by the QUEUE kind', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(INVESTIGATIONS, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [sampleQueueInvestigation], nextCursor: null });
      })
    );

    const result = await t.client.admin.investigations.list({ kind: InvestigationKind.Queue });

    expect(params?.get('kind')).toBe('QUEUE');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.items[0]?.parkedQueueId).toBe(sampleParkedQueueId);
    }
  });
});
