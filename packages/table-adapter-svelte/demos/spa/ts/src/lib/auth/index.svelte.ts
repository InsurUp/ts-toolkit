/**
 * Auth store for Svelte, backed by the SDK's first-class auth module.
 *
 * The SDK's `createInsurUpAuth` owns PKCE generation, the authorize URL,
 * the code exchange, token storage, and refresh. This module exposes the
 * single shared auth handle plus a reactive Svelte 5 store mirroring its state.
 */

import type { AuthState } from '@insurup/sdk';

import { auth, authReady, login, handleCallback } from './oauth';

export { auth, login, handleCallback };

/**
 * Create a reactive auth state mirroring the SDK auth handle.
 * A `$state` is seeded from `auth.getState()` and kept in sync via
 * `auth.subscribe`.
 */
export function createAuthState() {
  let state = $state<AuthState>(auth.getState());
  let loginInProgress = $state(false);

  // Keep the reactive snapshot in sync with login, refresh, and logout.
  auth.subscribe((next) => {
    state = next;
  });

  // Hydration from storage doesn't emit to subscribers, so seed the state from
  // the restored session once it resolves — this lets a persisted login survive
  // a reload.
  void authReady.then(() => {
    state = auth.getState();
  });

  function setLoginInProgress(value: boolean) {
    loginInProgress = value;
  }

  async function logOut() {
    await auth.logout();
  }

  return {
    get tokens() {
      return state.tokens;
    },
    get token() {
      return state.tokens?.accessToken ?? null;
    },
    get isAuthenticated() {
      return state.isAuthenticated;
    },
    get loginInProgress() {
      return loginInProgress;
    },
    setLoginInProgress,
    logOut,
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
