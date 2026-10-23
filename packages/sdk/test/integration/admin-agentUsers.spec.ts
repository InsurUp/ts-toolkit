import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { problemResponse, setupIntegrationTest } from './setup';
import { sampleMigrateLegacyAgentUsersResult } from './fixtures/admin-agentUsers';

const t = setupIntegrationTest();

const AGENT_ID = '0192f1a0-0000-7000-8000-0000000000e1';

describe('InsurUpAdminAgentUsersClient', () => {
  it('migrateLegacy without arguments POSTs an empty object and returns the run summary', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/agent-users/migrate-legacy`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json(sampleMigrateLegacyAgentUsersResult);
      })
    );

    const result = await t.client.admin.agentUsers.migrateLegacy();

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({});
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.createdCount).toBe(3);
      expect(result.data.linkedCount).toBe(2);
      expect(result.data.skippedUserIds).toEqual(['0192f1a0-0000-7000-8000-0000000000d1']);
      expect(result.data.failedUserIds).toEqual([]);
    }
  });

  it('migrateLegacy sends the agency to migrate', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/agent-users/migrate-legacy`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(sampleMigrateLegacyAgentUsersResult);
      })
    );

    const result = await t.client.admin.agentUsers.migrateLegacy({ agentId: AGENT_ID });

    expect(receivedBody).toEqual({ agentId: AGENT_ID });
    expect(result.kind).toBe('success');
  });

  it('migrateLegacy maps a run already in progress to ResourceInvalidState', async () => {
    server.use(
      http.post(`${BASE_URL}/agent-users/migrate-legacy`, () =>
        problemResponse({
          status: 409,
          type: 'https://api.insurup.com/problems/resource-invalid-state',
          title: 'Conflict',
          detail: 'A legacy agent user migration is already in progress',
        })
      )
    );

    const result = await t.client.admin.agentUsers.migrateLegacy();

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceInvalidState);
    }
  });
});
