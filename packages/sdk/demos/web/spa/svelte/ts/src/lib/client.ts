/**
 * InsurUp SDK client for Svelte.
 * Provides a reactive client that uses the auth state.
 */

import { DefaultInsurUpClient } from "@insurup/sdk";
import { getConfig } from "./config";
import { getAccessToken } from "./auth/oauth";

let clientInstance: DefaultInsurUpClient | null = null;

/**
 * Get the SDK client instance.
 * Creates a new instance if one doesn't exist.
 */
export function getClient(): DefaultInsurUpClient {
  if (!clientInstance) {
    const config = getConfig();
    clientInstance = new DefaultInsurUpClient({
      tokenProvider: () => getAccessToken(),
      baseUrl: config.apiBaseUrl,
    });
  }
  return clientInstance;
}

/**
 * Reset the client instance.
 * Useful when auth state changes.
 */
export function resetClient(): void {
  clientInstance = null;
}
