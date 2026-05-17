import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { samplePolicyDetail, samplePolicyDocument } from './fixtures/policy';

const t = setupIntegrationTest();

describe('PolicyClient', () => {
  it('getPolicyDetail embeds policyId in path and returns parsed policy', async () => {
    server.use(
      http.get(`${BASE_URL}/policies/:id`, ({ params }) => {
        expect(params.id).toBe(samplePolicyDetail.id);
        return HttpResponse.json(samplePolicyDetail);
      })
    );

    const result = await t.client.policies.getPolicyDetail({
      policyId: samplePolicyDetail.id,
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(samplePolicyDetail.id);
      expect(result.data.insurerCustomerId).toBe(samplePolicyDetail.insurerCustomerId);
    }
  });

  it('getPolicyDetail maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/policies/:id`, () => notFound()));

    const result = await t.client.policies.getPolicyDetail({ policyId: 'missing' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('fetchPolicyDocument embeds policyId in /document path', async () => {
    server.use(
      http.get(`${BASE_URL}/policies/:id/document`, ({ params }) => {
        expect(params.id).toBe('POL-1');
        return HttpResponse.json(samplePolicyDocument);
      })
    );

    const result = await t.client.policies.fetchPolicyDocument({ policyId: 'POL-1' });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.url).toBe(samplePolicyDocument.url);
    }
  });
});
