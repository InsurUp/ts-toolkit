/**
 * @fileoverview Auth module barrel
 * @description Public surface of the InsurUp auth module.
 */

export { createInsurUpAuth } from './auth.js';
export { OAuthError } from './errors.js';
export type { OAuthErrorOptions } from './errors.js';
export { createMemoryTokenStorage } from './storage.js';
export { DEFAULT_AUTH_SERVER } from './oauth-client.js';

export type { AuthResult, AuthSuccess, AuthFailure } from './result.js';

export type {
  InsurUpAuth,
  InsurUpAuthConfig,
  InsurUpScope,
  AuthServerConfig,
  OAuthTokens,
  AuthState,
  TokenStorage,
  AuthorizeUrl,
  AuthorizeUrlOptions,
  ExchangeCodeOptions,
  ClientCredentialsLoginOptions,
} from './types.js';
