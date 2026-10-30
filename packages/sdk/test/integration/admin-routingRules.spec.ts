import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsuranceOperation, InsuranceServiceProvider } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest, validationError } from './setup';
import {
  sampleCreateRoutingRuleRequest,
  sampleDefaultRule,
  sampleScopedRule,
} from './fixtures/admin-routingRules';

const t = setupIntegrationTest();

describe('AdminRoutingRulesClient', () => {
  it('getAll GETs every rule', async () => {
    server.use(
      http.get(`${BASE_URL}/insurance-services/routing-rules`, () =>
        HttpResponse.json([sampleDefaultRule, sampleScopedRule])
      )
    );

    const result = await t.client.admin.routingRules.getAll();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.operation).toBe(InsuranceOperation.Proposal);
      expect(result.data[0]?.isDefault).toBe(true);
      expect(result.data[1]?.provider).toBe(InsuranceServiceProvider.InsurGateway);
    }
  });

  it('create POSTs the rule and returns it', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/insurance-services/routing-rules`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json(sampleScopedRule);
      })
    );

    const result = await t.client.admin.routingRules.create(sampleCreateRoutingRuleRequest);

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      operation: 'PROPOSAL',
      insuranceCompanyId: 49,
      productBranch: 'KASKO',
      agentIds: ['0193a3c4-0000-7000-8000-00000000aaaa'],
      provider: 'INSUR_GATEWAY',
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleScopedRule.id);
    }
  });

  it('create maps 409 to ResourceDuplicate', async () => {
    server.use(http.post(`${BASE_URL}/insurance-services/routing-rules`, () => conflict()));

    const result = await t.client.admin.routingRules.create(sampleCreateRoutingRuleRequest);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('update PUTs the scope with the rule id in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/insurance-services/routing-rules/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe(sampleScopedRule.id);
        receivedBody = await request.json();
        return HttpResponse.json({ ...sampleScopedRule, productId: 2471 });
      })
    );

    const result = await t.client.admin.routingRules.update(sampleScopedRule.id, {
      productId: 2471,
      provider: InsuranceServiceProvider.InsurGateway,
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      productId: 2471,
      provider: 'INSUR_GATEWAY',
      id: sampleScopedRule.id,
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.productId).toBe(2471);
    }
  });

  it('update maps 404 to ResourceNotFound', async () => {
    server.use(http.put(`${BASE_URL}/insurance-services/routing-rules/:id`, () => notFound()));

    const result = await t.client.admin.routingRules.update(sampleScopedRule.id, {
      provider: InsuranceServiceProvider.InsurGateway,
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('delete DELETEs the rule by id', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/insurance-services/routing-rules/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe(sampleScopedRule.id);
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.routingRules.delete(sampleScopedRule.id);

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it("delete maps a default rule's refusal to InputValidation", async () => {
    server.use(
      http.delete(`${BASE_URL}/insurance-services/routing-rules/:id`, () =>
        validationError(
          [],
          "An operation's default rule can't be deleted: change its provider instead."
        )
      )
    );

    const result = await t.client.admin.routingRules.delete(sampleDefaultRule.id);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });
});
