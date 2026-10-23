import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { AgentSetupPaymentMode, AgentSetupRequestState } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest, validationError } from './setup';
import {
  sampleAgentSetupRequest,
  sampleAgentSetupRequestId,
  sampleAgentSetupRequests,
  sampleCreateAgentSetupRequestResult,
} from './fixtures/admin-agentSetup';

const t = setupIntegrationTest();

describe('AdminAgentSetupClient', () => {
  it('create POSTs the request to /agent-setup-requests and returns the invite', async () => {
    let methodSeen: string | undefined;
    let body: unknown;
    server.use(
      http.post(`${BASE_URL}/agent-setup-requests`, async ({ request }) => {
        methodSeen = request.method;
        body = await request.json();
        return HttpResponse.json(sampleCreateAgentSetupRequestResult);
      })
    );

    const result = await t.client.admin.agentSetup.create({
      label: 'Acme onboarding',
      expiration: '7.00:00:00',
      email: 'owner@acme.example',
      subscriptionPlanId: 2,
      paymentMode: AgentSetupPaymentMode.Required,
    });

    expect(methodSeen).toBe('POST');
    expect(body).toEqual({
      label: 'Acme onboarding',
      expiration: '7.00:00:00',
      email: 'owner@acme.example',
      subscriptionPlanId: 2,
      paymentMode: 'REQUIRED',
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleAgentSetupRequestId);
      expect(result.data.urlEncodedCode).toBe('AbC%2B12%2Fx');
    }
  });

  it('create maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/agent-setup-requests`, () =>
        validationError([{ propertyName: 'email', errorMessage: 'Invalid e-mail' }])
      )
    );

    const result = await t.client.admin.agentSetup.create({
      label: 'x',
      expiration: '1.00:00:00',
      email: 'not-an-email',
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('getAll GETs the page with paging query', async () => {
    let methodSeen: string | undefined;
    let query: URLSearchParams | undefined;
    server.use(
      http.get(`${BASE_URL}/agent-setup-requests`, ({ request }) => {
        methodSeen = request.method;
        query = new URL(request.url).searchParams;
        return HttpResponse.json(sampleAgentSetupRequests);
      })
    );

    const result = await t.client.admin.agentSetup.getAll({ page: 2, pageSize: 10 });

    expect(methodSeen).toBe('GET');
    expect(query?.get('page')).toBe('2');
    expect(query?.get('pageSize')).toBe('10');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.hasPreviousPage).toBe(true);
      expect(result.data.items[0]?.state).toBe(AgentSetupRequestState.Done);
      expect(result.data.items[0]?.expirationTimeSpan).toBe('7.00:00:00');
    }
  });

  it('getById embeds the id in the path', async () => {
    let id: unknown;
    server.use(
      http.get(`${BASE_URL}/agent-setup-requests/:id`, ({ params }) => {
        id = params.id;
        return HttpResponse.json(sampleAgentSetupRequest);
      })
    );

    const result = await t.client.admin.agentSetup.getById(sampleAgentSetupRequestId);

    expect(id).toBe(sampleAgentSetupRequestId);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.state).toBe(AgentSetupRequestState.Active);
    }
  });

  it('getById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/agent-setup-requests/:id`, () => notFound()));

    const result = await t.client.admin.agentSetup.getById('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('disable PATCHes the id in path and body', async () => {
    let methodSeen: string | undefined;
    let id: unknown;
    let body: unknown;
    server.use(
      http.patch(`${BASE_URL}/agent-setup-requests/:id/disable`, async ({ request, params }) => {
        methodSeen = request.method;
        id = params.id;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.agentSetup.disable(sampleAgentSetupRequestId);

    expect(methodSeen).toBe('PATCH');
    expect(id).toBe(sampleAgentSetupRequestId);
    expect(body).toEqual({ id: sampleAgentSetupRequestId });
    expect(result.kind).toBe('success');
  });
});
