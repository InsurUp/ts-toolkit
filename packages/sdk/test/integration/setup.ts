/**
 * @fileoverview Integration test setup helpers
 * @description Shared boilerplate for integration specs: client lifecycle and
 * problem-details response builders. Use `setupIntegrationTest()` at module
 * scope and the response builders inside `server.use(...)` calls.
 */

import { HttpResponse } from 'msw';
import { beforeEach } from 'vitest';
import { DefaultInsurUpClient } from '../../src/client/client';
import { BASE_URL, useMockServer } from './server';

interface IntegrationContext {
  readonly client: DefaultInsurUpClient;
}

/**
 * Registers the MSW server lifecycle and reconstructs a `DefaultInsurUpClient`
 * before each test. Call once at module scope, outside any `describe`.
 *
 * @example
 *   const t = setupIntegrationTest();
 *   it('does something', async () => {
 *     const result = await t.client.customers.getCustomer('X');
 *   });
 */
export function setupIntegrationTest(): IntegrationContext {
  useMockServer();
  let client: DefaultInsurUpClient | undefined;
  beforeEach(() => {
    client = new DefaultInsurUpClient({ baseUrl: BASE_URL, timeoutMs: 5000 });
  });
  return {
    get client() {
      if (!client) {
        throw new Error(
          'Integration client accessed outside test scope — call setupIntegrationTest() at module scope'
        );
      }
      return client;
    },
  };
}

interface ValidationErrorItem {
  readonly propertyName: string;
  readonly errorMessage: string;
  readonly attemptedValue?: unknown;
}

interface ProblemOptions {
  readonly status: number;
  readonly type: string;
  readonly title: string;
  readonly detail?: string;
  readonly validationErrors?: readonly ValidationErrorItem[];
  readonly codes?: readonly string[];
  readonly traceId?: string;
  readonly suggestions?: readonly string[];
}

/**
 * Build a Problem Details (RFC 7807) response. Prefer the named shortcuts
 * (`notFound`, `validationError`, etc.) for common cases.
 */
export function problemResponse(opts: ProblemOptions): Response {
  return HttpResponse.json(
    {
      type: opts.type,
      title: opts.title,
      status: opts.status,
      ...(opts.detail !== undefined ? { detail: opts.detail } : {}),
      ...(opts.validationErrors ? { validationErrors: opts.validationErrors } : {}),
      ...(opts.codes ? { codes: opts.codes } : {}),
      ...(opts.traceId ? { traceId: opts.traceId } : {}),
      ...(opts.suggestions ? { suggestions: opts.suggestions } : {}),
    },
    { status: opts.status, headers: { 'Content-Type': 'application/problem+json' } }
  );
}

export const notFound = (detail?: string): Response =>
  problemResponse({
    status: 404,
    type: 'https://api.insurup.com/problems/resource-not-found',
    title: 'Not Found',
    detail,
  });

export const validationError = (
  validationErrors: readonly ValidationErrorItem[],
  detail?: string
): Response =>
  problemResponse({
    status: 400,
    type: 'https://api.insurup.com/problems/input-validation',
    title: 'Validation Error',
    detail,
    validationErrors,
  });

export const conflict = (detail?: string): Response =>
  problemResponse({
    status: 409,
    type: 'https://api.insurup.com/problems/resource-duplicate',
    title: 'Conflict',
    detail,
  });

export const unauthorized = (detail?: string): Response =>
  problemResponse({
    status: 401,
    type: 'https://api.insurup.com/problems/unauthorized',
    title: 'Unauthorized',
    detail,
  });

export const upstreamError = (detail?: string): Response =>
  problemResponse({
    status: 500,
    type: 'https://api.insurup.com/problems/upstream-service',
    title: 'Internal Server Error',
    detail,
  });
