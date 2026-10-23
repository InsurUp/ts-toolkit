import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleMyAdminPanelInvite } from './fixtures/admin-invites';

const t = setupIntegrationTest();

const INVITE_ID = '0192f1a0-0000-7000-8000-0000000000c1';

describe('InsurUpAdminInvitesClient', () => {
  it('getMine GETs /me/admin-panel/invites and returns the parsed list', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/me/admin-panel/invites`, ({ request }) => {
        methodSeen = request.method;
        return HttpResponse.json([sampleMyAdminPanelInvite]);
      })
    );

    const result = await t.client.admin.invites.getMine();

    expect(methodSeen).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.inviteId).toBe(INVITE_ID);
      expect(result.data[0]?.roleNames).toEqual(['Support']);
      expect(result.data[0]?.createdAt).toBe('2026-10-20T08:30:00Z');
    }
  });

  it('accept POSTs to the accept path without a body', async () => {
    let methodSeen: string | undefined;
    let idSeen: unknown;
    let bodySeen: string | undefined;
    server.use(
      http.post(
        `${BASE_URL}/me/admin-panel/invites/:inviteId/accept`,
        async ({ request, params }) => {
          methodSeen = request.method;
          idSeen = params.inviteId;
          bodySeen = await request.text();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.invites.accept(INVITE_ID);

    expect(methodSeen).toBe('POST');
    expect(idSeen).toBe(INVITE_ID);
    expect(bodySeen).toBe('');
    expect(result.kind).toBe('success');
  });

  it('accept maps 404 to ResourceNotFound', async () => {
    server.use(http.post(`${BASE_URL}/me/admin-panel/invites/:inviteId/accept`, () => notFound()));

    const result = await t.client.admin.invites.accept('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('decline POSTs to the decline path without a body', async () => {
    let idSeen: unknown;
    let bodySeen: string | undefined;
    server.use(
      http.post(
        `${BASE_URL}/me/admin-panel/invites/:inviteId/decline`,
        async ({ request, params }) => {
          idSeen = params.inviteId;
          bodySeen = await request.text();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.invites.decline(INVITE_ID);

    expect(idSeen).toBe(INVITE_ID);
    expect(bodySeen).toBe('');
    expect(result.kind).toBe('success');
  });

  it('leave POSTs to /me/admin-panel/leave without a body', async () => {
    let methodSeen: string | undefined;
    let bodySeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/me/admin-panel/leave`, async ({ request }) => {
        methodSeen = request.method;
        bodySeen = await request.text();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.invites.leave();

    expect(methodSeen).toBe('POST');
    expect(bodySeen).toBe('');
    expect(result.kind).toBe('success');
  });
});
