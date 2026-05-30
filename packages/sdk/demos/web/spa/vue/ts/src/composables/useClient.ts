/**
 * SDK client composable for Vue.
 * Provides an authenticated InsurUp SDK client.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { auth } from '@/lib/auth';
import { getConfig } from '@/lib/config';

let clientInstance: DefaultInsurUpClient | null = null;

export function useClient() {
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

export function resetClient(): void {
  clientInstance = null;
}
