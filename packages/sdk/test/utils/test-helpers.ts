/**
 * @fileoverview Test Helpers
 * @description Shared utilities for common test operations and assertions
 */

import { vi, expect, type Mock } from 'vitest';
import type { HttpTransport } from '../../src/client/http';
import type { InsurUpResult, Success } from '../../src/core/result';
import { MockHttpTransportFactory, MockFetchResponseFactory } from './mock-factories';

/**
 * Helper for setting up common test scenarios
 */
export class TestSetupHelper {
  /**
   * Sets up a basic mock HttpTransport for client testing
   */
  static setupMockHttpTransport(): HttpTransport {
    return MockHttpTransportFactory.create();
  }

  /**
   * Sets up mock fetch with common response patterns
   */
  static setupMockFetch(): Mock<typeof fetch> {
    const mockFetch = vi.fn<typeof fetch>();
    globalThis.fetch = mockFetch;
    return mockFetch;
  }

  /**
   * Clears all mocks - call this in beforeEach
   * Note: vi.clearAllTimers() is not available in Bun's test runner
   */
  static cleanup() {
    vi.clearAllMocks();
  }

  /**
   * Sets up fake timers for testing time-dependent operations
   * Note: Not available in Bun's test runner - use vitest directly if needed
   */
  static setupFakeTimers() {
    // vi.useFakeTimers() is not available in Bun's test runner
    // Tests using this should use vitest's built-in timers or skip in Bun
    if (typeof vi.useFakeTimers === 'function') {
      vi.useFakeTimers();
    }
  }

  /**
   * Restores real timers - call this in afterEach
   * Note: Not available in Bun's test runner - use vitest directly if needed
   */
  static restoreTimers() {
    // vi.useRealTimers() is not available in Bun's test runner
    if (typeof vi.useRealTimers === 'function') {
      vi.useRealTimers();
    }
  }
}

/**
 * Helper for common test assertions
 */
export class TestAssertionHelper {
  /**
   * Asserts that a result is successful and returns the data
   */
  static assertSuccess<T>(result: InsurUpResult<T>): T {
    if (result.kind !== 'success') {
      throw new Error(`Expected success result, got ${result.kind}: ${result.message}`);
    }
    // Type narrowing: after checking kind === 'success', we know it's Success<T> if T is not void
    return (result as Success<T>).data;
  }

  /**
   * Asserts that a result is a server error with specific status
   */
  static assertServerError(result: InsurUpResult<unknown>, expectedStatus: number) {
    if (result.kind !== 'server-error') {
      throw new Error(`Expected server-error result, got ${result.kind}`);
    }
    if (result.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${result.status}`);
    }
    return result;
  }

  /**
   * Asserts that a result is a client error with specific type
   */
  static assertClientError(result: InsurUpResult<unknown>, expectedType: string) {
    if (result.kind !== 'client-error') {
      throw new Error(`Expected client-error result, got ${result.kind}`);
    }
    if (result.type !== expectedType) {
      throw new Error(`Expected error type ${expectedType}, got ${result.type}`);
    }
    return result;
  }

  /**
   * Asserts that HTTP method was called with correct endpoint and data
   */
  static assertHttpCall(mockMethod: Mock, expectedEndpoint: string, expectedData?: unknown) {
    expect(mockMethod).toHaveBeenCalledWith(
      expectedEndpoint,
      ...(expectedData !== undefined ? [expectedData] : [])
    );
  }

  /**
   * Asserts that fetch was called with correct URL and options
   */
  static assertFetchCall(
    mockFetch: Mock<typeof fetch>,
    expectedUrl: string,
    expectedOptions: Partial<RequestInit>
  ) {
    expect(mockFetch).toHaveBeenCalledWith(expectedUrl, expect.objectContaining(expectedOptions));
  }
}

/**
 * Helper for creating test scenarios with multiple operations
 */
export class TestScenarioHelper {
  /**
   * Creates a scenario where multiple HTTP calls succeed in sequence
   */
  static setupSequentialSuccess(
    mockHttp: HttpTransport,
    responses: Array<{ method: keyof HttpTransport; result: InsurUpResult<unknown> }>
  ) {
    responses.forEach(({ method, result }) => {
      vi.mocked(mockHttp[method]).mockResolvedValueOnce(result as InsurUpResult<never>);
    });
  }

  /**
   * Creates a scenario where HTTP calls fail then succeed (for retry testing)
   */
  static setupRetryScenario(mockFetch: Mock<typeof fetch>, failureCount: number, finalResponse: Response) {
    // Add failure responses
    for (let i = 0; i < failureCount; i++) {
      mockFetch.mockResolvedValueOnce(
        MockFetchResponseFactory.error(
          500,
          'https://api.insurup.com/problems/upstream-service',
          'Internal Server Error',
          'Server temporarily unavailable'
        )
      );
    }
    // Add final success response
    mockFetch.mockResolvedValueOnce(finalResponse);
  }

  /**
   * Creates a scenario for testing concurrent operations
   */
  static setupConcurrentScenario(mockFetch: Mock<typeof fetch>, responses: Response[]) {
    responses.forEach((response) => {
      mockFetch.mockResolvedValueOnce(response);
    });
  }
}

/**
 * Helper for validating contract types and structures
 */
export class ContractValidationHelper {
  /**
   * Validates that an object has all required properties
   */
  static validateRequiredProperties<T extends Record<string, unknown>>(
    obj: T,
    requiredProps: (keyof T)[]
  ): void {
    requiredProps.forEach((prop) => {
      if (!(prop in obj) || obj[prop] === undefined) {
        throw new Error(`Required property '${String(prop)}' is missing or undefined`);
      }
    });
  }

  /**
   * Validates that a response matches the expected contract structure
   */
  static validateResponseContract<T>(
    response: T,
    contractValidator: (obj: unknown) => obj is T
  ): void {
    if (!contractValidator(response)) {
      throw new Error('Response does not match expected contract structure');
    }
  }

  /**
   * Creates a type-safe property override for test data
   */
  static override<T>(base: T, overrides: Partial<T>): T {
    return { ...base, ...overrides };
  }
}

/**
 * Helper for performance testing
 */
export class PerformanceTestHelper {
  /**
   * Measures execution time of an async operation
   */
  static async measureExecutionTime<T>(operation: () => Promise<T>): Promise<{
    result: T;
    executionTimeMs: number;
  }> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();

    return {
      result,
      executionTimeMs: endTime - startTime
    };
  }

  /**
   * Creates a large object for payload testing
   */
  static createLargeObject(sizeKb: number): Record<string, unknown> {
    const targetSize = sizeKb * 1024;
    const obj: Record<string, unknown> = {};
    let currentSize = 0;
    let counter = 0;

    while (currentSize < targetSize) {
      const key = `property${counter}`;
      const value = {
        id: counter,
        data: 'x'.repeat(100),
        nested: {
          array: new Array(10).fill(counter),
          timestamp: new Date().toISOString()
        }
      };

      obj[key] = value;
      currentSize += JSON.stringify({ [key]: value }).length;
      counter++;
    }

    return obj;
  }

  /**
   * Creates a large string for payload testing
   */
  static createLargeString(sizeKb: number): string {
    const targetSize = sizeKb * 1024;
    return 'x'.repeat(targetSize);
  }
}
