/**
 * Cross-platform credential storage for OAuth2 tokens using keytar.
 * Stores tokens securely in the OS keychain (macOS Keychain, Windows Credential Vault, Linux Secret Service).
 */

import keytar from "keytar";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

const SERVICE = "com.insurup.sdk";
const ACCOUNT = "tokens";

export async function saveTokens(data: TokenData): Promise<void> {
  await keytar.setPassword(SERVICE, ACCOUNT, JSON.stringify(data));
}

export async function loadTokens(): Promise<TokenData | null> {
  const json = await keytar.getPassword(SERVICE, ACCOUNT);
  return json ? (JSON.parse(json) as TokenData) : null;
}

export async function clearTokens(): Promise<void> {
  await keytar.deletePassword(SERVICE, ACCOUNT);
}
