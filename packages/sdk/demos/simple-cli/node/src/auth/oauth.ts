/**
 * OAuth2/OIDC authentication module using the InsurUp SDK auth module.
 * Orchestrates the authorization code flow with PKCE (public client, no secret).
 */

import {
  createInsurUpAuth,
  type InsurUpAuth,
  type OAuthTokens,
  type TokenStorage,
} from '@insurup/sdk';
import open from 'open';
import { saveTokens, loadTokens, clearTokens } from './credential-store.js';
import { waitForCallback, type CallbackResult } from './callback-server.js';
import { getConfig } from '../config.js';

// Timeout for OAuth callback (5 minutes)
const CALLBACK_TIMEOUT = 5 * 60 * 1000;

/**
 * Keychain-backed token storage for the SDK auth module.
 * Bridges the SDK's TokenStorage contract to the credential store.
 */
const storage: TokenStorage = {
  get: () => loadTokens(),
  set: (tokens) => saveTokens(tokens),
  clear: () => clearTokens(),
};

// Lazily initialized auth handle (uses config values)
let _auth: InsurUpAuth | null = null;

/**
 * Get the auth handle.
 * Lazily initializes with config values.
 */
function getAuth(): InsurUpAuth {
  if (!_auth) {
    const config = getConfig();
    _auth = createInsurUpAuth({
      clientId: config.clientId,
      authServer: config.authServer,
      scopes: config.scopes,
      storage,
    });
  }
  return _auth;
}

/**
 * Start the OAuth2 login flow.
 * Opens the browser, waits for callback, exchanges code for tokens.
 */
export async function login(): Promise<OAuthTokens> {
  const auth = getAuth();

  // Start callback server to receive the authorization code
  const { result, url: redirectUri, stop } = await waitForCallback();

  // Build the authorize URL (generates PKCE verifier + state)
  const { url: authUrl, codeVerifier, state } = await auth.getAuthorizeUrl({ redirectUri });

  // Open browser for user authentication
  await open(authUrl);

  try {
    // Wait for callback with authorization code (with timeout)
    const callbackResult = await Promise.race<CallbackResult>([
      result,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Authentication timed out after 5 minutes')),
          CALLBACK_TIMEOUT
        )
      ),
    ]);

    if (callbackResult.error) {
      throw new Error(
        `Authorization failed: ${callbackResult.error}${
          callbackResult.errorDescription ? ` - ${callbackResult.errorDescription}` : ''
        }`
      );
    }

    if (!callbackResult.code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens (callbackUrl must be absolute; state is validated)
    const callbackUrl = new URL(redirectUri);
    callbackUrl.searchParams.set('code', callbackResult.code);
    if (callbackResult.state) {
      callbackUrl.searchParams.set('state', callbackResult.state);
    }

    const exchange = await auth.exchangeCode({
      callbackUrl,
      redirectUri,
      codeVerifier,
      state,
    });

    if (!exchange.isSuccess) {
      throw new Error(exchange.error.message);
    }

    return exchange.data;
  } finally {
    // Always stop the callback server
    stop();
  }
}

/**
 * Get a valid access token.
 * Refreshes the token transparently if expired.
 * Returns null if not logged in.
 */
export async function getAccessToken(): Promise<string | null> {
  return getAuth().getAccessToken();
}

/**
 * Get the current authentication status.
 */
export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  expiresAt?: Date;
  hasRefreshToken: boolean;
}> {
  const tokens = await getAuth().getTokens();

  if (!tokens) {
    return {
      isAuthenticated: false,
      hasRefreshToken: false,
    };
  }

  return {
    isAuthenticated: true,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
    hasRefreshToken: !!tokens.refreshToken,
  };
}

/**
 * Logout and clear stored tokens.
 */
export async function logout(): Promise<void> {
  await getAuth().logout();
}

/**
 * Check if the user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}
