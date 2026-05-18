/**
 * Configuration for the Vue demo.
 * Uses environment variables with sensible defaults.
 */

export interface Config {
  /** OAuth2 authorization server URL */
  authServer: string;
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
  return {
    authServer: import.meta.env.VITE_AUTH_SERVER || 'https://auth.insurup.com',
    clientId: import.meta.env.VITE_CLIENT_ID || 'demo',
    scopes: (import.meta.env.VITE_SCOPES || 'openid profile offline_access core-api').split(' '),
    redirectUri: `${window.location.origin}/callback`,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.insurup.com',
  };
}
