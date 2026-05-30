/**
 * Cross-platform credential storage for OAuth2 tokens using Bun.secrets.
 */

import { secrets } from 'bun';
import type { OAuthTokens } from '@insurup/sdk';

const SERVICE = 'com.insurup.sdk';
const NAME = 'tokens';

export async function saveTokens(data: OAuthTokens): Promise<void> {
  await secrets.set({ service: SERVICE, name: NAME, value: JSON.stringify(data) });
}

export async function loadTokens(): Promise<OAuthTokens | null> {
  const json = await secrets.get({ service: SERVICE, name: NAME });
  return json ? (JSON.parse(json) as OAuthTokens) : null;
}

export async function clearTokens(): Promise<void> {
  await secrets.delete({ service: SERVICE, name: NAME });
}
