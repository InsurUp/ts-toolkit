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
export interface TokenManagerOptions {
  /** Where tokens are read from and written to. */
  readonly storage: TokenStorage;

  /** Seconds before expiry at which a token is treated as expired. */
  readonly refreshBufferSeconds: number;

  /** Performs a refresh with the given refresh token, resolving to new tokens. */
  readonly refresh: (refreshToken: string) => Promise<OAuthTokens>;
}

/**
 * Manages a single {@link OAuthTokens} set: hydrates lazily from storage, serves
 * access tokens with proactive refresh, and notifies subscribers on change.
 *
 * Tek bir {@link OAuthTokens} kümesini yönetir.
 */
export class TokenManager {
  private current: OAuthTokens | null = null;
  private hydrated = false;
  private refreshInFlight: Promise<OAuthTokens> | null = null;
  private readonly listeners = new Set<(state: AuthState) => void>();

  constructor(private readonly options: TokenManagerOptions) {}

  /**
   * Returns a valid access token, refreshing transparently when the current one
   * is expired (or within the refresh buffer). Resolves to `null` when there is
   * no usable session; clears storage when an expired token cannot be refreshed.
   */
  async getAccessToken(): Promise<string | null> {
    await this.hydrate();
    const tokens = this.current;
    if (!tokens) {
      return null;
    }

    if (!this.isExpired(tokens)) {
      return tokens.accessToken;
    }

    if (tokens.refreshToken !== undefined) {
      try {
        const refreshed = await this.refreshWithLock(tokens.refreshToken);
        return refreshed.accessToken;
      } catch {
        await this.clear();
        return null;
      }
    }

    // Expired with no way to refresh — drop the dead session.
    await this.clear();
    return null;
  }

  /** Returns the currently held tokens (which may be expired), or `null`. */
  async getTokens(): Promise<OAuthTokens | null> {
    await this.hydrate();
    return this.current;
  }

  /** Stores a new token set and notifies subscribers. */
  async setTokens(tokens: OAuthTokens): Promise<void> {
    this.current = tokens;
    this.hydrated = true;
    await this.options.storage.set(tokens);
    this.emit();
  }

  /** Forces a refresh using the stored refresh token. */
  async refresh(): Promise<OAuthTokens> {
    await this.hydrate();
    const refreshToken = this.current?.refreshToken;
    if (refreshToken === undefined) {
      throw new OAuthError('No refresh token available to refresh the session.');
    }
    return this.refreshWithLock(refreshToken);
  }

  /** Clears the stored session and notifies subscribers. */
  async clear(): Promise<void> {
    this.current = null;
    this.hydrated = true;
    await this.options.storage.clear();
    this.emit();
  }

  /** Returns a synchronous snapshot of the current state. */
  getState(): AuthState {
    return { isAuthenticated: this.current !== null, tokens: this.current };
  }

  /** Subscribes to state changes; returns an unsubscribe function. */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async hydrate(): Promise<void> {
    if (this.hydrated) {
      return;
    }
    this.current = (await this.options.storage.get()) ?? null;
    this.hydrated = true;
  }

  /**
   * Refreshes under a single-flight lock: concurrent callers share one in-flight
   * refresh rather than each hitting the token endpoint.
   */
  private refreshWithLock(refreshToken: string): Promise<OAuthTokens> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }
    const inFlight = this.doRefresh(refreshToken);
    this.refreshInFlight = inFlight;
    return inFlight;
  }

  private async doRefresh(refreshToken: string): Promise<OAuthTokens> {
    try {
      const refreshed = await this.options.refresh(refreshToken);
      await this.setTokens(refreshed);
      return refreshed;
    } finally {
      this.refreshInFlight = null;
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
