import { describe, it, expect } from 'vitest';
import { http, HttpResponse, type JsonBodyType } from 'msw';
import {
  AgentUserState,
  InsightsAgentRisk,
  InsightsBucketSize,
  InsightsFeature,
  InsightsFeatureKind,
  InsuranceProductType,
  Module,
  SubscriptionStatus,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { setupIntegrationTest, validationError } from './setup';
import {
  sampleInsightsAgent,
  sampleInsightsAgents,
  sampleInsightsAssistant,
  sampleInsightsChannels,
  sampleInsightsFeatures,
  sampleInsightsOperations,
  sampleInsightsOverview,
  sampleInsightsRange,
  sampleInsightsSales,
} from './fixtures/admin-insights';

const t = setupIntegrationTest();

interface SeenRequest {
  method?: string;
  body?: unknown;
}

/** Answers POST `observability/insights/{path}` with `response` and records what was sent. */
function mockInsights(path: string, response: JsonBodyType): SeenRequest {
  const seen: SeenRequest = {};
  server.use(
    http.post(`${BASE_URL}/observability/insights/${path}`, async ({ request }) => {
      seen.method = request.method;
      seen.body = await request.json();
      return HttpResponse.json(response);
    })
  );
  return seen;
}

describe('AdminInsightsClient', () => {
  it('getOverview POSTs the range, agent and test-agent flag and returns the overview', async () => {
    const seen = mockInsights('overview', sampleInsightsOverview);

    const result = await t.client.admin.insights.getOverview({
      ...sampleInsightsRange,
      agentId: null,
      includeTestAgents: true,
    });

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual({ ...sampleInsightsRange, agentId: null, includeTestAgents: true });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.buckets.size).toBe(InsightsBucketSize.Day);
      expect(result.data.proposals.series).toEqual([5, 7]);
      expect(result.data.grossPremiumTL.total).toBe(15250.75);
      expect(result.data.activeUsers).toBeNull();
      expect(result.data.proposalsByProductBranch[0]?.key).toBe('Kasko');
      expect(result.data.policiesByProductBranch[0]?.amountTL).toBe(12000);
    }
  });

  it('getAgents POSTs the range and returns every agent row', async () => {
    const seen = mockInsights('agents', sampleInsightsAgents);

    const result = await t.client.admin.insights.getAgents(sampleInsightsRange);

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual(sampleInsightsRange);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.activityAvailable).toBe(true);
      const row = result.data.agents[0];
      expect(row?.agentId).toBe('AGENT-1');
      expect(row?.subscription?.status).toBe(SubscriptionStatus.PastDue);
      expect(row?.health.reasons).toEqual([
        InsightsAgentRisk.ActivityDropped,
        InsightsAgentRisk.PastDue,
      ]);
    }
  });

  it('getAgent POSTs the range with the agent id and returns its users and screens', async () => {
    const seen = mockInsights('agent', sampleInsightsAgent);

    const result = await t.client.admin.insights.getAgent({
      ...sampleInsightsRange,
      agentId: 'AGENT-1',
    });

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual({ ...sampleInsightsRange, agentId: 'AGENT-1' });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.agent.name).toBe('Acme Sigorta');
      expect(result.data.users[0]?.state).toBe(AgentUserState.Active);
      expect(result.data.users[0]?.requests).toBe(410);
      expect(result.data.screens[0]?.path).toBe('/proposals/{id}');
    }
  });

  it('getFeatures POSTs the range and returns the feature matrix', async () => {
    const seen = mockInsights('features', sampleInsightsFeatures);

    const result = await t.client.admin.insights.getFeatures({
      ...sampleInsightsRange,
      agentId: 'AGENT-1',
    });

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual({ ...sampleInsightsRange, agentId: 'AGENT-1' });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.features.map((column) => column.kind)).toEqual([
        InsightsFeatureKind.Module,
        InsightsFeatureKind.Feature,
        InsightsFeatureKind.Integration,
      ]);
      expect(result.data.features[0]?.module).toBe(Module.Case);
      expect(result.data.features[2]?.integration).toBe(InsightsFeature.Webhooks);
      expect(result.data.agents[0]?.cells[2]?.configured).toBe(2);
    }
  });

  it('getSales POSTs the range and returns the insurance companies and renewals', async () => {
    const seen = mockInsights('sales', sampleInsightsSales);

    const result = await t.client.admin.insights.getSales(sampleInsightsRange);

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual(sampleInsightsRange);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      const company = result.data.insuranceCompanies[0];
      expect(company?.productType).toBe(InsuranceProductType.WebService);
      expect(company?.errors[0]?.key).toBe('Timeout');
      expect(result.data.renewals.next90Days).toBe(15);
      expect(result.data.renewals.byInsuranceCompany[0]?.key).toBe('Anadolu Sigorta');
    }
  });

  it('getChannels POSTs the range and returns the channel breakdowns and heatmap', async () => {
    const seen = mockInsights('channels', sampleInsightsChannels);

    const result = await t.client.admin.insights.getChannels({
      ...sampleInsightsRange,
      agentId: 'AGENT-1',
    });

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual({ ...sampleInsightsRange, agentId: 'AGENT-1' });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.selfServiceCustomers).toBe(120);
      expect(result.data.onlinePurchases.total).toBe(12);
      expect(result.data.heatmap.proposals[1]).toEqual([2, 0]);
    }
  });

  it('getOperations POSTs the range and returns the case figures', async () => {
    const seen = mockInsights('operations', sampleInsightsOperations);

    const result = await t.client.admin.insights.getOperations(sampleInsightsRange);

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual(sampleInsightsRange);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.open).toBe(14);
      expect(result.data.medianHoursToClose).toBe(18.5);
      expect(result.data.averageHoursToClose).toBeNull();
      expect(result.data.openByType[0]?.key).toBe('Request');
    }
  });

  it('getAssistant POSTs the range and returns the assistant usage', async () => {
    const seen = mockInsights('assistant', sampleInsightsAssistant);

    const result = await t.client.admin.insights.getAssistant({
      ...sampleInsightsRange,
      agentId: 'AGENT-1',
    });

    expect(seen.method).toBe('POST');
    expect(seen.body).toEqual({ ...sampleInsightsRange, agentId: 'AGENT-1' });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.tokens.cachedInput).toBe(800);
      expect(result.data.models[0]?.model).toBe('claude-sonnet');
      expect(result.data.actions[0]?.executed).toBe(2);
      expect(result.data.agents[0]?.lastUsedAt).toBeNull();
    }
  });

  it('maps a 400 with validationErrors to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/observability/insights/assistant`, () =>
        validationError([
          {
            propertyName: '',
            errorMessage: 'The range spans at most 31 days.',
          },
        ])
      )
    );

    const result = await t.client.admin.insights.getAssistant({
      from: '2026-09-01T00:00:00+03:00',
      to: '2026-10-15T00:00:00+03:00',
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.validationErrors).toHaveLength(1);
      expect(result.validationErrors[0]?.errorMessage).toBe('The range spans at most 31 days.');
    }
  });
});
