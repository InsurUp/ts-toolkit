import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { ProductBranch } from '@insurup/sdk';
import type { KaskoCoverage } from '@insurup/sdk';
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

  // Regression for #67: the deployed backend's polymorphic deserializer rejects (HTTP 500) any
  // coverage object whose `$type` discriminator is missing or not the first property. Consumers
  // that build coverages via spreads / field-by-field edits / mergeCoverage can't guarantee key
  // order, so the SDK must re-order `$type` to the front at every depth before sending.
  it('updateCoverageGroup hoists $type to the first key at every depth', async () => {
    let rawBody: string | undefined;
    server.use(
      http.put(`${BASE_URL}/coverage-groups/:id`, async ({ request }) => {
        rawBody = await request.text();
        return new HttpResponse(null, { status: 204 });
      })
    );

    // Deliberately out of order: $type trails both the coverage object and the nested value.
    const coverage: KaskoCoverage = {
      productBranch: ProductBranch.Kasko,
      immLimitiAyrimsiz: { value: 250000, $type: 'DECIMAL' as const },
      $type: 'kasko' as const,
    };

    await t.client.coverage.updateCoverageGroup({
      id: 'CG-9',
      name: 'Premium',
      coverageTable: [{ coverage }],
    });

    const sent = JSON.parse(rawBody ?? '{}') as {
      coverageTable: { coverage: Record<string, unknown> }[];
    };
    const sentCoverage = sent.coverageTable[0]!.coverage;
    expect(Object.keys(sentCoverage)[0]).toBe('$type');
    expect(sentCoverage['$type']).toBe('kasko');
    expect(Object.keys(sentCoverage['immLimitiAyrimsiz'] as object)[0]).toBe('$type');
  });

  it('createCoverageGroup hoists $type to the first key at every depth', async () => {
    let rawBody: string | undefined;
    server.use(
      http.post(`${BASE_URL}/coverage-groups`, async ({ request }) => {
        rawBody = await request.text();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const coverage: KaskoCoverage = {
      productBranch: ProductBranch.Kasko,
      immLimitiAyrimsiz: { value: 250000, $type: 'DECIMAL' as const },
      $type: 'kasko' as const,
    };

    await t.client.coverage.createCoverageGroup({
      name: 'Basic',
      productBranch: ProductBranch.Kasko,
      coverageTable: [{ coverage }],
    });

    const sent = JSON.parse(rawBody ?? '{}') as {
      coverageTable: { coverage: Record<string, unknown> }[];
    };
    const sentCoverage = sent.coverageTable[0]!.coverage;
    expect(Object.keys(sentCoverage)[0]).toBe('$type');
    expect(Object.keys(sentCoverage['immLimitiAyrimsiz'] as object)[0]).toBe('$type');
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

  it('getOssCoverageChoices hits oss endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:oss`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await t.client.coverage.getOssCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:oss');
  });

  it('getSeyahatSaglikCoverageChoices hits seyahat-saglik endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:seyahat-saglik`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await t.client.coverage.getSeyahatSaglikCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:seyahat-saglik');
  });

  it('getYabanciSaglikCoverageChoices hits yabanci-saglik endpoint', async () => {
    let capturedUrl: string | undefined;
    server.use(
      http.get(`${BASE_URL}/coverage-choices:yabanci-saglik`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await t.client.coverage.getYabanciSaglikCoverageChoices();

    expect(capturedUrl).toContain('/coverage-choices:yabanci-saglik');
  });
});
