import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import {
  InsuranceProductType,
  PaymentOption,
  ProductBranch,
  ProductProposalConditionOperator,
} from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest, validationError } from './setup';
import { sampleInstallmentOption, sampleProposalConditions } from './fixtures/admin-products';

const t = setupIntegrationTest();

describe('AdminProductsClient', () => {
  it('enable POSTs the product id in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/products/:productId/enable`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.productId).toBe('42');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.products.enable(42);

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({ productId: 42 });
    expect(result.kind).toBe('success');
  });

  it('disable POSTs the product id in the path and the body', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/products/:productId/disable`, async ({ request, params }) => {
        expect(params.productId).toBe('7');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.products.disable(7);

    expect(receivedBody).toEqual({ productId: 7 });
    expect(result.kind).toBe('success');
  });

  it('disable maps 404 to ResourceNotFound', async () => {
    server.use(http.post(`${BASE_URL}/products/:productId/disable`, () => notFound()));

    const result = await t.client.admin.products.disable(999);

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('create POSTs the product and returns it', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/products`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({
          id: 100000,
          name: 'Yeni Kasko',
          insuranceCompanyId: 49,
          branch: 'KASKO',
          type: 'WEB_SERVICE',
          enabled: false,
          code: 'YK-1',
          supportedDocumentLanguages: [0],
        });
      })
    );

    const result = await t.client.admin.products.create({
      name: 'Yeni Kasko',
      insuranceCompanyId: 49,
      productBranch: ProductBranch.Kasko,
      type: InsuranceProductType.WebService,
      code: 'YK-1',
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      name: 'Yeni Kasko',
      insuranceCompanyId: 49,
      productBranch: 'KASKO',
      type: 'WEB_SERVICE',
      code: 'YK-1',
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(100000);
      expect(result.data.branch).toBe(ProductBranch.Kasko);
    }
  });

  it('create maps 409 to ResourceDuplicate', async () => {
    server.use(http.post(`${BASE_URL}/products`, () => conflict('Product 2471 exists')));

    const result = await t.client.admin.products.create({
      id: 2471,
      name: 'Kopya',
      insuranceCompanyId: 49,
      productBranch: ProductBranch.Trafik,
      type: InsuranceProductType.Robot,
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('update PUTs the name and code with the product id in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/products/:productId`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.productId).toBe('100000');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.products.update(100000, {
      name: 'Yeni Kasko 2',
      code: null,
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({ name: 'Yeni Kasko 2', code: null, productId: 100000 });
    expect(result.kind).toBe('success');
  });

  it('update maps 404 to ResourceNotFound', async () => {
    server.use(http.put(`${BASE_URL}/products/:productId`, () => notFound()));

    const result = await t.client.admin.products.update(987654, { name: 'X' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('sync POSTs without a body and accepts an empty 200', async () => {
    let methodSeen: string | undefined;
    let bodyText: string | undefined;
    server.use(
      http.post(`${BASE_URL}/products/sync`, async ({ request }) => {
        methodSeen = request.method;
        bodyText = await request.text();
        return new HttpResponse(null, { status: 200 });
      })
    );

    const result = await t.client.admin.products.sync();

    expect(methodSeen).toBe('POST');
    expect(bodyText).toBe('');
    expect(result.kind).toBe('success');
  });

  it('getInstallmentOptions GETs the product options', async () => {
    server.use(
      http.get(`${BASE_URL}/products/:productId/installment-options`, ({ params }) => {
        expect(params.productId).toBe('42');
        return HttpResponse.json([sampleInstallmentOption]);
      })
    );

    const result = await t.client.admin.products.getInstallmentOptions(42);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.installmentNumber).toBe(6);
      expect(result.data[0]?.paymentType).toBe(PaymentOption.Async3dSecure);
    }
  });

  it('createInstallmentOption POSTs the option with the product id', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(
        `${BASE_URL}/products/:productId/installment-options`,
        async ({ request, params }) => {
          methodSeen = request.method;
          expect(params.productId).toBe('42');
          receivedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.products.createInstallmentOption(42, {
      installmentNumber: 3,
      paymentType: PaymentOption.SyncCreditCard,
    });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      installmentNumber: 3,
      paymentType: 'SYNC_CREDIT_CARD',
      productId: 42,
    });
    expect(result.kind).toBe('success');
  });

  it('createInstallmentOption maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/products/:productId/installment-options`, () =>
        validationError([{ propertyName: 'installmentNumber', errorMessage: 'Must be positive' }])
      )
    );

    const result = await t.client.admin.products.createInstallmentOption(42, {
      installmentNumber: 0,
      paymentType: PaymentOption.SyncCreditCard,
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
      expect(result.validationErrors[0]?.propertyName).toBe('installmentNumber');
    }
  });

  it('deleteInstallmentOption DELETEs the product id and installment number path', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(
        `${BASE_URL}/products/:productId/installment-options/:installmentNumber`,
        ({ request, params }) => {
          methodSeen = request.method;
          expect(params.productId).toBe('42');
          expect(params.installmentNumber).toBe('6');
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.products.deleteInstallmentOption(42, 6);

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });

  it('getProposalConditions returns integer operators', async () => {
    server.use(
      http.get(`${BASE_URL}/products/:productId/proposal-conditions`, ({ params }) => {
        expect(params.productId).toBe('42');
        return HttpResponse.json([
          { key: 101, operator: 1, value: 'E' },
          { key: 202, operator: 2, value: null },
        ]);
      })
    );

    const result = await t.client.admin.products.getProposalConditions(42);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toEqual(sampleProposalConditions);
      expect(result.data[1]?.operator).toBe(ProductProposalConditionOperator.NotEquals);
    }
  });

  it('replaceProposalConditions PUTs the full set and returns the stored one', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(
        `${BASE_URL}/products/:productId/proposal-conditions`,
        async ({ request, params }) => {
          methodSeen = request.method;
          expect(params.productId).toBe('42');
          receivedBody = await request.json();
          return HttpResponse.json(sampleProposalConditions);
        }
      )
    );

    const result = await t.client.admin.products.replaceProposalConditions(42, {
      conditions: sampleProposalConditions,
    });

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      conditions: [
        { key: 101, operator: 1, value: 'E' },
        { key: 202, operator: 2, value: null },
      ],
      productId: 42,
    });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.operator).toBe(ProductProposalConditionOperator.Equals);
    }
  });
});
