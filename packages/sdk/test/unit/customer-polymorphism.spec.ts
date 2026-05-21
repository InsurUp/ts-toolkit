/**
 * Wire-format regression tests for polymorphic customer endpoints.
 *
 * The deployed API uses System.Text.Json polymorphism with lowercase `$type`
 * discriminators (`individual` / `foreign` / `company`). Sending the SDK's
 * friendly uppercase `type` enum value verbatim makes the server fail to
 * resolve the derived type and 500 with
 * `Each parameter in the deserialization constructor on type
 * 'UpdateCustomerEndpointRequest' must bind to an object property or field`.
 * These tests pin that the SDK translates `type` → `$type` on every endpoint
 * that ships a polymorphic customer body.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CustomerType,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
} from '@insurup/contracts';
import { DefaultInsurUpClient } from '../../src/client/client';
import { MockFetchResponseFactory } from '../utils';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const createRequests: ReadonlyArray<[CustomerType, string, CreateCustomerRequest]> = [
  [
    CustomerType.Individual,
    'individual',
    {
      type: CustomerType.Individual,
      identityNumber: '12345678901',
      fullName: 'John Doe',
      fillMissingFields: false,
    },
  ],
  [
    CustomerType.Foreign,
    'foreign',
    {
      type: CustomerType.Foreign,
      identityNumber: 'P12345',
      fullName: 'Jane Roe',
      fillMissingFields: false,
    },
  ],
  [
    CustomerType.Company,
    'company',
    {
      type: CustomerType.Company,
      taxNumber: '1234567890',
      title: 'Acme Co.',
      fillMissingFields: false,
    },
  ],
];

const updateRequests: ReadonlyArray<[CustomerType, string, UpdateCustomerRequest]> = [
  [
    CustomerType.Individual,
    'individual',
    {
      type: CustomerType.Individual,
      id: 'CUSTOMER-1',
      fullName: 'Updated Name',
      fillMissingFields: false,
    },
  ],
  [
    CustomerType.Foreign,
    'foreign',
    {
      type: CustomerType.Foreign,
      id: 'CUSTOMER-2',
      fullName: 'Updated Foreign',
      fillMissingFields: false,
    },
  ],
  [
    CustomerType.Company,
    'company',
    {
      type: CustomerType.Company,
      id: 'CUSTOMER-3',
      title: 'Updated Co.',
      taxNumber: '0987654321',
      fillMissingFields: false,
    },
  ],
];

describe('Customer polymorphic wire format', () => {
  let client: DefaultInsurUpClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new DefaultInsurUpClient({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: { retries: 0, minTimeout: 10, maxTimeout: 50, factor: 1.5, randomize: false },
    });
  });

  describe('createCustomer', () => {
    it.each(createRequests)(
      'maps type=%s to $type=%s and strips the original `type` key',
      async (_type, expectedDiscriminator, request) => {
        mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.json({ id: 'CUSTOMER-X' }, 201));

        await client.customers.createCustomer(request);

        const [url, init] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe('https://test.api.com/api/customers');
        expect(init?.method).toBe('POST');
        const body = JSON.parse(init?.body as string);
        expect(body.$type).toBe(expectedDiscriminator);
        expect(body).not.toHaveProperty('type');
      }
    );
  });

  describe('updateCustomer', () => {
    it.each(updateRequests)(
      'maps type=%s to $type=%s and strips the original `type` key',
      async (_type, expectedDiscriminator, request) => {
        mockFetch.mockResolvedValueOnce(MockFetchResponseFactory.empty(204));

        await client.customers.updateCustomer(request);

        const [url, init] = mockFetch.mock.calls[0] ?? [];
        expect(url).toBe(`https://test.api.com/api/customers/${request.id}`);
        expect(init?.method).toBe('PUT');
        const body = JSON.parse(init?.body as string);
        expect(body.$type).toBe(expectedDiscriminator);
        expect(body).not.toHaveProperty('type');
        expect(body.id).toBe(request.id);
      }
    );
  });
});
