import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { setupIntegrationTest, validationError } from './setup';
import { sampleAgentSetupResult } from './fixtures/agentSetup';

const t = setupIntegrationTest();

describe('AgentSetupClient', () => {
  it('enterAgentSetupRequest posts code and returns setup payload', async () => {
    let receivedBody: { code?: string } | undefined;
    server.use(
      http.post(`${BASE_URL}/agent-setup-requests/enter`, async ({ request }) => {
        receivedBody = (await request.json()) as { code?: string };
        return HttpResponse.json(sampleAgentSetupResult);
      })
    );

    const result = await t.client.agentSetup.enterAgentSetupRequest({ code: 'ABC-123' });

    expect(receivedBody?.code).toBe('ABC-123');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.label).toBe(sampleAgentSetupResult.label);
    }
  });

  it('enterAgentSetupRequest maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/agent-setup-requests/enter`, () =>
        validationError([], 'Code is required')
      )
    );

    const result = await t.client.agentSetup.enterAgentSetupRequest({ code: '' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });
});
