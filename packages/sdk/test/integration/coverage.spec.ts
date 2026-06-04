import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProductBranch } from '@insurup/sdk';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { emptyCoverage, sampleCoverageGroup } from './fixtures/coverage';

const t = setupIntegrationTest();

const coverageTable = [{ coverage: emptyCoverage }];

describe('CoverageClient', () => {
  it('createCoverageGroup POSTs name and coverage table', async () => {
    let receivedBody: { name?: string; coverageTable?: unknown } | undefined;
    let methodSeen: string | undefined;
    server.use(
      http.post(`${BASE_URL}/coverage-groups`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.coverage.createCoverageGroup({
      name: 'Basic',
      productBranch: ProductBranch.Kasko,
      coverageTable,
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody?.name).toBe('Basic');
    expect(receivedBody?.coverageTable).toEqual(coverageTable);
  });

  it('updateCoverageGroup PUTs to id-specific path', async () => {
    let receivedBody: { id?: string; name?: string } | undefined;
    server.use(
      http.put(`${BASE_URL}/coverage-groups/:id`, async ({ request, params }) => {
        expect(params.id).toBe('CG-9');
        receivedBody = (await request.json()) as typeof receivedBody;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.coverage.updateCoverageGroup({
      id: 'CG-9',
      name: 'Premium',
      coverageTable,
    });

    expect(receivedBody?.id).toBe('CG-9');
    expect(receivedBody?.name).toBe('Premium');
  });

  it('deleteCoverageGroup sends DELETE', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${BASE_URL}/coverage-groups/:id`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('CG-9');
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.coverage.deleteCoverageGroup({ id: 'CG-9' });

    expect(methodSeen).toBe('DELETE');
  });

  it('getCoverageGroupById returns parsed coverage group', async () => {
    server.use(
      http.get(`${BASE_URL}/coverage-groups/:id`, ({ params }) => {
        expect(params.id).toBe(sampleCoverageGroup.id);
        return HttpResponse.json(sampleCoverageGroup);
      })
    );

    const result = await t.client.coverage.getCoverageGroupById(sampleCoverageGroup.id);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(sampleCoverageGroup.id);
      expect(result.data.name).toBe(sampleCoverageGroup.name);
    }
  });

  it('getAllCoverageGroups returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/coverage-groups`, () =>
        HttpResponse.json([
          sampleCoverageGroup,
          { ...sampleCoverageGroup, id: 'CG-2', name: 'Premium' },
        ])
      )
    );

    const result = await t.client.coverage.getAllCoverageGroups();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
    }
  });

  it('getKaskoCoverageChoices appends vehicleUtilizationStyle filter when provided', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:kasko`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([
          { insuranceCompanyId: 1, productType: 'WEB_SERVICE', coverageChoices: {} },
        ]);
      })
    );

    const result = await t.client.coverage.getKaskoCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:kasko');
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
    }
  });

  it('getKonutCoverageChoices hits konut endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:konut`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([
          { insuranceCompanyId: 2, productType: 'ROBOT', coverageChoices: {} },
        ]);
      })
    );

    const result = await t.client.coverage.getKonutCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:konut');
    expect(result.kind).toBe('success');
  });

  it('getTssCoverageChoices hits tss endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:tss`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await t.client.coverage.getTssCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:tss');
  });

  it('getImmCoverageChoices hits imm endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:imm`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await t.client.coverage.getImmCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:imm');
  });
});
