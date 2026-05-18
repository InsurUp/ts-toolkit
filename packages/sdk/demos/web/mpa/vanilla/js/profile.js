/**
 * Profile page entry point.
 * @module pages/profile
 */

import { loadConfig } from './js/shared/config.js';
import {
  renderHeader,
  initTheme,
  renderLoading,
  renderError,
  escapeHtml,
} from './js/shared/components.js';
import { requireAuth } from './js/shared/auth.js';
import { getClient } from './js/shared/client.js';

/**
 * Initializes the profile page.
 */
async function init() {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) await loadProfile(main);
}

/**
 * Loads and displays the user profile.
 * @param {HTMLElement} container - The container element
 */
async function loadProfile(container) {
  renderLoading(container, 'Loading profile...');

  try {
    const client = getClient();
    const res = await client.users.getCurrentUser();

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || 'Failed to load profile');
    }

    renderProfile(container, res.data);
  } catch (error) {
    console.error('Failed to load profile:', error);
    renderError(
      container,
      'Error Loading Profile',
      error instanceof Error ? error.message : 'Unknown error',
      () => loadProfile(container)
    );
  }
}

/**
 * Renders the profile content.
 * @param {HTMLElement} container - The container element
 * @param {Object} user - The user data
 */
function renderProfile(container, user) {
  const isAgent = 'agentId' in user;

  container.innerHTML = `
    <div class="detail-header">
      <h1>My Profile</h1>
    </div>

    <div class="card-grid">
      <article>
        <header><strong>User Information</strong></header>
        <dl>
          <dt>User ID</dt>
          <dd><code>${escapeHtml(user.id)}</code></dd>
          
          <dt>Name</dt>
          <dd>${escapeHtml(user.name || '-')}</dd>
          
          <dt>Email</dt>
          <dd>${escapeHtml(user.email || '-')}</dd>
          
          <dt>Type</dt>
          <dd>${isAgent ? 'Agent User' : 'Customer'}</dd>
        </dl>
      </article>

      ${
        isAgent
          ? `
        <article>
          <header><strong>Agent Details</strong></header>
          <dl>
            <dt>Agent ID</dt>
            <dd><code>${escapeHtml(user.agentId)}</code></dd>
            
            <dt>Agent Name</dt>
            <dd>${escapeHtml(user.agentName || '-')}</dd>
          </dl>
        </article>
      `
          : ''
      }
    </div>
  `;
}

init();
