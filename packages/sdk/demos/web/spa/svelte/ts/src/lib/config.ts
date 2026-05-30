/**
 * Configuration for the Svelte demo.
 * Uses environment variables with sensible defaults.
 */

export interface Config {
  /** OAuth2 issuer (must match the server's issuer exactly, trailing slash incl.) */
  authServer: string;
  /** OAuth2 authorization endpoint URL */
  authorizationEndpoint: string;
  /** OAuth2 token endpoint URL */
  tokenEndpoint: string;
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 scopes to request */
  scopes: string[];
  /** OAuth2 redirect URI for callback */
  redirectUri: string;
  /** API base URL */
  apiBaseUrl: string;
}

/**
 * Get configuration from environment variables.
 */
export function getConfig(): Config {
  // Base without a trailing slash, used to build endpoint URLs.
  const authServerBase = (import.meta.env.VITE_AUTH_SERVER || 'https://auth.insurup.com').replace(
    /\/+$/,
    ''
  );
  return {
    // `authServer` is the OAuth issuer in the SDK and must match the server's
    // issuer EXACTLY — note the trailing slash — because the server returns an
    // `iss` callback param (RFC 9207) the SDK validates against it. We pin the
    // endpoints (instead of OIDC discovery) because the discovery document is
    // CORS-blocked from the browser.
    authServer: `${authServerBase}/`,
    authorizationEndpoint: `${authServerBase}/connect/authorize`,
    tokenEndpoint: `${authServerBase}/connect/token`,
    clientId: import.meta.env.VITE_CLIENT_ID || 'demo',
    scopes: (import.meta.env.VITE_SCOPES || 'openid profile offline_access core-api').split(' '),
    redirectUri: `${window.location.origin}/callback`,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.insurup.com',
  };
}
