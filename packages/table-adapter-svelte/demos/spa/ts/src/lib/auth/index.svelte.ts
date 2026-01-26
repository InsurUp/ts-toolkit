/**
 * Auth store for Svelte using writable store.
 */

import { writable, derived, get } from "svelte/store";
import { loadTokens, clearTokens, type TokenData } from "./token-store";

export { startLogin, handleCallback, logout, getAccessToken, isAuthenticated } from "./oauth";
export type { TokenData } from "./token-store";

const tokens = writable<TokenData | null>(loadTokens());
const loginInProgress = writable(false);

export const token = derived(tokens, ($tokens) => $tokens?.accessToken ?? null);
export const isAuthenticatedStore = derived(tokens, ($tokens) => !!$tokens?.accessToken);

export function setTokens(newTokens: TokenData | null): void {
  tokens.set(newTokens);
}

export function setLoginInProgress(value: boolean): void {
  loginInProgress.set(value);
}

export function logOut(): void {
  clearTokens();
  tokens.set(null);
}

export function refreshTokens(): void {
  tokens.set(loadTokens());
}

export function getIsAuthenticated(): boolean {
  return get(isAuthenticatedStore);
}

export function getLoginInProgress(): boolean {
  return get(loginInProgress);
}

export { tokens, loginInProgress };
