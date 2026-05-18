/**
 * @fileoverview Shared M2M token acquisition for e2e tests.
 */

import { readEnv } from './env.js';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

let cached: Promise<string> | null = null;

async function fetchToken(): Promise<string> {
  const env = readEnv();
  if (!env) {
    throw new Error(
      'Missing INSURUP_E2E_CLIENT_ID / INSURUP_E2E_CLIENT_SECRET — cannot acquire access token'
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.clientId,
    client_secret: env.clientSecret,
    scope: env.scope,
  });

  const response = await fetch(`${env.authUrl}/connect/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '<unreadable body>');
    throw new Error(`Token endpoint returned ${response.status} ${response.statusText}: ${text}`);
  }

  const data = (await response.json()) as Partial<TokenResponse>;
  if (!data.access_token) {
    throw new Error('Token endpoint response missing access_token');
  }
  return data.access_token;
}

export function getAccessToken(): Promise<string> {
  cached ??= fetchToken();
  return cached;
}

export function resetCachedToken(): void {
  cached = null;
}
