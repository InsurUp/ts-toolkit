/**
 * Cross-platform credential storage for OAuth2 tokens using Bun.secrets.
 */

import { secrets } from "bun";

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType?: string;
  scope?: string;
}

const SERVICE = "com.insurup.sdk";
const NAME = "tokens";

export async function saveTokens(data: TokenData): Promise<void> {
  await secrets.set({ service: SERVICE, name: NAME, value: JSON.stringify(data) });
}

export async function loadTokens(): Promise<TokenData | null> {
  const json = await secrets.get({ service: SERVICE, name: NAME });
  return json ? (JSON.parse(json) as TokenData) : null;
}

export async function clearTokens(): Promise<void> {
  await secrets.delete({ service: SERVICE, name: NAME });
}
