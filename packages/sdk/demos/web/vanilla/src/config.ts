/**
 * Configuration for the web demo.
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
  apiBaseUrl?: string;
}

/**
 * Default configuration values.
 */
const defaults: Config = {
  authServer: "https://auth.insurup.com",
  clientId: "demo",
  scopes: ["openid", "profile", "offline_access", "core-api"],
  redirectUri: `${window.location.origin}/callback`,
};

let cachedConfig: Config | null = null;

/**
 * Load configuration from environment/localStorage.
 */
export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  // Check for stored config overrides in localStorage
  const storedConfig = localStorage.getItem("insurup_config");
  const overrides = storedConfig ? JSON.parse(storedConfig) : {};

  const config: Config = {
    ...defaults,
    ...overrides,
    // Update redirect URI based on current origin
    redirectUri: `${window.location.origin}/callback`,
  };

  cachedConfig = config;
  return config;
}

/**
 * Get the current configuration.
 */
export function getConfig(): Config {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}

/**
 * Update configuration overrides.
 */
export function updateConfig(updates: Partial<Config>): void {
  const current = getConfig();
  const newConfig = { ...current, ...updates };
  localStorage.setItem("insurup_config", JSON.stringify(newConfig));
  cachedConfig = newConfig;
}

/**
 * Reset configuration to defaults.
 */
export function resetConfig(): void {
  localStorage.removeItem("insurup_config");
  cachedConfig = null;
}
