import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { Module } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest } from './setup';
import {
  sampleSubscriptionPlan,
  sampleUpdateSubscriptionPlanRequest,
} from './fixtures/admin-subscriptionPlans';

const t = setupIntegrationTest();

describe('AdminSubscriptionPlansClient', () => {
  it('getAll GETs /subscription-plans and returns the plans', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.get(`${BASE_URL}/subscription-plans`, ({ request }) => {
        methodSeen = request.method;
        return HttpResponse.json([sampleSubscriptionPlan]);
      })
    );

    const result = await t.client.admin.subscriptionPlans.getAll();

    expect(methodSeen).toBe('GET');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.name).toBe('Pro');
      expect(result.data[0]?.modules).toContain(Module.Policy);
    }
  });

  it('getById embeds the plan id in the path', async () => {
    let id: unknown;
    server.use(
      http.get(`${BASE_URL}/subscription-plans/:id`, ({ params }) => {
        id = params.id;
        return HttpResponse.json(sampleSubscriptionPlan);
      })
    );

    const result = await t.client.admin.subscriptionPlans.getById(2);

    expect(id).toBe('2');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.purchaseProposalLimit).toBe(500);
      expect(result.data.insuranceCompanyLimit).toBeNull();
    }
  });

  it('getById maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/subscription-plans/:id`, () => notFound()));

    const result = await t.client.admin.subscriptionPlans.getById(99);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('create POSTs the plan and returns the bare id', async () => {
    let methodSeen: string | undefined;
    let body: unknown;
    server.use(
      http.post(`${BASE_URL}/subscription-plans`, async ({ request }) => {
        methodSeen = request.method;
        body = await request.json();
        return HttpResponse.json(7);
      })
    );

    const request = { ...sampleUpdateSubscriptionPlanRequest, id: 7 };
    const result = await t.client.admin.subscriptionPlans.create(request);

    expect(methodSeen).toBe('POST');
    expect(body).toEqual(request);
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toBe(7);
    }
  });

  it('create maps 409 to ResourceDuplicate', async () => {
    server.use(http.post(`${BASE_URL}/subscription-plans`, () => conflict('Plan id taken')));

    const result = await t.client.admin.subscriptionPlans.create({
      ...sampleUpdateSubscriptionPlanRequest,
      id: 2,
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('update PUTs the definition to the id-specific path', async () => {
    let methodSeen: string | undefined;
    let id: unknown;
    let body: unknown;
    server.use(
      http.put(`${BASE_URL}/subscription-plans/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        id = params.id;
        body = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.subscriptionPlans.update(
      2,
      sampleUpdateSubscriptionPlanRequest
    );

    expect(methodSeen).toBe('PUT');
    expect(id).toBe('2');
    expect(body).toEqual({
      nameResourceKey: 'subscription-plans.pro.name',
      descriptionResourceKey: null,
      basePrice: 1200,
      pricePerUser: 120,
      pricePerInsuranceCompany: 60,
      modules: ['CUSTOMER', 'PROPOSAL'],
      features: ['DATA_MASKING'],
      supportedBranches: ['DASK'],
      userLimit: 25,
      insuranceCompanyLimit: null,
    });
    expect(result.kind).toBe('success');
  });
});
