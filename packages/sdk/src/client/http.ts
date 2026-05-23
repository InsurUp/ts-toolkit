/**
 * @fileoverview HTTP Transport Layer - Fetch-based HTTP client
 * @description Cross-environment HTTP transport with timeout support and error handling
 */

import type { InsurUpResult } from '../core/result.js';
import { createSuccess, createSuccessNoContent, InsurUpClientErrorType } from '../core/result.js';
import {
  parseServerError,
  createNetworkError,
  createSerializationError,
  createDeserializationError,
  createUnexpectedNoContentError,
} from '../core/errors.js';
import type { InsurUpClientOptions, RequestConfig, RequestOptions } from '../core/options.js';
import { mergeWithDefaults, type RequiredClientOptions } from '../core/config.js';
import { withRetry } from '../core/retry.js';
import { encodePolymorphicTypes, decodePolymorphicTypes } from './polymorphic.js';

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Valid request body types for HTTP requests
 */
export type RequestBody = unknown | FormData;

/**
 * Error type that built-in retry can understand
 */
interface RetryableError extends Error {
  result: InsurUpResult<unknown> | InsurUpResult;
  attemptNumber: number;
}

/**
 * HTTP transport class providing fetch-based request capabilities
 * with environment detection and timeout support
 */
export class HttpTransport {
  private readonly options: RequiredClientOptions;

  constructor(options?: InsurUpClientOptions) {
    this.options = mergeWithDefaults(options);
  }

  /**
   * Sends an HTTP request and returns the parsed result
   * @template T The expected response type (void for no-content operations)
   * @param method HTTP method
   * @param path Relative path (will be prefixed with baseUrl)
   * @param body Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @param expectContent Whether the response should contain data (internal use)
   * @returns Promise resolving to InsurUpResult<T>
   */
  private async sendInternal<T>(
    method: HttpMethod,
    path: string,
    body?: RequestBody,
    options?: RequestOptions,
    expectContent: boolean = true
  ): Promise<InsurUpResult<T> | InsurUpResult> {
    const startTime = Date.now();
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    // Build initial request config for interceptors
    let requestConfig: RequestConfig = {
      url,
      method,
      headers: { ...this.options.customHeaders, ...options?.headers },
      body,
    };

    // Call request interceptor if provided
    if (this.options.onRequest) {
      try {
        requestConfig = await this.options.onRequest(requestConfig);
      } catch (error) {
        if (this.options.logLevel !== 'none') {
          this.options.logger.warn('Request interceptor failed:', error);
        }
      }
    }

    this.logRequest(method, path, body, options?.headers);

    const executeRequest = async (
      attemptNumber: number
    ): Promise<InsurUpResult<T> | InsurUpResult> => {
      try {
        const result = await this.sendSingleRequest<T>(
          requestConfig.method as HttpMethod,
          path,
          requestConfig.body,
          {
            headers: requestConfig.headers,
            signal: options?.signal,
            timeoutMs: options?.timeoutMs,
          },
          expectContent
        );

        // If it's a success, return it
        if (result.kind === 'success') {
          return result;
        }

        // Check if this error should be retried
        if (this.shouldRetryResult(result)) {
          const error = new Error(result.message) as RetryableError;
          error.result = result;
          error.attemptNumber = attemptNumber;

          throw error;
        }

        // Non-retryable error, return it directly
        return result;
      } catch (rawError) {
        // Handle raw errors from fetch (like timeout errors)
        const networkError = createNetworkError(rawError);

        // Don't retry timeout errors
        if (networkError.type === InsurUpClientErrorType.Timeout) {
          return networkError;
        }

        // Only retry HttpRequestFailed errors
        if (networkError.type === InsurUpClientErrorType.HttpRequestFailed && this.options.retry) {
          const error = new Error(networkError.message) as RetryableError;
          error.result = networkError;
          error.attemptNumber = attemptNumber;

          throw error;
        }

        // Non-retryable error, return it directly
        return networkError;
      }
    };

    try {
      let result: InsurUpResult<T> | InsurUpResult;

      if (this.options.retry) {
        result = await withRetry(executeRequest, {
          ...this.options.retry,
          onFailedAttempt: (error) => {
            const originalError = error.error as RetryableError;
            if (originalError.result) {
              this.logRetry(error.attemptNumber, originalError.result);
            }

            // Call user's onFailedAttempt if provided
            if (this.options.retry?.onFailedAttempt) {
              this.options.retry.onFailedAttempt(error);
            }
          },
        });
      } else {
        result = await executeRequest(1);
      }

      const duration = Date.now() - startTime;
      this.logResponse('SUCCESS', duration, 1, result);

      // Call response interceptor if provided
      if (this.options.onResponse) {
        try {
          return (await this.options.onResponse(
            result as InsurUpResult<unknown>,
            requestConfig
          )) as InsurUpResult<T> | InsurUpResult;
        } catch (error) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', error);
          }
        }
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      // If it's our custom error with a result, use that
      const retryableError = error as RetryableError;
      if (retryableError.result) {
        this.logResponse(
          'ERROR',
          duration,
          retryableError.attemptNumber || 1,
          retryableError.result
        );

        // Call response interceptor for errors too
        if (this.options.onResponse) {
          try {
            return (await this.options.onResponse(
              retryableError.result as InsurUpResult<unknown>,
              requestConfig
            )) as InsurUpResult<T> | InsurUpResult;
          } catch (interceptorError) {
            if (this.options.logLevel !== 'none') {
              this.options.logger.warn('Response interceptor failed:', interceptorError);
            }
          }
        }

        return retryableError.result as InsurUpResult<T> | InsurUpResult;
      }

      // Otherwise, it's a network error
      const networkError = createNetworkError(error);
      this.logResponse('ERROR', duration, 1, networkError);

      // Call response interceptor for network errors too
      if (this.options.onResponse) {
        try {
          return (await this.options.onResponse(
            networkError as InsurUpResult<unknown>,
            requestConfig
          )) as InsurUpResult<T> | InsurUpResult;
        } catch (interceptorError) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', interceptorError);
          }
        }
      }

      return networkError;
    }
  }

  /**
   * Sends a single HTTP request without retry logic
   */
  private async sendSingleRequest<T>(
    method: HttpMethod,
    path: string,
    body?: RequestBody,
    options?: RequestOptions,
    expectContent: boolean = true
  ): Promise<InsurUpResult<T> | InsurUpResult> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const requestHeaders = await this.buildHeaders(options?.headers);

    // Serialize request body
    let serializedBody: string | FormData | null = null;
    if (body) {
      if (body instanceof FormData) {
        // Don't serialize FormData - let browser set Content-Type with boundary
        serializedBody = body;
      } else {
        try {
          serializedBody = JSON.stringify(encodePolymorphicTypes(body));
          // Set Content-Type header for JSON requests
          if (!this.hasContentTypeHeader(requestHeaders)) {
            requestHeaders['Content-Type'] = 'application/json';
          }
        } catch (error) {
          return createSerializationError(error);
        }
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeoutMs ?? this.options.timeoutMs
    );

    // Bridge external signal (if provided) to our controller
    let signalCleanup: (() => void) | undefined;
    if (options?.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        const abortHandler = () => controller.abort();
        options.signal.addEventListener('abort', abortHandler, { once: true });
        signalCleanup = () => options.signal!.removeEventListener('abort', abortHandler);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: serializedBody,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
      signalCleanup?.();
    }

    return await this.handleResponse<T>(response, expectContent);
  }

  /**
   * Convenience method for GET requests - always expects content
   * @param path Relative path (will be prefixed with baseUrl)
   * @param options Optional request options (headers, signal, timeoutMs)
   */
  async get<T>(path: string, options?: RequestOptions): Promise<InsurUpResult<T>> {
    return this.sendInternal<T>('GET', path, null, options, true) as Promise<InsurUpResult<T>>;
  }

  /**
   * POST request expecting a response with data
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult<T> with response data
   */
  async post<T>(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult<T>> {
    return this.sendInternal<T>('POST', path, data, options, true) as Promise<InsurUpResult<T>>;
  }

  /**
   * POST request expecting no response content (204 No Content)
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult (no data)
   */
  async postNoContent(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.sendInternal('POST', path, data, options, false) as Promise<InsurUpResult>;
  }

  /**
   * PUT request expecting a response with data
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult<T> with response data
   */
  async put<T>(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult<T>> {
    return this.sendInternal<T>('PUT', path, data, options, true) as Promise<InsurUpResult<T>>;
  }

  /**
   * PUT request expecting no response content (204 No Content)
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult (no data)
   */
  async putNoContent(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.sendInternal('PUT', path, data, options, false) as Promise<InsurUpResult>;
  }

  /**
   * PATCH request expecting a response with data
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult<T> with response data
   */
  async patch<T>(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult<T>> {
    return this.sendInternal<T>('PATCH', path, data, options, true) as Promise<InsurUpResult<T>>;
  }

  /**
   * PATCH request expecting no response content (204 No Content)
   * @param path Relative path (will be prefixed with baseUrl)
   * @param data Optional request body
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult (no data)
   */
  async patchNoContent(
    path: string,
    data?: RequestBody,
    options?: RequestOptions
  ): Promise<InsurUpResult> {
    return this.sendInternal('PATCH', path, data, options, false) as Promise<InsurUpResult>;
  }

  /**
   * DELETE request expecting a response with data
   * @param path Relative path (will be prefixed with baseUrl)
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult<T> with response data
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<InsurUpResult<T>> {
    return this.sendInternal<T>('DELETE', path, null, options, true) as Promise<InsurUpResult<T>>;
  }

  /**
   * DELETE request expecting no response content (204 No Content)
   * @param path Relative path (will be prefixed with baseUrl)
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult (no data)
   */
  async deleteNoContent(path: string, options?: RequestOptions): Promise<InsurUpResult> {
    return this.sendInternal('DELETE', path, null, options, false) as Promise<InsurUpResult>;
  }

  /**
   * Downloads a binary file as a Blob
   * Use this for downloading documents, images, or other binary content
   * @param path Relative path (will be prefixed with baseUrl)
   * @param options Optional request options (headers, signal, timeoutMs)
   * @returns Promise resolving to InsurUpResult<Blob>
   */
  async getBlob(path: string, options?: RequestOptions): Promise<InsurUpResult<Blob>> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const requestHeaders = await this.buildHeaders(options?.headers);

    // Build request config for interceptors
    let requestConfig: RequestConfig = {
      url,
      method: 'GET',
      headers: requestHeaders,
    };

    // Call request interceptor if provided
    if (this.options.onRequest) {
      try {
        requestConfig = await this.options.onRequest(requestConfig);
      } catch (error) {
        if (this.options.logLevel !== 'none') {
          this.options.logger.warn('Request interceptor failed:', error);
        }
      }
    }

    this.logRequest('GET', path, undefined, options?.headers);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      options?.timeoutMs ?? this.options.timeoutMs
    );

    // Bridge external signal (if provided) to our controller
    let signalCleanup: (() => void) | undefined;
    if (options?.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        const abortHandler = () => controller.abort();
        options.signal.addEventListener('abort', abortHandler, { once: true });
        signalCleanup = () => options.signal!.removeEventListener('abort', abortHandler);
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: requestConfig.headers,
        signal: controller.signal,
      });
    } catch (error) {
      // Cleanup is handled by finally block
      const networkError = createNetworkError(error);

      // Call response interceptor for errors
      if (this.options.onResponse) {
        try {
          return await this.options.onResponse(networkError, requestConfig);
        } catch (interceptorError) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', interceptorError);
          }
        }
      }

      return networkError;
    } finally {
      clearTimeout(timeoutId);
      signalCleanup?.();
    }

    // Handle non-success HTTP status codes
    if (!response.ok) {
      const errorText = await response.text();
      const serverError = parseServerError(response, errorText);

      // Call response interceptor for errors
      if (this.options.onResponse) {
        try {
          return await this.options.onResponse(serverError, requestConfig);
        } catch (interceptorError) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', interceptorError);
          }
        }
      }

      return serverError;
    }

    // Return the blob
    try {
      const blob = await response.blob();
      const result = createSuccess(blob);

      // Call response interceptor
      if (this.options.onResponse) {
        try {
          return await this.options.onResponse(result, requestConfig);
        } catch (interceptorError) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', interceptorError);
          }
        }
      }

      return result;
    } catch (error) {
      const deserializationError = createDeserializationError(error);

      // Call response interceptor for errors
      if (this.options.onResponse) {
        try {
          return await this.options.onResponse(deserializationError, requestConfig);
        } catch (interceptorError) {
          if (this.options.logLevel !== 'none') {
            this.options.logger.warn('Response interceptor failed:', interceptorError);
          }
        }
      }

      return deserializationError;
    }
  }

  /**
   * Builds request headers including defaults and custom headers
   * Invokes token provider if available and adds Authorization header
   */
  private async buildHeaders(
    additionalHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...this.options.customHeaders,
      ...additionalHeaders,
    };

    // Set User-Agent in environments where it's allowed (Node.js)
    // Use type-safe check for browser environment
    const isBrowser = typeof globalThis === 'object' && 'window' in globalThis;
    if (!isBrowser && this.options.userAgent) {
      headers['User-Agent'] = this.options.userAgent;
    }

    // Add Authorization header if token provider is available
    if (this.options.tokenProvider) {
      try {
        const token = await this.options.tokenProvider();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        // Log token provider error but don't fail the request
        if (this.options.logLevel !== 'none') {
          this.options.logger.warn('Token provider failed:', error);
        }
      }
    }

    return headers;
  }

  /**
   * Checks if Content-Type header is present (case-insensitive)
   */
  private hasContentTypeHeader(headers: Record<string, string>): boolean {
    return Object.keys(headers).some((key) => key.toLowerCase() === 'content-type');
  }

  /**
   * Checks if a content type is a valid JSON content type
   */
  private isJsonContentType(contentType: string): boolean {
    const lowerContentType = contentType.toLowerCase();
    return (
      lowerContentType.includes('application/json') ||
      lowerContentType.includes('application/vnd.api+json') ||
      lowerContentType.includes('application/hal+json') ||
      lowerContentType.includes('application/problem+json') ||
      lowerContentType.includes('text/json') ||
      /^application\/.*\+json/i.test(contentType)
    );
  }

  /**
   * Handles HTTP response and converts to InsurUpResult
   * @param response The fetch Response object
   * @param expectContent Whether the caller expects response data
   */
  private async handleResponse<T>(
    response: Response,
    expectContent: boolean
  ): Promise<InsurUpResult<T> | InsurUpResult> {
    // Handle non-success HTTP status codes first
    if (!response.ok) {
      const errorText = await response.text();
      return parseServerError(response, errorText);
    }

    // No Content responses (204, 205)
    if (response.status === 204 || response.status === 205) {
      if (expectContent) {
        return createUnexpectedNoContentError();
      }
      return createSuccessNoContent();
    }

    // Get response text first to determine if it's empty
    const responseText = await response.text();

    // Handle empty response body
    if (!responseText.trim()) {
      if (expectContent) {
        return createUnexpectedNoContentError();
      }
      return createSuccessNoContent();
    }

    // For non-empty responses, validate Content-Type
    const contentType = response.headers.get('content-type');
    if (contentType && !this.isJsonContentType(contentType)) {
      return createDeserializationError(new Error(`Expected JSON response but got ${contentType}`));
    }

    // Parse the JSON response
    return this.parseSuccessResponse<T>(responseText);
  }

  /**
   * Parses successful JSON response body
   */
  private parseSuccessResponse<T>(responseText: string): InsurUpResult<T> | InsurUpResult {
    try {
      const data = decodePolymorphicTypes(JSON.parse(responseText)) as T;
      return createSuccess(data);
    } catch (error) {
      return createDeserializationError(error);
    }
  }

  /**
   * Determines if a result should be retried
   */
  private shouldRetryResult(result: InsurUpResult<unknown> | InsurUpResult): boolean {
    if (!this.options.retry) {
      return false;
    }

    // Retry server errors with retryable status codes
    if (result.kind === 'server-error') {
      return this.options.retry.retryableStatusCodes.includes(result.status);
    }

    // Retry client errors for network issues but not timeouts
    if (result.kind === 'client-error') {
      return result.type === InsurUpClientErrorType.HttpRequestFailed;
    }

    return false;
  }

  /**
   * Logs outgoing request details
   */
  private logRequest(
    method: HttpMethod,
    path: string,
    body?: RequestBody,
    headers?: Record<string, string>
  ): void {
    if (this.options.logLevel === 'none') {
      return;
    }

    const url = `${this.options.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    if (this.options.logLevel === 'basic') {
      this.options.logger.info(`${method} ${url}`);
    } else if (this.options.logLevel === 'detailed') {
      // Only compute sanitized values when detailed logging is enabled
      const sanitizedHeaders = this.sanitizeHeaders(headers);
      const sanitizedBody = this.sanitizeBody(body);
      this.options.logger.info(`Request: ${method} ${url}`, {
        headers: sanitizedHeaders,
        body: sanitizedBody,
      });
    }
  }

  /**
   * Logs response details
   */
  private logResponse(
    status: 'SUCCESS' | 'ERROR',
    duration: number,
    attempt: number,
    result: InsurUpResult<unknown> | InsurUpResult
  ): void {
    if (this.options.logLevel === 'none') {
      return;
    }

    const attemptInfo = attempt > 1 ? ` (attempt ${attempt})` : '';

    if (this.options.logLevel === 'basic') {
      if (status === 'SUCCESS') {
        this.options.logger.info(`${status} in ${duration}ms${attemptInfo}`);
      } else {
        this.options.logger.error(`${status} in ${duration}ms${attemptInfo}`);
      }
    } else if (this.options.logLevel === 'detailed') {
      // Only compute sanitized values when detailed logging is enabled
      if (status === 'SUCCESS') {
        const data =
          result.kind === 'success' && 'data' in result
            ? this.sanitizeResponseData(result.data)
            : undefined;
        this.options.logger.info(`Response: ${status} in ${duration}ms${attemptInfo}`, { data });
      } else {
        const sanitizedError = this.sanitizeError(result);
        this.options.logger.error(`Response: ${status} in ${duration}ms${attemptInfo}`, {
          error: sanitizedError,
        });
      }
    }
  }

  /**
   * Logs retry attempt
   */
  private logRetry(attemptNumber: number, result: InsurUpResult<unknown> | InsurUpResult): void {
    if (this.options.logLevel === 'none') {
      return;
    }

    const reason =
      result.kind === 'server-error'
        ? `HTTP ${result.status}`
        : result.kind === 'client-error'
          ? result.type
          : 'Unknown error';

    this.options.logger.warn(`Retry attempt ${attemptNumber} failed due to: ${reason}`);
  }

  /**
   * Sanitizes headers for logging (removes sensitive information)
   */
  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) {
      return undefined;
    }

    const sanitized: Record<string, string> = {};
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];

    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveHeaders.includes(lowerKey)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitizes request body for logging with memory-efficient handling
   */
  private sanitizeBody(body?: RequestBody): unknown {
    if (!body) {
      return undefined;
    }

    // Handle FormData
    if (body instanceof FormData) {
      return '[FormData body]';
    }

    // Handle string bodies efficiently
    if (typeof body === 'string') {
      if (body.length > 10000) {
        return '[Large string body - truncated for logging]';
      }
      return body.length > 1000 ? `${body.substring(0, 1000)}... [truncated]` : body;
    }

    // Handle primitive types
    if (typeof body === 'number' || typeof body === 'boolean') {
      return body;
    }

    // For objects/arrays, use memory-efficient serialization
    try {
      // Quick size estimation to avoid expensive stringification of large objects
      if (this.isLargeObject(body)) {
        return '[Large object body - truncated for logging]';
      }

      const stringified = JSON.stringify(body);
      return stringified.length > 1000 ? `${stringified.substring(0, 1000)}... [truncated]` : body;
    } catch {
      return '[Unable to serialize body]';
    }
  }

  /**
   * Efficiently estimates if an object is large without full serialization
   */
  private isLargeObject(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    try {
      // Quick heuristic: count properties and nested levels
      let propertyCount = 0;
      let maxDepth = 0;

      const countProperties = (item: unknown, depth = 0): boolean => {
        if (depth > 3) return true; // Too deep
        if (propertyCount > 50) return true; // Too many properties

        maxDepth = Math.max(maxDepth, depth);

        if (Array.isArray(item)) {
          if (item.length > 100) return true; // Large array
          for (let i = 0; i < Math.min(item.length, 10); i++) {
            if (countProperties(item[i], depth + 1)) return true;
          }
        } else if (item && typeof item === 'object') {
          const keys = Object.keys(item);
          propertyCount += keys.length;

          for (const key of keys.slice(0, 10)) {
            // Check first 10 properties
            if (countProperties((item as Record<string, unknown>)[key], depth + 1)) return true;
          }
        }

        return false;
      };

      return countProperties(obj);
    } catch {
      // If estimation fails, assume it might be large
      return true;
    }
  }

  /**
   * Sanitizes response data for logging with memory-efficient handling
   */
  private sanitizeResponseData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    try {
      // Use the same efficient large object detection
      if (this.isLargeObject(data)) {
        return '[Large response data - truncated for logging]';
      }

      const stringified = JSON.stringify(data);
      return stringified.length > 1000 ? `${stringified.substring(0, 1000)}... [truncated]` : data;
    } catch {
      return '[Unable to serialize response data]';
    }
  }

  /**
   * Sanitizes error information for logging
   */
  private sanitizeError(result: InsurUpResult<unknown> | InsurUpResult): unknown {
    if (result.kind === 'server-error') {
      return {
        type: result.type,
        status: result.status,
        title: result.title,
        detail: result.detail,
        traceId: result.traceId,
      };
    }

    if (result.kind === 'client-error') {
      return {
        type: result.type,
        message: result.message,
      };
    }

    return { message: 'Unknown error type' };
  }
}
