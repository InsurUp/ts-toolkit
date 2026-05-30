/**
 * @fileoverview TokenManager unit tests
 * @description Covers expiry math, single-flight refresh, clear-on-failure, and
 * subscription notifications — all without network (refresh is injected).
 */

import { describe, it, expect, vi } from 'vitest';

import { OAuthError } from '../../../src/auth/errors';
import { createMemoryTokenStorage } from '../../../src/auth/storage';
import { TokenManager } from '../../../src/auth/token-manager';
import type { OAuthTokens, TokenStorage } from '../../../src/auth/types';

function makeTokens(overrides: Partial<OAuthTokens> = {}): OAuthTokens {
  return {
    accessToken: 'access-1',
    tokenType: 'Bearer',
    refreshToken: 'refresh-1',
    expiresAt: Date.now() + 3_600_000,
    ...overrides,
  };
}

function makeManager(
  options: {
    initial?: OAuthTokens | null;
    refresh?: (refreshToken: string) => Promise<OAuthTokens>;
    refreshBufferSeconds?: number;
    storage?: TokenStorage;
  } = {}
): { manager: TokenManager; storage: TokenStorage; refresh: ReturnType<typeof vi.fn> } {
  const storage = options.storage ?? createMemoryTokenStorage();
  if (options.initial) {
    void storage.set(options.initial);
  }
  const refresh = vi.fn(
    options.refresh ??
      (async () => makeTokens({ accessToken: 'access-2', refreshToken: 'refresh-2' }))
  );
  const manager = new TokenManager({
    storage,
    refreshBufferSeconds: options.refreshBufferSeconds ?? 60,
    refresh,
  });
  return { manager, storage, refresh };
}

describe('TokenManager', () => {
  it('returns null when no tokens are stored', async () => {
    const { manager, refresh } = makeManager();
    expect(await manager.getAccessToken()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });

  it('returns the access token when it is still valid', async () => {
    const { manager, refresh } = makeManager({ initial: makeTokens() });
    expect(await manager.getAccessToken()).toBe('access-1');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('treats a token with no expiry as valid', async () => {
    const { manager, refresh } = makeManager({ initial: makeTokens({ expiresAt: undefined }) });
    expect(await manager.getAccessToken()).toBe('access-1');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('refreshes a token that is within the refresh buffer', async () => {
    // Expires in 10s, buffer is 60s → treated as expired.
    const { manager, refresh } = makeManager({
      initial: makeTokens({ expiresAt: Date.now() + 10_000 }),
    });
    expect(await manager.getAccessToken()).toBe('access-2');
    expect(refresh).toHaveBeenCalledTimes(1);
    // Subsequent reads use the fresh token without refreshing again.
    expect(await manager.getAccessToken()).toBe('access-2');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('shares a single in-flight refresh across concurrent callers', async () => {
    let resolveRefresh!: (tokens: OAuthTokens) => void;
    const deferred = new Promise<OAuthTokens>((resolve) => {
      resolveRefresh = resolve;
    });
    const { manager, refresh } = makeManager({
      initial: makeTokens({ expiresAt: Date.now() - 1_000 }),
      refresh: () => deferred,
    });

    const calls = Promise.all(Array.from({ length: 5 }, () => manager.getAccessToken()));
    // Let every caller reach the refresh lock before the refresh resolves.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(refresh).toHaveBeenCalledTimes(1);

    resolveRefresh(makeTokens({ accessToken: 'access-2' }));
    expect(await calls).toEqual(['access-2', 'access-2', 'access-2', 'access-2', 'access-2']);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('clears the session when a refresh fails', async () => {
    const { manager, storage, refresh } = makeManager({
      initial: makeTokens({ expiresAt: Date.now() - 1_000 }),
      refresh: async () => {
        throw new OAuthError('invalid_grant');
      },
    });
    expect(await manager.getAccessToken()).toBeNull();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(await manager.getTokens()).toBeNull();
    expect(await storage.get()).toBeNull();
  });

  it('clears the session when expired with no refresh token', async () => {
    const { manager, refresh } = makeManager({
      initial: makeTokens({ expiresAt: Date.now() - 1_000, refreshToken: undefined }),
    });
    expect(await manager.getAccessToken()).toBeNull();
    expect(refresh).not.toHaveBeenCalled();
    expect(await manager.getTokens()).toBeNull();
  });

  it('returns stored tokens even when expired via getTokens', async () => {
    const expired = makeTokens({ expiresAt: Date.now() - 1_000 });
    const { manager } = makeManager({ initial: expired });
    expect(await manager.getTokens()).toEqual(expired);
  });

  it('refresh() rejects with OAuthError when no refresh token is available', async () => {
    const { manager } = makeManager();
    await expect(manager.refresh()).rejects.toBeInstanceOf(OAuthError);
  });

  it('notifies subscribers on setTokens and clear, and stops after unsubscribe', async () => {
    const { manager } = makeManager();
    const listener = vi.fn();
    const unsubscribe = manager.subscribe(listener);

    const tokens = makeTokens();
    await manager.setTokens(tokens);
    expect(listener).toHaveBeenLastCalledWith({ isAuthenticated: true, tokens });

    await manager.clear();
    expect(listener).toHaveBeenLastCalledWith({ isAuthenticated: false, tokens: null });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    await manager.setTokens(tokens);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
