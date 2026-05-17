import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { sampleAgentBranch } from './fixtures/agentBranch';

const t = setupIntegrationTest();

describe('AgentBranchClient', () => {
  it('createAgentBranch posts name + parent and returns id', async () => {
    let receivedBody: { name?: string; parentBranchId?: string } | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-branches`, async ({ request }) => {
        receivedBody = (await request.json()) as typeof receivedBody;
        return HttpResponse.json('BRANCH-NEW');
      })
    );

    const result = await t.client.agentBranches.createAgentBranch({
      name: 'Ankara Office',
      parentBranchId: 'BRANCH-ROOT',
    });

    expect(receivedBody?.name).toBe('Ankara Office');
    expect(receivedBody?.parentBranchId).toBe('BRANCH-ROOT');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toBe('BRANCH-NEW');
    }
  });

  it('getAgentBranches returns parsed list', async () => {
    server.use(
      http.get(`${BASE_URL}/agent-branches`, () =>
        HttpResponse.json([
          sampleAgentBranch,
          { ...sampleAgentBranch, id: 'BR-2', parentBranchId: 'BR-1' },
        ])
      )
    );

    const result = await t.client.agentBranches.getAgentBranches();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[1]?.parentBranchId).toBe('BR-1');
    }
  });

  it('getAgentBranchById embeds id in path', async () => {
    server.use(
      http.get(`${BASE_URL}/agent-branches/:id`, ({ params }) => {
        expect(params.id).toBe(sampleAgentBranch.id);
        return HttpResponse.json(sampleAgentBranch);
      })
    );

    const result = await t.client.agentBranches.getAgentBranchById(sampleAgentBranch.id);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleAgentBranch.id);
    }
  });

  it('getAgentBranchById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/agent-branches/:id`, () => notFound()));

    const result = await t.client.agentBranches.getAgentBranchById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('updateAgentBranch sends PUT with new name', async () => {
    let receivedBody: { name?: string } | undefined;
    let methodSeen: string | undefined;
    server.use(
      http.put(`${BASE_URL}/agent-branches/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('BR-1');
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.agentBranches.updateAgentBranch({ id: 'BR-1', name: 'Renamed' });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody?.name).toBe('Renamed');
  });

  it('deleteAgentBranch sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/agent-branches/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('BR-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.agentBranches.deleteAgentBranch({ id: 'BR-1' });

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
