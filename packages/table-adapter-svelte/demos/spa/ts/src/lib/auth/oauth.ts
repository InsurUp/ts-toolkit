/**
 * OAuth2/PKCE authentication via the SDK's first-class auth module.
 *
 * The SDK's `createInsurUpAuth` handles PKCE generation, the authorize URL,
 * the code exchange, token persistence, and refresh. This module wires it to a
 * localStorage-backed `TokenStorage` (so sessions survive reloads) and exposes
 * browser-facing `login()` / `handleCallback()` helpers.
 *
 * Public browser client: PKCE only, no client secret.
 */

import { createInsurUpAuth } from '@insurup/sdk';
import type { AuthResult, OAuthTokens, TokenStorage } from '@insurup/sdk';

import { getConfig } from '$lib/config';

const STORAGE_KEY = 'table-adapter-svelte-demo-tokens';
const PKCE_KEY = 'table-adapter-svelte-demo-pkce';

/**
 * PKCE flow data stashed in sessionStorage between the authorize redirect and
 * the callback. Survives the full-page navigation to the auth server.
 */
interface PKCEData {
  codeVerifier: string;
  state: string;
}

function savePKCEData(data: PKCEData): void {
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(data));
}

function loadAndClearPKCEData(): PKCEData | null {
  const stored = sessionStorage.getItem(PKCE_KEY);
  if (!stored) return null;

  sessionStorage.removeItem(PKCE_KEY);

  try {
    return JSON.parse(stored) as PKCEData;
  } catch {
    return null;
  }
}

/**
 * localStorage-backed token storage so sessions persist across reloads.
 */
const localStorageTokenStorage: TokenStorage = {
  get(): OAuthTokens | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as OAuthTokens;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  },
  set(tokens: OAuthTokens): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },
  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};

const config = getConfig();

/**
 * The single shared auth handle. Created once, backed by localStorage.
 * Endpoints are pinned (discovery is CORS-blocked in the browser); `authServer`
 * carries the trailing slash the server reports as its issuer so the `iss`
 * callback check (RFC 9207) passes.
 */
export const auth = createInsurUpAuth({
  clientId: config.clientId,
  authServer: config.authServer,
  authorizationEndpoint: config.authorizationEndpoint,
  tokenEndpoint: config.tokenEndpoint,
  scopes: config.scopes,
  storage: localStorageTokenStorage,
  // Dev only: the token endpoint is routed through the http Vite dev proxy.
  allowInsecureRequests: import.meta.env.DEV,
});

/**
 * Eagerly hydrate the handle from storage so a reload reflects the restored
 * session as soon as the first async read resolves.
 */
export const authReady: Promise<OAuthTokens | null> = auth.getTokens();

/**
 * Start the OAuth2 login flow.
 * Builds the authorize URL, stashes the PKCE verifier + state, then redirects.
 */
export async function login(): Promise<void> {
  const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
    redirectUri: config.redirectUri,
  });

  savePKCEData({ codeVerifier, state });

  window.location.href = url;
}

/**
 * Handle the OAuth callback by exchanging the authorization code for tokens.
 * Returns the SDK's discriminated `AuthResult` so callers can branch on success.
 */
export async function handleCallback(): Promise<AuthResult<OAuthTokens>> {
  const pkceData = loadAndClearPKCEData();
  if (!pkceData) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  return auth.exchangeCode({
    callbackUrl: window.location.href,
    redirectUri: config.redirectUri,
    codeVerifier: pkceData.codeVerifier,
    state: pkceData.state,
  });
}
