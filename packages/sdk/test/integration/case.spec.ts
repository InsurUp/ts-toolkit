import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import {
  sampleCase,
  sampleCaseActivities,
  sampleCaseAutomations,
  sampleCasePriorityTemplates,
} from './fixtures/case';

const t = setupIntegrationTest();

describe('CaseClient', () => {
  it('getCaseByRef embeds ref in path and returns parsed case', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/:ref`, ({ params }) => {
        expect(params.ref).toBe(sampleCase.ref);
        return HttpResponse.json(sampleCase);
      })
    );

    const result = await t.client.cases.getCaseByRef(sampleCase.ref);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.ref).toBe(sampleCase.ref);
      expect(result.data.customerId).toBe(sampleCase.customerId);
    }
  });

  it('getCaseByRef maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/cases/:ref`, () => notFound()));

    const result = await t.client.cases.getCaseByRef('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('getCaseActivities returns activities array', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/:ref/activities`, ({ params }) => {
        expect(params.ref).toBe('CS-1');
        return HttpResponse.json(sampleCaseActivities);
      })
    );

    const result = await t.client.cases.getCaseActivities('CS-1');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(sampleCaseActivities.length);
      expect(result.data[0]?.action).toBe(sampleCaseActivities[0]?.action);
    }
  });

  it('getCasePolicies returns case-attached policies', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/:ref/policies`, ({ params }) => {
        expect(params.ref).toBe('CS-1');
        return HttpResponse.json([{ id: 'POL-1' }]);
      })
    );

    const result = await t.client.cases.getCasePolicies('CS-1');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
    }
  });

  it('getCaseProposals returns case-attached proposals', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/:ref/proposals`, ({ params }) => {
        expect(params.ref).toBe('CS-1');
        return HttpResponse.json([{ id: 'PR-1' }]);
      })
    );

    const result = await t.client.cases.getCaseProposals('CS-1');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.id).toBe('PR-1');
    }
  });

  it('getAllCaseCommunicationAutomations returns parsed automations', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/communication-automations`, () =>
        HttpResponse.json(sampleCaseAutomations)
      )
    );

    const result = await t.client.cases.getAllCaseCommunicationAutomations();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.name).toBe(sampleCaseAutomations[0]?.name);
    }
  });

  it('getCasePriorityTemplates returns priority templates', async () => {
    server.use(
      http.get(`${BASE_URL}/cases/priority-templates`, () =>
        HttpResponse.json(sampleCasePriorityTemplates)
      )
    );

    const result = await t.client.cases.getCasePriorityTemplates();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.templates).toHaveLength(sampleCasePriorityTemplates.templates.length);
    }
  });
});
