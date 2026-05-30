/**
 * @fileoverview Token manager
 * @description Owns the access-token lifecycle: expiry-aware reads, single-flight
 * refresh, clear-on-failure, and {@link AuthState} subscriptions. Protocol- and
 * storage-agnostic — refresh is injected as a callback.
 */

import { OAuthError } from './errors.js';
import type { AuthState, OAuthTokens, TokenStorage } from './types.js';

/**
 * Dependencies for a {@link TokenManager}.
 */
export interface TokenManagerOptions<TContext = void> {
  /** Where tokens are read from and written to. */
  readonly storage: TokenStorage<TContext>;

  /** Seconds before expiry at which a token is treated as expired. */
  readonly refreshBufferSeconds: number;

  /** Performs a refresh with the given refresh token, resolving to new tokens. */
  readonly refresh: (refreshToken: string) => Promise<OAuthTokens>;
}

/**
 * Manages an {@link OAuthTokens} set: serves access tokens with proactive
 * refresh and notifies subscribers on change. Storage is the single source of
 * truth — every read hits it, keyed by the per-call `context`, so one manager
 * serves many sessions (multi-tenant) without leaking tokens between them.
 *
 * Bir {@link OAuthTokens} kümesini yönetir.
 */
export class TokenManager<TContext = void> {
  /** Last token set seen by this manager, for the synchronous {@link getState}. */
  private lastSeen: OAuthTokens | null = null;
  /** In-flight refreshes keyed by refresh token, so concurrent callers for the
   *  same session share one request while different sessions stay independent. */
  private readonly refreshInFlight = new Map<string, Promise<OAuthTokens>>();
  private readonly listeners = new Set<(state: AuthState) => void>();

  constructor(private readonly options: TokenManagerOptions<TContext>) {}

  /**
   * Returns a valid access token, refreshing transparently when the current one
   * is expired (or within the refresh buffer). Resolves to `null` when there is
   * no usable session; clears storage when an expired token cannot be refreshed.
   */
  async getAccessToken(context?: TContext): Promise<string | null> {
    const tokens = await this.read(context);
    if (!tokens) {
      return null;
    }

    if (!this.isExpired(tokens)) {
      return tokens.accessToken;
    }

    if (tokens.refreshToken !== undefined) {
      try {
        const refreshed = await this.refreshWithLock(tokens.refreshToken, context);
        return refreshed.accessToken;
      } catch {
        await this.clear(context);
        return null;
      }
    }

    // Expired with no way to refresh — drop the dead session.
    await this.clear(context);
    return null;
  }

  /** Returns the currently held tokens (which may be expired), or `null`. */
  async getTokens(context?: TContext): Promise<OAuthTokens | null> {
    return this.read(context);
  }

  /** Stores a new token set and notifies subscribers. */
  async setTokens(tokens: OAuthTokens, context?: TContext): Promise<void> {
    await this.options.storage.set(tokens, context);
    this.lastSeen = tokens;
    this.emit();
  }

  /** Forces a refresh using the refresh token stored under `context`. */
  async refresh(context?: TContext): Promise<OAuthTokens> {
    const tokens = await this.read(context);
    const refreshToken = tokens?.refreshToken;
    if (refreshToken === undefined) {
      throw new OAuthError('No refresh token available to refresh the session.');
    }
    return this.refreshWithLock(refreshToken, context);
  }

  /** Clears the stored session and notifies subscribers. */
  async clear(context?: TContext): Promise<void> {
    await this.options.storage.clear(context);
    this.lastSeen = null;
    this.emit();
  }

  /** Returns a synchronous snapshot of the last token set seen by this manager. */
  getState(): AuthState {
    return { isAuthenticated: this.lastSeen !== null, tokens: this.lastSeen };
  }

  /** Subscribes to state changes; returns an unsubscribe function. */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Reads tokens for `context` from storage, refreshing the {@link getState} mirror. */
  private async read(context?: TContext): Promise<OAuthTokens | null> {
    const tokens = (await this.options.storage.get(context)) ?? null;
    this.lastSeen = tokens;
    return tokens;
  }

  /**
   * Refreshes under a single-flight lock keyed by the refresh token: concurrent
   * callers for the same session share one in-flight refresh, while refreshes
   * for different sessions proceed independently.
   */
  private refreshWithLock(refreshToken: string, context?: TContext): Promise<OAuthTokens> {
    const existing = this.refreshInFlight.get(refreshToken);
    if (existing) {
      return existing;
    }
    const inFlight = this.doRefresh(refreshToken, context);
    this.refreshInFlight.set(refreshToken, inFlight);
    return inFlight;
  }

  private async doRefresh(refreshToken: string, context?: TContext): Promise<OAuthTokens> {
    try {
      const refreshed = await this.options.refresh(refreshToken);
      await this.setTokens(refreshed, context);
      return refreshed;
    } finally {
      this.refreshInFlight.delete(refreshToken);
    }
  }

  private isExpired(tokens: OAuthTokens): boolean {
    if (tokens.expiresAt === undefined) {
      return false;
    }
    return Date.now() >= tokens.expiresAt - this.options.refreshBufferSeconds * 1000;
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }
}
