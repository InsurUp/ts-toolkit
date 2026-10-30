import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsuranceProductType, ProductBranch } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, problemResponse, setupIntegrationTest } from './setup';
import {
  sampleInsurGatewayInsuranceCompanies,
  sampleInsurGatewayProducts,
} from './fixtures/admin-insurGateway';

const t = setupIntegrationTest();

const productsPath = `${BASE_URL}/insurance-services/insurgateway/products`;
const companiesPath = `${BASE_URL}/insurance-services/insurgateway/insurance-companies`;

describe('AdminInsurGatewayClient', () => {
  it("getProducts GETs InsurGateway's products with their mappings", async () => {
    server.use(http.get(productsPath, () => HttpResponse.json(sampleInsurGatewayProducts)));

    const result = await t.client.admin.insurGateway.getProducts();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.productBranch).toBe(ProductBranch.Trafik);
      expect(result.data[0]?.type).toBe(InsuranceProductType.Robot);
      expect(result.data[1]?.productId).toBeNull();
    }
  });

  it("getProducts maps InsurGateway's refusal to Upstream", async () => {
    server.use(
      http.get(productsPath, () =>
        problemResponse({
          status: 422,
          type: 'https://api.insurup.com/problems/upstream-service',
          title: 'Upstream Error',
          detail: "External service 'InsurGateway' failed",
          codes: ['UPSTREAM_EXTERNAL_SERVICE_FAILED', 'INSURGATEWAY_LOGIN_FAILED'],
        })
      )
    );

    const result = await t.client.admin.insurGateway.getProducts();

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(422);
      expect(result.type).toBe(InsurUpServerErrorType.Upstream);
    }
  });

  it("getInsuranceCompanies GETs InsurGateway's companies with their mappings", async () => {
    server.use(
      http.get(companiesPath, () => HttpResponse.json(sampleInsurGatewayInsuranceCompanies))
    );

    const result = await t.client.admin.insurGateway.getInsuranceCompanies();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.map((company) => company.insuranceCompanyId)).toEqual([49, null]);
    }
  });

  it('mapProduct PUTs both ids with the product id in the path', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${productsPath}/:productId/mapping`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.productId).toBe('100000');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGateway.mapProduct(100000, 3001);

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({ productId: 100000, insurGatewayProductId: 3001 });
    expect(result.kind).toBe('success');
  });

  it("mapProduct maps an unmapped company's refusal to ResourceInvalidState", async () => {
    server.use(
      http.put(`${productsPath}/:productId/mapping`, () =>
        problemResponse({
          status: 409,
          type: 'https://api.insurup.com/problems/resource-invalid-state',
          title: 'Conflict',
          codes: ['RESOURCE_INVALID_STATE_WITH_ERROR', 'INSURGATEWAY_INSURANCE_COMPANY_NOT_MAPPED'],
        })
      )
    );

    const result = await t.client.admin.insurGateway.mapProduct(100000, 3001);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceInvalidState);
      expect(result.codes).toContain('INSURGATEWAY_INSURANCE_COMPANY_NOT_MAPPED');
    }
  });

  it('unmapProduct DELETEs the mapping by product id', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${productsPath}/:productId/mapping`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.productId).toBe('2471');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGateway.unmapProduct(2471);

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it('unmapProduct maps 404 to ResourceNotFound', async () => {
    server.use(http.delete(`${productsPath}/:productId/mapping`, () => notFound()));

    const result = await t.client.admin.insurGateway.unmapProduct(100000);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('mapInsuranceCompany PUTs both ids with the company id in the path', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${companiesPath}/:companyId/mapping`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.companyId).toBe('100000');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGateway.mapInsuranceCompany(100000, 120);

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({ insuranceCompanyId: 100000, insurGatewayCompanyId: 120 });
    expect(result.kind).toBe('success');
  });

  it('unmapInsuranceCompany DELETEs the mapping by company id', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${companiesPath}/:companyId/mapping`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.companyId).toBe('100000');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGateway.unmapInsuranceCompany(100000);

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it('unmapInsuranceCompany maps the mapped-products refusal to ResourceInvalidState', async () => {
    server.use(
      http.delete(`${companiesPath}/:companyId/mapping`, () =>
        problemResponse({
          status: 409,
          type: 'https://api.insurup.com/problems/resource-invalid-state',
          title: 'Conflict',
          codes: [
            'RESOURCE_INVALID_STATE_WITH_ERROR',
            'INSURGATEWAY_INSURANCE_COMPANY_HAS_MAPPED_PRODUCTS',
          ],
        })
      )
    );

    const result = await t.client.admin.insurGateway.unmapInsuranceCompany(100000);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceInvalidState);
      expect(result.codes).toContain('INSURGATEWAY_INSURANCE_COMPANY_HAS_MAPPED_PRODUCTS');
    }
  });

  it('unmapInsuranceCompany maps 404 to ResourceNotFound', async () => {
    server.use(http.delete(`${companiesPath}/:companyId/mapping`, () => notFound()));

    const result = await t.client.admin.insurGateway.unmapInsuranceCompany(100001);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });
});
