/**
 * OAuth callback page entry point.
 */

import { loadConfig } from '../shared/config';
import { renderHeader, initTheme, renderError, showSuccess } from '../shared/components';
import { handleCallback } from '../shared/auth';

async function init(): Promise<void> {
  loadConfig();
  initTheme();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (!main) return;

  // Get code and state from URL
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');
  const errorDescription = params.get('error_description');

  if (error) {
    renderError(main, 'Authentication Failed', errorDescription || error, () => {
      window.location.href = '/login.html';
    });
    return;
  }

  if (!code || !state) {
    renderError(main, 'Invalid Callback', 'Missing authorization code or state parameter.', () => {
      window.location.href = '/login.html';
    });
    return;
  }

  try {
    await handleCallback();
    showSuccess('Successfully authenticated!');

    // Clear URL params and redirect to home
    window.history.replaceState({}, '', '/callback.html');
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  } catch (err) {
    console.error('Callback error:', err);
    renderError(
      main,
      'Authentication Failed',
      err instanceof Error ? err.message : 'Unknown error occurred',
      () => {
        window.location.href = '/login.html';
      }
    );
  }
}

init();
