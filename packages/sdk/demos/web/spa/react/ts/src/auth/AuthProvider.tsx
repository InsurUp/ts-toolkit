import { useMemo, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import type { AuthState } from '@insurup/sdk';
import { auth, login, logout } from './auth';
import { AuthContext } from './context';
import type { AuthContextValue } from './context';

/**
 * Cached snapshot for `useSyncExternalStore`. `auth.getState()` returns a fresh
 * object on every call, which would make `useSyncExternalStore` loop. We cache
 * the last snapshot and only replace it when the meaningful fields change, so
 * `getSnapshot` returns a stable reference between real updates.
 */
let cachedState: AuthState = auth.getState();

function getSnapshot(): AuthState {
  const next = auth.getState();
  if (next.isAuthenticated !== cachedState.isAuthenticated || next.tokens !== cachedState.tokens) {
    cachedState = next;
  }
  return cachedState;
}

function subscribe(listener: () => void): () => void {
  return auth.subscribe(() => listener());
}

/**
 * Provides reactive auth state to the app. State is sourced from the module-level
 * {@link auth} singleton via `useSyncExternalStore`, so it re-renders on login,
 * refresh, and logout.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      isAuthenticated: state.isAuthenticated,
      tokens: state.tokens,
      login,
      logout,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
