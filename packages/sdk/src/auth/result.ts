/**
 * @fileoverview Auth result types
 * @description Discriminated-union results for the imperative auth flows
 * (login, authorization-code exchange, refresh). Mirrors the SDK's
 * `InsurUpResult` convention — `isSuccess`/`kind` — so the whole surface shares
 * one error model instead of mixing returns and throws.
 *
 * İmperatif kimlik doğrulama akışları için ayrımlı birleşim sonuçları.
 */

import type { OAuthError } from './errors.js';

/** A successful auth operation, carrying the acquired data. */
export interface AuthSuccess<T> {
  readonly kind: 'success';
  readonly isSuccess: true;
  readonly data: T;
}

/** A failed auth operation, carrying the {@link OAuthError} that caused it. */
export interface AuthFailure {
  readonly kind: 'auth-error';
  readonly isSuccess: false;
  readonly error: OAuthError;
}

/**
 * The outcome of an imperative auth flow. Discriminate on `isSuccess` (or
 * `kind`) — exactly like the SDK's `InsurUpResult` — to access `data` or
 * `error`.
 */
export type AuthResult<T> = AuthSuccess<T> | AuthFailure;

/** Builds a successful {@link AuthResult}. */
export function authSuccess<T>(data: T): AuthSuccess<T> {
  return { kind: 'success', isSuccess: true, data };
}

/** Builds a failed {@link AuthResult}. */
export function authFailure(error: OAuthError): AuthFailure {
  return { kind: 'auth-error', isSuccess: false, error };
}
