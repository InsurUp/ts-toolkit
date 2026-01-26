/**
 * SDK client composable for Vue.
 */

import { DefaultInsurUpClient } from "@insurup/sdk";
import { getConfig } from "@/lib/config";
import { useAuth } from "./useAuth";

let clientInstance: DefaultInsurUpClient | null = null;

export function useClient(): DefaultInsurUpClient {
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
