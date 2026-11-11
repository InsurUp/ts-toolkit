/**
 * @fileoverview Call Center Client Tests - call-center/* endpoints
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'https://test.api.com/api/';

describe('InsurUpAgentClient call center endpoints', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new DefaultInsurUpClient({ baseUrl: BASE_URL });
  });

  it('startCallCenterCall sends POST call-center/calls with the request body', async () => {
    mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty());

    const result = await client.agents.startCallCenterCall({
      countryCode: 90,
      phoneNumber: '5551112233',
    });

    expect(result.kind).toBe('success');
    const [url, init] = mockFetch.mock.calls[0] ?? [];
    expect(String(url)).toBe(`${BASE_URL}call-center/calls`);
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({ countryCode: 90, phoneNumber: '5551112233' });
  });

  it('getCallCenterAgents sends GET call-center/agents and returns the agents', async () => {
    const agents = [{ agentNumber: '101', firstName: 'Ada', lastName: 'Yilmaz', active: true }];
    mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ agents }));

    const result = await client.agents.getCallCenterAgents();

    const [url, init] = mockFetch.mock.calls[0] ?? [];
    expect(String(url)).toBe(`${BASE_URL}call-center/agents`);
    expect(init?.method).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.agents).toEqual(agents);
    }
  });
});
