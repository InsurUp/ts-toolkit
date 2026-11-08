import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { notFound, problemResponse, setupIntegrationTest, validationError } from './setup';
import {
  sampleInsurGatewayPlatformInsuranceCompanies,
  sampleInsurGatewayPlatformProducts,
} from './fixtures/admin-insurGatewayPlatform';

const t = setupIntegrationTest();

const productsPath = `${BASE_URL}/insurance-services/insurgateway-platform/products`;
const companiesPath = `${BASE_URL}/insurance-services/insurgateway-platform/insurance-companies`;

describe('AdminInsurGatewayPlatformClient', () => {
  it("getProducts GETs the platform's products with their mappings", async () => {
    server.use(http.get(productsPath, () => HttpResponse.json(sampleInsurGatewayPlatformProducts)));

    const result = await t.client.admin.insurGatewayPlatform.getProducts();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.mappedMajor).toBe(1);
      expect(result.data[1]?.productId).toBeNull();
    }
  });

  it("getProducts maps the catalog's refusal to Upstream", async () => {
    server.use(
      http.get(productsPath, () =>
        problemResponse({
          status: 422,
          type: 'https://api.insurup.com/problems/upstream-service',
          title: 'Upstream Error',
          detail: "External service 'InsurGatewayPlatform' failed",
          codes: ['UPSTREAM_EXTERNAL_SERVICE_FAILED'],
        })
      )
    );

    const result = await t.client.admin.insurGatewayPlatform.getProducts();

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(422);
      expect(result.type).toBe(InsurUpServerErrorType.Upstream);
    }
  });

  it('getInsuranceCompanies GETs the mapped companies with their renamed keys', async () => {
    server.use(
      http.get(companiesPath, () => HttpResponse.json(sampleInsurGatewayPlatformInsuranceCompanies))
    );

    const result = await t.client.admin.insurGatewayPlatform.getInsuranceCompanies();

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data[0]?.company).toBe('turkiye-sigorta');
      expect(result.data[0]?.connectionFields['Servis URL']).toBe('serviceUrl');
    }
  });

  it('mapProduct PUTs the platform product and major with the product id in the path', async () => {
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

    const result = await t.client.admin.insurGatewayPlatform.mapProduct(
      100000,
      'turkiye-sigorta-togg-kasko-proposal',
      1
    );

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      productId: 100000,
      product: 'turkiye-sigorta-togg-kasko-proposal',
      major: 1,
    });
    expect(result.kind).toBe('success');
  });

  it('mapProduct sends a null major when none is given, for the highest', async () => {
    let receivedBody: unknown;
    server.use(
      http.put(`${productsPath}/:productId/mapping`, async ({ request }) => {
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    await t.client.admin.insurGatewayPlatform.mapProduct(100000, 'turkiye-sigorta-kasko-proposal');

    expect(receivedBody).toEqual({
      productId: 100000,
      product: 'turkiye-sigorta-kasko-proposal',
      major: null,
    });
  });

  it("mapProduct maps an unmapped company's refusal to ResourceInvalidState", async () => {
    server.use(
      http.put(`${productsPath}/:productId/mapping`, () =>
        problemResponse({
          status: 409,
          type: 'https://api.insurup.com/problems/resource-invalid-state',
          title: 'Conflict',
          codes: ['RESOURCE_INVALID_STATE'],
        })
      )
    );

    const result = await t.client.admin.insurGatewayPlatform.mapProduct(
      100000,
      'turkiye-sigorta-togg-kasko-proposal'
    );

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceInvalidState);
    }
  });

  it('unmapProduct DELETEs the mapping by product id', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${productsPath}/:productId/mapping`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.productId).toBe('100001');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGatewayPlatform.unmapProduct(100001);

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it('unmapProduct maps 404 to ResourceNotFound', async () => {
    server.use(http.delete(`${productsPath}/:productId/mapping`, () => notFound()));

    const result = await t.client.admin.insurGatewayPlatform.unmapProduct(100000);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('mapInsuranceCompany PUTs the company and renamed keys with the company id in the path', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${companiesPath}/:companyId/mapping`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.companyId).toBe('116');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGatewayPlatform.mapInsuranceCompany(116, {
      company: 'turkiye-sigorta',
      connectionFields: { 'Servis URL': 'serviceUrl' },
      robotLogin: { totpSecret: 'otp' },
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      insuranceCompanyId: 116,
      company: 'turkiye-sigorta',
      connectionFields: { 'Servis URL': 'serviceUrl' },
      robotLogin: { totpSecret: 'otp' },
    });
    expect(result.kind).toBe('success');
  });

  it('mapInsuranceCompany maps a company the catalog has no products of to InputValidation', async () => {
    server.use(
      http.put(`${companiesPath}/:companyId/mapping`, () =>
        validationError([
          {
            propertyName: 'Company',
            errorMessage: "The specified condition was not met for 'Company'.",
          },
        ])
      )
    );

    const result = await t.client.admin.insurGatewayPlatform.mapInsuranceCompany(116, {
      company: 'no-such-company',
      connectionFields: {},
      robotLogin: {},
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.validationErrors[0]?.propertyName).toBe('Company');
    }
  });

  it('unmapInsuranceCompany DELETEs the mapping by company id', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(`${companiesPath}/:companyId/mapping`, ({ request, params }) => {
        methodSeen = request.method;
        expect(params.companyId).toBe('116');
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insurGatewayPlatform.unmapInsuranceCompany(116);

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
          codes: ['RESOURCE_INVALID_STATE'],
        })
      )
    );

    const result = await t.client.admin.insurGatewayPlatform.unmapInsuranceCompany(116);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceInvalidState);
    }
  });
});
