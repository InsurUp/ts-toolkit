import { DefaultInsurUpClient } from '@insurup/sdk';
import { useMemo } from 'react';
import { auth } from '@/auth';
import { apiConfig } from './config';

/**
 * Hook to get an authenticated InsurUp SDK client.
 *
 * The client is bound to the app-wide {@link auth} handle, which injects (and
 * refreshes) the access token automatically on each request. The instance is
 * memoized for the lifetime of the component.
 */
export function useClient(): DefaultInsurUpClient {
  return useMemo(
    () =>
      new DefaultInsurUpClient({
        baseUrl: apiConfig.baseUrl,
        auth,
      }),
    []
  );
}
