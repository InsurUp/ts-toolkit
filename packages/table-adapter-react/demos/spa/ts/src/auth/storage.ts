import type { OAuthTokens, TokenStorage } from '@insurup/sdk';

const STORAGE_KEY = 'table-adapter-react-demo-auth-tokens';

/**
 * A {@link TokenStorage} backed by `localStorage` so the OAuth session survives
 * page reloads and new tabs.
 */
export function createLocalStorageTokenStorage(): TokenStorage {
  return {
    get: () => {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      try {
        return JSON.parse(raw) as OAuthTokens;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    },
    set: (tokens) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    },
    clear: () => {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}
