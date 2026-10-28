import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { AuthorKind, ErrorGroupStatus, InvestigationKind } from '@insurup/contracts';
import type {
  UpdateErrorGroupRequest,
  UpdateErrorTrackingSettingsRequest,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest, validationError } from './setup';
import {
  sampleErrorGroup,
  sampleErrorGroupId,
  sampleErrorGroupSummary,
  sampleErrorInvestigation,
  sampleInvestigation,
  sampleInvestigationId,
  sampleNotificationId,
  sampleSettings,
} from './fixtures/admin-errors';

const t = setupIntegrationTest();
const ERRORS = `${BASE_URL}/observability/errors`;
const SETTINGS = `${BASE_URL}/observability/error-tracking/settings`;
const INVESTIGATIONS = `${BASE_URL}/observability/investigations`;

describe('AdminErrorsClient', () => {
  it('list GETs /observability/errors without a query when no filter is set', async () => {
    let search: string | undefined;
    server.use(
      http.get(ERRORS, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ items: [sampleErrorGroupSummary], nextCursor: null });
      })
    );

    const result = await t.client.admin.errors.list();

    expect(search).toBe('');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.items[0]?.status).toBe('OPEN');
      expect(result.data.items[0]?.count7d).toBe(117);
    }
  });

  it('list sends every status as its own parameter, with the other filters', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(ERRORS, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [], nextCursor: null });
      })
    );

    await t.client.admin.errors.list({
      status: [ErrorGroupStatus.Open, ErrorGroupStatus.Resolved],
      service: 'core',
      search: 'proposal handler',
      cursor: 'page-2',
      limit: 25,
    });

    expect(params?.getAll('status')).toEqual(['OPEN', 'RESOLVED']);
    expect(params?.get('service')).toBe('core');
    expect(params?.get('search')).toBe('proposal handler');
    expect(params?.get('cursor')).toBe('page-2');
    expect(params?.get('limit')).toBe('25');
  });

  it('list sends only the statuses when they are the only filter', async () => {
    let search: string | undefined;
    server.use(
      http.get(ERRORS, ({ request }) => {
        search = new URL(request.url).search;
        return HttpResponse.json({ items: [], nextCursor: null });
      })
    );

    await t.client.admin.errors.list({ status: [ErrorGroupStatus.Ignored] });

    expect(search).toBe('?status=IGNORED');
  });

  it('get GETs the group and returns its texts, timeline and investigations', async () => {
    let idSeen: unknown;
    server.use(
      http.get(`${ERRORS}/:errorGroupId`, ({ params }) => {
        idSeen = params.errorGroupId;
        return HttpResponse.json(sampleErrorGroup);
      })
    );

    const result = await t.client.admin.errors.get(sampleErrorGroupId);

    expect(idSeen).toBe(sampleErrorGroupId);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.cause?.author.kind).toBe(AuthorKind.Ai);
      expect(result.data.timeline).toHaveLength(2);
      expect(result.data.investigations[0]?.kind).toBe(InvestigationKind.Error);
    }
  });

  it('get maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${ERRORS}/:errorGroupId`, () => notFound()));

    const result = await t.client.admin.errors.get('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('update PATCHes only the fields given', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.patch(`${ERRORS}/:errorGroupId`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({ ...sampleErrorGroup, status: ErrorGroupStatus.Resolved });
      })
    );
    const request: UpdateErrorGroupRequest = {
      status: ErrorGroupStatus.Resolved,
      resolution: '#1900 ile düzeltildi.',
    };

    const result = await t.client.admin.errors.update(sampleErrorGroupId, request);

    expect(methodSeen).toBe('PATCH');
    expect(receivedBody).toEqual(request);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.status).toBe('RESOLVED');
    }
  });

  it('update maps a 400 with validation errors to InputValidation', async () => {
    server.use(
      http.patch(`${ERRORS}/:errorGroupId`, () =>
        validationError([{ propertyName: 'Cause', errorMessage: 'En fazla 4000 karakter.' }])
      )
    );

    const result = await t.client.admin.errors.update(sampleErrorGroupId, {
      cause: 'x'.repeat(4001),
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('investigate POSTs an empty body to the group investigate route', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${ERRORS}/:errorGroupId/investigate`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(sampleErrorInvestigation);
      })
    );

    const result = await t.client.admin.errors.investigate(sampleErrorGroupId);

    expect(receivedBody).toEqual({});
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.errorGroupId).toBe(sampleErrorGroupId);
    }
  });

  it('getSettings GETs /observability/error-tracking/settings', async () => {
    server.use(http.get(SETTINGS, () => HttpResponse.json(sampleSettings)));

    const result = await t.client.admin.errors.getSettings();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.investigateNewErrors).toBe(false);
      expect(result.data.maxPerHour).toBe(5);
      expect(result.data.investigatorAvailable).toBe(true);
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
        return HttpResponse.json({ ...sampleSettings, investigateNewErrors: true });
      })
    );
    const request: UpdateErrorTrackingSettingsRequest = {
      investigateNewErrors: true,
      maxPerHour: 5,
      maxPerDay: 20,
    };

    const result = await t.client.admin.errors.updateSettings(request);

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual(request);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.investigateNewErrors).toBe(true);
    }
  });
});

describe('AdminInvestigationsClient', () => {
  it('list GETs /observability/investigations with the filters given', async () => {
    let params: URLSearchParams | undefined;
    server.use(
      http.get(INVESTIGATIONS, ({ request }) => {
        params = new URL(request.url).searchParams;
        return HttpResponse.json({ items: [sampleErrorInvestigation], nextCursor: 'next' });
      })
    );

    const result = await t.client.admin.investigations.list({
      kind: InvestigationKind.Alert,
      notificationId: sampleNotificationId,
      limit: 1,
    });

    expect(params?.get('kind')).toBe('ALERT');
    expect(params?.get('notificationId')).toBe(sampleNotificationId);
    expect(params?.get('limit')).toBe('1');
    expect(params?.has('ruleId')).toBe(false);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.nextCursor).toBe('next');
    }
  });

  it('get GETs one investigation with its report', async () => {
    let idSeen: unknown;
    server.use(
      http.get(`${INVESTIGATIONS}/:investigationId`, ({ params }) => {
        idSeen = params.investigationId;
        return HttpResponse.json(sampleInvestigation);
      })
    );

    const result = await t.client.admin.investigations.get(sampleInvestigationId);

    expect(idSeen).toBe(sampleInvestigationId);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.report).toContain('*Neden tetiklendi*');
      expect(result.data.costUsd).toBe(0.42);
    }
  });
});
