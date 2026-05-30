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
    // Surface an explicit authorization-server error before attempting exchange.
    // The callback URL format is: /callback?code=xxx&state=yyy (or ?error=...)
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      throw new Error(
        `Authorization failed: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`
      );
    }

    // Exchange the authorization code for tokens. The SDK parses code and state
    // from the callback URL and validates state against the stashed value.
    await handleCallback(window.location.href);

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
