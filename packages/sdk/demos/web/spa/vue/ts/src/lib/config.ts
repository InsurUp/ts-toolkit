/**
 * Configuration for the Vue demo.
 * Uses environment variables with sensible defaults.
 */

export interface Config {
  /** OAuth2 authorization server URL */
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
  const authServer = import.meta.env.VITE_AUTH_SERVER || 'https://auth.insurup.com';
  return {
    authServer,
    // Pin the endpoints to the same URLs the demo has always used, so the SDK
    // skips OIDC discovery and behaves identically to the previous hand-rolled flow.
    authorizationEndpoint: `${authServer}/connect/authorize`,
    tokenEndpoint: `${authServer}/connect/token`,
    clientId: import.meta.env.VITE_CLIENT_ID || 'demo',
    scopes: (import.meta.env.VITE_SCOPES || 'openid profile offline_access core-api').split(' '),
    redirectUri: `${window.location.origin}/callback`,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.insurup.com',
  };
}
