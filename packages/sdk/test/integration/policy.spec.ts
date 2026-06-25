import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { samplePolicyDetail, samplePolicyDocument } from './fixtures/policy';
import { AssetType, Currency, PaymentOption, ProductBranch } from '@insurup/contracts';

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

  it('getPolicyDetail includes version query when provided', async () => {
    server.use(
      http.get(`${BASE_URL}/policies/:id`, ({ params, request }) => {
        expect(params.id).toBe(samplePolicyDetail.id);
        expect(new URL(request.url).searchParams.get('version')).toBe('2');
        return HttpResponse.json({ ...samplePolicyDetail, currentVersion: 2, versions: [] });
      })
    );

    const result = await t.client.policies.getPolicyDetail({
      policyId: samplePolicyDetail.id,
      version: 2,
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.currentVersion).toBe(2);
    }
  });

  it('searchPolicyForClaim posts composite policy key', async () => {
    server.use(
      http.post(`${BASE_URL}/policies/search-for-claim`, async ({ request }) => {
        const body = (await request.json()) as {
          insuranceCompanyId: number;
          policyNumber: string;
          endorsementNumber: number;
          renewalNumber: number;
        };
        expect(body).toEqual({
          insuranceCompanyId: 42,
          policyNumber: 'P-123',
          endorsementNumber: 1,
          renewalNumber: 0,
        });
        return HttpResponse.json({
          found: true,
          owned: false,
          ownedBySelf: false,
          policyId: 'POL-CLAIM',
          requiresBranchSelection: true,
          candidateBranchIds: ['BR-1', 'BR-2'],
          endorsementAhead: false,
          lastEndorsementNumber: null,
        });
      })
    );

    const result = await t.client.policies.searchPolicyForClaim({
      insuranceCompanyId: 42,
      policyNumber: 'P-123',
      endorsementNumber: 1,
      renewalNumber: 0,
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.policyId).toBe('POL-CLAIM');
      expect(result.data.candidateBranchIds).toEqual(['BR-1', 'BR-2']);
    }
  });

  it('claimPolicy posts to policy claim endpoint', async () => {
    server.use(
      http.post(`${BASE_URL}/policies/:id/claim`, async ({ params, request }) => {
        expect(params.id).toBe('POL-CLAIM');
        const body = (await request.json()) as { policyId: string; agentBranchId: string };
        expect(body).toEqual({ policyId: 'POL-CLAIM', agentBranchId: 'BR-1' });
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.policies.claimPolicy({
      policyId: 'POL-CLAIM',
      agentBranchId: 'BR-1',
    });

    expect(result.kind).toBe('success');
  });

  it('addPolicyEndorsement posts manual endorsement differences', async () => {
    server.use(
      http.post(`${BASE_URL}/policies/:id/endorsements`, async ({ params, request }) => {
        expect(params.id).toBe('POL-1');
        const body = (await request.json()) as {
          policyId: string;
          netPremium: number;
          grossPremium: number;
          commission: number;
          reason: string;
        };
        expect(body).toEqual({
          policyId: 'POL-1',
          netPremium: -10,
          grossPremium: -12,
          commission: -1,
          reason: 'Correction',
        });
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.policies.addPolicyEndorsement({
      policyId: 'POL-1',
      netPremium: -10,
      grossPremium: -12,
      commission: -1,
      reason: 'Correction',
    });

    expect(result.kind).toBe('success');
  });

  it('createManualPolicy accepts the expanded core request shape', async () => {
    server.use(
      http.post(`${BASE_URL}/policies/manual`, async ({ request }) => {
        const body = (await request.json()) as { insuredCustomerId: string; agentBranchId: string };
        expect(body.insuredCustomerId).toBe('CUS-INSURED');
        expect(body.agentBranchId).toBe('BR-1');
        return HttpResponse.json({ policyId: 'POL-MANUAL' }, { status: 201 });
      })
    );

    const result = await t.client.policies.createManualPolicy({
      policyNumber: 'M-1',
      insuranceCompanyId: 42,
      productId: 7,
      productBranch: ProductBranch.Kasko,
      insuredCustomerId: 'CUS-INSURED',
      insurerCustomerId: 'CUS-INSURER',
      coverage: null,
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      arrangementDate: '2026-01-01',
      netPremium: 100,
      grossPremium: 120,
      commission: 10,
      renewalNumber: 0,
      daskPolicyNumber: null,
      proposalId: null,
      currency: Currency.TurkishLira,
      exchangeRate: 1,
      paymentType: PaymentOption.SyncCreditCard,
      assetId: 'ASSET-1',
      assetType: AssetType.Vehicle,
      metadata: { source: 'agent-panel' },
      agentBranchId: 'BR-1',
    });

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.policyId).toBe('POL-MANUAL');
    }
  });

  it('updateManualPolicy accepts expanded partial fields', async () => {
    server.use(
      http.put(`${BASE_URL}/policies/manual/:id`, async ({ params, request }) => {
        expect(params.id).toBe('POL-MANUAL');
        const body = (await request.json()) as { policyId: string; exchangeRate: number };
        expect(body).toMatchObject({ policyId: 'POL-MANUAL', exchangeRate: 2 });
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.policies.updateManualPolicy({
      policyId: 'POL-MANUAL',
      policyNumber: 'M-2',
      insuranceCompanyId: 42,
      productId: 8,
      productBranch: ProductBranch.Konut,
      insuredCustomerId: 'CUS-INSURED-2',
      insurerCustomerId: 'CUS-INSURER-2',
      coverage: null,
      startDate: '2026-02-01',
      endDate: '2027-02-01',
      arrangementDate: '2026-02-01',
      netPremium: 200,
      grossPremium: 240,
      commission: 20,
      daskPolicyNumber: 'DASK-1',
      proposalId: 'PROP-1',
      currency: Currency.Euro,
      exchangeRate: 2,
      paymentType: PaymentOption.SyncOpenAccount,
      assetId: 'ASSET-2',
      assetType: AssetType.Property,
    });

    expect(result.kind).toBe('success');
  });

  it('setPolicyBranch uses PUT according to the core endpoint contract', async () => {
    server.use(
      http.put(`${BASE_URL}/policies/:id/branch`, async ({ params, request }) => {
        expect(params.id).toBe('POL-1');
        const body = (await request.json()) as { policyId: string; branchId: string };
        expect(body).toEqual({ policyId: 'POL-1', branchId: 'BR-1' });
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.policies.setPolicyBranch({ policyId: 'POL-1', branchId: 'BR-1' });

    expect(result.kind).toBe('success');
  });
});
