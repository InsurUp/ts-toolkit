/**
 * @fileoverview OAuth protocol layer
 * @description Thin wrappers over oauth4webapi for OIDC discovery and the three
 * supported grants (client credentials, refresh token, authorization code +
 * PKCE). Normalizes responses into {@link OAuthTokens} and maps failures into
 * {@link OAuthError}. This is the only module that imports oauth4webapi.
 */

import * as oauth from 'oauth4webapi';

import { OAuthError, toOAuthError } from './errors.js';
import type { AuthServerConfig, AuthorizeUrl, AuthorizeUrlOptions, OAuthTokens } from './types.js';

/** The default InsurUp authorization server issuer. */
export const DEFAULT_AUTH_SERVER = 'https://auth.insurup.com';

/**
 * Resolves the {@link oauth.AuthorizationServer} metadata for the given config.
 * When explicit endpoints are configured, builds the metadata directly;
 * otherwise fetches the OIDC discovery document from the issuer.
 */
export async function discoverAuthServer(
  config: AuthServerConfig
): Promise<oauth.AuthorizationServer> {
  const issuer = config.authServer ?? DEFAULT_AUTH_SERVER;

  if (config.tokenEndpoint !== undefined || config.authorizationEndpoint !== undefined) {
    return {
      issuer,
      token_endpoint: config.tokenEndpoint,
      authorization_endpoint: config.authorizationEndpoint,
    };
  }

  const issuerUrl = new URL(issuer);
  try {
    const response = await oauth.discoveryRequest(issuerUrl, { algorithm: 'oidc' });
    return await oauth.processDiscoveryResponse(issuerUrl, response);
  } catch (error) {
    throw toOAuthError(error);
  }
}

/**
 * Normalizes an oauth4webapi token endpoint response into {@link OAuthTokens},
 * computing an absolute expiry from `expires_in`.
 */
function normalizeTokens(response: oauth.TokenEndpointResponse): OAuthTokens {
  return {
    accessToken: response.access_token,
    tokenType: response.token_type,
    refreshToken: response.refresh_token,
    scope: response.scope,
    idToken: response.id_token,
    expiresAt:
      response.expires_in !== undefined ? Date.now() + response.expires_in * 1000 : undefined,
  };
}

/**
 * Performs the OAuth 2.0 client credentials grant (machine-to-machine).
 */
export async function clientCredentialsGrant(
  as: oauth.AuthorizationServer,
  clientId: string,
  clientSecret: string,
  scopes: readonly string[] | undefined
): Promise<OAuthTokens> {
  const client: oauth.Client = { client_id: clientId };
  const clientAuth = oauth.ClientSecretPost(clientSecret);
  const params = new URLSearchParams();
  if (scopes && scopes.length > 0) {
    params.set('scope', scopes.join(' '));
  }

  try {
    const response = await oauth.clientCredentialsGrantRequest(as, client, clientAuth, params);
    return normalizeTokens(await oauth.processClientCredentialsResponse(as, client, response));
  } catch (error) {
    throw toOAuthError(error);
  }
}

/**
 * Performs the OAuth 2.0 refresh token grant. Supplies client authentication
 * only when a secret is provided (confidential clients).
 */
export async function refreshTokenGrant(
  as: oauth.AuthorizationServer,
  clientId: string,
  refreshToken: string,
  clientSecret: string | undefined
): Promise<OAuthTokens> {
  const client: oauth.Client = { client_id: clientId };
  const clientAuth =
    clientSecret !== undefined ? oauth.ClientSecretPost(clientSecret) : oauth.None();

  try {
    const response = await oauth.refreshTokenGrantRequest(as, client, clientAuth, refreshToken);
    return normalizeTokens(await oauth.processRefreshTokenResponse(as, client, response));
  } catch (error) {
    throw toOAuthError(error);
  }
}

/**
 * Builds an authorization-code (PKCE) authorize URL, generating a PKCE verifier
 * and `state` when not supplied.
 */
export async function buildAuthorizeUrl(
  as: oauth.AuthorizationServer,
  clientId: string,
  options: AuthorizeUrlOptions
): Promise<AuthorizeUrl> {
  if (as.authorization_endpoint === undefined) {
    throw new OAuthError(
      'Authorization server metadata is missing an authorization_endpoint. ' +
        'Configure authorizationEndpoint or use a server that supports OIDC discovery.'
    );
  }

  const codeVerifier = options.codeVerifier ?? oauth.generateRandomCodeVerifier();
  const state = options.state ?? oauth.generateRandomState();
  const codeChallenge = await oauth.calculatePKCECodeChallenge(codeVerifier);

  const url = new URL(as.authorization_endpoint);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', options.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  if (options.scopes && options.scopes.length > 0) {
    url.searchParams.set('scope', options.scopes.join(' '));
  }
  for (const [key, value] of Object.entries(options.extraParams ?? {})) {
    url.searchParams.set(key, value);
  }

  return { url: url.href, codeVerifier, state };
}

/**
 * Validates an authorization-code callback and exchanges the code for tokens.
 */
export async function exchangeAuthorizationCode(
  as: oauth.AuthorizationServer,
  clientId: string,
  options: {
    callbackUrl: string | URL;
    redirectUri: string;
    codeVerifier: string;
    state?: string;
    clientSecret?: string;
  }
): Promise<OAuthTokens> {
  const client: oauth.Client = { client_id: clientId };
  const clientAuth =
    options.clientSecret !== undefined
      ? oauth.ClientSecretPost(options.clientSecret)
      : oauth.None();
  const callbackUrl =
    typeof options.callbackUrl === 'string' ? new URL(options.callbackUrl) : options.callbackUrl;

  try {
    const params = oauth.validateAuthResponse(
      as,
      client,
      callbackUrl,
      options.state ?? oauth.skipStateCheck
    );
    const response = await oauth.authorizationCodeGrantRequest(
      as,
      client,
      clientAuth,
      params,
      options.redirectUri,
      options.codeVerifier
    );
    return normalizeTokens(await oauth.processAuthorizationCodeResponse(as, client, response));
  } catch (error) {
    throw toOAuthError(error);
  }
}
