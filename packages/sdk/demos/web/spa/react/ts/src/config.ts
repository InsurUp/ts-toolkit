// OAuth2 configuration - uses discovery-style auth server URL
const authServer = import.meta.env.VITE_AUTH_SERVER || 'https://auth.insurup.com';
const scopesEnv = import.meta.env.VITE_SCOPES || 'openid profile offline_access core-api';

export const authConfig = {
  clientId: import.meta.env.VITE_CLIENT_ID || 'demo',
  authServer,
  scopes: scopesEnv.split(' ').filter(Boolean),
  redirectUri: `${window.location.origin}/callback`,
};

export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.insurup.com',
};
