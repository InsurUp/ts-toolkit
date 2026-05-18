/**
 * Configuration management for the MPA demo.
 * @module config
 */

import { STORAGE_KEYS } from './constants.js';

/**
 * @typedef {import('./constants.js').Config} Config
 */

/** @type {Config} */
const defaults = {
  authServer: 'https://auth.insurup.com',
  clientId: 'demo',
  scopes: ['openid', 'profile', 'offline_access', 'core-api'],
  redirectUri: `${window.location.origin}/callback`,
};

/** @type {Config|null} */
let cachedConfig = null;

/**
 * Loads configuration from localStorage, merging with defaults.
 * The result is cached for subsequent calls.
 *
 * @returns {Config} The merged configuration
 */
export function loadConfig() {
  if (cachedConfig) {
    return cachedConfig;
  }

  const storedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
  const overrides = storedConfig ? JSON.parse(storedConfig) : {};

  cachedConfig = {
    ...defaults,
    ...overrides,
    redirectUri: `${window.location.origin}/callback`,
  };

  return cachedConfig;
}

/**
 * Gets the current configuration.
 * Loads from storage if not already cached.
 *
 * @returns {Config} The current configuration
 */
export function getConfig() {
  if (!cachedConfig) {
    return loadConfig();
  }
  return cachedConfig;
}
