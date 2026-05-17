/**
 * @fileoverview Interceptors and Blob Tests
 * @description Tests for request/response interceptors and blob download functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpTransport } from '../../src/client/http';
import type { RequestConfig, ResponseInterceptor } from '../../src/core/options';
import type { InsurUpResult } from '../../src/core/result';
import { TestSetupHelper } from '../utils';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('HttpTransport Interceptors', () => {
  beforeEach(() => {
    TestSetupHelper.cleanup();
    TestSetupHelper.setupFakeTimers();
  });

  afterEach(() => {
    TestSetupHelper.restoreTimers();
    vi.restoreAllMocks();
  });

  describe('Request Interceptor', () => {
    it('should call onRequest interceptor before sending request', async () => {
      const onRequest = vi.fn((config: RequestConfig) => config);

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      expect(onRequest).toHaveBeenCalledTimes(1);
      expect(onRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://test.api.com/api/test',
          method: 'GET',
        })
      );
    });

    it('should allow modifying headers via request interceptor', async () => {
      const onRequest = vi.fn((config: RequestConfig) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Custom-Header': 'custom-value',
        },
      }));

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      // Verify fetch was called with modified headers
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.api.com/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should support async request interceptors', async () => {
      const onRequest = vi.fn(async (config: RequestConfig) => {
        // Simulate async token fetch
        await Promise.resolve();
        return {
          ...config,
          headers: {
            ...config.headers,
            Authorization: 'Bearer async-token',
          },
        };
      });

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer async-token',
          }),
        })
      );
    });

    it('should continue request even if interceptor throws', async () => {
      const onRequest = vi.fn(() => {
        throw new Error('Interceptor error');
      });

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      const result = await transport.get('/test');

      // Request should still succeed despite interceptor failure
      expect(result.kind).toBe('success');
    });
  });

  describe('Response Interceptor', () => {
    it('should call onResponse interceptor after receiving response', async () => {
      const onResponse = vi.fn(
        (result: InsurUpResult<unknown>) => result
      ) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      expect(onResponse).toHaveBeenCalledTimes(1);
      expect(onResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          data: { id: '123' },
        }),
        expect.objectContaining({
          url: 'https://test.api.com/api/test',
          method: 'GET',
        })
      );
    });

    it('should allow transforming response data', async () => {
      const onResponse = vi.fn((result: InsurUpResult<unknown>, _config: RequestConfig) => {
        if (result.kind === 'success' && 'data' in result) {
          return {
            ...result,
            data: { ...(result.data as object), transformed: true },
          };
        }
        return result;
      }) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      const result = await transport.get<{ id: string; transformed?: boolean }>('/test');

      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data.transformed).toBe(true);
      }
    });

    it('should call onResponse for error responses', async () => {
      const onResponse = vi.fn(
        (result: InsurUpResult<unknown>) => result
      ) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
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
              status: 404,
            })
          ),
      });

      await transport.get('/test');

      expect(onResponse).toHaveBeenCalledTimes(1);
      expect(onResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'server-error',
          status: 404,
        }),
        expect.any(Object)
      );
    });

    it('should support async response interceptors', async () => {
      const onResponse = vi.fn(async (result: InsurUpResult<unknown>) => {
        await Promise.resolve(); // Simulate async operation
        return result;
      }) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      const result = await transport.get('/test');

      expect(result.kind).toBe('success');
      expect(onResponse).toHaveBeenCalledTimes(1);
    });

    it('should return original result if interceptor throws', async () => {
      const onResponse = vi.fn((): InsurUpResult<unknown> => {
        throw new Error('Interceptor error');
      }) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      const result = await transport.get('/test');

      // Should return the original result
      expect(result.kind).toBe('success');
      if (result.kind === 'success') {
        expect(result.data).toEqual({ id: '123' });
      }
    });
  });

  describe('Combined Interceptors', () => {
    it('should call both request and response interceptors in order', async () => {
      const callOrder: string[] = [];

      const onRequest = vi.fn((config: RequestConfig) => {
        callOrder.push('request');
        return config;
      });

      const onResponse = vi.fn((result: InsurUpResult<unknown>) => {
        callOrder.push('response');
        return result;
      }) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      expect(callOrder).toEqual(['request', 'response']);
    });

    it('should provide request config to response interceptor', async () => {
      let capturedConfig: RequestConfig | undefined;

      const onRequest = vi.fn((config: RequestConfig) => ({
        ...config,
        headers: {
          ...config.headers,
          'X-Request-Id': 'test-123',
        },
      }));

      const onResponse = vi.fn((result: InsurUpResult<unknown>, config: RequestConfig) => {
        capturedConfig = config;
        return result;
      }) as unknown as ResponseInterceptor;

      const transport = new HttpTransport({
        baseUrl: 'https://test.api.com/api/',
        timeoutMs: 5000,
        logLevel: 'none',
        onRequest,
        onResponse,
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        text: () => Promise.resolve(JSON.stringify({ id: '123' })),
      });

      await transport.get('/test');

      expect(capturedConfig).toBeDefined();
      expect(capturedConfig?.headers['X-Request-Id']).toBe('test-123');
    });
  });
});

describe('HttpTransport Blob Download', () => {
  beforeEach(() => {
    TestSetupHelper.cleanup();
    TestSetupHelper.setupFakeTimers();
  });

  afterEach(() => {
    TestSetupHelper.restoreTimers();
    vi.restoreAllMocks();
  });

  it('should download binary content as Blob', async () => {
    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      logLevel: 'none',
    });

    const blobContent = new Blob(['test content'], { type: 'application/pdf' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/pdf' },
      blob: () => Promise.resolve(blobContent),
    });

    const result = await transport.getBlob('/documents/test.pdf');

    expect(result.kind).toBe('success');
    if (result.kind === 'success') {
      expect(result.data).toBeInstanceOf(Blob);
      expect(result.data.type).toBe('application/pdf');
    }
  });

  it('should handle 404 errors for blob requests', async () => {
    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      logLevel: 'none',
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'application/json' },
      text: () =>
        Promise.resolve(
          JSON.stringify({
            type: 'https://api.insurup.com/problems/resource-not-found',
            title: 'Not Found',
            detail: 'Document not found',
            status: 404,
          })
        ),
    });

    const result = await transport.getBlob('/documents/missing.pdf');

    expect(result.kind).toBe('server-error');
    if (result.kind === 'server-error') {
      expect(result.status).toBe(404);
    }
  });

  it('should respect timeout for blob requests', async () => {
    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 1000,
      logLevel: 'none',
    });

    // Create an AbortError
    const abortError = new DOMException('signal is aborted without reason', 'AbortError');

    mockFetch.mockRejectedValueOnce(abortError);

    const result = await transport.getBlob('/documents/large.pdf');

    expect(result.kind).toBe('client-error');
    if (result.kind === 'client-error') {
      expect(result.type).toBe('Timeout');
    }
  });

  it('should support custom headers for blob requests', async () => {
    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      logLevel: 'none',
    });

    const blobContent = new Blob(['test'], { type: 'application/pdf' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/pdf' },
      blob: () => Promise.resolve(blobContent),
    });

    await transport.getBlob('/documents/test.pdf', {
      headers: { 'X-Custom-Header': 'custom-value' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.api.com/api/documents/test.pdf',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Custom-Header': 'custom-value',
        }),
      })
    );
  });

  it('should call interceptors for blob requests', async () => {
    const onRequest = vi.fn((config: RequestConfig) => config);
    const onResponse = vi.fn(
      (result: InsurUpResult<unknown>) => result
    ) as unknown as ResponseInterceptor;

    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      logLevel: 'none',
      onRequest,
      onResponse,
    });

    const blobContent = new Blob(['test'], { type: 'application/pdf' });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: { get: () => 'application/pdf' },
      blob: () => Promise.resolve(blobContent),
    });

    await transport.getBlob('/documents/test.pdf');

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it('should support AbortSignal for blob requests', async () => {
    const transport = new HttpTransport({
      baseUrl: 'https://test.api.com/api/',
      timeoutMs: 5000,
      logLevel: 'none',
    });

    const controller = new AbortController();
    controller.abort();

    const abortError = new DOMException('signal is aborted without reason', 'AbortError');
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await transport.getBlob('/documents/test.pdf', { signal: controller.signal });

    expect(result.kind).toBe('client-error');
  });
});
