/**
 * SDK client composable for Vue.
 * Provides an authenticated InsurUp SDK client.
 */

import { DefaultInsurUpClient } from "@insurup/sdk";
import { getConfig } from "@/lib/config";
import { useAuth } from "./useAuth";

let clientInstance: DefaultInsurUpClient | null = null;

export function useClient() {
  const { getAccessToken } = useAuth();

  if (!clientInstance) {
    const config = getConfig();
    clientInstance = new DefaultInsurUpClient({
      tokenProvider: () => getAccessToken(),
      baseUrl: config.apiBaseUrl,
    });
  }

  return clientInstance;
}

export function resetClient(): void {
  clientInstance = null;
}
