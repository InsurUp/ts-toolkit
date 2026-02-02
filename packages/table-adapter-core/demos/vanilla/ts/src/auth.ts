/**
 * OAuth2/PKCE authentication for the demo.
 */

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: string;
}

const CONFIG = {
  authServer: "https://auth.insurup.com",
  clientId: "demo",
  scopes: ["openid", "profile", "offline_access", "core-api"],
  redirectUri: `${window.location.origin}/callback`,
};

const STORAGE_KEYS = {
  tokens: "table_adapter_vanilla_tokens",
  pkce: "table_adapter_vanilla_pkce",
};

// ============================================================================
// Token Storage
// ============================================================================

function saveTokens(tokens: TokenData): void {
  localStorage.setItem(STORAGE_KEYS.tokens, JSON.stringify(tokens));
}

function loadTokens(): TokenData | null {
  const stored = localStorage.getItem(STORAGE_KEYS.tokens);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as TokenData;
  } catch {
    return null;
  }
}

export function clearTokens(): void {
  localStorage.removeItem(STORAGE_KEYS.tokens);
}

function savePKCE(data: { codeVerifier: string; state: string }): void {
  sessionStorage.setItem(STORAGE_KEYS.pkce, JSON.stringify(data));
}

function loadAndClearPKCE(): { codeVerifier: string; state: string } | null {
  const stored = sessionStorage.getItem(STORAGE_KEYS.pkce);
  if (!stored) return null;
  sessionStorage.removeItem(STORAGE_KEYS.pkce);
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ============================================================================
// OAuth2/PKCE Flow
// ============================================================================

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function startLogin(): Promise<void> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);

  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(codeVerifier));
  const codeChallenge = base64UrlEncode(new Uint8Array(digest));
  const authState = crypto.randomUUID();

  savePKCE({ codeVerifier, state: authState });

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CONFIG.clientId,
    redirect_uri: CONFIG.redirectUri,
    scope: CONFIG.scopes.join(" "),
    state: authState,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  window.location.href = `${CONFIG.authServer}/connect/authorize?${params}`;
}

export async function handleCallback(code: string, urlState: string): Promise<void> {
  const pkce = loadAndClearPKCE();
  if (!pkce || pkce.state !== urlState) {
    throw new Error("Invalid state");
  }

  const response = await fetch(`${CONFIG.authServer}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: CONFIG.clientId,
      code,
      redirect_uri: CONFIG.redirectUri,
      code_verifier: pkce.codeVerifier,
    }),
  });

  if (!response.ok) throw new Error("Token exchange failed");

  const data = await response.json();
  saveTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
    tokenType: data.token_type || "Bearer",
  });
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  // Check if token needs refresh
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt - 60000) {
    if (tokens.refreshToken) {
      try {
        const response = await fetch(`${CONFIG.authServer}/connect/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            client_id: CONFIG.clientId,
            refresh_token: tokens.refreshToken,
          }),
        });

        if (!response.ok) throw new Error("Refresh failed");

        const data = await response.json();
        saveTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token || tokens.refreshToken,
          expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : undefined,
          tokenType: data.token_type || "Bearer",
        });
        return data.access_token;
      } catch {
        clearTokens();
        return null;
      }
    }
    clearTokens();
    return null;
  }

  return tokens.accessToken;
}

export function isAuthenticated(): boolean {
  const tokens = loadTokens();
  return tokens !== null && (!tokens.expiresAt || Date.now() < tokens.expiresAt);
}
