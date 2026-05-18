/**
 * Profile page entry point.
 */

import { loadConfig } from '../shared/config';
import {
  renderHeader,
  initTheme,
  renderLoading,
  renderError,
  escapeHtml,
} from '../shared/components';
import { requireAuth } from '../shared/auth';
import { getClient } from '../shared/client';
import type { GetAgentUserResult } from '@insurup/contracts';

async function init(): Promise<void> {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) await loadProfile(main);
}

async function loadProfile(container: HTMLElement): Promise<void> {
  renderLoading(container, 'Loading profile...');

  try {
    const client = getClient();
    const res = await client.agentUsers.getMyAgentUser();

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

function renderProfile(container: HTMLElement, user: GetAgentUserResult): void {
  const fullName = `${user.firstName} ${user.lastName}`.trim() || '-';

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
          <dd>${escapeHtml(fullName)}</dd>
          
          <dt>Email</dt>
          <dd>${escapeHtml(user.email || '-')}</dd>
          
          <dt>Type</dt>
          <dd>Agent User</dd>
        </dl>
      </article>

      <article>
        <header><strong>Agent Details</strong></header>
        <dl>
          <dt>Agent Name</dt>
          <dd>${escapeHtml(user.agentName || '-')}</dd>
          
          <dt>Roles</dt>
          <dd>${user.roles.length > 0 ? escapeHtml(user.roles.join(', ')) : '-'}</dd>
        </dl>
      </article>
    </div>
  `;
}

init();
