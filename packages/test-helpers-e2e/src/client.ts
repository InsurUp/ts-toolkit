/**
 * @fileoverview Real InsurUp SDK client/options wired with the shared M2M token provider.
 */

import { DefaultInsurUpClient, type InsurUpClientOptions } from '@insurup/sdk';
import { readEnv } from './env.js';
import { getAccessToken } from './token.js';

export function e2eClientOptions(): InsurUpClientOptions {
  const env = readEnv();
  if (!env) {
    throw new Error('e2eClientOptions called without credentials — guard tests with describeE2E()');
  }
  return {
    baseUrl: env.apiBaseUrl,
    tokenProvider: () => getAccessToken(),
  };
}

export function createE2EClient(): DefaultInsurUpClient {
  return new DefaultInsurUpClient(e2eClientOptions());
}
