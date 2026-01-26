import type { TAuthConfig } from "react-oauth2-code-pkce";

// OAuth2 configuration - uses discovery-style auth server URL
const authServer =
  import.meta.env.VITE_AUTH_SERVER || "https://auth.insurup.com";
const scopes = import.meta.env.VITE_SCOPES || "openid profile offline_access core-api";

export const authConfig: TAuthConfig = {
  clientId: import.meta.env.VITE_CLIENT_ID || "demo",
  authorizationEndpoint: `${authServer}/connect/authorize`,
  tokenEndpoint: `${authServer}/connect/token`,
  redirectUri: `${window.location.origin}/callback`,
  scope: scopes,
  autoLogin: false,
  decodeToken: false, // Token may not be a standard JWT
};

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.insurup.com",
};
