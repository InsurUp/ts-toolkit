/**
 * OAuth2/PKCE authentication for the MPA demo, backed by the SDK's first-class
 * auth module (`createInsurUpAuth`).
 *
 * This is a public browser client: PKCE only, no client secret. Because each
 * page load is a fresh module instance, the auth handle is recreated on demand
 * (see {@link getAuth}) and session state is persisted in `localStorage` via a
 * {@link TokenStorage}, so it survives navigations and reloads.
 */

import { createInsurUpAuth } from '@insurup/sdk';
import type { InsurUpAuth, TokenStorage, OAuthTokens } from '@insurup/sdk';

import { getConfig } from './config';

// Storage keys
const STORAGE_KEY = 'insurup_tokens';
const PKCE_KEY = 'insurup_pkce';

interface PKCEData {
  codeVerifier: string;
  state: string;
}

// ============ Token Storage (localStorage-backed) ============

const localTokenStorage: TokenStorage = {
  get(): OAuthTokens | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as OAuthTokens;
    } catch {
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

// ============ Auth handle (recreated per page load) ============

let authInstance: InsurUpAuth | null = null;

/**
 * Returns the shared auth handle for this page load, creating it on first use.
 * The handle reads its persisted session from {@link localTokenStorage}, so
 * authentication established on a previous page is picked up here.
 */
export function getAuth(): InsurUpAuth {
  if (!authInstance) {
    const config = getConfig();
    authInstance = createInsurUpAuth({
      clientId: config.clientId,
      authServer: config.authServer,
      scopes: config.scopes,
      storage: localTokenStorage,
    });
  }
  return authInstance;
}

// ============ PKCE handoff (login -> callback) ============

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

// ============ OAuth Flow ============

export async function startLogin(): Promise<void> {
  const config = getConfig();
  const auth = getAuth();

  const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
    redirectUri: config.redirectUri,
    scopes: config.scopes,
  });

  savePKCEData({ codeVerifier, state });

  window.location.href = url;
}

export async function handleCallback(): Promise<void> {
  const config = getConfig();
  const auth = getAuth();

  const pkceData = loadAndClearPKCEData();
  if (!pkceData) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  const result = await auth.exchangeCode({
    callbackUrl: window.location.href,
    redirectUri: config.redirectUri,
    codeVerifier: pkceData.codeVerifier,
    state: pkceData.state,
  });

  if (!result.isSuccess) {
    throw new Error(result.error.description || result.error.message || 'Token exchange failed');
  }
}

/**
 * Gets the current access token, refreshing transparently when needed.
 * Returns `null` when there is no usable session.
 */
export async function getAccessToken(): Promise<string | null> {
  return getAuth().getAccessToken();
}

export function isAuthenticated(): boolean {
  const { tokens } = getAuth().getState();
  if (!tokens) return false;
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;
  return !isExpired;
}

export function getAuthStatus(): { isAuthenticated: boolean; expiresAt?: Date } {
  const { tokens } = getAuth().getState();
  if (!tokens) {
    return { isAuthenticated: false };
  }
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;
  return {
    isAuthenticated: !isExpired,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
  };
}

export async function logout(): Promise<void> {
  await getAuth().logout();
}

/**
 * Requires authentication, attempting to refresh the token if expired.
 * Redirects to login if not authenticated or refresh fails.
 */
export async function requireAuth(): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    window.location.href = '/login.html';
  }
}
