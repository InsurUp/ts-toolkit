/**
 * @fileoverview Transport-level integration tests
 * @description Cross-cutting verification of HTTP headers, problem-details
 * parsing, content negotiation, and timeout handling through MSW. Uses customer
 * endpoints as a vehicle but asserts on transport behavior, not domain.
 */

import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { DefaultInsurUpClient } from '../../src/client/client';
import { InsurUpServerErrorType } from '../../src/core/result';
import { CustomerType } from '@insurup/contracts';
import { BASE_URL, server } from './server';
import { problemResponse, setupIntegrationTest } from './setup';
import { sampleCustomer } from './fixtures/customer';

const t = setupIntegrationTest();

describe('HTTP Headers Contract', () => {
  it('should send correct Content-Type header for JSON requests', async () => {
    let capturedHeaders: Headers | undefined;

    server.use(
      http.post(`${BASE_URL}/customers`, async ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json({ id: 'CUSTOMER-123' }, { status: 201 });
      })
    );

    await t.client.customers.createCustomer({
      type: CustomerType.Individual,
      identityNumber: '12345678901',
      fullName: 'Test',
      fillMissingFields: false,
    });

    const headers = capturedHeaders;
    if (!headers) throw new Error('expected request headers to be captured');
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('should include custom headers when provided', async () => {
    const customClient = new DefaultInsurUpClient({
      baseUrl: BASE_URL,
      customHeaders: {
        'X-Custom-Header': 'custom-value',
        'X-Request-ID': 'test-123',
      },
    });

    let capturedHeaders: Headers | undefined;

    server.use(
      http.get(`${BASE_URL}/customers/:customerId`, ({ request }) => {
        capturedHeaders = request.headers;
        return HttpResponse.json(sampleCustomer);
      })
    );

    await customClient.customers.getCustomer('CUSTOMER-12345');

    const headers = capturedHeaders;
    if (!headers) throw new Error('expected request headers to be captured');
    expect(headers.get('x-custom-header')).toBe('custom-value');
    expect(headers.get('x-request-id')).toBe('test-123');
  });
});

describe('Error Response Contract', () => {
  it('should parse Problem Details JSON format correctly', async () => {
    server.use(
      http.post(`${BASE_URL}/customers`, () =>
        problemResponse({
          status: 422,
          type: 'https://api.insurup.com/problems/business-validation',
          title: 'Business Rule Violation',
          detail: 'Customer must be at least 18 years old',
          codes: ['AGE_RESTRICTION'],
          traceId: 'trace-abc-123',
          suggestions: ['Update the birth date', 'Verify customer age'],
        })
      )
    );

    const result = await t.client.customers.createCustomer({
      type: CustomerType.Individual,
      identityNumber: '12345678901',
      fullName: 'Young Person',
      birthDate: '2020-01-01',
      fillMissingFields: false,
    });

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.type).toBe(InsurUpServerErrorType.BusinessValidation);
      expect(result.title).toBe('Business Rule Violation');
      expect(result.detail).toBe('Customer must be at least 18 years old');
      expect(result.codes).toContain('AGE_RESTRICTION');
      expect(result.traceId).toBe('trace-abc-123');
      expect(result.suggestions).toContain('Update the birth date');
    }
  });

  it('should handle malformed error response gracefully', async () => {
    server.use(
      http.get(`${BASE_URL}/customers/:customerId`, () => {
        return new HttpResponse('Internal Server Error', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
    );

    const result = await t.client.customers.getCustomer('CUSTOMER-12345');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(500);
    }
  });
});

describe('Timeout Handling', () => {
  it('should handle request timeout', async () => {
    const shortTimeoutClient = new DefaultInsurUpClient({
      baseUrl: BASE_URL,
      timeoutMs: 10,
    });

    server.use(
      http.get(`${BASE_URL}/customers/:customerId`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(sampleCustomer);
      })
    );

    const result = await shortTimeoutClient.customers.getCustomer('CUSTOMER-12345');

    expect(result.kind).toBe('client-error');
    if (result.kind === 'client-error') {
      expect(result.type).toBe('Timeout');
    }
  });
});

describe('Content Negotiation', () => {
  it('should handle different JSON content types', async () => {
    const jsonContentTypes = [
      'application/json',
      'application/json; charset=utf-8',
      'application/vnd.api+json',
      'application/problem+json',
    ];

    for (const contentType of jsonContentTypes) {
      server.use(
        http.get(`${BASE_URL}/customers/:customerId`, () => {
          return HttpResponse.json(sampleCustomer, {
            headers: { 'Content-Type': contentType },
          });
        })
      );

      const result = await t.client.customers.getCustomer('CUSTOMER-12345');
      expect(result.kind).toBe('success');
      server.resetHandlers();
    }
  });
});
