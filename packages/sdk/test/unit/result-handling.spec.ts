/**
 * @fileoverview Result Handling Tests - Unit tests for result type utilities
 * @description Tests for createSuccess, createSuccessNoContent, getDataOrThrow, throwIfError
 */

import { describe, it, expect } from 'vitest';
import {
  createSuccess,
  createSuccessNoContent,
  getDataOrThrow,
  throwIfError,
  InsurUpClientErrorType,
  InsurUpServerErrorType,
  type InsurUpResult,
  type Success,
  type SuccessNoContent,
  type ServerError,
  type ClientError
} from '../../src/core/result';
import { InsurUpError } from '../../src/core/errors';

describe('Result Handling Utilities', () => {
  describe('createSuccess', () => {
    it('should create a success result with primitive data', () => {
      const result = createSuccess('test-data');

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
      expect(result.message).toBe('Success');
      expect(result.data).toBe('test-data');
    });

    it('should create a success result with object data', () => {
      const data = { id: '123', name: 'Test Customer' };
      const result = createSuccess(data);

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.data.id).toBe('123');
    });

    it('should create a success result with array data', () => {
      const data = [1, 2, 3];
      const result = createSuccess(data);

      expect(result.kind).toBe('success');
      expect(result.data).toEqual([1, 2, 3]);
      expect(result.data.length).toBe(3);
    });

    it('should create a success result with null data', () => {
      const result = createSuccess(null);

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should create a success result with undefined data', () => {
      const result = createSuccess(undefined);

      expect(result.kind).toBe('success');
      expect(result.data).toBeUndefined();
    });

    it('should create a success result with complex nested data', () => {
      const data = {
        customer: {
          id: 'CUST-123',
          policies: [
            { id: 'POL-1', type: 'auto' },
            { id: 'POL-2', type: 'home' }
          ]
        },
        metadata: { timestamp: new Date().toISOString() }
      };
      const result = createSuccess(data);

      expect(result.kind).toBe('success');
      expect(result.data.customer.policies).toHaveLength(2);
    });

    it('should preserve type information', () => {
      interface Customer {
        id: string;
        name: string;
      }
      const customer: Customer = { id: '123', name: 'John' };
      const result: Success<Customer> = createSuccess(customer);

      // TypeScript should know result.data is Customer
      expect(result.data.id).toBe('123');
      expect(result.data.name).toBe('John');
    });
  });

  describe('createSuccessNoContent', () => {
    it('should create a success result without data', () => {
      const result = createSuccessNoContent();

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
      expect(result.message).toBe('Success');
      expect('data' in result).toBe(false);
    });

    it('should have correct type shape', () => {
      const result: SuccessNoContent = createSuccessNoContent();

      expect(result.kind).toBe('success');
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('getDataOrThrow', () => {
    it('should extract data from successful result', () => {
      const result = createSuccess({ id: '123', value: 'test' });
      const data = getDataOrThrow(result);

      expect(data).toEqual({ id: '123', value: 'test' });
    });

    it('should extract primitive data from successful result', () => {
      const result = createSuccess('hello');
      const data = getDataOrThrow(result);

      expect(data).toBe('hello');
    });

    it('should extract array data from successful result', () => {
      const result = createSuccess([1, 2, 3]);
      const data = getDataOrThrow(result);

      expect(data).toEqual([1, 2, 3]);
    });

    it('should throw InsurUpError for server error result', () => {
      const serverError: ServerError = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Resource not found',
        type: InsurUpServerErrorType.ResourceNotFound,
        typeString: 'https://api.insurup.com/problems/resource-not-found',
        title: 'Not Found',
        detail: 'Customer with ID 123 was not found',
        instance: '/customers/123',
        status: 404,
        codes: ['CUSTOMER_NOT_FOUND'],
        traceId: 'trace-123',
        template: '',
        templateArgs: {},
        suggestions: ['Check the customer ID'],
        validationErrors: []
      };

      expect(() => getDataOrThrow(serverError as InsurUpResult<unknown>)).toThrow(InsurUpError);

      try {
        getDataOrThrow(serverError as InsurUpResult<unknown>);
      } catch (error) {
        expect(error).toBeInstanceOf(InsurUpError);
        expect((error as InsurUpError).error).toBe(serverError);
        expect((error as InsurUpError).message).toBe('Resource not found');
      }
    });

    it('should throw InsurUpError for client error result', () => {
      const clientError: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Request timed out',
        type: InsurUpClientErrorType.Timeout,
        error: new Error('timeout')
      };

      expect(() => getDataOrThrow(clientError as InsurUpResult<unknown>)).toThrow(InsurUpError);

      try {
        getDataOrThrow(clientError as InsurUpResult<unknown>);
      } catch (error) {
        expect(error).toBeInstanceOf(InsurUpError);
        expect((error as InsurUpError).error).toBe(clientError);
        expect((error as InsurUpError).message).toBe('Request timed out');
      }
    });

    it('should preserve the error object in thrown InsurUpError', () => {
      const serverError: ServerError = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Validation failed',
        type: InsurUpServerErrorType.InputValidation,
        typeString: 'https://api.insurup.com/problems/input-validation',
        title: 'Bad Request',
        detail: 'Invalid email format',
        instance: '/customers',
        status: 400,
        codes: ['INVALID_EMAIL'],
        traceId: 'trace-456',
        template: '',
        templateArgs: {},
        suggestions: [],
        validationErrors: [
          {
            propertyName: 'email',
            errorMessage: 'Invalid email format',
            attemptedValue: 'not-an-email'
          }
        ]
      };

      try {
        getDataOrThrow(serverError as InsurUpResult<unknown>);
      } catch (error) {
        const insurUpError = error as InsurUpError;
        expect(insurUpError.error.kind).toBe('server-error');
        if (insurUpError.error.kind === 'server-error') {
          expect(insurUpError.error.validationErrors).toHaveLength(1);
          expect(insurUpError.error.validationErrors[0].propertyName).toBe('email');
        }
      }
    });
  });

  describe('throwIfError', () => {
    it('should not throw for successful result with data', () => {
      const result = createSuccess({ id: '123' });

      expect(() => throwIfError(result)).not.toThrow();
    });

    it('should not throw for successful no-content result', () => {
      const result = createSuccessNoContent();

      expect(() => throwIfError(result)).not.toThrow();
    });

    it('should throw InsurUpError for server error', () => {
      const serverError: ServerError = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Internal server error',
        type: InsurUpServerErrorType.Upstream,
        typeString: 'https://api.insurup.com/problems/upstream-service',
        title: 'Server Error',
        detail: 'An upstream service failed',
        instance: '/policies',
        status: 500,
        codes: [],
        traceId: 'trace-789',
        template: '',
        templateArgs: {},
        suggestions: [],
        validationErrors: []
      };

      expect(() => throwIfError(serverError)).toThrow(InsurUpError);
    });

    it('should throw InsurUpError for client error', () => {
      const clientError: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Failed to parse response JSON',
        type: InsurUpClientErrorType.JsonDeserialization
      };

      expect(() => throwIfError(clientError)).toThrow(InsurUpError);
    });

    it('should return void for successful results', () => {
      const result = createSuccess('data');
      const returnValue = throwIfError(result);

      expect(returnValue).toBeUndefined();
    });
  });

  describe('Type Discrimination', () => {
    it('should discriminate success from server-error using kind', () => {
      const successResult: InsurUpResult<string> = createSuccess('data');
      const serverError: InsurUpResult<string> = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Error',
        type: InsurUpServerErrorType.Unknown,
        typeString: '',
        title: 'Error',
        detail: 'Error',
        instance: '',
        status: 500,
        codes: [],
        traceId: undefined,
        template: '',
        templateArgs: {},
        suggestions: [],
        validationErrors: []
      };

      // Test discrimination works
      if (successResult.kind === 'success') {
        expect(successResult.data).toBe('data');
      }

      if (serverError.kind === 'server-error') {
        expect(serverError.status).toBe(500);
      }
    });

    it('should discriminate success from client-error using kind', () => {
      const clientError: InsurUpResult<string> = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Network error',
        type: InsurUpClientErrorType.HttpRequestFailed
      };

      if (clientError.kind === 'client-error') {
        expect(clientError.type).toBe(InsurUpClientErrorType.HttpRequestFailed);
      }
    });

    it('should discriminate using isSuccess boolean', () => {
      const success = createSuccess({ id: '123' });
      const error: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Error',
        type: InsurUpClientErrorType.Unknown
      };

      expect(success.isSuccess).toBe(true);
      expect(error.isSuccess).toBe(false);

      // Use isSuccess for quick checks
      if (success.isSuccess) {
        expect(success.kind).toBe('success');
      }
    });

    it('should handle all three result kinds in switch statement', () => {
      const results: InsurUpResult<string>[] = [
        createSuccess('data'),
        {
          kind: 'server-error',
          isSuccess: false,
          message: 'Server error',
          type: InsurUpServerErrorType.Unknown,
          typeString: '',
          title: '',
          detail: '',
          instance: '',
          status: 500,
          codes: [],
          traceId: undefined,
          template: '',
          templateArgs: {},
          suggestions: [],
          validationErrors: []
        },
        {
          kind: 'client-error',
          isSuccess: false,
          message: 'Client error',
          type: InsurUpClientErrorType.Unknown
        }
      ];

      const kinds: string[] = [];

      for (const result of results) {
        switch (result.kind) {
          case 'success':
            kinds.push('success');
            break;
          case 'server-error':
            kinds.push('server-error');
            break;
          case 'client-error':
            kinds.push('client-error');
            break;
        }
      }

      expect(kinds).toEqual(['success', 'server-error', 'client-error']);
    });
  });

  describe('InsurUpError Class', () => {
    it('should extend Error', () => {
      const clientError: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Test error',
        type: InsurUpClientErrorType.Unknown
      };

      const error = new InsurUpError(clientError);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InsurUpError);
    });

    it('should have correct name property', () => {
      const clientError: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Test',
        type: InsurUpClientErrorType.Unknown
      };

      const error = new InsurUpError(clientError);

      expect(error.name).toBe('InsurUpError');
    });

    it('should preserve the original error object', () => {
      const serverError: ServerError = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Not found',
        type: InsurUpServerErrorType.ResourceNotFound,
        typeString: 'https://api.insurup.com/problems/resource-not-found',
        title: 'Not Found',
        detail: 'Resource not found',
        instance: '/test',
        status: 404,
        codes: ['NOT_FOUND'],
        traceId: 'trace-123',
        template: '',
        templateArgs: {},
        suggestions: [],
        validationErrors: []
      };

      const error = new InsurUpError(serverError);

      expect(error.error).toBe(serverError);
      expect(error.error.kind).toBe('server-error');
    });

    it('should use error message as Error message', () => {
      const clientError: ClientError = {
        kind: 'client-error',
        isSuccess: false,
        message: 'Custom error message',
        type: InsurUpClientErrorType.Timeout
      };

      const error = new InsurUpError(clientError);

      expect(error.message).toBe('Custom error message');
    });

    it('should work with try-catch pattern', () => {
      const serverError: ServerError = {
        kind: 'server-error',
        isSuccess: false,
        message: 'Access denied',
        type: InsurUpServerErrorType.AccessDenied,
        typeString: 'https://api.insurup.com/problems/access-denied',
        title: 'Forbidden',
        detail: 'You do not have permission',
        instance: '/admin',
        status: 403,
        codes: [],
        traceId: undefined,
        template: '',
        templateArgs: {},
        suggestions: [],
        validationErrors: []
      };

      let caughtError: InsurUpError | null = null;

      try {
        throw new InsurUpError(serverError);
      } catch (error) {
        if (error instanceof InsurUpError) {
          caughtError = error;
        }
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError?.error.kind).toBe('server-error');
      if (caughtError?.error.kind === 'server-error') {
        expect(caughtError.error.status).toBe(403);
      }
    });
  });

  describe('Error Types', () => {
    it('should have all expected client error types', () => {
      const expectedTypes = [
        'Unknown',
        'Timeout',
        'HttpRequestFailed',
        'JsonSerialization',
        'JsonDeserialization',
        'NullResponse',
        'UnexpectedNoContent'
      ];

      for (const type of expectedTypes) {
        expect(InsurUpClientErrorType[type as keyof typeof InsurUpClientErrorType]).toBeDefined();
      }
    });

    it('should have all expected server error types', () => {
      const expectedTypes = [
        'Unknown',
        'AccessDenied',
        'BusinessValidation',
        'FeatureNotSupported',
        'InputValidation',
        'ResourceDuplicate',
        'ResourceInvalidState',
        'ResourceNotFound',
        'EndpointNotFound',
        'Unauthorized',
        'Upstream',
        'UnsupportedMediaType',
        'MethodNotAllowed'
      ];

      for (const type of expectedTypes) {
        expect(InsurUpServerErrorType[type as keyof typeof InsurUpServerErrorType]).toBeDefined();
      }
    });
  });
});
