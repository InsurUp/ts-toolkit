import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { BASE_URL, server } from './server';
import { setupIntegrationTest } from './setup';
import { sampleBanks, sampleInsuranceCompanies, sampleResourceKeys } from './fixtures/insurance';

const t = setupIntegrationTest();

describe('InsuranceClient', () => {
  it('getResourceKeys returns parsed array', async () => {
    server.use(http.get(`${BASE_URL}/resource-keys`, () => HttpResponse.json(sampleResourceKeys)));

    const result = await t.client.insurance.getResourceKeys();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(sampleResourceKeys.length);
      expect(result.data[0]?.key).toBe(sampleResourceKeys[0]?.key);
    }
  });

  it('getInsuranceCompanies returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/insurance-companies`, () => HttpResponse.json(sampleInsuranceCompanies))
    );

    const result = await t.client.insurance.getInsuranceCompanies();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(sampleInsuranceCompanies.length);
      expect(result.data[1]?.name).toBe(sampleInsuranceCompanies[1]?.name);
    }
  });

  it('getInsuranceCompanyProducts embeds company id in path', async () => {
    server.use(
      http.get(`${BASE_URL}/insurance-companies/:id/products`, ({ params }) => {
        expect(params.id).toBe('42');
        return HttpResponse.json([{ id: 'PROD-1', name: 'Kasko' }]);
      })
    );

    const result = await t.client.insurance.getInsuranceCompanyProducts(42);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.name).toBe('Kasko');
    }
  });

  it('getAllProducts hits the cross-company products endpoint', async () => {
    server.use(http.get(`${BASE_URL}/products`, () => HttpResponse.json([{ id: 'PROD-X' }])));

    const result = await t.client.insurance.getAllProducts();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
    }
  });

  it('getCompanyConnectionFields embeds company id in path', async () => {
    server.use(
      http.get(
        `${BASE_URL}/insurance-companies/:id/connection-fields:agent-based`,
        ({ params }) => {
          expect(params.id).toBe('7');
          return HttpResponse.json([{ field: 'apiKey', required: true }]);
        }
      )
    );

    const result = await t.client.insurance.getCompanyConnectionFields(7);

    expect(result.kind).toBe('success');
  });

  it('getAllReleaseNotes returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/release-notes`, () =>
        HttpResponse.json([{ version: '1.0', notes: 'Initial' }])
      )
    );

    const result = await t.client.insurance.getAllReleaseNotes();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.version).toBe('1.0');
    }
  });

  it('getBanks returns parsed array', async () => {
    server.use(http.get(`${BASE_URL}/banks`, () => HttpResponse.json(sampleBanks)));

    const result = await t.client.insurance.getBanks();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.name).toBe(sampleBanks[0]?.name);
    }
  });

  it('getBankBranches embeds bank id in path', async () => {
    server.use(
      http.get(`${BASE_URL}/banks/:id/branches`, ({ params }) => {
        expect(params.id).toBe('BANK-XYZ');
        return HttpResponse.json([{ id: 'BR-1', name: 'Kadikoy Branch' }]);
      })
    );

    const result = await t.client.insurance.getBankBranches('BANK-XYZ');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.name).toBe('Kadikoy Branch');
    }
  });

  it('getFinancialInstitutions returns parsed array', async () => {
    server.use(
      http.get(`${BASE_URL}/financial-institutions`, () => HttpResponse.json([{ id: 'FI-1' }]))
    );

    const result = await t.client.insurance.getFinancialInstitutions();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
    }
  });
});
