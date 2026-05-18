/**
 * OAuth2/PKCE authentication flow.
 */

import { getConfig } from '$lib/config';
import {
  saveTokens,
  loadTokens,
  clearTokens,
  savePKCEData,
  loadAndClearPKCEData,
  type TokenData,
} from './token-store';

const EXPIRY_BUFFER_MS = 60 * 1000;

async function generateCodeVerifier(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(digest));
}

function generateState(): string {
  return crypto.randomUUID();
}

function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function startLogin(): Promise<void> {
  const config = getConfig();

  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  savePKCEData({ codeVerifier, state });

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  window.location.href = `${config.authServer}/connect/authorize?${params.toString()}`;
}

export async function handleCallback(code: string, state: string): Promise<TokenData> {
  const config = getConfig();
  const pkceData = loadAndClearPKCEData();

  if (!pkceData) {
    throw new Error('No PKCE data found. Please start login again.');
  }

  if (pkceData.state !== state) {
    throw new Error('State mismatch. Possible CSRF attack.');
  }

  const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
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
  const expiresAt = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined;

  const tokens: TokenData = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt,
    tokenType: tokenData.token_type || 'Bearer',
    idToken: tokenData.id_token,
  };

  saveTokens(tokens);
  return tokens;
}

export async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
  if (!tokens) return null;

  if (tokens.expiresAt && Date.now() >= tokens.expiresAt - EXPIRY_BUFFER_MS) {
    if (tokens.refreshToken) {
      try {
        const config = getConfig();
        const tokenResponse = await fetch(`${config.authServer}/connect/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: config.clientId,
            refresh_token: tokens.refreshToken,
          }),
        });

        if (!tokenResponse.ok) throw new Error('Token refresh failed');

        const tokenData = await tokenResponse.json();
        const expiresAt = tokenData.expires_in
          ? Date.now() + tokenData.expires_in * 1000
          : undefined;

        const newTokens: TokenData = {
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token || tokens.refreshToken,
          expiresAt,
          tokenType: tokenData.token_type || 'Bearer',
          idToken: tokenData.id_token || tokens.idToken,
        };

        saveTokens(newTokens);
        return newTokens.accessToken;
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

export function logout(): void {
  clearTokens();
}

export function isAuthenticated(): boolean {
  const tokens = loadTokens();
  if (!tokens) return false;
  if (tokens.expiresAt && Date.now() >= tokens.expiresAt) return false;
  return true;
}
