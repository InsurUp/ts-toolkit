import { createContext, useContext } from 'react';
import type { AuthState, InsurUpAuth } from '@insurup/sdk';

export interface AuthContextValue {
  readonly auth: InsurUpAuth;
  readonly isAuthenticated: boolean;
  readonly tokens: AuthState['tokens'];
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

/** Reactive access to the auth session. Must be used within `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return value;
}
