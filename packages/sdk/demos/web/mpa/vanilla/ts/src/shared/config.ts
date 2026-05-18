/**
 * Configuration for the MPA demo.
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
  apiBaseUrl?: string;
}

const defaults: Config = {
  authServer: 'https://auth.insurup.com',
  clientId: 'demo',
  scopes: ['openid', 'profile', 'offline_access', 'core-api'],
  redirectUri: `${window.location.origin}/callback`,
};

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const storedConfig = localStorage.getItem('insurup_config');
  const overrides = storedConfig ? JSON.parse(storedConfig) : {};

  const config: Config = {
    ...defaults,
    ...overrides,
    redirectUri: `${window.location.origin}/callback`,
  };

  cachedConfig = config;
  return config;
}

export function getConfig(): Config {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}
