/**
 * @fileoverview MSW Server Setup
 * @description Minimal MSW server with no default handlers. Each spec registers
 * the handlers it needs via `server.use(...)` per test. A catch-all surfaces
 * unhandled requests so missing mocks fail loudly instead of silently.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

export { BASE_URL } from './config';

export const server = setupServer(
  // Catch-all — surfaces missing handlers immediately
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return HttpResponse.json(
      {
        type: 'https://api.insurup.com/problems/endpoint-not-found',
        title: 'Not Found',
        detail: 'The requested endpoint does not exist',
        status: 404,
      },
      { status: 404 }
    );
  })
);

/**
 * Register MSW server lifecycle hooks. Call once at the top of an integration
 * spec file (outside any describe block).
 */
export function useMockServer() {
  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
