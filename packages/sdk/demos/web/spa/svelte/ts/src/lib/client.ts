/**
 * InsurUp SDK client for Svelte.
 * Wires the SDK's auth handle into the client so tokens are injected and
 * refreshed automatically on every request.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getConfig } from './config';
import { auth } from './auth/oauth';

let clientInstance: DefaultInsurUpClient | null = null;

/**
 * Get the SDK client instance.
 * Creates a new instance if one doesn't exist.
 */
export function getClient(): DefaultInsurUpClient {
  if (!clientInstance) {
    const config = getConfig();
    clientInstance = new DefaultInsurUpClient({
      auth,
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
