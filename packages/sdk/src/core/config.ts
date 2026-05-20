/**
 * @fileoverview SDK Configuration - Default values and configuration constants
 * @description Default configuration values for the InsurUp SDK client
 */

import type {
  InsurUpClientOptions,
  RetryOptions,
  TokenProvider,
  RequestInterceptor,
  ResponseInterceptor,
} from './options.js';

/**
 * Default retry options for transient failure handling
 * Based on standard exponential backoff defaults with InsurUp-specific settings
 */
export const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 10000,
  randomize: true,
  backoffStrategy: 'exponential',
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  onFailedAttempt: () => {}, // No-op by default
} as const;

/**
 * Default logger implementation using console
 */
export const DEFAULT_LOGGER = {
  info: (message: string, data?: unknown) => {
    if (data !== undefined) {
      console.info(message, data);
    } else {
      console.info(message);
    }
  },
  warn: (message: string, data?: unknown) => {
    if (data !== undefined) {
      console.warn(message, data);
    } else {
      console.warn(message);
    }
  },
  error: (message: string, data?: unknown) => {
    if (data !== undefined) {
      console.error(message, data);
    } else {
      console.error(message);
    }
  },
} as const;

/**
 * Required client options type (tokenProvider, onRequest, onResponse, retry remain optional)
 */
export type RequiredClientOptions = Required<
  Omit<
    InsurUpClientOptions,
    'tokenProvider' | 'onRequest' | 'onResponse' | 'retry' | 'hubsBaseUrl' | 'signalRLogLevel'
  >
> & {
  tokenProvider?: TokenProvider;
  onRequest?: RequestInterceptor;
  onResponse?: ResponseInterceptor;
  retry?: Required<RetryOptions>;
};

/**
 * Default configuration values for the InsurUp SDK client
 */
export const DEFAULT_CLIENT_OPTIONS: RequiredClientOptions = {
  baseUrl: 'https://api.insurup.com/api/',
  customHeaders: {},
  userAgent: '@insurup/sdk',
  timeoutMs: 30000,
  logLevel: 'none',
  logger: DEFAULT_LOGGER,
  retry: undefined,
  tokenProvider: undefined,
  onRequest: undefined,
  onResponse: undefined,
} as const;

/**
 * Merges user-provided options with defaults
 * @param options User-provided options
 * @returns Complete options object with defaults applied
 */
export function mergeWithDefaults(options?: InsurUpClientOptions): RequiredClientOptions {
  return {
    baseUrl: options?.baseUrl ?? DEFAULT_CLIENT_OPTIONS.baseUrl,
    customHeaders: {
      ...DEFAULT_CLIENT_OPTIONS.customHeaders,
      ...options?.customHeaders,
    },
    userAgent: options?.userAgent ?? DEFAULT_CLIENT_OPTIONS.userAgent,
    timeoutMs: options?.timeoutMs ?? DEFAULT_CLIENT_OPTIONS.timeoutMs,
    logLevel: options?.logLevel ?? DEFAULT_CLIENT_OPTIONS.logLevel,
    logger: options?.logger ?? DEFAULT_CLIENT_OPTIONS.logger,
    retry: options?.retry ? { ...DEFAULT_RETRY_OPTIONS, ...options.retry } : undefined,
    tokenProvider: options?.tokenProvider,
    onRequest: options?.onRequest,
    onResponse: options?.onResponse,
  };
}
