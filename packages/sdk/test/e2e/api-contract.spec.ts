/**
 * @fileoverview E2E API Contract Tests
 * @description Contract tests against a mock server using MSW (Mock Service Worker)
 * Tests complete request/response cycles with real HTTP to verify API contracts
 */

import { describe, it, expect, beforeAll, beforeEach, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { DefaultInsurUpClient } from '../../src/client/client';
import { CustomerType } from '@insurup/contracts';
import { InsurUpServerErrorType } from '../../src/core/result';
import type { GetCustomerResultIndividual, CreateCustomerRequestIndividual } from '@insurup/contracts';
import { DateTime, DateOnly } from '@insurup/contracts';

// Base URL for the mock server
const BASE_URL = 'https://api.test.insurup.com/api';

// Sample customer data that matches the API contract
const sampleCustomer: GetCustomerResultIndividual = {
  id: 'CUSTOMER-12345',
  type: CustomerType.Individual,
  fullName: 'John Doe',
  identityNumber: 12345678901,
  primaryEmail: 'john.doe@example.com',
  primaryPhoneNumber: {
    number: '5551234567',
    countryCode: 90
  },
  birthDate: new DateOnly('1990-05-15'),
  createdAt: new DateTime('2024-01-15T10:30:00Z'),
  createdBy: {
    id: 'AGENT-789',
    name: 'Agent Smith',
    role: 'agent'
  }
};

// Setup MSW server with handlers
const server = setupServer(
  // GET /customers/:id - Retrieve customer by ID
  http.get(`${BASE_URL}/customers/:customerId`, ({ params }) => {
    const { customerId } = params;

    if (customerId === 'CUSTOMER-12345') {
      return HttpResponse.json(sampleCustomer);
    }

    if (customerId === 'not-found') {
      return HttpResponse.json(
        {
          type: 'https://api.insurup.com/problems/resource-not-found',
          title: 'Not Found',
          detail: 'Customer not found',
          status: 404,
          instance: `/customers/${customerId}`
        },
        { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    return HttpResponse.json(
      {
        type: 'https://api.insurup.com/problems/input-validation',
        title: 'Bad Request',
        detail: 'Invalid customer ID format',
        status: 400
      },
      { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
    );
  }),

  // POST /customers - Create new customer
  http.post(`${BASE_URL}/customers`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;

    // Validate required fields
    if (!body.identityNumber || !body.fullName) {
      return HttpResponse.json(
        {
          type: 'https://api.insurup.com/problems/input-validation',
          title: 'Validation Error',
          detail: 'Missing required fields',
          status: 400,
          validationErrors: [
            {
              propertyName: 'identityNumber',
              errorMessage: 'Identity number is required',
              attemptedValue: null
            }
          ]
        },
        { status: 400, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    // Simulate duplicate check
    if (body.identityNumber === '99999999999') {
      return HttpResponse.json(
        {
          type: 'https://api.insurup.com/problems/resource-duplicate',
          title: 'Conflict',
          detail: 'Customer with this identity number already exists',
          status: 409
        },
        { status: 409, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    // Successful creation
    return HttpResponse.json(
      { id: `CUSTOMER-${Date.now()}` },
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // PUT /customers/:id - Update customer
  http.put(`${BASE_URL}/customers/:customerId`, async ({ params, request }) => {
    const { customerId } = params;
    // Consume the request body (not used in mock, but validates the request has a body)
    await request.json();

    if (customerId === 'not-found') {
      return HttpResponse.json(
        {
          type: 'https://api.insurup.com/problems/resource-not-found',
          title: 'Not Found',
          detail: 'Customer not found',
          status: 404
        },
        { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    // Successful update returns 204 No Content
    return new HttpResponse(null, { status: 204 });
  }),

  // DELETE /customers/:id - Delete customer
  http.delete(`${BASE_URL}/customers/:customerId`, ({ params }) => {
    const { customerId } = params;

    if (customerId === 'not-found') {
      return HttpResponse.json(
        {
          type: 'https://api.insurup.com/problems/resource-not-found',
          title: 'Not Found',
          detail: 'Customer not found',
          status: 404
        },
        { status: 404, headers: { 'Content-Type': 'application/problem+json' } }
      );
    }

    // Successful deletion returns 204 No Content
    return new HttpResponse(null, { status: 204 });
  }),

  // GET /customers/:id/emails - Get customer emails
  http.get(`${BASE_URL}/customers/:customerId/emails`, ({ params }) => {
    const { customerId } = params;

    if (customerId === 'CUSTOMER-12345') {
      return HttpResponse.json([
        { email: 'john.doe@example.com', isPrimary: true },
        { email: 'john.backup@example.com', isPrimary: false }
      ]);
    }

    return HttpResponse.json(
      {
        type: 'https://api.insurup.com/problems/resource-not-found',
        title: 'Not Found',
        detail: 'Customer not found',
        status: 404
      },
      { status: 404 }
    );
  }),

  // Catch-all for unhandled routes - returns 404
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      {
        type: 'https://api.insurup.com/problems/endpoint-not-found',
        title: 'Not Found',
        detail: 'The requested endpoint does not exist',
        status: 404
      },
      { status: 404 }
    );
  })
);

// Initialize client at module level for simpler setup
let client: DefaultInsurUpClient;

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(() => {
  client = new DefaultInsurUpClient({
    baseUrl: BASE_URL,
    timeoutMs: 5000
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('E2E API Contract Tests', () => {

  describe('Customer API Contract', () => {
    describe('GET /customers/:id', () => {
      it('should return customer data with correct structure', async () => {
        const result = await client.customers.getCustomer('CUSTOMER-12345');

        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          // Verify response structure matches contract
          expect(result.data).toHaveProperty('id');
          expect(result.data).toHaveProperty('type');
          expect(result.data).toHaveProperty('createdAt');
          expect(result.data).toHaveProperty('createdBy');

          // Verify specific values
          expect(result.data.id).toBe('CUSTOMER-12345');
          expect(result.data.type).toBe(CustomerType.Individual);

          // Verify nested structure
          expect(result.data.createdBy).toHaveProperty('id');
          expect(result.data.createdBy).toHaveProperty('name');
          expect(result.data.createdBy).toHaveProperty('role');
        }
      });

      it('should return 404 error structure for non-existent customer', async () => {
        const result = await client.customers.getCustomer('not-found');

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(404);
          expect(result.type).toBe(InsurUpServerErrorType.ResourceNotFound);
          expect(result.detail).toContain('Customer not found');
        }
      });

      it('should handle invalid ID format', async () => {
        const result = await client.customers.getCustomer('invalid-format');

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(400);
        }
      });
    });

    describe('POST /customers', () => {
      it('should create customer and return ID', async () => {
        const result = await client.customers.createCustomer({
          type: CustomerType.Individual,
          identityNumber: '12345678901',
          fullName: 'Test Customer',
          birthDate: '1990-01-01',
          fillMissingFields: false
        });

        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(result.data).toHaveProperty('id');
          expect(result.data.id).toMatch(/^CUSTOMER-/);
        }
      });

      it('should return validation error for missing required fields', async () => {
        // Send invalid request without required fields - intentionally incomplete for validation testing
        const incompleteRequest: Partial<CreateCustomerRequestIndividual> = {
          type: CustomerType.Individual,
          fillMissingFields: false
        };
        const result = await client.customers.createCustomer(
          incompleteRequest as CreateCustomerRequestIndividual
        );

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(400);
          expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
          expect(result.validationErrors.length).toBeGreaterThan(0);
        }
      });

      it('should return 409 for duplicate identity number', async () => {
        const result = await client.customers.createCustomer({
          type: CustomerType.Individual,
          identityNumber: '99999999999',
          fullName: 'Duplicate Customer',
          fillMissingFields: false
        });

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(409);
          expect(result.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
        }
      });
    });

    describe('PUT /customers/:id', () => {
      it('should update customer and return 204', async () => {
        const result = await client.customers.updateCustomer({
          type: CustomerType.Individual,
          id: 'CUSTOMER-12345',
          fullName: 'John Updated Doe',
          fillMissingFields: false
        });

        expect(result.kind).toBe('success');
        expect(result.isSuccess).toBe(true);
      });

      it('should return 404 for non-existent customer', async () => {
        const result = await client.customers.updateCustomer({
          type: CustomerType.Individual,
          id: 'not-found',
          fullName: 'Test',
          fillMissingFields: false
        });

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(404);
        }
      });
    });

    describe('DELETE /customers/:id', () => {
      it('should delete customer and return 204', async () => {
        const result = await client.customers.deleteCustomer('CUSTOMER-12345');

        expect(result.kind).toBe('success');
        expect(result.isSuccess).toBe(true);
      });

      it('should return 404 for non-existent customer', async () => {
        const result = await client.customers.deleteCustomer('not-found');

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.status).toBe(404);
        }
      });
    });

    describe('GET /customers/:id/emails', () => {
      it('should return array of customer emails', async () => {
        const result = await client.customers.getCustomerEmails('CUSTOMER-12345');

        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(Array.isArray(result.data)).toBe(true);
          expect(result.data.length).toBeGreaterThan(0);
          expect(result.data[0]).toHaveProperty('email');
          expect(result.data[0]).toHaveProperty('isPrimary');
        }
      });
    });
  });

  describe('HTTP Headers Contract', () => {
    it('should send correct Content-Type header for JSON requests', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.post(`${BASE_URL}/customers`, async ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({ id: 'CUSTOMER-123' }, { status: 201 });
        })
      );

      await client.customers.createCustomer({
        type: CustomerType.Individual,
        identityNumber: '12345678901',
        fullName: 'Test',
        fillMissingFields: false
      });

      expect(capturedHeaders!.get('content-type')).toBe('application/json');
    });

    it('should include custom headers when provided', async () => {
      const customClient = new DefaultInsurUpClient({
        baseUrl: BASE_URL,
        customHeaders: {
          'X-Custom-Header': 'custom-value',
          'X-Request-ID': 'test-123'
        }
      });

      let capturedHeaders: Headers | null = null;

      server.use(
        http.get(`${BASE_URL}/customers/:customerId`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json(sampleCustomer);
        })
      );

      await customClient.customers.getCustomer('CUSTOMER-12345');

      expect(capturedHeaders!.get('x-custom-header')).toBe('custom-value');
      expect(capturedHeaders!.get('x-request-id')).toBe('test-123');
    });
  });

  describe('Error Response Contract', () => {
    it('should parse Problem Details JSON format correctly', async () => {
      const problemDetails = {
        type: 'https://api.insurup.com/problems/business-validation',
        title: 'Business Rule Violation',
        detail: 'Customer must be at least 18 years old',
        status: 422,
        instance: '/customers',
        codes: ['AGE_RESTRICTION'],
        traceId: 'trace-abc-123',
        suggestions: ['Update the birth date', 'Verify customer age']
      };

      server.use(
        http.post(`${BASE_URL}/customers`, () => {
          return HttpResponse.json(problemDetails, {
            status: 422,
            headers: { 'Content-Type': 'application/problem+json' }
          });
        })
      );

      const result = await client.customers.createCustomer({
        type: CustomerType.Individual,
        identityNumber: '12345678901',
        fullName: 'Young Person',
        birthDate: '2020-01-01',
        fillMissingFields: false
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
            headers: { 'Content-Type': 'text/plain' }
          });
        })
      );

      const result = await client.customers.getCustomer('CUSTOMER-12345');

      // Should still be categorized as server error
      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(500);
      }
    });
  });

  describe('Request/Response Cycle', () => {
    it('should complete full CRUD cycle', async () => {
      // Create
      const createResult = await client.customers.createCustomer({
        type: CustomerType.Individual,
        identityNumber: '11111111111',
        fullName: 'CRUD Test Customer',
        fillMissingFields: false
      });
      expect(createResult.kind).toBe('success');

      // Read
      const readResult = await client.customers.getCustomer('CUSTOMER-12345');
      expect(readResult.kind).toBe('success');

      // Update
      const updateResult = await client.customers.updateCustomer({
        type: CustomerType.Individual,
        id: 'CUSTOMER-12345',
        fullName: 'Updated CRUD Test Customer',
        fillMissingFields: false
      });
      expect(updateResult.kind).toBe('success');

      // Delete
      const deleteResult = await client.customers.deleteCustomer('CUSTOMER-12345');
      expect(deleteResult.kind).toBe('success');
    });

    it('should handle request timeout', async () => {
      const shortTimeoutClient = new DefaultInsurUpClient({
        baseUrl: BASE_URL,
        timeoutMs: 10 // Very short timeout
      });

      server.use(
        http.get(`${BASE_URL}/customers/:customerId`, async () => {
          // Simulate slow response
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
        'application/problem+json'
      ];

      for (const contentType of jsonContentTypes) {
        server.use(
          http.get(`${BASE_URL}/customers/:customerId`, () => {
            return HttpResponse.json(sampleCustomer, {
              headers: { 'Content-Type': contentType }
            });
          })
        );

        const result = await client.customers.getCustomer('CUSTOMER-12345');
        expect(result.kind).toBe('success');
        server.resetHandlers();
      }
    });
  });
});
