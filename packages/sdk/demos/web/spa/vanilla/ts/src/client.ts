/**
 * InsurUp SDK client singleton.
 * Configured with a token provider that retrieves tokens from storage.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getAccessToken } from './auth';
import { getConfig } from './config';

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
      ...(config.apiBaseUrl && { baseUrl: config.apiBaseUrl }),
    });
  }
  return clientInstance;
}

/**
 * Reset the client instance.
 * Useful when configuration changes.
 */
export function resetClient(): void {
  clientInstance = null;
}
