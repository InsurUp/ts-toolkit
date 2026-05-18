/**
 * @fileoverview E2E environment configuration
 *
 * Bun auto-loads `.env`, and Vitest forks inherit the env from the parent process,
 * so no explicit dotenv loading is needed here.
 */

export interface E2EEnv {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  apiBaseUrl: string;
  scope: string;
}

export function readEnv(): E2EEnv | null {
  const clientId = process.env.INSURUP_E2E_CLIENT_ID;
  const clientSecret = process.env.INSURUP_E2E_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    authUrl: process.env.INSURUP_E2E_AUTH_URL ?? 'https://auth.insurup.com',
    apiBaseUrl: process.env.INSURUP_E2E_BASE_URL ?? 'https://api.insurup.com/api/',
    scope: process.env.INSURUP_E2E_SCOPE ?? 'core-api',
  };
}

export function hasCreds(): boolean {
  return readEnv() !== null;
}
