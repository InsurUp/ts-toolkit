import {
  OAuthApplicationType,
  OAuthClientType,
  OAuthGrantType,
  type GetOAuthClientByIdResult,
  type GetOAuthClientsResult,
} from '@insurup/contracts';

export const sampleOAuthClientSummary: GetOAuthClientsResult = {
  id: 'OAC-1',
  clientId: 'agent-panel',
  displayName: 'Agent Panel',
  clientType: OAuthClientType.Confidential,
  scopes: ['core-api'],
  createdAt: '2024-01-01T00:00:00Z',
};

export const sampleOAuthClient: GetOAuthClientByIdResult = {
  id: 'OAC-1',
  applicationId: 'APP-1',
  clientId: 'agent-panel',
  displayName: 'Agent Panel',
  clientType: OAuthClientType.Confidential,
  applicationType: OAuthApplicationType.Web,
  grantTypes: [OAuthGrantType.AuthorizationCode, OAuthGrantType.RefreshToken],
  scopes: ['core-api'],
  redirectUris: ['https://agent-panel.insurup.com/signin-oidc'],
  postLogoutRedirectUris: ['https://agent-panel.insurup.com/signout-callback-oidc'],
  requirePushedAuthorizationRequests: false,
  createdAt: '2024-01-01T00:00:00Z',
};
