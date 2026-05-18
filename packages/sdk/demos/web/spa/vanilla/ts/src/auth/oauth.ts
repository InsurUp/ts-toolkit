/**
 * OAuth2/PKCE authentication flow for browser.
 * Handles authorization, token exchange, and refresh.
 */

import { getConfig } from '../config';
import { generateCodeVerifier, generateCodeChallenge, generateState } from './pkce';
import {
  saveTokens,
  loadTokens,
  clearTokens,
  savePKCEData,
  loadAndClearPKCEData,
  type TokenData,
} from './token-store';

// Buffer time before token expiry to trigger refresh (60 seconds)
const EXPIRY_BUFFER_MS = 60 * 1000;

/**
 * Start the OAuth2 login flow.
 * Redirects the user to the authorization server.
 */
export async function startLogin(): Promise<void> {
  const config = getConfig();

  // Generate PKCE values
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  // Save PKCE data for callback
  savePKCEData({ codeVerifier, state });

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${config.authServer}/connect/authorize?${params.toString()}`;

  // Redirect to authorization server
  window.location.href = authUrl;
}

/**
 * Handle the OAuth callback.
 * Exchanges the authorization code for tokens.
 */
export async function handleCallback(code: string, state: string): Promise<TokenData> {
  const config = getConfig();

  // Load and validate PKCE data
  const pkceData = loadAndClearPKCEData();
  if (!pkceData) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  // Validate state to prevent CSRF
  if (pkceData.state !== state) {
    throw new Error('State mismatch. Possible CSRF attack.');
  }

  // Exchange code for tokens
  const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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

  // Calculate expiry time
  const expiresAt = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined;

  const tokens: TokenData = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
  };

  // Save tokens
  saveTokens(tokens);

  return tokens;
}

/**
 * Refresh the access token using the refresh token.
 */
async function refreshAccessToken(tokens: TokenData): Promise<TokenData> {
  if (!tokens.refreshToken) {
    throw new Error('No refresh token available');
  }

  const config = getConfig();

  const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
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
 * Get a valid access token.
 * Automatically refreshes if expired.
 * Returns null if not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();

  if (!tokens) {
    return null;
  }

  // Check if token is expired (with buffer)
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt - EXPIRY_BUFFER_MS) {
    if (tokens.refreshToken) {
      try {
        const newTokens = await refreshAccessToken(tokens);
        return newTokens.accessToken;
      } catch {
        // Refresh failed - clear tokens
        clearTokens();
        return null;
      }
    }
    // No refresh token and expired
    clearTokens();
    return null;
  }

  return tokens.accessToken;
}

/**
 * Get the current authentication status.
 */
export function getAuthStatus(): {
  isAuthenticated: boolean;
  expiresAt?: Date;
  hasRefreshToken: boolean;
} {
  const tokens = loadTokens();

  if (!tokens) {
    return {
      isAuthenticated: false,
      hasRefreshToken: false,
    };
  }

  // Check if definitely expired (without buffer, for display)
  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;

  return {
    isAuthenticated: !isExpired,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
    hasRefreshToken: !!tokens.refreshToken,
  };
}

/**
 * Logout and clear stored tokens.
 */
export function logout(): void {
  clearTokens();
}

/**
 * Check if the user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return getAuthStatus().isAuthenticated;
}
