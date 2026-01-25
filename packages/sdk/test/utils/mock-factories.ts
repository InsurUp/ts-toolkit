/**
 * @fileoverview Mock Factories
 * @description Factory functions for generating test data with customizable properties
 */

import type { HttpTransport } from '../../src/client/http';
import type { InsurUpResult } from '../../src/core/result';
import { vi, type Mock } from 'vitest';

/**
 * Factory for creating mock HttpTransport instances
 */
export class MockHttpTransportFactory {
  /**
   * Creates a fully mocked HttpTransport with all methods
   */
  static create(): HttpTransport {
    return {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    } as unknown as HttpTransport;
  }

  /**
   * Creates a mock HttpTransport that returns success for all operations
   */
  static createAlwaysSuccessful(): HttpTransport {
    const mockHttp = MockHttpTransportFactory.create();

    const successResult = {
      kind: 'success',
      data: null,
      isSuccess: true,
      message: 'Success'
    } as const;

    vi.mocked(mockHttp.get).mockResolvedValue(successResult);
    vi.mocked(mockHttp.post).mockResolvedValue(successResult);
    vi.mocked(mockHttp.put).mockResolvedValue(successResult);
    vi.mocked(mockHttp.delete).mockResolvedValue(successResult);

    return mockHttp;
  }

  /**
   * Creates a mock HttpTransport that returns specific results for specific endpoints
   */
  static createWithEndpointMocks(endpointMocks: Record<string, InsurUpResult<unknown>>): HttpTransport {
    const mockHttp = MockHttpTransportFactory.create();

    // Configure mocks to return specific results based on endpoint
    const configureMock = (mockFn: Mock) => {
      mockFn.mockImplementation((endpoint: string) => {
        const result = endpointMocks[endpoint];
        return Promise.resolve(
          result || {
            kind: 'server-error',
            type: 'https://api.insurup.com/problems/resource-not-found',
            title: 'Not Found',
            detail: `Endpoint ${endpoint} not mocked`,
            status: 404,
            instance: endpoint,
            isSuccess: false,
            message: 'Endpoint not found'
          }
        );
      });
    };

    configureMock(vi.mocked(mockHttp.get));
    configureMock(vi.mocked(mockHttp.post));
    configureMock(vi.mocked(mockHttp.put));
    configureMock(vi.mocked(mockHttp.delete));

    return mockHttp;
  }
}

/**
 * Factory for creating mock fetch responses
 */
export class MockFetchResponseFactory {
  /**
   * Creates a successful JSON response
   */
  static json(data: unknown, status: number = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 200 ? 'OK' : 'Success',
      headers: {
        get: (header: string) => (header === 'content-type' ? 'application/json' : null)
      },
      text: () => Promise.resolve(JSON.stringify(data))
    } as unknown as Response;
  }

  /**
   * Creates an empty successful response
   */
  static empty(status: number = 204): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 204 ? 'No Content' : 'Success',
      headers: {
        get: (header: string) => (header === 'content-type' ? 'application/json' : null)
      },
      text: () => Promise.resolve('')
    } as unknown as Response;
  }

  /**
   * Creates an error response with problem details
   */
  static error(
    status: number,
    type: string,
    title: string,
    detail: string,
    instance?: string
  ): Response {
    return {
      ok: false,
      status,
      statusText: title,
      headers: {
        get: (header: string) => (header === 'content-type' ? 'application/problem+json' : null)
      },
      text: () =>
        Promise.resolve(
          JSON.stringify({
            type,
            title,
            detail,
            status,
            instance
          })
        )
    } as unknown as Response;
  }

  /**
   * Creates a blob response (for file downloads)
   */
  static blob(blob: Blob, status: number = 200): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: 'OK',
      headers: {
        get: (header: string) => (header === 'content-type' ? blob.type : null)
      },
      blob: () => Promise.resolve(blob),
      text: () => Promise.resolve('[Binary Data]')
    } as unknown as Response;
  }
}

/**
 * Factory for creating test data with customizable properties
 */
export class TestDataFactory {
  /**
   * Creates a customer ID with optional prefix
   */
  static customerId(suffix: string = '123'): string {
    return `CUSTOMER-${suffix}`;
  }

  /**
   * Creates a policy ID with optional prefix
   */
  static policyId(suffix: string = '123'): string {
    return `POLICY-${suffix}`;
  }

  /**
   * Creates a case reference with optional prefix
   */
  static caseRef(suffix: string = '123'): string {
    return `CASE-${suffix}`;
  }

  /**
   * Creates an agent ID with optional prefix
   */
  static agentId(suffix: string = '456'): string {
    return `AGENT-${suffix}`;
  }

  /**
   * Creates a timestamp in ISO format
   */
  static timestamp(offsetDays: number = 0): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    return date.toISOString();
  }

  /**
   * Creates a realistic Turkish phone number
   */
  static phoneNumber(prefix: string = '555'): string {
    const suffix = Math.floor(Math.random() * 9000000) + 1000000;
    return `+90${prefix}${suffix}`;
  }

  /**
   * Creates a realistic Turkish identity number
   */
  static identityNumber(): number {
    // Generate a valid 11-digit Turkish identity number
    return Math.floor(Math.random() * 90000000000) + 10000000000;
  }

  /**
   * Creates a realistic email address
   */
  static email(name: string = 'test', domain: string = 'example.com'): string {
    return `${name}@${domain}`;
  }
}
