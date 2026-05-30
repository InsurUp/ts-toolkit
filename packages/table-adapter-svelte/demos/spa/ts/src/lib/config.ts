/**
 * Configuration for the Svelte demo.
 */

export interface Config {
  authServer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
  scopes: string[];
  redirectUri: string;
  apiBaseUrl: string;
}

export function getConfig(): Config {
  const authServerBase = 'https://auth.insurup.com';
  return {
    // `authServer` is the OAuth issuer and must match the server's issuer
    // EXACTLY — note the trailing slash — for the `iss` callback check
    // (RFC 9207). `authorizationEndpoint` is a full-page redirect, so it targets
    // the auth server directly. `tokenEndpoint` is a browser `fetch`, which the
    // auth server does NOT serve CORS for — so we point it at this app's own
    // origin and let the Vite dev proxy forward it same-origin (see
    // vite.config.ts), sidestepping CORS. Endpoints are pinned (not discovered)
    // because the discovery document is also CORS-blocked.
    authServer: `${authServerBase}/`,
    authorizationEndpoint: `${authServerBase}/connect/authorize`,
    tokenEndpoint: `${window.location.origin}/connect/token`,
    clientId: 'demo',
    scopes: ['openid', 'profile', 'offline_access', 'core-api'],
    redirectUri: `${window.location.origin}/callback`,
    apiBaseUrl: 'https://api.insurup.com',
  };
}
