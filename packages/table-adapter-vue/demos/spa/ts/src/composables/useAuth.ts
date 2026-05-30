/**
 * Auth composable for Vue.
 *
 * Bridges the SDK auth handle (`createInsurUpAuth`) into reactive Vue state.
 * The handle and its localStorage-backed storage live in `@/lib/auth`; here we
 * mirror `auth.subscribe(...)` into a module-level `ref` so every component and
 * the router guard share one reactive source of truth.
 */

import { ref, computed, readonly } from 'vue';
import type { AuthState } from '@insurup/sdk';
import { auth, authReady, savePKCEData, loadAndClearPKCEData } from '@/lib/auth';
import { getConfig } from '@/lib/config';

// Module-level reactive state, seeded from the handle's current snapshot and
// kept in sync via a single subscription that lives for the app's lifetime.
const state = ref<AuthState>(auth.getState());
auth.subscribe((next) => {
  state.value = next;
});

// Hydration from storage doesn't emit to subscribers, so seed the state from the
// restored session once it resolves — this is what lets a persisted login survive
// a reload (and the router guard see it).
void authReady.then(() => {
  state.value = auth.getState();
});

const loginInProgress = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => state.value.isAuthenticated);

  async function login(): Promise<void> {
    loginInProgress.value = true;
    try {
      const config = getConfig();
      const {
        url,
        codeVerifier,
        state: oauthState,
      } = await auth.getAuthorizeUrl({
        redirectUri: config.redirectUri,
        scopes: config.scopes,
      });

      savePKCEData({ codeVerifier, state: oauthState });
      window.location.href = url;
    } catch (error) {
      loginInProgress.value = false;
      throw error;
    }
  }

  async function handleCallback(): Promise<void> {
    const config = getConfig();
    const pkceData = loadAndClearPKCEData();

    if (!pkceData) {
      throw new Error('No PKCE data found. Please start login again.');
    }

    const result = await auth.exchangeCode({
      // exchangeCode requires an absolute callback URL.
      callbackUrl: window.location.href,
      redirectUri: config.redirectUri,
      codeVerifier: pkceData.codeVerifier,
      state: pkceData.state,
    });

    if (!result.isSuccess) {
      throw result.error;
    }
  }

  async function logout(): Promise<void> {
    await auth.logout();
  }

  return {
    isAuthenticated,
    loginInProgress: readonly(loginInProgress),
    login,
    handleCallback,
    logout,
  };
}
