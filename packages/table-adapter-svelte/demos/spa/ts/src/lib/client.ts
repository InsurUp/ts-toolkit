/**
 * InsurUp SDK client for Svelte.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getConfig } from '$lib/config';
import { getAccessToken } from '$lib/auth/oauth';

let clientInstance: DefaultInsurUpClient | null = null;

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
