/**
 * Configuration management for the CLI.
 * Loads configuration from environment variables.
 */

/**
 * CLI configuration options.
 */
export interface Config {
  /** OAuth2 authorization server URL */
  authServer: string;
  /** OAuth2 client ID */
  clientId: string;
  /** OAuth2 scopes to request */
  scopes: string[];
  /** API base URL (optional) */
  apiBaseUrl?: string;
  /** Current environment name */
  environment: string;
}

/**
 * Default configuration values.
 */
const defaults: Config = {
  authServer: "https://auth.insurup.com",
  clientId: "demo",
  scopes: ["openid", "profile", "offline_access", "core-api"],
  environment: "production",
};

/** Cached config */
let cachedConfig: Config | null = null;

/**
 * Load configuration from environment variables.
 */
export async function loadConfig(): Promise<Config> {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    ...defaults,
    ...(process.env.INSURUP_AUTH_SERVER && {
      authServer: process.env.INSURUP_AUTH_SERVER,
    }),
    ...(process.env.INSURUP_CLIENT_ID && {
      clientId: process.env.INSURUP_CLIENT_ID,
    }),
    ...(process.env.INSURUP_SCOPES && {
      scopes: process.env.INSURUP_SCOPES.split(",").map((s) => s.trim()),
    }),
    ...(process.env.INSURUP_API_URL && {
      apiBaseUrl: process.env.INSURUP_API_URL,
    }),
    ...(process.env.INSURUP_ENV && {
      environment: process.env.INSURUP_ENV,
    }),
  };

  return cachedConfig;
}

/**
 * Get the current configuration (must call loadConfig first).
 */
export function getConfig(): Config {
  if (!cachedConfig) {
    throw new Error("Config not loaded. Call loadConfig() first.");
  }
  return cachedConfig;
}
