/**
 * @fileoverview Error Scenario Integration Tests
 * @description Tests for complex error handling scenarios including cascading errors,
 * partial failures, recovery patterns, validation errors, and rate limiting
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { InsurUpClientErrorType, InsurUpServerErrorType } from '../../src/core/result';
import { InsurUpError } from '../../src/core/errors';
import { getDataOrThrow, throwIfError } from '../../src/core/result';
import { MockFetchResponseFactory, customerRequests } from '../utils';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Error Scenario Integration Tests', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
    });
  });

  describe('Cascading Errors', () => {
    it('should propagate server error through getDataOrThrow', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          404,
          'https://api.insurup.com/problems/resource-not-found',
          'Not Found',
          'Customer not found'
        )
      );

      const result = await client.customers.getCustomer('nonexistent-id');

      expect(() => getDataOrThrow(result)).toThrow(InsurUpError);

      try {
        getDataOrThrow(result);
      } catch (error) {
        expect(error).toBeInstanceOf(InsurUpError);
        const insurUpError = error as InsurUpError;
        expect(insurUpError.error.kind).toBe('server-error');
        if (insurUpError.error.kind === 'server-error') {
          expect(insurUpError.error.status).toBe(404);
          expect(insurUpError.error.type).toBe(InsurUpServerErrorType.ResourceNotFound);
        }
      }
    });

    it('should propagate client error through throwIfError', async () => {
      // Simulate network error
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      const result = await client.customers.getCustomer('123');

      expect(() => throwIfError(result)).toThrow(InsurUpError);

      try {
        throwIfError(result);
      } catch (error) {
        expect(error).toBeInstanceOf(InsurUpError);
        const insurUpError = error as InsurUpError;
        expect(insurUpError.error.kind).toBe('client-error');
        if (insurUpError.error.kind === 'client-error') {
          expect(insurUpError.error.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
        }
      }
    });

    it('should handle error in multi-step workflow', async () => {
      // Step 1: Create customer succeeds
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-123' }, 201));

      const createResult = await client.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );
      expect(createResult.kind).toBe('success');

      // Step 2: Add email fails with server error
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/input-validation',
          'Bad Request',
          'Invalid email format'
        )
      );

      const emailResult = await client.customers.addCustomerEmail({
        customerId: 'CUSTOMER-123',
        email: 'invalid-email',
      });

      expect(emailResult.kind).toBe('server-error');

      // Workflow should handle partial completion
      if (createResult.kind === 'success' && emailResult.kind === 'server-error') {
        // Customer was created but email addition failed
        expect(createResult.data.id).toBe('CUSTOMER-123');
        expect(emailResult.status).toBe(400);
      }
    });
  });

  describe('Partial Failures', () => {
    it('should handle batch operations with partial failures', async () => {
      // Simulate creating 3 customers, where 2nd one fails
      mockFetch
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-1' }, 201))
        .mockResolvedValueOnce(
          MockFetchResponseFactory.error(
            409,
            'https://api.insurup.com/problems/resource-duplicate',
            'Conflict',
            'Customer with this identity number already exists'
          )
        )
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-3' }, 201));

      const customers = [
        { ...customerRequests.validIndividualCustomer(), identityNumber: '11111111111' },
        { ...customerRequests.validIndividualCustomer(), identityNumber: '22222222222' },
        { ...customerRequests.validIndividualCustomer(), identityNumber: '33333333333' },
      ];

      const results = await Promise.all(customers.map((c) => client.customers.createCustomer(c)));

      // Collect successes and failures
      const successes = results.filter((r) => r.kind === 'success');
      const failures = results.filter((r) => r.kind !== 'success');

      expect(successes).toHaveLength(2);
      expect(failures).toHaveLength(1);

      // Verify the failure details
      const failure = failures[0];
      if (failure?.kind === 'server-error') {
        expect(failure.status).toBe(409);
        expect(failure.type).toBe(InsurUpServerErrorType.ResourceDuplicate);
      }
    });

    it('should track which operations succeeded in partial failure scenario', async () => {
      const operations = [
        { name: 'createCustomer', endpoint: 'customers' },
        { name: 'addEmail', endpoint: 'customers/123/emails' },
        { name: 'addPhone', endpoint: 'customers/123/phone-numbers' },
      ] as const;

      // Mock: first succeeds, second fails, third succeeds
      mockFetch
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-123' }, 201))
        .mockResolvedValueOnce(
          MockFetchResponseFactory.error(400, 'error', 'Bad Request', 'Invalid email')
        )
        .mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

      const results: Array<{ operation: string; success: boolean; error?: string }> = [];

      // Operation 1: Create customer
      const createResult = await client.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );
      const [op1, op2, op3] = operations;
      results.push({
        operation: op1.name,
        success: createResult.kind === 'success',
        error: createResult.kind !== 'success' ? createResult.message : undefined,
      });

      // Operation 2: Add email
      const emailResult = await client.customers.addCustomerEmail({
        customerId: 'CUSTOMER-123',
        email: 'test@test.com',
      });
      results.push({
        operation: op2.name,
        success: emailResult.kind === 'success',
        error: emailResult.kind !== 'success' ? emailResult.message : undefined,
      });

      // Operation 3: Add phone
      const phoneResult = await client.customers.addCustomerPhoneNumber({
        customerId: 'CUSTOMER-123',
        phoneNumber: { number: '5551234567', countryCode: 90 },
      });
      results.push({
        operation: op3.name,
        success: phoneResult.kind === 'success',
        error: phoneResult.kind !== 'success' ? phoneResult.message : undefined,
      });

      // Verify tracking
      const [r1, r2, r3] = results;
      expect(r1?.success).toBe(true);
      expect(r2?.success).toBe(false);
      expect(r2?.error).toBeDefined();
      expect(r3?.success).toBe(true);
    });
  });

  describe('Recovery Patterns', () => {
    it('should retry after recoverable 500 error', async () => {
      const clientWithRetry = new DefaultInsurUpClient({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        retry: {
          retries: 3,
          minTimeout: 1, // Very short for testing
          maxTimeout: 10,
          factor: 2,
          randomize: false,
        },
      });

      // First two calls fail with 500, third succeeds
      mockFetch
        .mockResolvedValueOnce(
          MockFetchResponseFactory.error(
            500,
            'https://api.insurup.com/problems/upstream-service',
            'Internal Server Error',
            'Service temporarily unavailable'
          )
        )
        .mockResolvedValueOnce(
          MockFetchResponseFactory.error(
            500,
            'https://api.insurup.com/problems/upstream-service',
            'Internal Server Error',
            'Service temporarily unavailable'
          )
        )
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-123' }, 201));

      const result = await clientWithRetry.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-recoverable 400 error', async () => {
      const clientWithRetry = new DefaultInsurUpClient({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        retry: {
          retries: 3,
          minTimeout: 100,
          maxTimeout: 1000,
          factor: 2,
          randomize: false,
        },
      });

      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/input-validation',
          'Bad Request',
          'Invalid data provided'
        )
      );

      const result = await clientWithRetry.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );

      expect(result.kind).toBe('server-error');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 400
    });

    it('should give up after max retries exhausted', async () => {
      const clientWithRetry = new DefaultInsurUpClient({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        retry: {
          retries: 2,
          minTimeout: 1, // Very short for testing
          maxTimeout: 5,
          factor: 2,
          randomize: false,
        },
      });

      // All calls fail - explicitly mock each retry attempt
      const errorResponse = MockFetchResponseFactory.error(
        500,
        'https://api.insurup.com/problems/upstream-service',
        'Internal Server Error',
        'Service unavailable'
      );

      mockFetch
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse)
        .mockResolvedValueOnce(errorResponse);

      const result = await clientWithRetry.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );

      // After max retries, the error is returned (either server-error or client-error depending on implementation)
      expect(result.isSuccess).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('Validation Errors', () => {
    it('should parse validation errors from server response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: () => 'application/problem+json' },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              type: 'https://api.insurup.com/problems/input-validation',
              title: 'Validation Error',
              detail: 'One or more validation errors occurred',
              status: 400,
              validationErrors: [
                {
                  propertyName: 'email',
                  errorMessage: 'Email format is invalid',
                  attemptedValue: 'not-an-email',
                },
                {
                  propertyName: 'phoneNumber',
                  errorMessage: 'Phone number must be 10 digits',
                  attemptedValue: '123',
                },
              ],
            })
          ),
      });

      const result = await client.customers.createCustomer({
        ...customerRequests.validIndividualCustomer(),
        email: 'not-an-email',
      });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.type).toBe(InsurUpServerErrorType.InputValidation);
        expect(result.validationErrors).toHaveLength(2);
        expect(result.validationErrors[0]?.propertyName).toBe('email');
        expect(result.validationErrors[1]?.propertyName).toBe('phoneNumber');
      }
    });

    it('should handle validation error without validation details', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/input-validation',
          'Bad Request',
          'Invalid request data'
        )
      );

      const result = await client.customers.createCustomer(
        customerRequests.validIndividualCustomer()
      );

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.validationErrors).toEqual([]);
      }
    });

    it('should handle business validation errors', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          422,
          'https://api.insurup.com/problems/business-validation',
          'Unprocessable Entity',
          'Customer age must be at least 18 years old'
        )
      );

      const result = await client.customers.createCustomer({
        ...customerRequests.validIndividualCustomer(),
        birthDate: '2020-01-01', // Too young
      });

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.type).toBe(InsurUpServerErrorType.BusinessValidation);
        expect(result.detail).toContain('18 years old');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle 429 Too Many Requests error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          get: (header: string) => {
            if (header === 'content-type') return 'application/problem+json';
            if (header === 'Retry-After') return '60';
            return null;
          },
        },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              type: 'https://api.insurup.com/problems/rate-limit-exceeded',
              title: 'Too Many Requests',
              detail: 'Rate limit exceeded. Please retry after 60 seconds.',
              status: 429,
            })
          ),
      });

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(429);
        expect(result.detail).toContain('Rate limit');
      }
    });

    it('should handle multiple rapid requests hitting rate limit', async () => {
      // First few succeed, then rate limited
      mockFetch
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: '1' }))
        .mockResolvedValueOnce(MockFetchResponseFactory.json({ id: '2' }))
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve(JSON.stringify({ status: 429, detail: 'Rate limited' })),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve(JSON.stringify({ status: 429, detail: 'Rate limited' })),
        });

      const results = await Promise.all([
        client.customers.getCustomer('1'),
        client.customers.getCustomer('2'),
        client.customers.getCustomer('3'),
        client.customers.getCustomer('4'),
      ]);

      const successes = results.filter((r) => r.kind === 'success');
      const rateLimited = results.filter((r) => r.kind === 'server-error' && r.status === 429);

      expect(successes).toHaveLength(2);
      expect(rateLimited).toHaveLength(2);
    });
  });

  describe('Authentication Errors', () => {
    it('should handle 401 Unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          401,
          'https://api.insurup.com/problems/unauthorized',
          'Unauthorized',
          'Invalid or expired authentication token'
        )
      );

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(401);
        expect(result.type).toBe(InsurUpServerErrorType.Unauthorized);
      }
    });

    it('should handle 403 Forbidden error', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          403,
          'https://api.insurup.com/problems/access-denied',
          'Forbidden',
          'You do not have permission to access this resource'
        )
      );

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.status).toBe(403);
        expect(result.type).toBe(InsurUpServerErrorType.AccessDenied);
      }
    });
  });

  describe('Network Errors', () => {
    it('should handle connection refused', async () => {
      const connectionError = new TypeError('Failed to fetch');
      mockFetch.mockRejectedValueOnce(connectionError);

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
      }
    });

    it('should handle DNS resolution failure', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND api.example.com');
      mockFetch.mockRejectedValueOnce(dnsError);

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
      }
    });

    it('should handle timeout error', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.Timeout);
      }
    });
  });

  describe('Malformed Response Handling', () => {
    it('should handle non-JSON response when expecting JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html' },
        text: () => Promise.resolve('<html>Error Page</html>'),
      });

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
      }
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{invalid json}'),
      });

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
      }
    });

    it('should handle unexpected empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(''),
      });

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.UnexpectedNoContent);
      }
    });
  });

  describe('Error Type Mapping', () => {
    const errorTypeMappings = [
      {
        type: 'https://api.insurup.com/problems/access-denied',
        expected: InsurUpServerErrorType.AccessDenied,
      },
      {
        type: 'https://api.insurup.com/problems/business-validation',
        expected: InsurUpServerErrorType.BusinessValidation,
      },
      {
        type: 'https://api.insurup.com/problems/feature-not-supported',
        expected: InsurUpServerErrorType.FeatureNotSupported,
      },
      {
        type: 'https://api.insurup.com/problems/input-validation',
        expected: InsurUpServerErrorType.InputValidation,
      },
      {
        type: 'https://api.insurup.com/problems/resource-duplicate',
        expected: InsurUpServerErrorType.ResourceDuplicate,
      },
      {
        type: 'https://api.insurup.com/problems/resource-invalid-state',
        expected: InsurUpServerErrorType.ResourceInvalidState,
      },
      {
        type: 'https://api.insurup.com/problems/resource-not-found',
        expected: InsurUpServerErrorType.ResourceNotFound,
      },
      {
        type: 'https://api.insurup.com/problems/endpoint-not-found',
        expected: InsurUpServerErrorType.EndpointNotFound,
      },
      {
        type: 'https://api.insurup.com/problems/unauthorized',
        expected: InsurUpServerErrorType.Unauthorized,
      },
      {
        type: 'https://api.insurup.com/problems/upstream-service',
        expected: InsurUpServerErrorType.Upstream,
      },
    ];

    errorTypeMappings.forEach(({ type, expected }) => {
      it(`should correctly map ${type} to ${expected}`, async () => {
        mockFetch.mockResolvedValueOnce(
          MockFetchResponseFactory.error(400, type, 'Error', 'Test error')
        );

        const result = await client.customers.getCustomer('123');

        expect(result.kind).toBe('server-error');
        if (result.kind === 'server-error') {
          expect(result.type).toBe(expected);
        }
      });
    });

    it('should map unknown error type to Unknown', async () => {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          400,
          'https://api.insurup.com/problems/some-new-error',
          'Error',
          'Unknown error type'
        )
      );

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('server-error');
      if (result.kind === 'server-error') {
        expect(result.type).toBe(InsurUpServerErrorType.Unknown);
      }
    });
  });
});
