/**
 * @fileoverview createInsurUpAuth
 * @description The public auth factory — ties config, storage, the token
 * manager, and the OAuth flows into a single {@link InsurUpAuth} handle.
 */

import type * as oauth from 'oauth4webapi';

import { OAuthError, toOAuthError } from './errors.js';
import {
  buildAuthorizeUrl,
  clientCredentialsGrant,
  discoverAuthServer,
  exchangeAuthorizationCode,
  refreshTokenGrant,
} from './oauth-client.js';
import { authFailure, authSuccess } from './result.js';
import { createMemoryTokenStorage } from './storage.js';
import { TokenManager } from './token-manager.js';
import type { InsurUpAuth, InsurUpAuthConfig } from './types.js';

const DEFAULT_REFRESH_BUFFER_SECONDS = 60;

/**
 * Creates an {@link InsurUpAuth} handle that acquires, stores, and refreshes
 * OAuth tokens for the InsurUp platform. The authorization server metadata is
 * resolved lazily (and cached) on first use — via OIDC discovery unless explicit
 * endpoints are configured.
 *
 * @example Server-to-server (client credentials)
 * ```typescript
 * const auth = createInsurUpAuth({ clientId, clientSecret });
 * const login = await auth.loginWithClientCredentials({ scopes: ['core-api'] });
 * if (!login.isSuccess) throw login.error;
 * const client = new DefaultInsurUpClient({ auth });
 * ```
 *
 * @example Browser (authorization code + PKCE)
 * ```typescript
 * const auth = createInsurUpAuth({ clientId, storage: myStorage });
 * const { url, codeVerifier, state } = await auth.getAuthorizeUrl({ redirectUri });
 * // ...persist codeVerifier/state, navigate to url, then on the callback:
 * const result = await auth.exchangeCode({ callbackUrl: location.href, redirectUri, codeVerifier, state });
 * if (result.isSuccess) {
 *   // tokens stored — result.data holds them
 *   const client = new DefaultInsurUpClient({ auth });
 * }
 * ```
 *
 * InsurUp platformu için OAuth belirteçlerini edinen, saklayan ve yenileyen bir
 * {@link InsurUpAuth} tutamacı oluşturur.
 */
export function createInsurUpAuth(config: InsurUpAuthConfig): InsurUpAuth {
  const storage = config.storage ?? createMemoryTokenStorage();
  const refreshBufferSeconds = config.refreshBufferSeconds ?? DEFAULT_REFRESH_BUFFER_SECONDS;

  let serverPromise: Promise<oauth.AuthorizationServer> | null = null;
  const getServer = (): Promise<oauth.AuthorizationServer> => {
    serverPromise ??= discoverAuthServer(config);
    return serverPromise;
  };

  const manager = new TokenManager({
    storage,
    refreshBufferSeconds,
    refresh: async (refreshToken) =>
      refreshTokenGrant(
        await getServer(),
        config.clientId,
        refreshToken,
        config.clientSecret,
        config.allowInsecureRequests
      ),
  });

  const getAccessToken = (): Promise<string | null> => manager.getAccessToken();

  return {
    getAccessToken,
    tokenProvider: getAccessToken,

    async loginWithClientCredentials(options) {
      const clientSecret = options?.clientSecret ?? config.clientSecret;
      if (clientSecret === undefined) {
        return authFailure(
          new OAuthError('A client secret is required for the client credentials grant.')
        );
      }
      try {
        const tokens = await clientCredentialsGrant(
          await getServer(),
          config.clientId,
          clientSecret,
          options?.scopes ?? config.scopes,
          config.allowInsecureRequests
        );
        await manager.setTokens(tokens);
        return authSuccess(tokens);
      } catch (error) {
        return authFailure(toOAuthError(error));
      }
    },

    async getAuthorizeUrl(options) {
      return buildAuthorizeUrl(await getServer(), config.clientId, {
        ...options,
        scopes: options.scopes ?? config.scopes,
      });
    },

    async exchangeCode(options) {
      try {
        const tokens = await exchangeAuthorizationCode(await getServer(), config.clientId, {
          ...options,
          clientSecret: options.clientSecret ?? config.clientSecret,
          allowInsecure: config.allowInsecureRequests,
        });
        await manager.setTokens(tokens);
        return authSuccess(tokens);
      } catch (error) {
        return authFailure(toOAuthError(error));
      }
    },

    async refresh() {
      try {
        return authSuccess(await manager.refresh());
      } catch (error) {
        return authFailure(toOAuthError(error));
      }
    },
    logout: () => manager.clear(),
    getTokens: () => manager.getTokens(),
    getState: () => manager.getState(),
    subscribe: (listener) => manager.subscribe(listener),
  };
}
