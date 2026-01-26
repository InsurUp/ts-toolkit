/**
 * Auth store for Svelte.
 * Provides reactive authentication state using Svelte 5 runes.
 */

import { loadTokens, clearTokens, type TokenData } from "./token-store";

export { startLogin, handleCallback, logout, getAccessToken, isAuthenticated, parseIdTokenClaims } from "./oauth";
export type { TokenData } from "./token-store";

/**
 * Create a reactive auth state.
 * Returns functions to get and update auth state.
 */
export function createAuthState() {
  let tokens = $state<TokenData | null>(loadTokens());
  let loginInProgress = $state(false);

  function setTokens(newTokens: TokenData | null) {
    tokens = newTokens;
  }

  function setLoginInProgress(value: boolean) {
    loginInProgress = value;
  }

  function logOut() {
    clearTokens();
    tokens = null;
  }

  function refresh() {
    tokens = loadTokens();
  }

  return {
    get tokens() { return tokens; },
    get token() { return tokens?.accessToken ?? null; },
    get isAuthenticated() { return !!tokens?.accessToken; },
    get loginInProgress() { return loginInProgress; },
    setTokens,
    setLoginInProgress,
    logOut,
    refresh,
  };
}

// Global auth state singleton
let authStateInstance: ReturnType<typeof createAuthState> | null = null;

export function getAuthState() {
  if (!authStateInstance) {
    authStateInstance = createAuthState();
  }
  return authStateInstance;
}
