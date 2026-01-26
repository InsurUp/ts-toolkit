/**
 * InsurUp SDK client singleton.
 *
 * Provides a lazily-initialized SDK client instance that uses
 * the OAuth token provider for authentication.
 *
 * @module client
 */

import { DefaultInsurUpClient } from "@insurup/sdk";
import { getAccessToken } from "./auth.js";
import { getConfig } from "./config.js";

/**
 * @typedef {import("@insurup/sdk").DefaultInsurUpClient} InsurUpClient
 */

/** @type {InsurUpClient|null} */
let clientInstance = null;

/**
 * Gets the SDK client instance.
 *
 * The client is lazily initialized on first call with:
 * - Token provider that fetches the current access token
 * - API base URL from configuration (if specified)
 *
 * The same instance is returned on subsequent calls (singleton pattern).
 *
 * @returns {InsurUpClient} The SDK client instance
 *
 * @example
 * const client = getClient();
 * const customers = await client.customers.getCustomers({ first: 10 });
 */
export function getClient() {
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
 * Resets the client instance.
 *
 * Call this when configuration changes to force re-initialization
 * of the client with new settings on the next `getClient()` call.
 *
 * @example
 * // After updating config in localStorage
 * resetClient();
 * const client = getClient(); // Uses new configuration
 */
export function resetClient() {
  clientInstance = null;
}
