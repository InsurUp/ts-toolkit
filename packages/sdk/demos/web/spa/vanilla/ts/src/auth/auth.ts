/**
 * Authentication using the InsurUp SDK's first-class auth module.
 *
 * This replaces the previous hand-rolled OAuth2/PKCE implementation with
 * `createInsurUpAuth`. The auth handle is created once with a localStorage-backed
 * `TokenStorage` so sessions survive page reloads. This is a PUBLIC browser
 * client: it uses PKCE and never sends a client secret.
 */

import {
  createInsurUpAuth,
  type AuthState,
  type InsurUpAuth,
  type OAuthTokens,
  type TokenStorage,
} from '@insurup/sdk';
import { getConfig } from '../config';

const TOKEN_STORAGE_KEY = 'insurup_tokens';
const PKCE_STORAGE_KEY = 'insurup_pkce';

/** PKCE data retained between the authorize redirect and the callback exchange. */
interface PendingPkce {
  codeVerifier: string;
  state: string;
}

/**
 * A localStorage-backed {@link TokenStorage} so sessions survive page reloads.
 */
function createLocalStorageTokenStorage(key: string): TokenStorage {
  return {
    get(): OAuthTokens | null {
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }
      try {
        return JSON.parse(stored) as OAuthTokens;
      } catch {
        return null;
      }
    },
    set(tokens: OAuthTokens): void {
      localStorage.setItem(key, JSON.stringify(tokens));
    },
    clear(): void {
      localStorage.removeItem(key);
    },
  };
}

let authInstance: InsurUpAuth | null = null;

/**
 * Get the shared {@link InsurUpAuth} handle, creating it once on first use.
 */
export function getAuth(): InsurUpAuth {
  if (!authInstance) {
    const config = getConfig();
    authInstance = createInsurUpAuth({
      clientId: config.clientId,
      authServer: config.authServer,
      scopes: config.scopes,
      storage: createLocalStorageTokenStorage(TOKEN_STORAGE_KEY),
    });
  }
  return authInstance;
}

/**
 * Stash the PKCE verifier and state for the in-flight authorization request.
 */
function savePendingPkce(data: PendingPkce): void {
  sessionStorage.setItem(PKCE_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Load and remove the PKCE data saved before the authorize redirect.
 */
function loadAndClearPendingPkce(): PendingPkce | null {
  const stored = sessionStorage.getItem(PKCE_STORAGE_KEY);
  if (!stored) {
    return null;
  }
  sessionStorage.removeItem(PKCE_STORAGE_KEY);
  try {
    return JSON.parse(stored) as PendingPkce;
  } catch {
    return null;
  }
}

/**
 * Start the OAuth2 authorization-code (PKCE) login flow.
 *
 * Builds the authorize URL, stashes the PKCE verifier and state in
 * sessionStorage for the callback, then redirects to the authorization server.
 */
export async function startLogin(): Promise<void> {
  const config = getConfig();
  const auth = getAuth();

  const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
    redirectUri: config.redirectUri,
    scopes: config.scopes,
  });

  savePendingPkce({ codeVerifier, state });

  location.assign(url);
}

/**
 * Handle the OAuth callback by exchanging the authorization code for tokens.
 *
 * Reads the PKCE verifier and state saved before the redirect, then calls the
 * SDK's `exchangeCode`. Throws on missing PKCE data or an exchange failure so
 * the callback page can surface the error.
 */
export async function handleCallback(callbackUrl: string): Promise<OAuthTokens> {
  const config = getConfig();
  const auth = getAuth();

  const pending = loadAndClearPendingPkce();
  if (!pending) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  const result = await auth.exchangeCode({
    callbackUrl,
    redirectUri: config.redirectUri,
    codeVerifier: pending.codeVerifier,
    state: pending.state,
  });

  if (!result.isSuccess) {
    throw result.error;
  }

  return result.data;
}

/**
 * The current authentication status, derived from the SDK auth state.
 */
export interface AuthStatus {
  isAuthenticated: boolean;
  expiresAt?: Date;
  hasRefreshToken: boolean;
}

/**
 * Derive a display-friendly auth status from the SDK auth state.
 *
 * The SDK's `isAuthenticated` only reports whether a token set is held (it may
 * be expired); we treat an expired token as not authenticated for display.
 */
export function getAuthStatus(): AuthStatus {
  const { tokens } = getAuth().getState();

  if (!tokens) {
    return { isAuthenticated: false, hasRefreshToken: false };
  }

  const isExpired = tokens.expiresAt ? Date.now() >= tokens.expiresAt : false;

  return {
    isAuthenticated: !isExpired,
    expiresAt: tokens.expiresAt ? new Date(tokens.expiresAt) : undefined,
    hasRefreshToken: !!tokens.refreshToken,
  };
}

/**
 * Whether the user is currently authenticated (token held and not expired).
 */
export function isAuthenticated(): boolean {
  return getAuthStatus().isAuthenticated;
}

/**
 * Get a valid access token, refreshing transparently when needed.
 * Returns `null` when there is no usable session.
 */
export function getAccessToken(): Promise<string | null> {
  return getAuth().getAccessToken();
}

/**
 * Subscribe to auth state changes (login, refresh, logout).
 * Returns an unsubscribe function.
 */
export function subscribeAuth(listener: (state: AuthState) => void): () => void {
  return getAuth().subscribe(listener);
}

/**
 * Logout and clear the stored session.
 */
export function logout(): Promise<void> {
  return getAuth().logout();
}
