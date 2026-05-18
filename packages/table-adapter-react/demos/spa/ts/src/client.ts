import { DefaultInsurUpClient } from '@insurup/sdk';
import { useAuthContext } from 'react-oauth2-code-pkce';
import { useMemo } from 'react';
import { apiConfig } from './config';

/**
 * Hook to get an authenticated InsurUp SDK client.
 * The client is memoized and will be recreated when the token changes.
 */
export function useClient(): DefaultInsurUpClient {
  const { token } = useAuthContext();

  return useMemo(
    () =>
      new DefaultInsurUpClient({
        baseUrl: apiConfig.baseUrl,
        tokenProvider: () => token ?? '',
      }),
    [token]
  );
}
