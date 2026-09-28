/**
 * @fileoverview Me Client Tests - me/* endpoints and the X-Agent-Id header
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'https://test.api.com/api/';

function lastCall(): { url: string; method: string; headers: Record<string, string> } {
  const [url, init] = mockFetch.mock.calls.at(-1) ?? [];
  return {
    url: String(url),
    method: String(init?.method),
    headers: (init?.headers ?? {}) as Record<string, string>,
  };
}

describe('InsurUpMeClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it.each([
    ['getMyContexts', 'me/contexts'],
    ['getMyAgents', 'me/agents'],
    ['getMyInvites', 'me/invites'],
  ] as const)('%s sends GET %s', async (method, path) => {
    mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json([]));
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL });

    const result = await client.me[method]();

    expect(result.kind).toBe('success');
    expect(lastCall()).toMatchObject({ url: `${BASE_URL}${path}`, method: 'GET' });
  });

  it.each([
    ['acceptInvite', 'me/invites/ID-1/accept'],
    ['declineInvite', 'me/invites/ID-1/decline'],
    ['leaveAgent', 'me/agents/ID-1/leave'],
  ] as const)('%s sends POST %s without a body', async (method, path) => {
    mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty());
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL });

    const result = await client.me[method]('ID-1');

    expect(result.kind).toBe('success');
    expect(lastCall()).toMatchObject({ url: `${BASE_URL}${path}`, method: 'POST' });
    expect(mockFetch.mock.calls.at(-1)?.[1]?.body).toBeNull();
  });
});

describe('agent context (X-Agent-Id)', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(async () => MockFetchResponseFactory.json([]));
  });

  it('is not sent by default', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL });

    await client.me.getMyAgents();

    expect(lastCall().headers).not.toHaveProperty('X-Agent-Id');
  });

  it('is sent from the agentId option', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL, agentId: 'AGENT-1' });

    await client.me.getMyAgents();

    expect(lastCall().headers['X-Agent-Id']).toBe('AGENT-1');
  });

  it('is replaced by setAgentId and removed by setAgentId(null)', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL, agentId: 'AGENT-1' });

    client.setAgentId('AGENT-2');
    await client.me.getMyAgents();
    expect(lastCall().headers['X-Agent-Id']).toBe('AGENT-2');

    client.setAgentId(null);
    await client.me.getMyAgents();
    expect(lastCall().headers).not.toHaveProperty('X-Agent-Id');
  });
});
