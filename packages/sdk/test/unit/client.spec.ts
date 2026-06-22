/**
 * @fileoverview Client Tests - Basic tests for the DefaultInsurUpClient
 * @description Unit tests to verify the SDK client functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { InsurUpClientErrorType } from '../../src/core/result';
import {
  customerRequests,
  customerResults,
  TestSetupHelper,
  MockFetchResponseFactory,
  TestAssertionHelper,
  IntegrationTestHelper,
} from '../utils';

// Mock fetch globally
const mockFetch = vi.fn<typeof fetch>();
vi.stubGlobal('fetch', mockFetch);

describe('DefaultInsurUpClient', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    TestSetupHelper.cleanup();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: {
        retries: 2,
        minTimeout: 10,
        maxTimeout: 50,
        factor: 1.5,
        randomize: false,
      },
    });
  });

  describe('Customer Operations', () => {
    it('should create customer successfully', async () => {
      const request = customerRequests.validIndividualCustomer();

      // createCustomer expects a response body with the created customer ID
      mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-123' }, 201));

      const result = await client.customers.createCustomer(request);

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
      if (result.kind === 'success') {
        expect(result.data.id).toBe('CUSTOMER-123');
      }
    });

    it('should get customer by ID', async () => {
      const mockCustomerData = customerResults.successfulCustomerRetrieval();

      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.json((mockCustomerData as { data: unknown }).data)
      );

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.id).toBe('CUSTOMER-123');
        expect(result.data.type).toBe('INDIVIDUAL');
      }

      TestAssertionHelper.assertFetchCall(mockFetch, 'https://test.api.com/api/customers/123', {
        method: 'GET',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON deserialization errors', async () => {
      mockFetch.mockResolvedValueOnce(
        new Response('not-json', {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      );

      const result = await client.customers.getCustomer('bad');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
      }
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
      }
    });

    it('should handle timeout errors', async () => {
      const abortError = new Error('Timeout');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await client.customers.getCustomer('123');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.Timeout);
      }
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const defaultClient = new DefaultInsurUpClient();
      expect(defaultClient).toBeInstanceOf(DefaultInsurUpClient);
    });

    it('should accept custom configuration', () => {
      const customClient = new DefaultInsurUpClient({
        baseUrl: 'https://custom.api.com/',
        customHeaders: { 'X-Custom': 'value' },
        userAgent: 'Custom Agent',
        timeoutMs: 10000,
      });
      expect(customClient).toBeInstanceOf(DefaultInsurUpClient);
    });
  });

  describe(
    'Modular Client Architecture',
    IntegrationTestHelper.validateClientArchitecture(() => client, {
      customers: ['createCustomer', 'getCustomer', 'updateCustomer', 'deleteCustomer'],
      policies: [
        'getPolicyDetail',
        'fetchPolicyDocument',
        'sendPolicyDocumentToCustomer',
        'setPolicyRepresentative',
        'setPolicyBranch',
        'searchPolicyForClaim',
        'claimPolicy',
        'addPolicyEndorsement',
      ],
      cases: [
        'createCancelCase',
        'createComplaintCase',
        'getCaseByRef',
        'assignCaseRepresentative',
      ],
    })
  );
});
