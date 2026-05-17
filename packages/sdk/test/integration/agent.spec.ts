import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { setupIntegrationTest, unauthorized } from './setup';
import {
  sampleAgent,
  sampleAgentInsuranceCompany,
  sampleAgentInsuranceConnection,
} from './fixtures/agent';

const t = setupIntegrationTest();

describe('AgentClient', () => {
  it('getCurrentAgent returns parsed profile', async () => {
    server.use(http.get(`${BASE_URL}/agents/me`, () => HttpResponse.json(sampleAgent)));

    const result = await t.client.agents.getCurrentAgent();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.name).toBe(sampleAgent.name);
      expect(result.data.taxNumber).toBe(sampleAgent.taxNumber);
    }
  });

  it('getCurrentAgent maps 401 to Unauthorized', async () => {
    server.use(http.get(`${BASE_URL}/agents/me`, () => unauthorized()));

    const result = await t.client.agents.getCurrentAgent();

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(401);
      expect(result.type).toBe(InsurUpServerErrorType.Unauthorized);
    }
  });

  it('getAgentInsuranceCompaniesAsync returns parsed list', async () => {
    server.use(
      http.get(`${BASE_URL}/agents/me/insurance-companies`, () =>
        HttpResponse.json([sampleAgentInsuranceCompany])
      )
    );

    const result = await t.client.agents.getAgentInsuranceCompaniesAsync();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.id).toBe(sampleAgentInsuranceCompany.id);
      expect(result.data[0]?.insuranceCompanyId).toBe(
        sampleAgentInsuranceCompany.insuranceCompanyId
      );
    }
  });

  it('getAgentInsuranceCompanyBranchesAsync embeds AIC id in path', async () => {
    server.use(
      http.get(`${BASE_URL}/agents/me/insurance-companies/:id/branches`, ({ params }) => {
        expect(params.id).toBe('AIC-77');
        return HttpResponse.json([{ branch: 'kasko' }]);
      })
    );

    const result = await t.client.agents.getAgentInsuranceCompanyBranchesAsync('AIC-77');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
    }
  });

  it('getAgentInsuranceCompanyConnectionAsync embeds id and returns connection', async () => {
    server.use(
      http.get(`${BASE_URL}/agents/me/insurance-companies/:id/connection`, ({ params }) => {
        expect(params.id).toBe('AIC-77');
        return HttpResponse.json(sampleAgentInsuranceConnection);
      })
    );

    const result = await t.client.agents.getAgentInsuranceCompanyConnectionAsync('AIC-77');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.connectionFields.apiKey).toBe('sk_test');
    }
  });

  it('removeAgentInsuranceCompany sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/agents/me/insurance-companies/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('AIC-77');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.agents.removeAgentInsuranceCompany('AIC-77');

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
