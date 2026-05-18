/**
 * InsurUp SDK client singleton.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getAccessToken } from './auth';
import { getConfig } from './config';

let clientInstance: DefaultInsurUpClient | null = null;

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

export function resetClient(): void {
  clientInstance = null;
}
