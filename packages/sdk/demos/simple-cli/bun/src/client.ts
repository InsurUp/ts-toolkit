/**
 * Shared SDK client instance.
 * The tokenProvider fetches tokens dynamically to handle token refresh.
 */

import { DefaultInsurUpClient } from '@insurup/sdk';
import { getAccessToken } from './auth/oauth';

export const client = new DefaultInsurUpClient({
  tokenProvider: () => getAccessToken(),
});
