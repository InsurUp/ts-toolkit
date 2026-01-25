/**
 * Auth module exports.
 */

// Re-export PKCE utilities from the library
export { generateCodeVerifier } from "@badgateway/oauth2-client";

export {
  login,
  logout,
  getAccessToken,
  getAuthStatus,
  isAuthenticated,
} from "./oauth";
export {
  saveTokens,
  loadTokens,
  clearTokens,
  type TokenData,
} from "./credential-store";
export { default as openBrowser } from "open";
export { waitForCallback, type CallbackResult } from "./callback-server";
