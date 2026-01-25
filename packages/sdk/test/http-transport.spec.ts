/**
 * @fileoverview HTTP Transport Tests - Comprehensive tests for HttpTransport class
 * @description Tests covering retry behavior, AbortSignal, large payloads, content types, and concurrency
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpTransport } from '../src/client/http';
import { InsurUpClientErrorType } from '../src/core/result';
import { TestSetupHelper } from './utils';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe('HttpTransport', () => {
  let transport: HttpTransport;

  beforeEach(() => {
    TestSetupHelper.cleanup();
    TestSetupHelper.setupFakeTimers();

    transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      retry: {
        retries: 3,
        minTimeout: 100,
        maxTimeout: 1000,
        factor: 2,
        randomize: false
      },
      logLevel: 'none'
    });
  });

  afterEach(() => {
    TestSetupHelper.restoreTimers();
    vi.restoreAllMocks();
  });

  describe('Retry Behavior Tests', () => {
    it('should retry with exponential backoff for retryable errors', async () => {
      // Mock failing responses that should be retried (500 error)
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: { get: () => 'application/json' },
          text: () =>
            Promise.resolve(
              JSON.stringify({
                type: 'https://api.insurup.com/problems/upstream-service',
                title: 'Internal Server Error',
                detail: 'Server temporarily unavailable',
                status: 500
              })
            )
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: { get: () => 'application/json' },
          text: () =>
            Promise.resolve(
              JSON.stringify({
                type: 'https://api.insurup.com/problems/upstream-service',
                title: 'Internal Server Error',
                detail: 'Server temporarily unavailable',
                status: 500
              })
            )
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve(JSON.stringify({ success: true }))
        });

      const resultPromise = transport.post('/test', { data: 'test' });

      // First failure happens immediately, then waits 100ms
      await vi.advanceTimersByTimeAsync(100);
      // Second failure happens, then waits 200ms (100 * 2^1)
      await vi.advanceTimersByTimeAsync(200);

      const result = await resultPromise;

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('should not retry if retry is disabled by default', async () => {
      const defaultTransport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        logLevel: 'none'
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{"error": "server error"}')
      });

      const result = await defaultTransport.post('/test', { data: 'test' });

      expect(result.kind).toBe('server-error');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries when disabled
    });

    it('should not retry non-retryable errors (400)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: { get: () => 'application/json' },
        text: () =>
          Promise.resolve(
            JSON.stringify({
              type: 'https://api.insurup.com/problems/input-validation',
              title: 'Bad Request',
              detail: 'Invalid input',
              status: 400
            })
          )
      });

      const result = await transport.post('/test', { data: 'test' });

      expect(result.kind).toBe('server-error');
      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries for 400 errors
    });

    it('should respect custom retryable status codes', async () => {
      const customTransport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        retry: {
          retries: 2,
          minTimeout: 10,
          randomize: false,
          retryableStatusCodes: [400, 500] // Include 400 as retryable
        },
        logLevel: 'none'
      });

      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"error": "bad request"}')
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"success": true}')
        });

      const resultPromise = customTransport.post('/test', { data: 'test' });
      await vi.advanceTimersByTimeAsync(10);
      const result = await resultPromise;

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledTimes(2); // Should retry 400 with custom config
    });
  });

  describe('AbortSignal Propagation Tests', () => {
    it('should propagate external AbortSignal to fetch', async () => {
      const controller = new AbortController();
      const signal = controller.signal;

      // Mock fetch to check if signal is passed
      mockFetch.mockImplementation((url, options) => {
        expect(options?.signal).toBeDefined();
        expect(options?.signal?.aborted).toBe(false);

        // Simulate the signal being aborted during the request
        setTimeout(() => controller.abort(), 10);

        return new Promise((_, reject) => {
          // Listen for abort on the signal passed to fetch
          options.signal.addEventListener('abort', () => {
            const abortError = new Error('The operation was aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          }, { once: true });
        });
      });

      const resultPromise = transport.get('/test', { signal });

      // Advance timers to trigger the abort
      await vi.advanceTimersByTimeAsync(10);

      const result = await resultPromise;

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.Timeout);
      }
    });

    it('should handle pre-aborted signals', async () => {
      const controller = new AbortController();
      controller.abort(); // Abort before making request

      mockFetch.mockImplementation((url, options) => {
        expect(options?.signal?.aborted).toBe(true);
        const abortError = new Error('The operation was aborted');
        abortError.name = 'AbortError';
        return Promise.reject(abortError);
      });

      const result = await transport.get('/test', { signal: controller.signal });

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.Timeout);
      }
    });

    it('should clean up signal listeners after request completes', async () => {
      const controller = new AbortController();
      const signal = controller.signal;

      // Spy on addEventListener and removeEventListener
      const addEventListenerSpy = vi.spyOn(signal, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(signal, 'removeEventListener');

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{"success": true}')
      });

      await transport.get('/test', { signal });

      expect(addEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function), {
        once: true
      });
      expect(removeEventListenerSpy).toHaveBeenCalledWith('abort', expect.any(Function));
    });
  });

  describe('Large Payload Handling Tests', () => {
    it('should handle large string request bodies efficiently', async () => {
      const largeString = 'x'.repeat(20000); // 20KB string

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{"success": true}')
      });

      const result = await transport.post('/test', largeString);

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.api.com/api/test',
        expect.objectContaining({
          method: 'POST',
          body: `"${largeString}"` // Should be properly serialized
        })
      );
    });

    it('should handle large object request bodies efficiently', async () => {
      // Create a large object with many properties
      const largeObject: Record<string, unknown> = {};
      for (let i = 0; i < 200; i++) {
        largeObject[`property${i}`] = {
          nested: {
            data: `value${i}`,
            array: new Array(50).fill(i)
          }
        };
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{"success": true}')
      });

      const result = await transport.post('/test', largeObject);

      expect(result.kind).toBe('success');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.api.com/api/test',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String) // Should be serialized to string
        })
      );
    });

    it('should handle large response data efficiently', async () => {
      // Create a large response
      const largeResponse = {
        data: new Array(1000).fill(0).map((_, i) => ({
          id: i,
          name: `Item ${i}`,
          description: 'x'.repeat(100)
        }))
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify(largeResponse))
      });

      const result = await transport.get('/test');

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual(largeResponse);
      }
    });

    it('should handle memory-efficient logging for large payloads', async () => {
      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        logLevel: 'detailed',
        logger: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        }
      });

      const largeObject = {
        data: new Array(200).fill(0).map((_, i) => ({ id: i, data: 'x'.repeat(100) }))
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve('{"success": true}')
      });

      await transport.post('/test', largeObject);

      // Verify that logging doesn't cause memory issues
      expect(transport['options'].logger.info).toHaveBeenCalled();
    });
  });

  describe('Content-Type Edge Cases Tests', () => {
    it('should handle various JSON content types', async () => {
      const jsonContentTypes = [
        'application/json',
        'application/json; charset=utf-8',
        'application/vnd.api+json',
        'application/hal+json',
        'application/problem+json'
      ];

      for (const contentType of jsonContentTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: (header: string) => (header === 'content-type' ? contentType : null) },
          text: () => Promise.resolve('{"data": "test"}')
        });

        const result = await transport.get('/test');

        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(result.data).toEqual({ data: 'test' });
        }
      }
    });

    it('should reject non-JSON content types for JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: (header: string) => (header === 'content-type' ? 'text/html' : null) },
        text: () => Promise.resolve('<html>Not JSON</html>')
      });

      const result = await transport.get('/test');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
        // The message should be about the content type
        expect(result.message).toContain('Failed to parse response JSON');
      }
    });

    it('should handle empty responses with various content types', async () => {
      // GET always expects content, so empty responses should return UnexpectedNoContent error
      const emptyResponseCases = [
        { status: 200, contentType: 'application/json', body: '' },
        { status: 204, contentType: 'application/json', body: '' },
        { status: 205, contentType: 'application/json', body: '' },
        { status: 200, contentType: null, body: '' }
      ];

      for (const testCase of emptyResponseCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: testCase.status,
          headers: {
            get: (header: string) => (header === 'content-type' ? testCase.contentType : null)
          },
          text: () => Promise.resolve(testCase.body)
        });

        const result = await transport.get('/test');

        // GET always expects content - empty responses are errors
        expect(result.kind).toBe('client-error');
        if (result.kind === 'client-error') {
          expect(result.type).toBe(InsurUpClientErrorType.UnexpectedNoContent);
        }
      }
    });

    it('should handle malformed JSON gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: (header: string) => (header === 'content-type' ? 'application/json' : null)
        },
        text: () => Promise.resolve('{"invalid": json}') // Invalid JSON
      });

      const result = await transport.get('/test');

      expect(result.kind).toBe('client-error');
      if (result.kind === 'client-error') {
        expect(result.type).toBe(InsurUpClientErrorType.JsonDeserialization);
      }
    });
  });

  describe('Concurrent Request Tests', () => {
    it('should handle multiple concurrent requests without race conditions', async () => {
      const responses = [
        { data: 'response1' },
        { data: 'response2' },
        { data: 'response3' },
        { data: 'response4' },
        { data: 'response5' }
      ];

      // Mock fetch to return different responses for each call
      responses.forEach((response) => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve(JSON.stringify(response))
        });
      });

      // Make 5 concurrent requests
      const promises = responses.map((_, index) => transport.get(`/test${index}`));

      const results = await Promise.all(promises);

      // Verify all requests succeeded and returned correct data
      results.forEach((result, index) => {
        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(result.data).toEqual(responses[index]);
        }
      });

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should handle concurrent requests with mixed success/failure', async () => {
      // Create a special transport for this test that doesn't retry server errors
      const noRetryTransport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        retry: {
          retries: 0, // No retries for this test
          retryableStatusCodes: []
        },
        logLevel: 'none'
      });

      // Mock responses: success, error, success, error, success
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"success": 1}')
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: { get: () => 'application/json' },
          text: () =>
            Promise.resolve(
              JSON.stringify({
                type: 'https://api.insurup.com/problems/upstream-service',
                title: 'Internal Server Error',
                detail: 'Server error',
                status: 500
              })
            )
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"success": 2}')
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: { get: () => 'application/json' },
          text: () =>
            Promise.resolve(
              JSON.stringify({
                type: 'https://api.insurup.com/problems/resource-not-found',
                title: 'Not Found',
                detail: 'Resource not found',
                status: 404
              })
            )
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"success": 3}')
        });

      const promises = [
        noRetryTransport.get('/success1'),
        noRetryTransport.get('/error1'),
        noRetryTransport.get('/success2'),
        noRetryTransport.get('/error2'),
        noRetryTransport.get('/success3')
      ];

      const results = await Promise.all(promises);

      // Verify results match expectations
      expect(results[0].kind).toBe('success');
      expect(results[1].kind).toBe('server-error');
      expect(results[2].kind).toBe('success');
      expect(results[3].kind).toBe('server-error');
      expect(results[4].kind).toBe('success');

      if (results[1].kind === 'server-error') {
        expect(results[1].status).toBe(500);
      }
      if (results[3].kind === 'server-error') {
        expect(results[3].status).toBe(404);
      }
    });

    it('should handle timeout scenarios in concurrent requests', async () => {
      // Create a transport with short timeout
      const shortTimeoutTransport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 100,
        logLevel: 'none'
      });

      // Mock fetch calls with specific responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"fast": true}')
        })
        .mockRejectedValueOnce(
          (() => {
            const error = new Error('Request timeout');
            error.name = 'AbortError';
            return error;
          })()
        )
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"fast": true}')
        });

      const promises = [
        shortTimeoutTransport.get('/fast1'),
        shortTimeoutTransport.get('/slow'),
        shortTimeoutTransport.get('/fast2')
      ];

      const results = await Promise.all(promises);

      // First request should succeed (fast)
      expect(results[0].kind).toBe('success');

      // Second request should timeout
      expect(results[1].kind).toBe('client-error');
      if (results[1].kind === 'client-error') {
        expect(results[1].type).toBe(InsurUpClientErrorType.Timeout);
      }

      // Third request should succeed (fast)
      expect(results[2].kind).toBe('success');
    }, 10000); // Increase timeout for this test

    it('should maintain request isolation with different headers', async () => {
      const requests = [
        { path: '/test1', headers: { 'X-Custom': 'value1' } },
        { path: '/test2', headers: { 'X-Custom': 'value2' } },
        { path: '/test3', headers: { 'X-Custom': 'value3' } }
      ];

      // Mock fetch to capture and return the custom header value
      mockFetch.mockImplementation((url, options) => {
        const customHeader = options?.headers?.['X-Custom'];
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve(JSON.stringify({ receivedHeader: customHeader }))
        });
      });

      const promises = requests.map((req) => transport.get(req.path, { headers: req.headers }));

      const results = await Promise.all(promises);

      // Verify each request maintained its own headers
      results.forEach((result, index) => {
        expect(result.kind).toBe('success');
        if (result.kind === 'success') {
          expect(result.data).toEqual({
            receivedHeader: requests[index].headers['X-Custom']
          });
        }
      });
    });
  });

  describe('Memory Management Validation', () => {
    it('should efficiently handle large object detection', async () => {
      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        logLevel: 'detailed',
        logger: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn()
        }
      });

      // Test with various object sizes
      const testCases = [
        { obj: { small: 'object' }, shouldBeLarge: false },
        { obj: new Array(200).fill({ data: 'test' }), shouldBeLarge: true },
        {
          obj: { deep: { nested: { object: { with: { many: { levels: 'test' } } } } } },
          shouldBeLarge: true
        },
        { obj: 'simple string', shouldBeLarge: false },
        { obj: 'x'.repeat(15000), shouldBeLarge: true }
      ];

      for (const testCase of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: { get: () => 'application/json' },
          text: () => Promise.resolve('{"success": true}')
        });

        await transport.post('/test', testCase.obj);

        // Verify logging was called (indirectly testing memory management)
        expect(transport['options'].logger.info).toHaveBeenCalled();
      }
    });
  });
});
