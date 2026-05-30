/**
 * @fileoverview Auth module types
 * @description Public types for the InsurUp auth module — OAuth token sets,
 * server configuration, flow options, and the {@link InsurUpAuth} surface.
 */

import type { TokenProvider } from '../core/options.js';

import type { AuthResult } from './result.js';

/**
 * An OAuth scope understood by the InsurUp authorization server. The known
 * scopes — standard OIDC scopes plus the InsurUp API scopes — autocomplete,
 * while any other string is still accepted (scopes are server-defined and may
 * evolve, and clients may be granted tenant-specific scopes).
 *
 * InsurUp yetkilendirme sunucusunun tanıdığı bir OAuth kapsamı.
 */
export type InsurUpScope =
  // Standard OIDC scopes
  | 'openid'
  | 'profile'
  | 'email'
  | 'roles'
  | 'offline_access'
  // Full API access (internal apps)
  | 'core-api'
  // Granular API scopes (`resource:action`, for third-party clients)
  | 'customer:read'
  | 'customer:write'
  | 'proposal:read'
  | 'proposal:write'
  | 'policy:read'
  | 'policy:write'
  | 'case:read'
  | 'case:write'
  | 'webhook:read'
  | 'webhook:write'
  | 'me:read'
  | 'me:write'
  // Authorization-server administration
  | 'auth-server-management'
  // Escape hatch: any other (future / tenant-specific) scope. Preserves the
  // literal suggestions above without collapsing the union to `string`.
  | (string & {});

/**
 * An OAuth 2.0 token set held by the auth module. Mirrors the relevant fields
 * of the token endpoint response, with an absolute {@link OAuthTokens.expiresAt}
 * computed at acquisition time so expiry can be checked without tracking when
 * the token was issued.
 *
 * Auth modülü tarafından tutulan bir OAuth 2.0 belirteç kümesi.
 */
export interface OAuthTokens {
  /** The access token used as the `Bearer` credential on API requests. */
  readonly accessToken: string;

  /**
   * The token type returned by the server. Normalized to lowercase by the
   * authorization server (typically `bearer`). Informational — the SDK always
   * sends the `Authorization` header as `Bearer {accessToken}`.
   */
  readonly tokenType: string;

  /** The refresh token, when the server issued one (requires `offline_access`). */
  readonly refreshToken?: string;

  /** The space-delimited scopes granted by the server, when returned. */
  readonly scope?: string;

  /** The OIDC ID token, when returned. */
  readonly idToken?: string;

  /**
   * Absolute access-token expiry as epoch milliseconds, or `undefined` when the
   * server did not return an `expires_in` value.
   */
  readonly expiresAt?: number;
}

/**
 * Describes how to reach the OAuth 2.0 / OIDC authorization server. Provide
 * either an {@link AuthServerConfig.authServer} issuer (endpoints are then
 * resolved via OIDC discovery) or explicit endpoint URLs to skip discovery.
 *
 * OAuth 2.0 / OIDC yetkilendirme sunucusuna nasıl erişileceğini açıklar.
 */
export interface AuthServerConfig {
  /**
   * Issuer identifier (base URL) of the authorization server, e.g.
   * `https://auth.insurup.com`. Used for OIDC discovery and as the expected
   * issuer. Defaults to `https://auth.insurup.com`.
   */
  readonly authServer?: string;

  /**
   * Explicit token endpoint URL. When provided (together with
   * {@link AuthServerConfig.authorizationEndpoint} where relevant), OIDC
   * discovery is skipped.
   */
  readonly tokenEndpoint?: string;

  /**
   * Explicit authorization endpoint URL. When provided, OIDC discovery is
   * skipped for building authorize URLs.
   */
  readonly authorizationEndpoint?: string;
}

/**
 * Pluggable persistence for {@link OAuthTokens}. Implementations may be sync or
 * async; the default is in-memory (see `createMemoryTokenStorage`). Provide your
 * own (e.g. `localStorage`, a keychain, or a file) to persist sessions.
 *
 * {@link OAuthTokens} için takılabilir kalıcılık katmanı.
 */
export interface TokenStorage {
  /** Returns the currently stored tokens, or `null` when none are stored. */
  get(): OAuthTokens | null | Promise<OAuthTokens | null>;

  /** Persists the given tokens, replacing any previously stored set. */
  set(tokens: OAuthTokens): void | Promise<void>;

  /** Removes any stored tokens. */
  clear(): void | Promise<void>;
}

/**
 * Configuration for {@link InsurUpAuth} created by `createInsurUpAuth`.
 *
 * `createInsurUpAuth` ile oluşturulan {@link InsurUpAuth} için yapılandırma.
 */
export interface InsurUpAuthConfig extends AuthServerConfig {
  /** The OAuth `client_id`. */
  readonly clientId: string;

  /**
   * The client secret for confidential clients. Used for the client credentials
   * grant, refreshing, and the authorization code exchange when the client is
   * confidential.
   *
   * @remarks Server-only — never ship a client secret to a browser. Public
   * clients (SPAs, native apps) authenticate with PKCE and omit this.
   */
  readonly clientSecret?: string;

  /** Default scopes requested by flows that do not specify their own. */
  readonly scopes?: readonly InsurUpScope[];

  /** Token storage backend. Defaults to in-memory storage. */
  readonly storage?: TokenStorage;

  /**
   * Seconds before access-token expiry at which `getAccessToken()` treats the
   * token as expired and refreshes proactively.
   *
   * @default 60
   */
  readonly refreshBufferSeconds?: number;
}

/**
 * Options for the client credentials grant (machine-to-machine).
 *
 * @remarks Server-only — never ship a client secret to a browser.
 */
export interface ClientCredentialsLoginOptions {
  /**
   * The client secret. Falls back to {@link InsurUpAuthConfig.clientSecret} when
   * omitted; an {@link OAuthTokens} request fails if neither is set.
   */
  readonly clientSecret?: string;

  /** Scopes to request. Falls back to {@link InsurUpAuthConfig.scopes}. */
  readonly scopes?: readonly InsurUpScope[];
}

/**
 * Options for building an authorization-code (PKCE) authorize URL.
 */
export interface AuthorizeUrlOptions {
  /** The redirect URI the authorization server will call back. */
  readonly redirectUri: string;

  /** Scopes to request. Falls back to {@link InsurUpAuthConfig.scopes}. */
  readonly scopes?: readonly InsurUpScope[];

  /**
   * A PKCE code verifier to use. When omitted, one is generated and returned in
   * {@link AuthorizeUrl.codeVerifier}.
   */
  readonly codeVerifier?: string;

  /**
   * An opaque `state` value for CSRF protection. When omitted, one is generated
   * and returned in {@link AuthorizeUrl.state}.
   */
  readonly state?: string;

  /**
   * Extra authorization request parameters to append (e.g. `prompt`,
   * `login_hint`, `acr_values`).
   */
  readonly extraParams?: Readonly<Record<string, string>>;
}

/**
 * The result of `getAuthorizeUrl` — the URL to send the user to plus the PKCE
 * verifier and state that must be retained for the subsequent code exchange.
 */
export interface AuthorizeUrl {
  /** The full authorization URL to navigate the user to. */
  readonly url: string;

  /** The PKCE code verifier to pass to `exchangeCode`. */
  readonly codeVerifier: string;

  /** The `state` value to validate against the callback in `exchangeCode`. */
  readonly state: string;
}

/**
 * Options for exchanging an authorization-code callback for tokens.
 */
export interface ExchangeCodeOptions {
  /** The full callback URL (or query string) received at the redirect URI. */
  readonly callbackUrl: string | URL;

  /** The redirect URI used when building the authorize URL. */
  readonly redirectUri: string;

  /** The PKCE code verifier returned from `getAuthorizeUrl`. */
  readonly codeVerifier: string;

  /**
   * The `state` returned from `getAuthorizeUrl`. When provided it is validated
   * against the callback; when omitted the state check is skipped.
   */
  readonly state?: string;

  /**
   * The client secret for confidential clients. Falls back to
   * {@link InsurUpAuthConfig.clientSecret}. Omit for public (PKCE-only) clients.
   */
  readonly clientSecret?: string;
}

/**
 * A snapshot of the auth module's current state, for reactive UIs.
 */
export interface AuthState {
  /** Whether a token set is currently held (it may still be expired). */
  readonly isAuthenticated: boolean;

  /** The currently held tokens, or `null` when unauthenticated. */
  readonly tokens: OAuthTokens | null;
}

/**
 * The auth handle returned by `createInsurUpAuth`. Drop
 * {@link InsurUpAuth.tokenProvider} into `InsurUpClientOptions`, or pass the
 * whole object as `auth` to wire token injection (and refresh) automatically.
 *
 * `createInsurUpAuth` tarafından döndürülen kimlik doğrulama tutamacı.
 */
export interface InsurUpAuth {
  /**
   * Returns a valid access token, refreshing transparently when the current one
   * is expired (or within the refresh buffer). Resolves to `null` when there is
   * no usable session. {@link TokenProvider}-compatible.
   */
  getAccessToken(): Promise<string | null>;

  /** {@link InsurUpAuth.getAccessToken} as a {@link TokenProvider}, ready for `InsurUpClientOptions.tokenProvider`. */
  readonly tokenProvider: TokenProvider;

  /**
   * Authenticates via the client credentials grant (machine-to-machine) and,
   * on success, stores the resulting tokens. Returns an {@link AuthResult}
   * rather than throwing — discriminate on `isSuccess`.
   *
   * @remarks Server-only — never ship a client secret to a browser.
   */
  loginWithClientCredentials(
    options?: ClientCredentialsLoginOptions
  ): Promise<AuthResult<OAuthTokens>>;

  /**
   * Builds an authorization-code (PKCE) authorize URL. Retain the returned
   * {@link AuthorizeUrl.codeVerifier} and {@link AuthorizeUrl.state} for
   * {@link InsurUpAuth.exchangeCode}.
   */
  getAuthorizeUrl(options: AuthorizeUrlOptions): Promise<AuthorizeUrl>;

  /**
   * Exchanges an authorization-code callback for tokens and, on success, stores
   * them. Returns an {@link AuthResult} rather than throwing.
   */
  exchangeCode(options: ExchangeCodeOptions): Promise<AuthResult<OAuthTokens>>;

  /**
   * Forces a token refresh using the stored refresh token and, on success,
   * stores the result. Returns an {@link AuthResult} — a failure (rather than a
   * throw) when no refresh token is available or the server rejects the grant.
   */
  refresh(): Promise<AuthResult<OAuthTokens>>;

  /** Clears the stored session. */
  logout(): Promise<void>;

  /** Returns the currently stored tokens (which may be expired), or `null`. */
  getTokens(): Promise<OAuthTokens | null>;

  /** Returns a synchronous snapshot of the current {@link AuthState}. */
  getState(): AuthState;

  /**
   * Subscribes to {@link AuthState} changes (login, refresh, logout). Returns an
   * unsubscribe function.
   */
  subscribe(listener: (state: AuthState) => void): () => void;
}
