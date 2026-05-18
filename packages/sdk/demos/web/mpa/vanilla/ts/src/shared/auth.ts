/**
 * OAuth2/PKCE authentication for the MPA demo.
 */

import { getConfig } from './config';

// Storage keys
const STORAGE_KEY = 'insurup_tokens';
const PKCE_KEY = 'insurup_pkce';

// Token expiry buffer (60 seconds)
const EXPIRY_BUFFER_MS = 60 * 1000;

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
}

interface PKCEData {
  codeVerifier: string;
  state: string;
}

// Mutex for preventing concurrent token refresh requests
let refreshPromise: Promise<TokenData> | null = null;

// ============ Token Storage ============

export function saveTokens(tokens: TokenData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function loadTokens(): TokenData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TokenData;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
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

// ============ PKCE Utilities ============

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function generateState(): string {
  return crypto.randomUUID();
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============ OAuth Flow ============

export async function startLogin(): Promise<void> {
  const config = getConfig();

  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  savePKCEData({ codeVerifier, state });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${config.authServer}/connect/authorize?${params.toString()}`;
}

export async function handleCallback(code: string, state: string): Promise<TokenData> {
  const config = getConfig();

  const pkceData = loadAndClearPKCEData();
  if (!pkceData) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  if (pkceData.state !== state) {
    throw new Error('State mismatch. Possible CSRF attack.');
  }

  const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code: code,
      redirect_uri: config.redirectUri,
      code_verifier: pkceData.codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokenData = await tokenResponse.json();
  const expiresAt = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined;

  const tokens: TokenData = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
  };

  saveTokens(tokens);
  return tokens;
}

async function refreshAccessToken(tokens: TokenData): Promise<TokenData> {
  if (!tokens.refreshToken) {
    throw new Error('No refresh token available');
  }

  const config = getConfig();

  const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: config.clientId,
      refresh_token: tokens.refreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Token refresh failed');
  }

  const tokenData = await tokenResponse.json();
  const expiresAt = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined;

  const newTokens: TokenData = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || tokens.refreshToken,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
  };

  saveTokens(newTokens);
  return newTokens;
}

/**
 * Gets the current access token, refreshing if necessary.
 * Uses a mutex pattern to prevent concurrent refresh requests.
 */
export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  // Check if token needs refresh
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt - EXPIRY_BUFFER_MS) {
    if (!tokens.refreshToken) {
      clearTokens();
      return null;
    }

    // Use mutex pattern to prevent concurrent refresh requests
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken(tokens).finally(() => {
        refreshPromise = null;
      });
    }

    try {
      const newTokens = await refreshPromise;
      return newTokens.accessToken;
    } catch {
      clearTokens();
      return null;
    }
  }

  return tokens.accessToken;
}

export function isAuthenticated(): boolean {
  const tokens = loadTokens();
  if (!tokens) return false;
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;
  return !isExpired;
}

export function getAuthStatus(): { isAuthenticated: boolean; expiresAt?: Date } {
  const tokens = loadTokens();
  if (!tokens) {
    return { isAuthenticated: false };
  }
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;
  return {
    isAuthenticated: !isExpired,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
  };
}

export function logout(): void {
  clearTokens();
}

/**
 * Requires authentication, attempting to refresh token if expired.
 * Redirects to login if not authenticated or refresh fails.
 */
export async function requireAuth(): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    window.location.href = '/login.html';
  }
}
