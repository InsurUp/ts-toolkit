/**
 * OAuth callback page - handles the authorization code exchange.
 */

import { handleCallback } from '../auth';
import { showSuccess, showError } from '../components/toast';

export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner large"></div>
      <p>Completing authentication...</p>
    </div>
  `;

  try {
    // Parse URL parameters from query string
    // The callback URL format is: /callback?code=xxx&state=yyy
    const params = new URLSearchParams(window.location.search);

    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      throw new Error(
        `Authorization failed: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`
      );
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state parameter');
    }

    // Exchange code for tokens
    await handleCallback(code, state);

    showSuccess('Successfully authenticated!');

    // Redirect to home (full page navigation to initialize the app properly)
    window.location.href = '/';
  } catch (error) {
    console.error('Callback error:', error);
    showError(error instanceof Error ? error.message : 'Authentication failed');

    container.innerHTML = `
      <article style="max-width: 500px; margin: 0 auto;">
        <header>
          <h2>Authentication Failed</h2>
        </header>
        <p>${error instanceof Error ? error.message : 'An unknown error occurred during authentication.'}</p>
        <a href="/#/login" role="button">Try Again</a>
      </article>
    `;
  }
}
