import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { sampleAgentUser, sampleAgentUserRobotCode } from './fixtures/agentUser';

const t = setupIntegrationTest();

describe('AgentUserClient', () => {
  it('getMyAgentUser returns parsed profile', async () => {
    server.use(http.get(`${BASE_URL}/agent-users/me`, () => HttpResponse.json(sampleAgentUser)));

    const result = await t.client.agentUsers.getMyAgentUser();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleAgentUser.id);
      expect(result.data.email).toBe(sampleAgentUser.email);
    }
  });

  it('getMyAgentUserRobotCode returns robot code', async () => {
    server.use(
      http.get(`${BASE_URL}/agent-users/me/robot-code`, () =>
        HttpResponse.json(sampleAgentUserRobotCode)
      )
    );

    const result = await t.client.agentUsers.getMyAgentUserRobotCode();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.robotCode).toBe(sampleAgentUserRobotCode.robotCode);
    }
  });

  it('getAgentUserById embeds id in path', async () => {
    server.use(
      http.get(`${BASE_URL}/agent-users/:id`, ({ params }) => {
        expect(params.id).toBe('AU-99');
        return HttpResponse.json({ id: 'AU-99', email: 'x@y.com' });
      })
    );

    const result = await t.client.agentUsers.getAgentUserById('AU-99');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('AU-99');
    }
  });

  it('activateAgentUser POSTs to id-specific activate path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-users/:id/activate`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('AU-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentUsers.activateAgentUser('AU-1');

    expect(methodSeen).toBe('POST');
  });

  it('deactivateAgentUser POSTs to id-specific deactivate path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-users/:id/deactivate`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('AU-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentUsers.deactivateAgentUser('AU-1');

    expect(methodSeen).toBe('POST');
  });

  it('deleteAgentUser sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/agent-users/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('AU-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentUsers.deleteAgentUser('AU-1');

    expect(methodSeen).toBe('DELETE');
  });

  it('reSendInviteAgentUser POSTs to re-send-invite path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-users/:id/re-send-invite`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('AU-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentUsers.reSendInviteAgentUser('AU-1');

    expect(methodSeen).toBe('POST');
  });

  it('checkAgentUserInviteCode forwards code as query param', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/agent-users/check-invite-code`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ valid: true });
      })
    );

    await t.client.agentUsers.checkAgentUserInviteCode('INV-12345');

    expect(capturedUrl).toContain('code=INV-12345');
  });
});
