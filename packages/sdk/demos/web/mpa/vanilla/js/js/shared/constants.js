/**
 * Centralized constants and type definitions for the MPA demo.
 */

// ============ Pagination Constants ============

/** @type {number} Default number of items per page */
export const DEFAULT_PAGE_SIZE = 10;

/** @type {number} Debounce delay in milliseconds for search inputs */
export const DEBOUNCE_DELAY_MS = 300;

// ============ Storage Keys ============

/**
 * LocalStorage and SessionStorage keys used by the application.
 * @type {Object}
 */
export const STORAGE_KEYS = {
  /** OAuth tokens storage key */
  TOKENS: "insurup_tokens",
  /** PKCE data storage key (sessionStorage) */
  PKCE: "insurup_pkce",
  /** Configuration overrides storage key */
  CONFIG: "insurup_config",
  /** Theme preference storage key */
  THEME: "theme",
};

// ============ Type Definitions ============

/**
 * @typedef {Object} PageInfo
 * @property {boolean} hasNextPage - Whether there are more items after the current page
 * @property {boolean} hasPreviousPage - Whether there are items before the current page
 * @property {string|null} startCursor - Cursor for the first item on the page
 * @property {string|null} endCursor - Cursor for the last item on the page
 */

/**
 * @typedef {Object} ListStateManager
 * @property {number} currentPage - Current page number (1-indexed)
 * @property {(string|null)[]} cursors - Array of cursors for each page
 * @property {() => void} reset - Reset pagination state to initial values
 * @property {(cursor: string) => void} goToNext - Navigate to next page with given cursor
 * @property {() => void} goToPrevious - Navigate to previous page
 * @property {() => void} goToFirst - Navigate to first page
 * @property {() => string|null} getCurrentCursor - Get cursor for current page
 */

/**
 * @typedef {Object} PaginationCallbacks
 * @property {(cursor: string) => void} onNext - Called when navigating to next page
 * @property {() => void} onPrevious - Called when navigating to previous page
 * @property {() => void} onFirst - Called when navigating to first page
 */

/**
 * @typedef {Object} TokenData
 * @property {string} accessToken - The OAuth access token
 * @property {string} [refreshToken] - The OAuth refresh token
 * @property {number} [expiresAt] - Token expiration timestamp in milliseconds
 * @property {string} tokenType - Token type (usually "Bearer")
 */

/**
 * @typedef {Object} Config
 * @property {string} authServer - OAuth2 authorization server URL
 * @property {string} clientId - OAuth2 client ID
 * @property {string[]} scopes - OAuth2 scopes to request
 * @property {string} redirectUri - OAuth2 redirect URI
 * @property {string} [apiBaseUrl] - API base URL override
 */
