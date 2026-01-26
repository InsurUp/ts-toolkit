/**
 * Configuration for the Vue demo.
 */

export interface Config {
  authServer: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  apiBaseUrl: string;
}

export function getConfig(): Config {
  return {
    authServer: "https://auth.insurup.com",
    clientId: "demo",
    scopes: ["openid", "profile", "offline_access", "core-api"],
    redirectUri: `${window.location.origin}/callback`,
    apiBaseUrl: "https://api.insurup.com",
  };
}
