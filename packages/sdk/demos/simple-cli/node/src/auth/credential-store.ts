/**
 * Cross-platform credential storage for OAuth2 tokens using keytar.
 * Stores tokens securely in the OS keychain (macOS Keychain, Windows Credential Vault, Linux Secret Service).
 */

import keytar from 'keytar';
import type { OAuthTokens } from '@insurup/sdk';

const SERVICE = 'com.insurup.sdk';
const ACCOUNT = 'tokens';

export async function saveTokens(data: OAuthTokens): Promise<void> {
  await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify(data));
}

export async function loadTokens(): Promise<OAuthTokens | null> {
  const json = await keytar.getPassword(SERVICE, ACCOUNT);
  return json ? (JSON.parse(json) as OAuthTokens) : null;
}

export async function clearTokens(): Promise<void> {
  await keytar.deletePassword(SERVICE, ACCOUNT);
}
