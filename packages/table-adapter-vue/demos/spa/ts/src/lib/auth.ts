/**
 * Auth singleton for the Vue demo.
 *
 * Wires the SDK's first-class auth module (`createInsurUpAuth`) for a PUBLIC
 * browser client (authorization code + PKCE, NO client secret). The handle is
 * created once at module load and backed by a localStorage `TokenStorage` so
 * sessions survive page reloads.
 */

import { createInsurUpAuth, type OAuthTokens, type TokenStorage } from '@insurup/sdk';
import { getConfig } from './config';

const TOKENS_KEY = 'table-adapter-vue-demo-tokens';
const PKCE_KEY = 'table-adapter-vue-demo-pkce';

/** PKCE values stashed between the authorize redirect and the callback exchange. */
export interface PKCEData {
  codeVerifier: string;
  state: string;
}

/** A `TokenStorage` backed by `localStorage`, so tokens persist across reloads. */
function createLocalStorageTokenStorage(): TokenStorage {
  return {
    get(): OAuthTokens | null {
      const stored = localStorage.getItem(TOKENS_KEY);
      if (!stored) return null;
      try {
        return JSON.parse(stored) as OAuthTokens;
      } catch {
        localStorage.removeItem(TOKENS_KEY);
        return null;
      }
    },
    set(tokens: OAuthTokens): void {
      localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
    },
    clear(): void {
      localStorage.removeItem(TOKENS_KEY);
    },
  };
}

const config = getConfig();

/**
 * The single auth handle for the app. Public client: PKCE only, no
 * `clientSecret`. Endpoints are pinned (discovery is CORS-blocked in the
 * browser).
 */
export const auth = createInsurUpAuth({
  clientId: config.clientId,
  authServer: config.authServer,
  authorizationEndpoint: config.authorizationEndpoint,
  tokenEndpoint: config.tokenEndpoint,
  scopes: config.scopes,
  storage: createLocalStorageTokenStorage(),
  // Dev only: the token endpoint is routed through the http Vite dev proxy.
  allowInsecureRequests: import.meta.env.DEV,
});

/**
 * Eagerly hydrates the handle from storage. `getState()` only reflects persisted
 * tokens after the first async read, so we kick this off at module load and
 * expose the promise; `useAuth` awaits it to seed its reactive state, ensuring
 * the router guard sees a restored session immediately on reload.
 */
export const authReady: Promise<OAuthTokens | null> = auth.getTokens();

/** Stashes PKCE state in sessionStorage ahead of the authorize redirect. */
export function savePKCEData(data: PKCEData): void {
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(data));
}

/** Reads and clears the stashed PKCE state on the callback route. */
export function loadAndClearPKCEData(): PKCEData | null {
  const stored = sessionStorage.getItem(PKCE_KEY);
  if (!stored) return null;
  sessionStorage.removeItem(PKCE_KEY);
  try {
    return JSON.parse(stored) as PKCEData;
  } catch {
    return null;
  }
}
