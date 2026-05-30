/**
 * @fileoverview Auth module errors
 * @description {@link OAuthError} and a mapper from oauth4webapi's error types.
 */

import * as oauth from 'oauth4webapi';

/**
 * Options for constructing an {@link OAuthError}.
 */
export interface OAuthErrorOptions {
  /** The OAuth 2.0 error code (e.g. `invalid_grant`, `invalid_client`). */
  readonly code?: string;

  /** The human-readable `error_description` returned by the server. */
  readonly description?: string;

  /** The HTTP status code of the token/authorization response. */
  readonly status?: number;

  /** The originating error (an oauth4webapi error or a network error). */
  readonly cause?: unknown;
}

/**
 * An error raised by the auth module while acquiring or refreshing tokens.
 * Wraps the various failure shapes from the underlying OAuth client (protocol
 * errors, authorization-response errors, `WWW-Authenticate` challenges, and
 * network failures) behind a single typed surface.
 *
 * Belirteç edinme veya yenileme sırasında kimlik doğrulama modülü tarafından
 * oluşturulan bir hata.
 */
export class OAuthError extends Error {
  /** The OAuth 2.0 error code (e.g. `invalid_grant`), when available. */
  readonly code?: string;

  /** The human-readable `error_description` from the server, when available. */
  readonly description?: string;

  /** The HTTP status code of the response, when available. */
  readonly status?: number;

  constructor(message: string, options?: OAuthErrorOptions) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'OAuthError';
    this.code = options?.code;
    this.description = options?.description;
    this.status = options?.status;
  }
}

/**
 * Maps any thrown value from the underlying OAuth client into an
 * {@link OAuthError}. Already-mapped {@link OAuthError}s pass through unchanged.
 */
export function toOAuthError(error: unknown): OAuthError {
  if (error instanceof OAuthError) {
    return error;
  }

  // OAuth-style JSON error from a token endpoint (e.g. invalid_grant).
  if (error instanceof oauth.ResponseBodyError) {
    return new OAuthError(error.error_description ?? error.error, {
      code: error.error,
      description: error.error_description,
      status: error.status,
      cause: error,
    });
  }

  // Error parameters returned on the authorization callback (e.g. access_denied).
  if (error instanceof oauth.AuthorizationResponseError) {
    return new OAuthError(error.error_description ?? error.error, {
      code: error.error,
      description: error.error_description,
      cause: error,
    });
  }

  // A parseable WWW-Authenticate challenge (e.g. expired token, bad client auth).
  if (error instanceof oauth.WWWAuthenticateChallengeError) {
    return new OAuthError(error.message, { status: error.status, cause: error });
  }

  if (error instanceof Error) {
    return new OAuthError(error.message, { cause: error });
  }

  return new OAuthError('Unknown OAuth error', { cause: error });
}
