/**
 * Auth composable for Vue.
 * Provides reactive authentication state.
 */

import { ref, computed, readonly } from "vue";
import { getConfig } from "@/lib/config";

// Types
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
  idToken?: string;
}

interface PKCEData {
  codeVerifier: string;
  state: string;
}

// Storage keys
const STORAGE_KEY = "insurup_tokens";
const PKCE_KEY = "insurup_pkce";
const EXPIRY_BUFFER_MS = 60 * 1000;

// PKCE utilities
async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function generateState(): string {
  return crypto.randomUUID();
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Token storage
function saveTokens(tokens: TokenData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

function loadTokens(): TokenData | null {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TokenData;
  } catch {
    return null;
  }
}

function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function savePKCEData(data: PKCEData): void {
  sessionStorage.setItem(PKCE_KEY, JSON.stringify(data));
}

function loadAndClearPKCEData(): PKCEData | null {
  const stored = sessionStorage.getItem(PKCE_KEY);
  if (!stored) return null;
  sessionStorage.removeItem(PKCE_KEY);
  try {
    return JSON.parse(stored) as PKCEData;
  } catch {
    return null;
  }
}

// Reactive state
const tokens = ref<TokenData | null>(loadTokens());
const loginInProgress = ref(false);

// Composable
export function useAuth() {
  const token = computed(() => tokens.value?.accessToken ?? null);
  const isAuthenticated = computed(() => !!tokens.value?.accessToken);

  async function login() {
    loginInProgress.value = true;
    const config = getConfig();

    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    savePKCEData({ codeVerifier, state });

    const params = new URLSearchParams({
      response_type: "code",
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scopes.join(" "),
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    window.location.href = `${config.authServer}/connect/authorize?${params.toString()}`;
  }

  async function handleCallback(code: string, state: string): Promise<TokenData> {
    const config = getConfig();
    const pkceData = loadAndClearPKCEData();

    if (!pkceData) {
      throw new Error("No PKCE data found. Please start login again.");
    }

    if (pkceData.state !== state) {
      throw new Error("State mismatch. Possible CSRF attack.");
    }

    const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        code: code,
        redirect_uri: config.redirectUri,
        code_verifier: pkceData.codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = tokenData.expires_in
      ? Date.now() + tokenData.expires_in * 1000
      : undefined;

    const newTokens: TokenData = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt,
      tokenType: tokenData.token_type || "Bearer",
      idToken: tokenData.id_token,
    };

    saveTokens(newTokens);
    tokens.value = newTokens;

    return newTokens;
  }

  function logout() {
    clearTokens();
    tokens.value = null;
  }

  async function getAccessToken(): Promise<string | null> {
    const currentTokens = tokens.value;
    if (!currentTokens) return null;

    // Check if token is expired (with buffer)
    if (currentTokens.expiresAt && Date.now() >= currentTokens.expiresAt - EXPIRY_BUFFER_MS) {
      if (currentTokens.refreshToken) {
        try {
          const config = getConfig();
          const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              client_id: config.clientId,
              refresh_token: currentTokens.refreshToken,
            }),
          });

          if (!tokenResponse.ok) throw new Error("Token refresh failed");

          const tokenData = await tokenResponse.json();
          const expiresAt = tokenData.expires_in
            ? Date.now() + tokenData.expires_in * 1000
            : undefined;

          const newTokens: TokenData = {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token || currentTokens.refreshToken,
            expiresAt,
            tokenType: tokenData.token_type || "Bearer",
            idToken: tokenData.id_token || currentTokens.idToken,
          };

          saveTokens(newTokens);
          tokens.value = newTokens;
          return newTokens.accessToken;
        } catch {
          logout();
          return null;
        }
      }
      logout();
      return null;
    }

    return currentTokens.accessToken;
  }

  function parseIdTokenClaims(): Record<string, unknown> | null {
    const idToken = tokens.value?.idToken;
    if (!idToken) return null;

    try {
      const parts = idToken.split(".");
      const payload = parts[1];
      if (parts.length !== 3 || !payload) return null;
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  return {
    token,
    tokens: readonly(tokens),
    isAuthenticated,
    loginInProgress: readonly(loginInProgress),
    login,
    handleCallback,
    logout,
    getAccessToken,
    parseIdTokenClaims,
  };
}
