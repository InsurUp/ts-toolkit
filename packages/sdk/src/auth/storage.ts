/**
 * @fileoverview Token storage
 * @description The default in-memory {@link TokenStorage} implementation.
 */

import type { OAuthTokens, TokenStorage } from './types.js';

/**
 * Creates an in-memory {@link TokenStorage}. Tokens live only for the lifetime
 * of the process and are not persisted across restarts — suitable for server
 * processes and tests. For browsers or CLIs, supply a persistent implementation.
 *
 * This default holds a single token set and ignores any `context`, so it is
 * single-session only. Multi-tenant servers must supply storage that keys
 * tokens by their `TContext`.
 *
 * Bellek içi bir {@link TokenStorage} oluşturur.
 */
export function createMemoryTokenStorage<TContext = void>(): TokenStorage<TContext> {
  let tokens: OAuthTokens | null = null;
  return {
    get: () => tokens,
    set: (next) => {
      tokens = next;
    },
    clear: () => {
      tokens = null;
    },
  };
}
