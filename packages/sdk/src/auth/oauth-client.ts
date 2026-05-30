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
      pushed_authorization_request_endpoint: config.pushedAuthorizationRequestEndpoint,
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
  scopes: readonly string[] | undefined,
  allowInsecure = false
): Promise<OAuthTokens> {
  const client: oauth.Client = { client_id: clientId };
  const clientAuth = oauth.ClientSecretPost(clientSecret);
  const params = new URLSearchParams();
  if (scopes && scopes.length > 0) {
    params.set('scope', scopes.join(' '));
  }

  try {
    const response = await oauth.clientCredentialsGrantRequest(
      as,
      client,
      clientAuth,
      params,
      allowInsecure ? { [oauth.allowInsecureRequests]: true } : undefined
    );
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
  clientSecret: string | undefined,
  allowInsecure = false
): Promise<OAuthTokens> {
  const client: oauth.Client = { client_id: clientId };
  const clientAuth =
    clientSecret !== undefined ? oauth.ClientSecretPost(clientSecret) : oauth.None();

  try {
    const response = await oauth.refreshTokenGrantRequest(
      as,
      client,
      clientAuth,
      refreshToken,
      allowInsecure ? { [oauth.allowInsecureRequests]: true } : undefined
    );
    return normalizeTokens(await oauth.processRefreshTokenResponse(as, client, response));
  } catch (error) {
    throw toOAuthError(error);
  }
}

/**
 * Builds an authorization-code (PKCE) authorize URL, generating a PKCE verifier
 * and `state` when not supplied.
 *
 * When {@link AuthorizeUrlOptions.usePAR} is set, the request parameters are
 * pushed to the authorization server's `pushed_authorization_request_endpoint`
 * (RFC 9126) over a back-channel call and the returned URL carries only
 * `client_id` + the one-shot `request_uri`.
 */
export async function buildAuthorizeUrl(
  as: oauth.AuthorizationServer,
  clientId: string,
  options: AuthorizeUrlOptions & {
    /** Client secret for confidential clients — authenticates the PAR call. */
    clientSecret?: string;
    /** Permits a non-HTTPS PAR endpoint (development only). */
    allowInsecure?: boolean;
  }
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

  // The authorization request parameters, shared by the standard and PAR flows.
  // `client_id` is added by the standard URL builder / by oauth4webapi for PAR.
  const params = new URLSearchParams();
  params.set('redirect_uri', options.redirectUri);
  params.set('response_type', 'code');
  params.set('code_challenge', codeChallenge);
  params.set('code_challenge_method', 'S256');
  params.set('state', state);
  if (options.scopes && options.scopes.length > 0) {
    params.set('scope', options.scopes.join(' '));
  }
  for (const [key, value] of Object.entries(options.extraParams ?? {})) {
    params.set(key, value);
  }

  const url = options.usePAR
    ? await pushAuthorizationRequest(as, as.authorization_endpoint, clientId, params, options)
    : buildStandardAuthorizeUrl(as.authorization_endpoint, clientId, params);

  return { url, codeVerifier, state };
}

/** Builds a standard OAuth authorize URL with all parameters in the query string. */
function buildStandardAuthorizeUrl(
  authorizationEndpoint: string,
  clientId: string,
  params: URLSearchParams
): string {
  const url = new URL(authorizationEndpoint);
  url.searchParams.set('client_id', clientId);
  for (const [key, value] of params) {
    url.searchParams.set(key, value);
  }
  return url.href;
}

/**
 * Pushes the authorization request parameters to the server's
 * `pushed_authorization_request_endpoint` (RFC 9126) and returns an authorize
 * URL carrying only `client_id` + the one-shot `request_uri`.
 */
async function pushAuthorizationRequest(
  as: oauth.AuthorizationServer,
  authorizationEndpoint: string,
  clientId: string,
  params: URLSearchParams,
  options: { clientSecret?: string; allowInsecure?: boolean }
): Promise<string> {
  if (as.pushed_authorization_request_endpoint === undefined) {
    throw new OAuthError(
      'usePAR was set, but the authorization server does not advertise a ' +
        'pushed_authorization_request_endpoint (RFC 9126). Configure ' +
        'pushedAuthorizationRequestEndpoint, use a server that supports PAR, or disable usePAR.'
    );
  }

  const client: oauth.Client = { client_id: clientId };
  const clientAuth =
    options.clientSecret !== undefined
      ? oauth.ClientSecretPost(options.clientSecret)
      : oauth.None();

  try {
    const response = await oauth.pushedAuthorizationRequest(
      as,
      client,
      clientAuth,
      params,
      options.allowInsecure ? { [oauth.allowInsecureRequests]: true } : undefined
    );
    const { request_uri } = await oauth.processPushedAuthorizationResponse(as, client, response);

    const url = new URL(authorizationEndpoint);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('request_uri', request_uri);
    return url.href;
  } catch (error) {
    throw toOAuthError(error);
  }
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
    allowInsecure?: boolean;
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
      options.codeVerifier,
      options.allowInsecure ? { [oauth.allowInsecureRequests]: true } : undefined
    );
    return normalizeTokens(await oauth.processAuthorizationCodeResponse(as, client, response));
  } catch (error) {
    throw toOAuthError(error);
  }
}
