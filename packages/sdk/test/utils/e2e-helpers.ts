/**
 * @fileoverview E2E Test Helpers
 * @description Utilities for end-to-end testing with MSW mock server
 */

import { http, HttpResponse, type JsonBodyType } from 'msw';
import type { SetupServer } from 'msw/node';
import type { InsurUpResult, ServerError, ClientError } from '../../src/core/result';

/**
 * Helper for creating MSW request handlers
 */
export class MSWHandlerFactory {
  constructor(private readonly baseUrl: string) {}

  /**
   * Creates a successful JSON response handler
   */
  successHandler<T extends JsonBodyType>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    data: T,
    status = 200
  ) {
    const fullPath = `${this.baseUrl}${path}`;
    const httpMethod =
      method === 'get'
        ? http.get
        : method === 'post'
          ? http.post
          : method === 'put'
            ? http.put
            : http.delete;

    return httpMethod(fullPath, () => {
      return HttpResponse.json(data, { status });
    });
  }

  /**
   * Creates a no-content (204) response handler
   */
  noContentHandler(method: 'post' | 'put' | 'delete', path: string) {
    const fullPath = `${this.baseUrl}${path}`;
    const httpMethod = method === 'post' ? http.post : method === 'put' ? http.put : http.delete;

    return httpMethod(fullPath, () => {
      return new HttpResponse(null, { status: 204 });
    });
  }

  /**
   * Creates a Problem Details error response handler
   */
  errorHandler(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    options: {
      status: number;
      type: string;
      title: string;
      detail: string;
      validationErrors?: Array<{
        propertyName: string;
        errorMessage: string;
        attemptedValue?: unknown;
      }>;
    }
  ) {
    const fullPath = `${this.baseUrl}${path}`;
    const httpMethod =
      method === 'get'
        ? http.get
        : method === 'post'
          ? http.post
          : method === 'put'
            ? http.put
            : http.delete;

    return httpMethod(fullPath, () => {
      return HttpResponse.json(
        {
          type: options.type,
          title: options.title,
          detail: options.detail,
          status: options.status,
          validationErrors: options.validationErrors || [],
        },
        {
          status: options.status,
          headers: { 'Content-Type': 'application/problem+json' },
        }
      );
    });
  }

  /**
   * Creates a slow response handler for timeout testing
   */
  slowHandler(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    delayMs: number,
    data?: unknown
  ) {
    const fullPath = `${this.baseUrl}${path}`;
    const httpMethod =
      method === 'get'
        ? http.get
        : method === 'post'
          ? http.post
          : method === 'put'
            ? http.put
            : http.delete;

    return httpMethod(fullPath, async () => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return data ? HttpResponse.json(data) : new HttpResponse(null, { status: 204 });
    });
  }
}

/**
 * Helper for E2E test assertions
 */
export class E2EAssertionHelper {
  /**
   * Asserts that a result matches the expected success structure
   */
  static assertSuccessResult<T>(
    result: InsurUpResult<T>
  ): asserts result is Extract<InsurUpResult<T>, { kind: 'success' }> {
    if (result.kind !== 'success') {
      throw new Error(`Expected success result, got ${result.kind}: ${result.message}`);
    }
  }

  /**
   * Asserts that a result is a server error with specific properties
   */
  static assertServerErrorResult(
    result: InsurUpResult<unknown>,
    expectedStatus: number,
    expectedType?: string
  ): asserts result is ServerError {
    if (result.kind !== 'server-error') {
      throw new Error(`Expected server-error result, got ${result.kind}`);
    }
    if (result.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${result.status}`);
    }
    if (expectedType && result.type !== expectedType) {
      throw new Error(`Expected type ${expectedType}, got ${result.type}`);
    }
  }

  /**
   * Asserts that a result is a client error with specific type
   */
  static assertClientErrorResult(
    result: InsurUpResult<unknown>,
    expectedType: string
  ): asserts result is ClientError {
    if (result.kind !== 'client-error') {
      throw new Error(`Expected client-error result, got ${result.kind}`);
    }
    if (result.type !== expectedType) {
      throw new Error(`Expected type ${expectedType}, got ${result.type}`);
    }
  }

  /**
   * Asserts that an object has all required properties
   */
  static assertHasProperties<T extends object>(obj: T, properties: (keyof T)[]): void {
    for (const prop of properties) {
      if (!(prop in obj)) {
        throw new Error(`Expected property ${String(prop)} to exist`);
      }
    }
  }
}

/**
 * Helper for managing MSW server in tests
 */
export class MSWServerHelper {
  constructor(private readonly server: SetupServer) {}

  /**
   * Adds a one-time handler that will be removed after first request
   */
  useOnce(...handlers: ReturnType<typeof http.get | typeof http.post>[]) {
    this.server.use(...handlers);
  }

  /**
   * Resets all handlers to initial state
   */
  reset() {
    this.server.resetHandlers();
  }

  /**
   * Captures the last request made to a specific endpoint
   */
  captureRequest<T extends JsonBodyType>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    response: T | (() => T),
    status = 200
  ): { getLastRequest: () => { body?: unknown; headers: Headers } | null } {
    let lastRequest: { body?: unknown; headers: Headers } | null = null;

    const httpMethod =
      method === 'get'
        ? http.get
        : method === 'post'
          ? http.post
          : method === 'put'
            ? http.put
            : http.delete;

    this.server.use(
      httpMethod(path, async ({ request }) => {
        const body = method !== 'get' ? await request.json().catch(() => undefined) : undefined;
        lastRequest = {
          body,
          headers: request.headers,
        };
        const responseData = typeof response === 'function' ? (response as () => T)() : response;
        return HttpResponse.json(responseData, { status });
      })
    );

    return {
      getLastRequest: () => lastRequest,
    };
  }
}
