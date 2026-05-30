/**
 * Authentication module exports.
 *
 * Backed by the InsurUp SDK's first-class auth module (`createInsurUpAuth`).
 */

export {
  getAuth,
  startLogin,
  handleCallback,
  getAccessToken,
  getAuthStatus,
  isAuthenticated,
  subscribeAuth,
  logout,
  type AuthStatus,
} from './auth';
