/**
 * @fileoverview InsurUp Client Options - Configuration for the SDK client
 * @description Configuration for the SDK client
 */

import type { InsurUpResult } from './result.js';

/**
 * Logging levels for request/response debugging
 */
export type LogLevel = 'none' | 'basic' | 'detailed';

/**
 * Custom logger interface for request/response logging
 */
export interface Logger {
  /**
   * Log informational messages
   */
  info(message: string, data?: unknown): void;

  /**
   * Log warning messages
   */
  warn(message: string, data?: unknown): void;

  /**
   * Log error messages
   */
  error(message: string, data?: unknown): void;
}

/**
 * Backoff strategy for retry delays
 * - exponential: delay = minTimeout * (factor ^ attempt) - grows quickly
 * - linear: delay = minTimeout * attempt - grows steadily
 * - constant: delay = minTimeout - fixed delay between retries
 */
export type BackoffStrategy = 'exponential' | 'linear' | 'constant';

/**
 * Retry configuration for handling transient failures
 * Built-in implementation providing configurable backoff with jitter.
 * Disabled by default. To enable, provide an object with retry settings.
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  readonly retries?: number;

  /**
   * The exponential factor to use
   * @default 2
   */
  readonly factor?: number;

  /**
   * The number of milliseconds before starting the first retry
   * @default 1000
   */
  readonly minTimeout?: number;

  /**
   * The maximum number of milliseconds between two retries
   * @default 10000
   */
  readonly maxTimeout?: number;

  /**
   * Randomizes the timeouts by multiplying with a factor between 1 to 2
   * @default true
   */
  readonly randomize?: boolean;

  /**
   * The backoff strategy to use between retries
   * - exponential: delay = minTimeout * (factor ^ attempt)
   * - linear: delay = minTimeout * attempt
   * - constant: delay = minTimeout
   * @default "exponential"
   */
  readonly backoffStrategy?: BackoffStrategy;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  readonly retryableStatusCodes?: readonly number[];

  /**
   * Called when a retry is made
   */
  readonly onFailedAttempt?: (error: {
    attemptNumber: number;
    retriesLeft: number;
    name: string;
    message: string;
    error: Error;
  }) => void;
}

/**
 * Token provider function that returns an authentication token
 * Can be async to support dynamic token retrieval
 */
export type TokenProvider = () => string | Promise<string | null> | null;

/**
 * Request configuration passed to interceptors
 */
export interface RequestConfig {
  /**
   * The full URL of the request
   */
  readonly url: string;

  /**
   * HTTP method (GET, POST, PUT, DELETE, PATCH)
   */
  readonly method: string;

  /**
   * Request headers
   */
  readonly headers: Record<string, string>;

  /**
   * Request body (if any)
   */
  readonly body?: unknown;
}

/**
 * Request interceptor function called before each request is sent
 * Can modify the request configuration or perform side effects
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function called after each response is received
 * Can transform the result or perform side effects
 */
export type ResponseInterceptor = <T>(
  result: InsurUpResult<T>,
  config: RequestConfig
) => InsurUpResult<T> | Promise<InsurUpResult<T>>;

/**
 * Per-request options for individual API calls
 * Allows overriding client-level defaults and controlling request lifecycle
 */
export interface RequestOptions {
  /**
   * AbortSignal for request cancellation
   * Useful for cancelling requests on component unmount (React) or user navigation
   *
   * @example
   * ```typescript
   * const controller = new AbortController();
   * const result = await client.customers.getCustomer('id', { signal: controller.signal });
   * // Later: controller.abort();
   * ```
   */
  readonly signal?: AbortSignal;

  /**
   * Per-request timeout in milliseconds
   * Overrides the client-level timeoutMs for this specific request
   *
   * @example
   * ```typescript
   * // Override default timeout for a slow operation
   * const result = await client.customers.getCustomer('id', { timeoutMs: 60000 });
   * ```
   */
  readonly timeoutMs?: number;

  /**
   * Additional headers for this specific request
   * These headers will be merged with client-level customHeaders
   */
  readonly headers?: Record<string, string>;
}

/**
 * Configuration options for the InsurUp SDK client
 */
export interface InsurUpClientOptions {
  /**
   * The base URL of the InsurUp API
   *
   * @default "https://api.insurup.com/api/"
   */
  readonly baseUrl?: string;

  /**
   * Custom headers to include with every request
   * These headers will be merged with the default headers for each request
   */
  readonly customHeaders?: Readonly<Record<string, string>>;

  /**
   * User agent string for HTTP requests
   * Note: In browser environments, this may be ignored due to CORS restrictions
   *
   * @default "@insurup/sdk/1.0.0"
   */
  readonly userAgent?: string;

  /**
   * Request timeout in milliseconds
   * This is a simplified adaptation of the .NET TimeoutStrategy options
   *
   * @default 30000 (30 seconds)
   */
  readonly timeoutMs?: number;

  /**
   * Logging configuration for request/response debugging
   *
   * @default 'none'
   */
  readonly logLevel?: LogLevel;

  /**
   * Custom logger implementation
   * If not provided, console will be used when logLevel is not 'none'
   */
  readonly logger?: Logger;

  /**
   * Retry configuration for handling transient failures
   * If not provided, no retries will be attempted
   */
  readonly retry?: RetryOptions;

  /**
   * Optional token provider function for authentication
   * Called before each request to get the current authentication token
   * The token will be automatically added to the Authorization header as 'Bearer {token}'
   */
  readonly tokenProvider?: TokenProvider;

  /**
   * Optional request interceptor called before each request is sent
   * Allows modifying request configuration or performing side effects
   */
  readonly onRequest?: RequestInterceptor;

  /**
   * Optional response interceptor called after each response is received
   * Allows transforming the result or performing side effects
   */
  readonly onResponse?: ResponseInterceptor;
}
