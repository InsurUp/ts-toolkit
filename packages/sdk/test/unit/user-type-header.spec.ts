/**
 * @fileoverview User Type Header Tests - the X-User-Type context header
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserType } from '@insurup/contracts';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', mockFetch);

const BASE_URL = 'https://test.api.com/api/';

function lastHeaders(): Record<string, string> {
  const [, init] = mockFetch.mock.calls.at(-1) ?? [];
  return (init?.headers ?? {}) as Record<string, string>;
}

describe('user type context (X-User-Type)', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockImplementation(async () => MockFetchResponseFactory.json([]));
  });

  it('is not sent by default', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL });

    await client.me.getMyAgents();

    expect(lastHeaders()).not.toHaveProperty('X-User-Type');
  });

  it.each([
    [UserType.AdminPanel, 'AdminPanel'],
    [UserType.Agent, 'Agent'],
  ] as const)('sends %s as core enum name %s', async (userType, headerValue) => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL, userType });

    await client.me.getMyAgents();

    expect(lastHeaders()['X-User-Type']).toBe(headerValue);
  });

  it('is replaced by setUserType and removed by setUserType(null)', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL, userType: UserType.Agent });

    client.setUserType(UserType.AdminPanel);
    await client.me.getMyAgents();
    expect(lastHeaders()['X-User-Type']).toBe('AdminPanel');

    client.setUserType(null);
    await client.me.getMyAgents();
    expect(lastHeaders()).not.toHaveProperty('X-User-Type');
  });

  it('is overridden by a per-request header', async () => {
    const client = new DefaultInsurUpClient({ baseUrl: BASE_URL, userType: UserType.AdminPanel });

    await client.me.getMyAgents({ headers: { 'X-User-Type': 'Agent' } });

    expect(lastHeaders()['X-User-Type']).toBe('Agent');
  });
});
