/**
 * @fileoverview Customer integration tests
 * @description Full-stack tests of customer client methods through MSW.
 * Each test registers its own handler — no global defaults.
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { InsurUpServerErrorType } from '../../src/core/result';
import { CustomerType } from '@insurup/contracts';
import type { CreateCustomerRequestIndividual } from '@insurup/contracts';
import { BASE_URL, server } from './server';
import { conflict, notFound, setupIntegrationTest, validationError } from './setup';
import { sampleCustomer, sampleCustomerEmails } from './fixtures/customer';

const t = setupIntegrationTest();

describe('Customer API Contract', () => {
  describe('GET /customers/:id', () => {
    it('returns customer data with correct structure', async () => {
      server.use(
        http.get(`${BASE_URL}/customers/:id`, ({ params }) => {
          expect(params.id).toBe('CUSTOMER-12345');
          return HttpResponse.json(sampleCustomer);
        })
      );

      const result = await t.client.customers.getCustomer('CUSTOMER-12345');

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.id).toBe('CUSTOMER-12345');
        expect(result.data.type).toBe(CustomerType.Individual);
        expect(result.data.createdBy).toEqual({
          id: 'AGENT-789',
          name: 'Agent Smith',
          role: 'agent',
        });
      }
    });

    it('maps 404 to ResourceNotFound', async () => {
      server.use(http.get(`${BASE_URL}/customers/:id`, () => notFound('Customer not found')));

      const result = await t.client.customers.getCustomer('not-found');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
        expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
        expect(result.detail).toContain('Customer not found');
      }
    });

    it('maps 400 to InputValidation for invalid id format', async () => {
      server.use(
        http.get(`${BASE_URL}/customers/:id`, () =>
          validationError([], 'Invalid customer ID format')
        )
      );

      const result = await t.client.customers.getCustomer('invalid-format');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(400);
      }
    });
  });

  describe('POST /customers', () => {
    it('creates customer and returns the new id', async () => {
      let receivedBody: { identityNumber?: string; fullName?: string } | undefined;
      server.use(
        http.post(`${BASE_URL}/customers`, async ({ request }) => {
          receivedBody = (await request.json()) as typeof receivedBody;
          return HttpResponse.json({ id: 'CUSTOMER-NEW-001' }, { status: 201 });
        })
      );

      const result = await t.client.customers.createCustomer({
        type: CustomerType.Individual,
        identityNumber: '12345678901',
        fullName: 'Test Customer',
        birthDate: '1990-01-01',
        fillMissingFields: false,
      });

      expect(receivedBody?.identityNumber).toBe('12345678901');
      expect(receivedBody?.fullName).toBe('Test Customer');
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.id).toBe('CUSTOMER-NEW-001');
      }
    });

    it('maps 400 with validationErrors to InputValidation', async () => {
      server.use(
        http.post(`${BASE_URL}/customers`, () =>
          validationError([
            {
              propertyName: 'identityNumber',
              errorMessage: 'Identity number is required',
              attemptedValue: null,
            },
          ])
        )
      );

      const incompleteRequest: Partial<CreateCustomerRequestIndividual> = {
        type: CustomerType.Individual,
        fillMissingFields: false,
      };
      const result = await t.client.customers.createCustomer(
        incompleteRequest as CreateCustomerRequestIndividual
      );

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(400);
        expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
        expect(result.validationErrors[0]?.propertyName).toBe('identityNumber');
      }
    });

    it('maps 409 to ResourceDuplicate for duplicate identity number', async () => {
      server.use(http.post(`${BASE_URL}/customers`, () => conflict()));

      const result = await t.client.customers.createCustomer({
        type: CustomerType.Individual,
        identityNumber: '99999999999',
        fullName: 'Duplicate Customer',
        fillMissingFields: false,
      });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(409);
        expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
      }
    });
  });

  describe('PUT /customers/:id', () => {
    it('updates customer and returns 204', async () => {
      let methodSeen: string | undefined;
      let receivedBody: { fullName?: string } | undefined;
      server.use(
        http.put(`${BASE_URL}/customers/:id`, async ({ request, params }) => {
          methodSeen = request.method;
          expect(params.id).toBe('CUSTOMER-12345');
          receivedBody = (await request.json()) as typeof receivedBody;
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await t.client.customers.updateCustomer({
        type: CustomerType.Individual,
        id: 'CUSTOMER-12345',
        fullName: 'John Updated Doe',
        fillMissingFields: false,
      });

      expect(methodSeen).toBe('PUT');
      expect(receivedBody?.fullName).toBe('John Updated Doe');
      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
    });

    it('maps 404 for non-existent customer', async () => {
      server.use(http.put(`${BASE_URL}/customers/:id`, () => notFound()));

      const result = await t.client.customers.updateCustomer({
        type: CustomerType.Individual,
        id: 'not-found',
        fullName: 'Test',
        fillMissingFields: false,
      });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
      }
    });
  });

  describe('DELETE /customers/:id', () => {
    it('deletes customer and returns 204', async () => {
      let methodSeen: string | undefined;
      server.use(
        http.delete(`${BASE_URL}/customers/:id`, ({ request, params }) => {
          methodSeen = request.method;
          expect(params.id).toBe('CUSTOMER-12345');
          return new HttpResponse(null, { status: 204 });
        })
      );

      const result = await t.client.customers.deleteCustomer('CUSTOMER-12345');

      expect(methodSeen).toBe('DELETE');
      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
    });

    it('maps 404 for non-existent customer', async () => {
      server.use(http.delete(`${BASE_URL}/customers/:id`, () => notFound()));

      const result = await t.client.customers.deleteCustomer('not-found');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(404);
      }
    });
  });

  describe('GET /customers/:id/emails', () => {
    it('returns array of customer emails', async () => {
      server.use(
        http.get(`${BASE_URL}/customers/:id/emails`, ({ params }) => {
          expect(params.id).toBe(sampleCustomer.id);
          return HttpResponse.json(sampleCustomerEmails);
        })
      );

      const result = await t.client.customers.getCustomerEmails(sampleCustomer.id);

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toHaveLength(sampleCustomerEmails.length);
        expect(result.data[0]?.email).toBe(sampleCustomerEmails[0]?.email);
        expect(result.data[0]?.primary).toBe(true);
      }
    });
  });
});

describe('Customer Request/Response Cycle', () => {
  it('completes a full CRUD cycle', async () => {
    server.use(
      http.post(`${BASE_URL}/customers`, () =>
        HttpResponse.json({ id: 'CUSTOMER-NEW' }, { status: 201 })
      ),
      http.get(`${BASE_URL}/customers/:id`, () => HttpResponse.json(sampleCustomer)),
      http.put(`${BASE_URL}/customers/:id`, () => new HttpResponse(null, { status: 204 })),
      http.delete(`${BASE_URL}/customers/:id`, () => new HttpResponse(null, { status: 204 }))
    );

    const createResult = await t.client.customers.createCustomer({
      type: CustomerType.Individual,
      identityNumber: '11111111111',
      fullName: 'CRUD Test Customer',
      fillMissingFields: false,
    });
    expect(createResult.kind).toBe('success');

    const readResult = await t.client.customers.getCustomer('CUSTOMER-12345');
    expect(readResult.kind).toBe('success');

    const updateResult = await t.client.customers.updateCustomer({
      type: CustomerType.Individual,
      id: 'CUSTOMER-12345',
      fullName: 'Updated CRUD Test Customer',
      fillMissingFields: false,
    });
    expect(updateResult.kind).toBe('success');

    const deleteResult = await t.client.customers.deleteCustomer('CUSTOMER-12345');
    expect(deleteResult.kind).toBe('success');
  });
});
