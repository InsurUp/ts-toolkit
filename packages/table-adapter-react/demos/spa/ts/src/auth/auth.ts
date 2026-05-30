import { createInsurUpAuth } from '@insurup/sdk';
import type { InsurUpAuth } from '@insurup/sdk';
import { authConfig } from '@/config';
import { createLocalStorageTokenStorage } from './storage';

/**
 * The single, app-wide auth handle. Public browser client: PKCE only, no
 * client secret. Endpoints are pinned (discovery is CORS-blocked in the
 * browser) and tokens persist across reloads via localStorage.
 */
export const auth: InsurUpAuth = createInsurUpAuth({
  clientId: authConfig.clientId,
  authServer: authConfig.authServer,
  authorizationEndpoint: authConfig.authorizationEndpoint,
  tokenEndpoint: authConfig.tokenEndpoint,
  scopes: authConfig.scopes,
  storage: createLocalStorageTokenStorage(),
  // Dev only: the token endpoint is routed through the http Vite dev proxy.
  allowInsecureRequests: import.meta.env.DEV,
});

/** Session-storage keys for the in-flight PKCE handshake. */
const PKCE_VERIFIER_KEY = 'table-adapter-react-demo-pkce-verifier';
const PKCE_STATE_KEY = 'table-adapter-react-demo-pkce-state';

/**
 * Starts the authorization-code (PKCE) login: builds the authorize URL, stashes
 * the code verifier and state for the callback, then navigates to the IdP.
 */
export async function login(): Promise<void> {
  const { url, codeVerifier, state } = await auth.getAuthorizeUrl({
    redirectUri: authConfig.redirectUri,
  });
  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);
  window.location.assign(url);
}

/** Clears the stored session. */
export async function logout(): Promise<void> {
  await auth.logout();
}

/** Reads (and clears) the stashed PKCE handshake values for the callback. */
export function takePkceHandshake(): { codeVerifier: string | null; state: string | null } {
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  const state = sessionStorage.getItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  return { codeVerifier, state };
}
