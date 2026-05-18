/**
 * Token storage using localStorage.
 * Handles persistence of OAuth tokens with expiry tracking.
 */

const STORAGE_KEY = 'insurup_tokens';
const PKCE_KEY = 'insurup_pkce';

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  idToken?: string;
}

export interface PKCEData {
  codeVerifier: string;
  state: string;
}

/**
 * Save tokens to localStorage.
 */
export function saveTokens(tokens: TokenData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

/**
 * Load tokens from localStorage.
 */
export function loadTokens(): TokenData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as TokenData;
  } catch {
    return null;
  }
}

/**
 * Clear stored tokens.
 */
export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Save PKCE data for the OAuth flow.
 */
export function savePKCEData(data: PKCEData): void {
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(data));
}

/**
 * Load and clear PKCE data.
 */
export function loadAndClearPKCEData(): PKCEData | null {
  const stored = sessionStorage.getItem(PKCE_KEY);
  if (!stored) {
    return null;
  }

  sessionStorage.removeItem(PKCE_KEY);

  try {
    return JSON.parse(stored) as PKCEData;
  } catch {
    return null;
  }
}

/**
 * Check if tokens are currently stored.
 */
export function hasStoredTokens(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
