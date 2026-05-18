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

  // If the user overrides one URL, they must override both — otherwise the
  // M2M token would be obtained from one environment and sent to another
  // (e.g. prod auth → staging API), which is both confusing and a credential-
  // misrouting risk.
  const authOverride = process.env.INSURUP_E2E_AUTH_URL;
  const apiOverride = process.env.INSURUP_E2E_BASE_URL;
  if (Boolean(authOverride) !== Boolean(apiOverride)) {
    throw new Error(
      'INSURUP_E2E_AUTH_URL and INSURUP_E2E_BASE_URL must both be set or both be left to defaults'
    );
  }

  return {
    clientId,
    clientSecret,
    authUrl: authOverride ?? 'https://auth.insurup.com',
    apiBaseUrl: apiOverride ?? 'https://api.insurup.com/api/',
    scope: process.env.INSURUP_E2E_SCOPE ?? 'core-api',
  };
}

export function hasCreds(): boolean {
  return readEnv() !== null;
}
