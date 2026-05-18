/**
 * OAuth2/PKCE authentication for the MPA demo.
 * @module auth
 */

import { getConfig } from './config.js';
import { STORAGE_KEYS } from './constants.js';

/** @type {number} Buffer time before token expiry to trigger refresh (60 seconds) */
const EXPIRY_BUFFER_MS = 60 * 1000;

/**
 * @typedef {Object} TokenData
 * @property {string} accessToken
 * @property {string} [refreshToken]
 * @property {number} [expiresAt]
 * @property {string} tokenType
 */

/**
 * Mutex for preventing concurrent token refresh requests.
 * @type {Promise<TokenData>|null}
 */
let refreshPromise = null;

// ============ Token Storage ============

/**
 * Saves tokens to localStorage.
 * @param {TokenData} tokens - The tokens to save
 */
export function saveTokens(tokens) {
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
}

/**
 * Loads tokens from localStorage.
 * @returns {TokenData|null} The stored tokens or null if not found
 */
export function loadTokens() {
  const stored = localStorage.getItem(STORAGE_KEYS.TOKENS);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clears tokens from localStorage.
 */
export function clearTokens() {
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
}

/**
 * Saves PKCE data to sessionStorage.
 * @param {{ codeVerifier: string, state: string }} data - PKCE data to save
 */
function savePKCEData(data) {
  sessionStorage.setItem(STORAGE_KEYS.PKCE, JSON.stringify(data));
}

/**
 * Loads and clears PKCE data from sessionStorage.
 * @returns {{ codeVerifier: string, state: string }|null} The PKCE data or null
 */
function loadAndClearPKCEData() {
  const stored = sessionStorage.getItem(STORAGE_KEYS.PKCE);
  if (!stored) return null;
  sessionStorage.removeItem(STORAGE_KEYS.PKCE);
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ============ PKCE Utilities ============

async function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function generateState() {
  return crypto.randomUUID();
}

function base64UrlEncode(bytes) {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ============ OAuth Flow ============

export async function startLogin() {
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

/**
 * @param {string} code
 * @param {string} state
 * @returns {Promise<TokenData>}
 */
export async function handleCallback(code, state) {
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

  const tokens = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
  };

  saveTokens(tokens);
  return tokens;
}

async function refreshAccessToken(tokens) {
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

  const newTokens = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || tokens.refreshToken,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
  };

  saveTokens(newTokens);
  return newTokens;
}

/**
 * Checks if the token is expired or about to expire.
 * @param {TokenData} tokens - The token data to check
 * @returns {boolean} True if the token is expired or within the expiry buffer
 */
function isTokenExpired(tokens) {
  if (!tokens.expiresAt) return false;
  return Date.now() >= tokens.expiresAt - EXPIRY_BUFFER_MS;
}

/**
 * Gets the current access token, refreshing if necessary.
 * Uses a mutex pattern to prevent concurrent refresh requests.
 *
 * @returns {Promise<string|null>} The access token or null if not authenticated
 */
export async function getAccessToken() {
  const tokens = loadTokens();
  if (!tokens) return null;

  // Check if token needs refresh
  if (isTokenExpired(tokens)) {
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

/**
 * @returns {boolean}
 */
export function isAuthenticated() {
  const tokens = loadTokens();
  if (!tokens) return false;
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;
  return !isExpired;
}

export function getAuthStatus() {
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

export function logout() {
  clearTokens();
}

/**
 * Requires authentication, attempting to refresh token if expired.
 * Redirects to login if not authenticated or refresh fails.
 * @returns {Promise<void>}
 */
export async function requireAuth() {
  const token = await getAccessToken();
  if (!token) {
    window.location.href = '/login.html';
  }
}
