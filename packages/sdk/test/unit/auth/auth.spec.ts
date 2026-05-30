/**
 * @fileoverview createInsurUpAuth integration tests
 * @description Exercises the public auth surface against a mocked authorization
 * server (MSW): client credentials, refresh, authorization code + PKCE, OIDC
 * discovery, OAuth error mapping, and DefaultInsurUpClient token wiring.
 */

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createInsurUpAuth } from '../../../src/auth/auth';
import { OAuthError } from '../../../src/auth/errors';
import { DefaultInsurUpClient } from '../../../src/client/client';
import type { InsurUpAuthConfig } from '../../../src/auth/types';

const AUTH_SERVER = 'https://auth.insurup.com';
const TOKEN_ENDPOINT = `${AUTH_SERVER}/connect/token`;
const AUTHORIZE_ENDPOINT = `${AUTH_SERVER}/connect/authorize`;
const DISCOVERY_ENDPOINT = `${AUTH_SERVER}/.well-known/openid-configuration`;

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
      const tokens = await auth.loginWithClientCredentials({ scopes: ['core-api'] });

      expect(tokens.accessToken).toBe('at-1');
      expect(tokens.refreshToken).toBe('rt-1');
      expect(tokens.expiresAt).toBeGreaterThan(Date.now());
      expect(body).toContain('grant_type=client_credentials');
      expect(body).toContain('scope=core-api');
      expect(auth.getState().isAuthenticated).toBe(true);
      expect(await auth.getAccessToken()).toBe('at-1');
    });

    it('throws OAuthError when no client secret is available', async () => {
      const auth = createInsurUpAuth({ clientId: 'demo', tokenEndpoint: TOKEN_ENDPOINT });
      await expect(auth.loginWithClientCredentials()).rejects.toBeInstanceOf(OAuthError);
    });

    it('maps a token endpoint error response to OAuthError', async () => {
      server.use(
        http.post(TOKEN_ENDPOINT, () =>
          HttpResponse.json(
            { error: 'invalid_client', error_description: 'bad secret' },
            { status: 400 }
          )
        )
      );

      const auth = makeAuth();
      await expect(auth.loginWithClientCredentials()).rejects.toMatchObject({
        name: 'OAuthError',
        code: 'invalid_client',
        description: 'bad secret',
      });
    });
  });

  describe('refresh', () => {
    it('refreshes an expired access token on getAccessToken', async () => {
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
      await auth.loginWithClientCredentials();
      expect(await auth.getAccessToken()).toBe('at-2');
      expect(calls).toBe(2);
    });
  });

  describe('authorization code + PKCE', () => {
    it('builds an authorize URL with S256 PKCE and the requested scopes', async () => {
      const auth = makeAuth();
      const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
        redirectUri: 'http://localhost:8080/cb',
        scopes: ['openid', 'core-api'],
      });

      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe(AUTHORIZE_ENDPOINT);
      expect(parsed.searchParams.get('response_type')).toBe('code');
      expect(parsed.searchParams.get('client_id')).toBe('demo');
      expect(parsed.searchParams.get('redirect_uri')).toBe('http://localhost:8080/cb');
      expect(parsed.searchParams.get('code_challenge_method')).toBe('S256');
      expect(parsed.searchParams.get('scope')).toBe('openid core-api');
      expect(parsed.searchParams.get('state')).toBe(state);

      // The challenge must be the base64url SHA-256 of the verifier (verified
      // independently of oauth4webapi).
      const expectedChallenge = await s256Challenge(codeVerifier);
      expect(parsed.searchParams.get('code_challenge')).toBe(expectedChallenge);
    });

    it('generates a unique verifier and state per call', async () => {
      const auth = makeAuth();
      const a = await auth.getAuthorizeUrl({ redirectUri: 'http://localhost/cb' });
      const b = await auth.getAuthorizeUrl({ redirectUri: 'http://localhost/cb' });
      expect(a.codeVerifier).not.toBe(b.codeVerifier);
      expect(a.state).not.toBe(b.state);
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
      const { codeVerifier, state } = await auth.getAuthorizeUrl({
        redirectUri: 'http://localhost:8080/cb',
      });
      const tokens = await auth.exchangeCode({
        callbackUrl: `http://localhost:8080/cb?code=auth-code-123&state=${state}`,
        redirectUri: 'http://localhost:8080/cb',
        codeVerifier,
        state,
      });

      expect(tokens.accessToken).toBe('at-x');
      expect(body).toContain('grant_type=authorization_code');
      expect(body).toContain('code=auth-code-123');
      expect(body).toContain('code_verifier=');
      expect(auth.getState().isAuthenticated).toBe(true);
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
      const tokens = await auth.loginWithClientCredentials();
      expect(tokens.accessToken).toBe('at-disc');
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
      await auth.loginWithClientCredentials();
      const client = new DefaultInsurUpClient({ auth });
      try {
        await client.agents.getCurrentAgent();
        expect(authHeader).toBe('Bearer at-bearer');
      } finally {
        await client.close();
      }
    });
  });
});
