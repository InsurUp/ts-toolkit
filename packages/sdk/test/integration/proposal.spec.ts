import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, setupIntegrationTest } from './setup';
import { emptyCoverage } from './fixtures/coverage';
import { sampleProposal, sampleProposalProductPremiumDetail } from './fixtures/proposal';

const t = setupIntegrationTest();

describe('ProposalClient', () => {
  it('getProposalDetail embeds id in path and returns parsed proposal', async () => {
    server.use(
      http.get(`${BASE_URL}/proposals/:id`, ({ params }) => {
        expect(params.id).toBe(sampleProposal.proposalId);
        return HttpResponse.json(sampleProposal);
      })
    );

    const result = await t.client.proposals.getProposalDetail(sampleProposal.proposalId);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.proposalId).toBe(sampleProposal.proposalId);
      expect(result.data.totalProductsCount).toBe(sampleProposal.totalProductsCount);
    }
  });

  it('getProposalDetail maps 404 to ResourceNotFound', async () => {
    server.use(http.get(`${BASE_URL}/proposals/:id`, () => notFound()));

    const result = await t.client.proposals.getProposalDetail('missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('getProposalProductCoverage embeds proposalId + productId in path', async () => {
    server.use(
      http.get(`${BASE_URL}/proposals/:id/products/:pid/coverage`, ({ params }) => {
        expect(params.id).toBe('PR-1');
        expect(params.pid).toBe('PP-9');
        return HttpResponse.json({ coverage: emptyCoverage });
      })
    );

    const result = await t.client.proposals.getProposalProductCoverage('PR-1', 'PP-9');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.coverage.productBranch).toBe(emptyCoverage.productBranch);
    }
  });

  it('getProposalProductPremiumDetail embeds installmentNumber in path', async () => {
    server.use(
      http.get(`${BASE_URL}/proposals/:id/products/:pid/premium-detail/:n`, ({ params }) => {
        expect(params.id).toBe('PR-1');
        expect(params.pid).toBe('PP-1');
        expect(params.n).toBe('3');
        return HttpResponse.json(sampleProposalProductPremiumDetail);
      })
    );

    const result = await t.client.proposals.getProposalProductPremiumDetail('PR-1', 'PP-1', 3);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.proposalProductId).toBe(
        sampleProposalProductPremiumDetail.proposalProductId
      );
    }
  });

  it('retryFailedProposalProduct POSTs to retry path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/proposals/:id/products/:pid/retry`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('PR-1');
        expect(params.pid).toBe('PP-1');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.proposals.retryFailedProposalProduct('PR-1', 'PP-1');

    expect(methodSeen).toBe('POST');
  });
});
