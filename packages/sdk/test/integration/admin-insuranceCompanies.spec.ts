import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsuranceCompanyConnectionFieldValueType } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest, validationError } from './setup';
import {
  sampleConnectionField,
  sampleConnectionFields,
  sampleCreateConnectionFieldRequest,
  sampleUpdateConnectionFieldRequest,
  sampleUpdateInsuranceCompanyRequest,
} from './fixtures/admin-insuranceCompanies';

const t = setupIntegrationTest();

describe('AdminInsuranceCompaniesClient', () => {
  it('create POSTs the company and returns it', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(`${BASE_URL}/insurance-companies`, async ({ request }) => {
        methodSeen = request.method;
        receivedBody = await request.json();
        return HttpResponse.json({
          id: 100000,
          name: 'Yeni Sigorta',
          logo: null,
          enabled: false,
          paymentOptions: [],
          supportedPaymentOptions: [],
        });
      })
    );

    const result = await t.client.admin.insuranceCompanies.create({ name: 'Yeni Sigorta' });

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({ name: 'Yeni Sigorta' });
    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data.id).toBe(100000);
      expect(result.data.paymentOptions).toEqual([]);
    }
  });

  it('create maps 400 to InputValidation', async () => {
    server.use(
      http.post(`${BASE_URL}/insurance-companies`, () =>
        validationError([{ propertyName: 'Name', errorMessage: "'Name' must not be empty." }])
      )
    );

    const result = await t.client.admin.insuranceCompanies.create({ name: '' });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('update PUTs the settings with the company id in the path and the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(`${BASE_URL}/insurance-companies/:id`, async ({ request, params }) => {
        methodSeen = request.method;
        expect(params.id).toBe('3');
        receivedBody = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const result = await t.client.admin.insuranceCompanies.update(
      3,
      sampleUpdateInsuranceCompanyRequest
    );

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      name: 'Anadolu Sigorta',
      logo: null,
      enabled: true,
      paymentOptions: [
        {
          branches: null,
          paymentOption: 'SYNC_CREDIT_CARD',
          enabled: true,
          disabledDescriptionResourceKey: null,
        },
        {
          branches: ['KASKO'],
          paymentOption: 'SYNC_CREDIT_CARD',
          enabled: false,
          disabledDescriptionResourceKey: 'PAYMENT_DISABLED_KASKO',
        },
      ],
      id: 3,
    });
    expect(result.kind).toBe('success');
  });

  it('update maps 400 to InputValidation', async () => {
    server.use(
      http.put(`${BASE_URL}/insurance-companies/:id`, () =>
        validationError([
          { propertyName: 'PaymentOptions', errorMessage: "'Payment Options' must not be null." },
        ])
      )
    );

    const result = await t.client.admin.insuranceCompanies.update(
      3,
      sampleUpdateInsuranceCompanyRequest
    );

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(400);
      expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
    }
  });

  it('getConnectionFields GETs the company fields', async () => {
    server.use(
      http.get(`${BASE_URL}/insurance-companies/:companyId/connection-fields`, ({ params }) => {
        expect(params.companyId).toBe('3');
        return HttpResponse.json(sampleConnectionFields);
      })
    );

    const result = await t.client.admin.insuranceCompanies.getConnectionFields(3);

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.valueType).toBe(InsuranceCompanyConnectionFieldValueType.AgentBased);
    }
  });

  it('getConnectionField GETs one field by company id and key', async () => {
    server.use(
      http.get(
        `${BASE_URL}/insurance-companies/:companyId/connection-fields/:key`,
        ({ params }) => {
          expect(params.companyId).toBe('3');
          expect(params.key).toBe('agent.no');
          return HttpResponse.json(sampleConnectionField);
        }
      )
    );

    const result = await t.client.admin.insuranceCompanies.getConnectionField(3, 'agent.no');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toEqual(sampleConnectionField);
    }
  });

  it('getConnectionField maps 404 to ResourceNotFound', async () => {
    server.use(
      http.get(`${BASE_URL}/insurance-companies/:companyId/connection-fields/:key`, () =>
        notFound()
      )
    );

    const result = await t.client.admin.insuranceCompanies.getConnectionField(3, 'missing');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
    }
  });

  it('createConnectionField POSTs the field with the company id', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post(
        `${BASE_URL}/insurance-companies/:companyId/connection-fields`,
        async ({ request, params }) => {
          methodSeen = request.method;
          expect(params.companyId).toBe('3');
          receivedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.insuranceCompanies.createConnectionField(
      3,
      sampleCreateConnectionFieldRequest
    );

    expect(methodSeen).toBe('POST');
    expect(receivedBody).toEqual({
      key: 'username',
      insuranceServicesKey: 'UserName',
      valueType: 'AGENT_BASED',
      purpose: 'CONNECTION',
      labelResourceKey: 'CONNECTION_FIELD_USERNAME',
      order: 1,
      insuranceCompanyId: 3,
    });
    expect(result.kind).toBe('success');
  });

  it('createConnectionField maps 409 to ResourceDuplicate', async () => {
    server.use(
      http.post(`${BASE_URL}/insurance-companies/:companyId/connection-fields`, () => conflict())
    );

    const result = await t.client.admin.insuranceCompanies.createConnectionField(
      3,
      sampleCreateConnectionFieldRequest
    );

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(409);
      expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
    }
  });

  it('updateConnectionField PUTs the field with the company id and key in the body', async () => {
    let methodSeen: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.put(
        `${BASE_URL}/insurance-companies/:companyId/connection-fields/:key`,
        async ({ request, params }) => {
          methodSeen = request.method;
          expect(params.companyId).toBe('3');
          expect(params.key).toBe('channel');
          receivedBody = await request.json();
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.insuranceCompanies.updateConnectionField(
      3,
      'channel',
      sampleUpdateConnectionFieldRequest
    );

    expect(methodSeen).toBe('PUT');
    expect(receivedBody).toEqual({
      insuranceServicesKey: 'Channel',
      valueType: 'CONSTANT',
      purpose: 'AGENT_NUMBER',
      labelResourceKey: 'CONNECTION_FIELD_CHANNEL',
      order: 3,
      descriptionResourceKey: null,
      value: 'MOBILE',
      hidden: true,
      key: 'channel',
      insuranceCompanyId: 3,
    });
    expect(result.kind).toBe('success');
  });

  it('deleteConnectionField DELETEs the field by company id and key', async () => {
    let methodSeen: string | undefined;
    server.use(
      http.delete(
        `${BASE_URL}/insurance-companies/:companyId/connection-fields/:key`,
        ({ request, params }) => {
          methodSeen = request.method;
          expect(params.companyId).toBe('3');
          expect(params.key).toBe('channel');
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    const result = await t.client.admin.insuranceCompanies.deleteConnectionField(3, 'channel');

    expect(methodSeen).toBe('DELETE');
    expect(result.kind).toBe('success');
  });
});
