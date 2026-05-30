/**
 * @fileoverview createInsurUpAuth integration tests
 * @description Exercises the public auth surface against a mocked authorization
 * server (MSW): client credentials, refresh, authorization code + PKCE, OIDC
 * discovery, the AuthResult error model, token storage/persistence,
 * subscriptions, and DefaultInsurUpClient token wiring.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createInsurUpAuth } from '../../../src/auth/auth';
import { OAuthError } from '../../../src/auth/errors';
import type { AuthResult } from '../../../src/auth/result';
import { createMemoryTokenStorage } from '../../../src/auth/storage';
import type { InsurUpAuthConfig } from '../../../src/auth/types';
import { DefaultInsurUpClient } from '../../../src/client/client';

const AUTH_SERVER = 'https://auth.insurup.com';
const TOKEN_ENDPOINT = `${AUTH_SERVER}/connect/token`;
const AUTHORIZE_ENDPOINT = `${AUTH_SERVER}/connect/authorize`;
const PAR_ENDPOINT = `${AUTH_SERVER}/connect/par`;
const DISCOVERY_ENDPOINT = `${AUTH_SERVER}/.well-known/openid-configuration`;
const CALLBACK = 'http://localhost:8080/cb';

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeAuth(overrides: Partial<InsurUpAuthConfig> = {}) {
  return createInsurUpAuth({
    clientId: 'demo',
    clientSecret: 'secret',
    tokenEndpoint: TOKEN_ENDPOINT,
    authorizationEndpoint: AUTHORIZE_ENDPOINT,
    ...overrides,
  });
}

/** Asserts an AuthResult succeeded and returns its data, narrowing the union. */
function unwrap<T>(result: AuthResult<T>): T {
  if (!result.isSuccess) {
    throw new Error(
      `expected success, got auth-error: ${result.error.code ?? result.error.message}`
    );
  }
  return result.data;
}

/** A token endpoint that answers each grant with a distinct access token. */
function tokenEndpoint(options: { withRefreshToken?: boolean } = {}) {
  const { withRefreshToken = true } = options;
  return http.post(TOKEN_ENDPOINT, async ({ request }) => {
    const body = await request.text();
    const base = { token_type: 'Bearer', expires_in: 3600 };
    if (body.includes('grant_type=refresh_token')) {
      return HttpResponse.json({ ...base, access_token: 'at-refreshed', refresh_token: 'rt-2' });
    }
    if (body.includes('grant_type=authorization_code')) {
      return HttpResponse.json({ ...base, access_token: 'at-code', refresh_token: 'rt-code' });
    }
    return HttpResponse.json({
      ...base,
      access_token: 'at-1',
      ...(withRefreshToken ? { refresh_token: 'rt-1' } : {}),
      scope: 'core-api',
    });
  });
}

/**
 * base64url(SHA-256(verifier)) via Web Crypto — an independent S256 challenge
 * computed without oauth4webapi (and without node:crypto).
 */
async function s256Challenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

describe('createInsurUpAuth', () => {
  describe('client credentials', () => {
    it('logs in, stores tokens, and serves the access token', async () => {
      let body = '';
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json({
            access_token: 'at-1',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'rt-1',
            scope: 'core-api',
          });
        })
      );

      const auth = makeAuth();
      const tokens = unwrap(await auth.loginWithClientCredentials({ scopes: ['core-api'] }));

      expect(tokens.accessToken).toBe('at-1');
      expect(tokens.refreshToken).toBe('rt-1');
      expect(tokens.expiresAt).toBeGreaterThan(Date.now());
      expect(body).toContain('grant_type=client_credentials');
      expect(body).toContain('scope=core-api');
      expect(auth.getState().isAuthenticated).toBe(true);
      expect(await auth.getAccessToken()).toBe('at-1');
    });

    it('falls back to the configured scopes when none are passed', async () => {
      let body = '';
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json({
            access_token: 'at-1',
            token_type: 'Bearer',
            expires_in: 3600,
          });
        })
      );

      const auth = makeAuth({ scopes: ['core-api', 'reports'] });
      unwrap(await auth.loginWithClientCredentials());
      // form-urlencoded body encodes the space between scopes as '+'
      expect(body).toContain('scope=core-api+reports');
    });

    it('uses a per-call client secret over the configured one', async () => {
      let body = '';
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json({
            access_token: 'at-1',
            token_type: 'Bearer',
            expires_in: 3600,
          });
        })
      );

      const auth = makeAuth({ clientSecret: 'configured' });
      unwrap(await auth.loginWithClientCredentials({ clientSecret: 'per-call' }));
      expect(body).toContain('client_secret=per-call');
    });

    it('accepts both known granular scopes and arbitrary server-defined scopes', async () => {
      let scope: string | null = null;
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          scope = new URLSearchParams(await request.text()).get('scope');
          return HttpResponse.json({ access_token: 'at', token_type: 'Bearer', expires_in: 3600 });
        })
      );

      const auth = makeAuth();
      // 'customer:read' is a typed InsurUpScope; 'tenant:custom' exercises the
      // string escape hatch — both must compile and reach the wire.
      unwrap(await auth.loginWithClientCredentials({ scopes: ['customer:read', 'tenant:custom'] }));
      expect(scope).toBe('customer:read tenant:custom');
    });

    it('returns an auth-error result when no client secret is available', async () => {
      const auth = createInsurUpAuth({ clientId: 'demo', tokenEndpoint: TOKEN_ENDPOINT });
      const result = await auth.loginWithClientCredentials();

      expect(result.isSuccess).toBe(false);
      expect(result.kind).toBe('auth-error');
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error).toBeInstanceOf(OAuthError);
      expect(auth.getState().isAuthenticated).toBe(false);
    });

    it('maps a token endpoint error response to an auth-error result', async () => {
      server.use(
        http.post(TOKEN_ENDPOINT, () =>
          HttpResponse.json(
            { error: 'invalid_client', error_description: 'bad secret' },
            { status: 400 }
          )
        )
      );

      const auth = makeAuth();
      const result = await auth.loginWithClientCredentials();

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error).toMatchObject({
        name: 'OAuthError',
        code: 'invalid_client',
        description: 'bad secret',
        status: 400,
      });
      // A failed login must not leave a half-authenticated session.
      expect(auth.getState().isAuthenticated).toBe(false);
    });
  });

  describe('refresh', () => {
    it('refreshes an expired access token transparently on getAccessToken', async () => {
      let calls = 0;
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          calls += 1;
          const body = await request.text();
          if (body.includes('grant_type=client_credentials')) {
            // Short-lived: with the 60s buffer this is immediately "expired".
            return HttpResponse.json({
              access_token: 'at-1',
              token_type: 'Bearer',
              expires_in: 1,
              refresh_token: 'rt-1',
            });
          }
          expect(body).toContain('grant_type=refresh_token');
          expect(body).toContain('refresh_token=rt-1');
          return HttpResponse.json({
            access_token: 'at-2',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'rt-2',
          });
        })
      );

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      expect(await auth.getAccessToken()).toBe('at-2');
      expect(calls).toBe(2);
    });

    it('refreshes explicitly via refresh()', async () => {
      server.use(tokenEndpoint());

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      const refreshed = unwrap(await auth.refresh());

      expect(refreshed.accessToken).toBe('at-refreshed');
      expect(await auth.getAccessToken()).toBe('at-refreshed');
    });

    it('returns an auth-error result when there is no refresh token', async () => {
      server.use(tokenEndpoint({ withRefreshToken: false }));

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      const result = await auth.refresh();

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error).toBeInstanceOf(OAuthError);
    });

    it('returns an auth-error result when the server rejects the refresh', async () => {
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          const body = await request.text();
          if (body.includes('grant_type=refresh_token')) {
            return HttpResponse.json({ error: 'invalid_grant' }, { status: 400 });
          }
          return HttpResponse.json({
            access_token: 'at-1',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'rt-1',
          });
        })
      );

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      const result = await auth.refresh();

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error.code).toBe('invalid_grant');
    });
  });

  describe('getAccessToken', () => {
    it('returns null when there is no session', async () => {
      const auth = makeAuth();
      expect(await auth.getAccessToken()).toBeNull();
      expect(auth.getState().isAuthenticated).toBe(false);
    });

    it('clears an expired session that has no refresh token and returns null', async () => {
      server.use(tokenEndpoint({ withRefreshToken: false }));

      const auth = makeAuth();
      // expires_in default is 3600, so override to make it instantly expired.
      server.use(
        http.post(TOKEN_ENDPOINT, () =>
          HttpResponse.json({ access_token: 'at-1', token_type: 'Bearer', expires_in: 1 })
        )
      );
      unwrap(await auth.loginWithClientCredentials());

      expect(await auth.getAccessToken()).toBeNull();
      expect(await auth.getTokens()).toBeNull();
      expect(auth.getState().isAuthenticated).toBe(false);
    });
  });

  describe('authorization code + PKCE', () => {
    it('builds an authorize URL with S256 PKCE and the requested scopes', async () => {
      const auth = makeAuth();
      const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
        redirectUri: CALLBACK,
        scopes: ['openid', 'core-api'],
      });

      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe(AUTHORIZE_ENDPOINT);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('client_id')).toBe('demo');
      expect(parsed.searchParams.get('redirect_uri')).toBe(CALLBACK);
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('scope')).toBe('openid core-api');
      expect(parsed.searchParams.get('state')).toBe(state);

      // The challenge must be the base64url SHA-256 of the verifier (verified
      // independently of oauth4webapi).
      const expectedChallenge = await s256Challenge(codeVerifier);
      expect(parsed.searchParams.get('code_challenge')).toBe(expectedChallenge);
    });

    it('falls back to configured scopes and appends extra params', async () => {
      const auth = makeAuth({ scopes: ['openid', 'core-api'] });
      const { url } = await auth.getAuthorizeUrl({
        redirectUri: CALLBACK,
        extraParams: { prompt: 'login', login_hint: 'a@b.com' },
      });

      const params = new URL(url).searchParams;
      expect(params.get('scope')).toBe('openid core-api');
      expect(params.get('prompt')).toBe('login');
      expect(params.get('login_hint')).toBe('a@b.com');
    });

    it('generates a unique verifier and state per call', async () => {
      const auth = makeAuth();
      const a = await auth.getAuthorizeUrl({ redirectUri: CALLBACK });
      const b = await auth.getAuthorizeUrl({ redirectUri: CALLBACK });
      expect(a.codeVerifier).not.toBe(b.codeVerifier);
      expect(a.state).not.toBe(b.state);
    });

    it('throws when the server has no authorization endpoint', async () => {
      // Only a token endpoint configured → no authorization_endpoint to build from.
      const auth = createInsurUpAuth({ clientId: 'demo', tokenEndpoint: TOKEN_ENDPOINT });
      await expect(auth.getAuthorizeUrl({ redirectUri: CALLBACK })).rejects.toBeInstanceOf(
        OAuthError
      );
    });

    it('exchanges an authorization code callback for tokens', async () => {
      let body = '';
      server.use(
        http.post(TOKEN_ENDPOINT, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json({
            access_token: 'at-x',
            token_type: 'Bearer',
            expires_in: 3600,
            refresh_token: 'rt-x',
          });
        })
      );

      const auth = makeAuth();
      const { codeVerifier, state } = await auth.getAuthorizeUrl({ redirectUri: CALLBACK });
      const tokens = unwrap(
        await auth.exchangeCode({
          callbackUrl: `${CALLBACK}?code=auth-code-123&state=${state}`,
          redirectUri: CALLBACK,
          codeVerifier,
          state,
        })
      );

      expect(tokens.accessToken).toBe('at-x');
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth-code-123');
      expect(body).toContain('code_verifier=');
      expect(auth.getState().isAuthenticated).toBe(true);
    });

    it('returns an auth-error result on a state mismatch', async () => {
      const auth = makeAuth();
      const { codeVerifier, state } = await auth.getAuthorizeUrl({ redirectUri: CALLBACK });
      const result = await auth.exchangeCode({
        callbackUrl: `${CALLBACK}?code=auth-code-123&state=TAMPERED`,
        redirectUri: CALLBACK,
        codeVerifier,
        state,
      });

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error).toBeInstanceOf(OAuthError);
    });

    it('returns an auth-error result when the callback carries an error param', async () => {
      const auth = makeAuth();
      const { codeVerifier, state } = await auth.getAuthorizeUrl({ redirectUri: CALLBACK });
      const result = await auth.exchangeCode({
        callbackUrl: `${CALLBACK}?error=access_denied&state=${state}`,
        redirectUri: CALLBACK,
        codeVerifier,
        state,
      });

      expect(result.isSuccess).toBe(false);
      if (result.isSuccess) throw new Error('expected failure');
      expect(result.error.code).toBe('access_denied');
    });
  });

  describe('pushed authorization requests (PAR)', () => {
    /**
     * A PAR endpoint that records the pushed body and answers with a one-shot
     * `request_uri` (RFC 9126 mandates HTTP 201 on success).
     */
    function parEndpoint(capture: { body?: string }, requestUri: string) {
      return http.post(PAR_ENDPOINT, async ({ request }) => {
        capture.body = await request.text();
        return HttpResponse.json({ request_uri: requestUri, expires_in: 60 }, { status: 201 });
      });
    }

    it('pushes the params and returns a URL carrying only client_id + request_uri', async () => {
      const capture: { body?: string } = {};
      const requestUri = 'urn:ietf:params:oauth:request_uri:abc123';
      server.use(parEndpoint(capture, requestUri));

      const auth = makeAuth({ pushedAuthorizationRequestEndpoint: PAR_ENDPOINT });
      const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
        redirectUri: CALLBACK,
        scopes: ['openid', 'core-api'],
        usePAR: true,
      });

      // The user-visible redirect leaks nothing but client_id + request_uri.
      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe(AUTHORIZE_ENDPOINT);
      expect(parsed.searchParams.get('client_id')).toBe('demo');
      expect(parsed.searchParams.get('request_uri')).toBe(requestUri);
      expect(parsed.searchParams.get('redirect_uri')).toBeNull();
      expect(parsed.searchParams.get('code_challenge')).toBeNull();
      expect(parsed.searchParams.get('scope')).toBeNull();
      expect(parsed.searchParams.get('state')).toBeNull();

      // The sensitive params instead travel over the back-channel push.
      const pushed = new URLSearchParams(capture.body);
      expect(pushed.get('client_id')).toBe('demo');
      expect(pushed.get('redirect_uri')).toBe(CALLBACK);
      expect(pushed.get('response_type')).toBe('code');
      expect(pushed.get('code_challenge_method')).toBe('S256');
      expect(pushed.get('scope')).toBe('openid core-api');
      expect(pushed.get('state')).toBe(state);
      expect(pushed.get('code_challenge')).toBe(await s256Challenge(codeVerifier));
    });

    it('authenticates the push with the client secret for confidential clients', async () => {
      const capture: { body?: string } = {};
      server.use(parEndpoint(capture, 'urn:req:1'));

      const auth = makeAuth({
        clientSecret: 'par-secret',
        pushedAuthorizationRequestEndpoint: PAR_ENDPOINT,
      });
      await auth.getAuthorizeUrl({ redirectUri: CALLBACK, usePAR: true });

      expect(new URLSearchParams(capture.body).get('client_secret')).toBe('par-secret');
    });

    it('omits client authentication for public (PKCE-only) clients', async () => {
      const capture: { body?: string } = {};
      server.use(parEndpoint(capture, 'urn:req:2'));

      const auth = createInsurUpAuth({
        clientId: 'demo',
        authorizationEndpoint: AUTHORIZE_ENDPOINT,
        pushedAuthorizationRequestEndpoint: PAR_ENDPOINT,
      });
      await auth.getAuthorizeUrl({ redirectUri: CALLBACK, usePAR: true });

      const pushed = new URLSearchParams(capture.body);
      expect(pushed.get('client_id')).toBe('demo');
      expect(pushed.get('client_secret')).toBeNull();
    });

    it('appends extra params to the push, not the redirect', async () => {
      const capture: { body?: string } = {};
      server.use(parEndpoint(capture, 'urn:req:3'));

      const auth = makeAuth({ pushedAuthorizationRequestEndpoint: PAR_ENDPOINT });
      const { url } = await auth.getAuthorizeUrl({
        redirectUri: CALLBACK,
        usePAR: true,
        extraParams: { prompt: 'login', login_hint: 'a@b.com' },
      });

      expect(new URL(url).searchParams.get('prompt')).toBeNull();
      const pushed = new URLSearchParams(capture.body);
      expect(pushed.get('prompt')).toBe('login');
      expect(pushed.get('login_hint')).toBe('a@b.com');
    });

    it('discovers the PAR endpoint via OIDC', async () => {
      const capture: { body?: string } = {};
      server.use(
        http.get(DISCOVERY_ENDPOINT, () =>
          HttpResponse.json({
            issuer: AUTH_SERVER,
            token_endpoint: TOKEN_ENDPOINT,
            authorization_endpoint: AUTHORIZE_ENDPOINT,
            pushed_authorization_request_endpoint: PAR_ENDPOINT,
            response_types_supported: ['code'],
          })
        ),
        parEndpoint(capture, 'urn:req:discovered')
      );

      const auth = createInsurUpAuth({
        clientId: 'demo',
        clientSecret: 'secret',
        authServer: AUTH_SERVER,
      });
      const { url } = await auth.getAuthorizeUrl({ redirectUri: CALLBACK, usePAR: true });

      expect(new URL(url).searchParams.get('request_uri')).toBe('urn:req:discovered');
      expect(capture.body).toBeDefined();
    });

    it('throws an OAuthError when the server advertises no PAR endpoint', async () => {
      // makeAuth() configures only token + authorization endpoints — no PAR.
      const auth = makeAuth();
      await expect(
        auth.getAuthorizeUrl({ redirectUri: CALLBACK, usePAR: true })
      ).rejects.toBeInstanceOf(OAuthError);
    });

    it('maps a PAR endpoint error response to a thrown OAuthError', async () => {
      server.use(
        http.post(PAR_ENDPOINT, () =>
          HttpResponse.json(
            { error: 'invalid_request', error_description: 'bad redirect_uri' },
            { status: 400 }
          )
        )
      );

      const auth = makeAuth({ pushedAuthorizationRequestEndpoint: PAR_ENDPOINT });
      await expect(
        auth.getAuthorizeUrl({ redirectUri: CALLBACK, usePAR: true })
      ).rejects.toMatchObject({ name: 'OAuthError', code: 'invalid_request' });
    });

    it('builds a standard authorize URL when usePAR is not set, even if a PAR endpoint exists', async () => {
      const auth = makeAuth({ pushedAuthorizationRequestEndpoint: PAR_ENDPOINT });
      const { url } = await auth.getAuthorizeUrl({ redirectUri: CALLBACK, scopes: ['openid'] });

      const parsed = new URL(url);
      expect(parsed.searchParams.get('request_uri')).toBeNull();
      expect(parsed.searchParams.get('code_challenge')).not.toBeNull();
      expect(parsed.searchParams.get('redirect_uri')).toBe(CALLBACK);
    });
  });

  describe('discovery', () => {
    it('discovers endpoints via OIDC when not explicitly configured', async () => {
      server.use(
        http.get(DISCOVERY_ENDPOINT, () =>
          HttpResponse.json({
            issuer: AUTH_SERVER,
            token_endpoint: TOKEN_ENDPOINT,
            authorization_endpoint: AUTHORIZE_ENDPOINT,
            response_types_supported: ['code'],
          })
        ),
        http.post(TOKEN_ENDPOINT, () =>
          HttpResponse.json({ access_token: 'at-disc', token_type: 'Bearer', expires_in: 3600 })
        )
      );

      const auth = createInsurUpAuth({
        clientId: 'demo',
        clientSecret: 'secret',
        authServer: AUTH_SERVER,
      });
      const tokens = unwrap(await auth.loginWithClientCredentials());
      expect(tokens.accessToken).toBe('at-disc');
    });

    it('skips discovery when explicit endpoints are configured', async () => {
      let discoveryCalls = 0;
      server.use(
        http.get(DISCOVERY_ENDPOINT, () => {
          discoveryCalls += 1;
          return HttpResponse.json({ issuer: AUTH_SERVER, token_endpoint: TOKEN_ENDPOINT });
        }),
        tokenEndpoint()
      );

      const auth = makeAuth(); // tokenEndpoint + authorizationEndpoint set
      unwrap(await auth.loginWithClientCredentials());
      expect(discoveryCalls).toBe(0);
    });
  });

  describe('storage and lifecycle', () => {
    it('persists tokens through a shared storage and hydrates lazily', async () => {
      server.use(tokenEndpoint());
      const storage = createMemoryTokenStorage();

      const writer = makeAuth({ storage });
      unwrap(await writer.loginWithClientCredentials());

      // A fresh handle over the same storage has no hot state until it reads.
      const reader = makeAuth({ storage });
      expect(reader.getState().isAuthenticated).toBe(false); // not hydrated yet
      expect(await reader.getAccessToken()).toBe('at-1'); // hydrates from storage
      expect(reader.getState().isAuthenticated).toBe(true);
    });

    it('logout clears the session and storage', async () => {
      server.use(tokenEndpoint());
      const storage = createMemoryTokenStorage();
      const auth = makeAuth({ storage });

      unwrap(await auth.loginWithClientCredentials());
      await auth.logout();

      expect(auth.getState().isAuthenticated).toBe(false);
      expect(await auth.getTokens()).toBeNull();
      expect(await auth.getAccessToken()).toBeNull();
      expect(await storage.get()).toBeNull();
    });

    it('notifies subscribers on login and logout, and stops after unsubscribe', async () => {
      server.use(tokenEndpoint());
      const auth = makeAuth();
      const events: boolean[] = [];
      const unsubscribe = auth.subscribe((state) => events.push(state.isAuthenticated));

      unwrap(await auth.loginWithClientCredentials());
      await auth.logout();
      unsubscribe();
      await auth.loginWithClientCredentials();

      expect(events).toEqual([true, false]);
    });
  });

  describe('DefaultInsurUpClient integration', () => {
    it('injects the access token as a Bearer header via the auth option', async () => {
      let authHeader: string | null = null;
      server.use(
        http.post(TOKEN_ENDPOINT, () =>
          HttpResponse.json({ access_token: 'at-bearer', token_type: 'Bearer', expires_in: 3600 })
        ),
        http.get('https://api.insurup.com/api/agents/me', ({ request }) => {
          authHeader = request.headers.get('authorization');
          return HttpResponse.json({ id: 'agent-1' });
        })
      );

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      const client = new DefaultInsurUpClient({ auth });
      try {
        await client.agents.getCurrentAgent();
        expect(authHeader).toBe('Bearer at-bearer');
      } finally {
        await client.close();
      }
    });

    it('lets an explicit tokenProvider take precedence over auth', async () => {
      let authHeader: string | null = null;
      server.use(
        tokenEndpoint(),
        http.get('https://api.insurup.com/api/agents/me', ({ request }) => {
          authHeader = request.headers.get('authorization');
          return HttpResponse.json({ id: 'agent-1' });
        })
      );

      const auth = makeAuth();
      unwrap(await auth.loginWithClientCredentials());
      const client = new DefaultInsurUpClient({ auth, tokenProvider: () => 'explicit-token' });
      try {
        await client.agents.getCurrentAgent();
        expect(authHeader).toBe('Bearer explicit-token');
      } finally {
        await client.close();
      }
    });
  });

  describe('allowInsecureRequests', () => {
    const HTTP_TOKEN_ENDPOINT = 'http://localhost:8080/connect/token';

    it('rejects an http token endpoint by default (HTTPS is required)', async () => {
      // oauth4webapi enforces HTTPS before sending, so no request is made.
      const auth = makeAuth({ tokenEndpoint: HTTP_TOKEN_ENDPOINT });
      const result = await auth.loginWithClientCredentials({ scopes: ['core-api'] });

      expect(result.isSuccess).toBe(false);
      if (!result.isSuccess) {
        expect(result.error.message).toMatch(/https/i);
      }
    });

    it('permits an http token endpoint when enabled (e.g. behind a dev proxy)', async () => {
      let body = '';
      server.use(
        http.post(HTTP_TOKEN_ENDPOINT, async ({ request }) => {
          body = await request.text();
          return HttpResponse.json({
            access_token: 'at-insecure',
            token_type: 'Bearer',
            expires_in: 3600,
          });
        })
      );

      const auth = makeAuth({ tokenEndpoint: HTTP_TOKEN_ENDPOINT, allowInsecureRequests: true });
      const tokens = unwrap(await auth.loginWithClientCredentials({ scopes: ['core-api'] }));

      expect(tokens.accessToken).toBe('at-insecure');
      expect(body).toContain('grant_type=client_credentials');
    });
  });
});
