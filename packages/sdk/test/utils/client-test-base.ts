/**
 * @fileoverview Client Test Base
 * @description Base class and utilities for testing client classes
 */

import { beforeEach, vi, it, expect } from 'vitest';
import type { HttpTransport } from '../../src/client/http';
import type { InsurUpServerErrorType } from '../../src/core/error-types';
import type { ValidationError } from '../../src/core/result';
import { MockHttpTransportFactory, TestSetupHelper } from './index';

/**
 * Base interface for clients that can be tested
 */
interface TestableClient {
  [key: string]: ((...args: unknown[]) => Promise<unknown>) | unknown;
}

/**
 * Base class for client testing with common setup
 */
export abstract class ClientTestBase {
  protected mockHttp!: HttpTransport;

  /**
   * Common setup for all client tests
   */
  protected setupClientTest() {
    beforeEach(() => {
      TestSetupHelper.cleanup();
      this.mockHttp = MockHttpTransportFactory.create();
    });
  }

  /**
   * Helper to verify that a method calls the correct HTTP endpoint
   */
  protected assertEndpointCall(
    method: 'get' | 'post' | 'put' | 'delete',
    expectedEndpoint: string,
    expectedData?: unknown
  ) {
    const mockMethod = vi.mocked(this.mockHttp[method]);

    if (expectedData !== undefined) {
      expect(mockMethod).toHaveBeenCalledWith(expectedEndpoint, expectedData);
    } else {
      expect(mockMethod).toHaveBeenCalledWith(expectedEndpoint);
    }
  }

  /**
   * Helper to setup a successful response for a specific method
   */
  protected setupSuccessResponse<T>(method: 'get' | 'post' | 'put' | 'delete', data: T) {
    const result = {
      kind: 'success',
      data,
      isSuccess: true,
      message: 'Success',
    } as const;

    vi.mocked(this.mockHttp[method]).mockResolvedValue(result);
    return result;
  }

  /**
   * Helper to setup an error response for a specific method
   */
  protected setupErrorResponse(
    method: 'get' | 'post' | 'put' | 'delete',
    status: number,
    type: string,
    title: string,
    detail: string
  ) {
    const result = {
      kind: 'server-error',
      type: type as InsurUpServerErrorType,
      typeString: type,
      title,
      detail,
      status,
      instance: '/test-endpoint',
      isSuccess: false,
      message: title,
      codes: [] as readonly string[],
      traceId: undefined,
      template: '',
      templateArgs: {} as Readonly<Record<string, unknown>>,
      suggestions: [] as readonly string[],
      validationErrors: [] as readonly ValidationError[],
    } as const;

    vi.mocked(this.mockHttp[method]).mockResolvedValue(result);
    return result;
  }
}

/**
 * Utility for creating comprehensive client test suites
 */
export class ClientTestSuiteBuilder {
  /**
   * Creates a standard test suite for a client method that returns data
   */
  static createDataMethodTests<TRequest, TResponse>(config: {
    methodName: string;
    clientFactory: (mockHttp: HttpTransport) => TestableClient;
    httpMethod: 'get' | 'post' | 'put' | 'delete';
    expectedEndpoint: string;
    validRequest?: TRequest;
    successResponse: TResponse;
    errorScenarios?: Array<{
      name: string;
      status: number;
      type: string;
      title: string;
      detail: string;
    }>;
  }) {
    return () => {
      let mockHttp: HttpTransport;
      let client: TestableClient;

      beforeEach(() => {
        TestSetupHelper.cleanup();
        mockHttp = MockHttpTransportFactory.create();
        client = config.clientFactory(mockHttp);
      });

      it(`should call ${config.httpMethod.toUpperCase()} with correct endpoint and return success`, async () => {
        const successResult = {
          kind: 'success',
          data: config.successResponse,
          isSuccess: true,
          message: 'Success',
        } as const;

        vi.mocked(mockHttp[config.httpMethod]).mockResolvedValue(successResult);

        const args = config.validRequest ? [config.validRequest] : ['test-id'];
        const method = client[config.methodName] as (...args: unknown[]) => Promise<unknown>;
        const result = await method(...args);

        expect(result).toEqual(successResult);

        const expectedArgs = config.validRequest
          ? [config.expectedEndpoint, config.validRequest]
          : [config.expectedEndpoint];

        expect(mockHttp[config.httpMethod]).toHaveBeenCalledWith(...expectedArgs);
      });

      // Add error scenario tests if provided
      if (config.errorScenarios) {
        config.errorScenarios.forEach((scenario) => {
          it(`should handle ${scenario.name}`, async () => {
            const errorResult = {
              kind: 'server-error',
              type: scenario.type as InsurUpServerErrorType,
              typeString: scenario.type,
              title: scenario.title,
              detail: scenario.detail,
              status: scenario.status,
              instance: config.expectedEndpoint,
              isSuccess: false,
              message: scenario.title,
              codes: [] as readonly string[],
              traceId: undefined,
              template: '',
              templateArgs: {} as Readonly<Record<string, unknown>>,
              suggestions: [] as readonly string[],
              validationErrors: [] as readonly ValidationError[],
            } as const;

            vi.mocked(mockHttp[config.httpMethod]).mockResolvedValue(errorResult);

            const args = config.validRequest ? [config.validRequest] : ['test-id'];
            const method = client[config.methodName] as (...args: unknown[]) => Promise<unknown>;
            const result = await method(...args);

            expect(result).toEqual(errorResult);
          });
        });
      }
    };
  }

  /**
   * Creates a standard test suite for a client method that returns no data (void operations)
   */
  static createVoidMethodTests<TRequest>(config: {
    methodName: string;
    clientFactory: (mockHttp: HttpTransport) => TestableClient;
    httpMethod: 'post' | 'put' | 'delete';
    expectedEndpoint: string;
    validRequest: TRequest;
    errorScenarios?: Array<{
      name: string;
      status: number;
      type: string;
      title: string;
      detail: string;
    }>;
  }) {
    return () => {
      let mockHttp: HttpTransport;
      let client: TestableClient;

      beforeEach(() => {
        TestSetupHelper.cleanup();
        mockHttp = MockHttpTransportFactory.create();
        client = config.clientFactory(mockHttp);
      });

      it(`should call ${config.httpMethod.toUpperCase()} with correct endpoint and return success`, async () => {
        const successResult = {
          kind: 'success',
          data: null,
          isSuccess: true,
          message: 'Success',
        } as const;

        vi.mocked(mockHttp[config.httpMethod]).mockResolvedValue(successResult);

        const method = client[config.methodName] as (...args: unknown[]) => Promise<unknown>;
        const result = await method(config.validRequest);

        expect(result).toEqual(successResult);
        expect(mockHttp[config.httpMethod]).toHaveBeenCalledWith(
          config.expectedEndpoint,
          config.validRequest
        );
      });

      // Add error scenario tests if provided
      if (config.errorScenarios) {
        config.errorScenarios.forEach((scenario) => {
          it(`should handle ${scenario.name}`, async () => {
            const errorResult = {
              kind: 'server-error',
              type: scenario.type as InsurUpServerErrorType,
              typeString: scenario.type,
              title: scenario.title,
              detail: scenario.detail,
              status: scenario.status,
              instance: config.expectedEndpoint,
              isSuccess: false,
              message: scenario.title,
              codes: [] as readonly string[],
              traceId: undefined,
              template: '',
              templateArgs: {} as Readonly<Record<string, unknown>>,
              suggestions: [] as readonly string[],
              validationErrors: [] as readonly ValidationError[],
            } as const;

            vi.mocked(mockHttp[config.httpMethod]).mockResolvedValue(errorResult);

            const method = client[config.methodName] as (...args: unknown[]) => Promise<unknown>;
            const result = await method(config.validRequest);

            expect(result).toEqual(errorResult);
          });
        });
      }
    };
  }
}

/**
 * Helper for integration test scenarios
 */
export class IntegrationTestHelper {
  /**
   * Creates a realistic workflow test scenario
   */
  static createWorkflowTest(config: {
    name: string;
    steps: Array<{
      description: string;
      operation: () => Promise<unknown>;
      assertions: (result: unknown) => void;
    }>;
  }) {
    return async () => {
      for (const [index, step] of config.steps.entries()) {
        const result = await step.operation();

        try {
          step.assertions(result);
        } catch (error) {
          throw new Error(
            `Step ${index + 1} (${step.description}) failed: ${(error as Error).message}`,
            { cause: error }
          );
        }
      }
    };
  }

  /**
   * Creates a test for validating client architecture
   */
  static validateClientArchitecture<T extends object>(
    clientFactory: () => T,
    expectedClients: { [K in keyof T]?: (keyof T[K])[] }
  ) {
    return () => {
      for (const clientName of Object.keys(expectedClients) as (keyof T)[]) {
        const methods = expectedClients[clientName] ?? [];
        it(`should expose ${String(clientName)} client`, () => {
          const client = clientFactory();
          expect(client[clientName]).toBeDefined();

          const subClient = client[clientName];
          for (const method of methods) {
            expect(typeof subClient[method]).toBe('function');
          }
        });
      }
    };
  }
}
