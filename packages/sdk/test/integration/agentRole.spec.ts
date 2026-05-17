import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleAgentRole } from './fixtures/agentRole';

const t = setupIntegrationTest();

describe('AgentRoleClient', () => {
  it('createAgentRole POSTs request body to /agent-roles', async () => {
    let receivedBody: { roleName?: string; permissions?: string[] } | undefined;
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-roles`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.agentRoles.createAgentRole({
      roleName: 'Manager',
      permissions: ['read:all', 'write:all'],
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody?.roleName).toBe('Manager');
    expect(receivedBody?.permissions).toEqual(['read:all', 'write:all']);
    expect(result.kind).toBe('success');
  });

  it('getAgentRoles returns parsed array', async () => {
    server.use(http.get(`${BASE_URL}/agent-roles`, () => HttpResponse.json([sampleAgentRole])));

    const result = await t.client.agentRoles.getAgentRoles();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.id).toBe('ROLE-1');
      expect(result.data[0]?.name).toBe('Operator');
    }
  });

  it('getAgentRoleById embeds id in path and returns role', async () => {
    server.use(
      http.get(`${BASE_URL}/agent-roles/:id`, ({ params }) => {
        expect(params.id).toBe('ROLE-42');
        return HttpResponse.json({ ...sampleAgentRole, id: 'ROLE-42' });
      })
    );

    const result = await t.client.agentRoles.getAgentRoleById('ROLE-42');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe('ROLE-42');
    }
  });

  it('getAgentRoleById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/agent-roles/:id`, () => notFound()));

    const result = await t.client.agentRoles.getAgentRoleById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('updateAgentRole sends PUT to id-specific path with body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: { name?: string; permissions?: string[] } | undefined;
    server.use(
      http.put(`${BASE_URL}/agent-roles/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('ROLE-1');
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentRoles.updateAgentRole({
      id: 'ROLE-1',
      name: 'Senior Operator',
      permissions: ['read:all'],
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody?.name).toBe('Senior Operator');
    expect(receivedBody?.permissions).toEqual(['read:all']);
  });

  it('deleteAgentRole sends DELETE to id-specific path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/agent-roles/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('ROLE-99');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.agentRoles.deleteAgentRole({ id: 'ROLE-99' });

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
