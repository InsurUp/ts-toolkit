/**
 * InsurUp SDK client for Svelte.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getConfig } from '$lib/config';
import { auth } from '$lib/auth/oauth';

let clientInstance: DefaultInsurUpClient | null = null;

export function getClient(): DefaultInsurUpClient {
  if (!clientInstance) {
    const config = getConfig();
    clientInstance = new DefaultInsurUpClient({
      // Passing the auth handle wires automatic token injection and refresh.
      auth,
      baseUrl: config.apiBaseUrl,
    });
  }
  return clientInstance;
}
