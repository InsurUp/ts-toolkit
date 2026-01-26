import type { TAuthConfig } from "react-oauth2-code-pkce";

// OAuth2 configuration - uses discovery-style auth server URL
const authServer = "https://auth.insurup.com";
const scopes = "openid profile offline_access core-api";

export const authConfig: TAuthConfig = {
  clientId: "demo",
  authorizationEndpoint: `${authServer}/connect/authorize`,
  tokenEndpoint: `${authServer}/connect/token`,
  redirectUri: `${window.location.origin}/callback`,
  scope: scopes,
  autoLogin: false,
  decodeToken: false,
};

export const apiConfig = {
  baseUrl: "https://api.insurup.com",
};
