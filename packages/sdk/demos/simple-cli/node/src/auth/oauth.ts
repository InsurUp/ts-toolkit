/**
 * OAuth2/OIDC authentication module using @badgateway/oauth2-client.
 * Orchestrates the authorization code flow with PKCE.
 */

import {
  OAuth2Client,
  generateCodeVerifier,
  type OAuth2Token,
} from "@badgateway/oauth2-client";
import open from "open";
import { saveTokens, loadTokens, clearTokens, type TokenData } from "./credential-store.js";
import { waitForCallback, type CallbackResult } from "./callback-server.js";
import { getConfig } from "../config.js";

// Timeout for OAuth callback (5 minutes)
const CALLBACK_TIMEOUT = 5 * 60 * 1000;

// Lazily initialized OAuth2 client (uses config values)
let _client: OAuth2Client | null = null;

/**
 * Get the OAuth2 client instance.
 * Lazily initializes with config values.
 */
function getOAuthClient(): OAuth2Client {
  if (!_client) {
    const config = getConfig();
    _client = new OAuth2Client({
      server: config.authServer,
      clientId: config.clientId,
    });
  }
  return _client;
}

/**
 * Convert library token to our TokenData format.
 */
function toTokenData(token: OAuth2Token): TokenData {
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken ?? undefined,
    expiresAt: token.expiresAt ?? undefined,
    tokenType: "Bearer",
  };
}

/**
 * Convert our TokenData to library token format.
 */
function toOAuth2Token(data: TokenData): OAuth2Token {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? null,
    expiresAt: data.expiresAt ?? null,
  };
}

/**
 * Start the OAuth2 login flow.
 * Opens the browser, waits for callback, exchanges code for tokens.
 */
export async function login(): Promise<TokenData> {
  // Generate PKCE code verifier
  const codeVerifier = await generateCodeVerifier();

  // Start callback server to receive the authorization code
  const { result, url: redirectUri, stop } = await waitForCallback();

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Get config for scopes
  const config = getConfig();
  const client = getOAuthClient();

  // Get authorization URL with PKCE
  const authUrl = await client.authorizationCode.getAuthorizeUri({
    redirectUri,
    state,
    codeVerifier,
    scope: config.scopes,
  });

  // Open browser for user authentication
  await open(authUrl);

  try {
    // Wait for callback with authorization code (with timeout)
    const callbackResult = await Promise.race<CallbackResult>([
      result,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Authentication timed out after 5 minutes")),
          CALLBACK_TIMEOUT
        )
      ),
    ]);

    if (callbackResult.error) {
      throw new Error(
        `Authorization failed: ${callbackResult.error}${
          callbackResult.errorDescription
            ? ` - ${callbackResult.errorDescription}`
            : ""
        }`
      );
    }

    if (!callbackResult.code) {
      throw new Error("No authorization code received");
    }

    // Verify state
    if (callbackResult.state !== state) {
      throw new Error("State mismatch - possible CSRF attack");
    }

    // Exchange code for tokens using the library
    const token = await client.authorizationCode.getToken({
      code: callbackResult.code,
      redirectUri,
      codeVerifier,
    });

    // Convert and save tokens
    const tokenData = toTokenData(token);
    await saveTokens(tokenData);

    return tokenData;
  } finally {
    // Always stop the callback server
    stop();
  }
}

/**
 * Refresh the access token using the refresh token.
 */
async function refreshAccessToken(tokenData: TokenData): Promise<TokenData> {
  const oauth2Token = toOAuth2Token(tokenData);
  const newToken = await getOAuthClient().refreshToken(oauth2Token);

  const newTokenData = toTokenData(newToken);
  await saveTokens(newTokenData);

  return newTokenData;
}

/**
 * Get a valid access token.
 * Refreshes the token if expired.
 * Returns null if not logged in.
 */
export async function getAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();

  if (!tokens) {
    return null;
  }

  // Check if token is expired (with 60 second buffer)
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt - 60000) {
    if (tokens.refreshToken) {
      try {
        const newTokens = await refreshAccessToken(tokens);
        return newTokens.accessToken;
      } catch {
        // Refresh failed - clear tokens and return null
        await clearTokens();
        return null;
      }
    }
    // No refresh token and expired - clear and return null
    await clearTokens();
    return null;
  }

  return tokens.accessToken;
}

/**
 * Get the current authentication status.
 */
export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  expiresAt?: Date;
  hasRefreshToken: boolean;
}> {
  const tokens = await loadTokens();

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
  await clearTokens();
}

/**
 * Check if the user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}
