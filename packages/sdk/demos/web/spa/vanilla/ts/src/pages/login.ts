/**
 * Login page - initiates OAuth2 login flow.
 */

import { startLogin, isAuthenticated } from '../auth';
import { navigate } from '../utils/router';

export async function render(container: HTMLElement): Promise<void> {
  // If already authenticated, redirect to home
  if (isAuthenticated()) {
    navigate('/');
    return;
  }

  container.innerHTML = `
    <article style="max-width: 400px; margin: 0 auto;">
      <header>
        <h2>Login</h2>
      </header>
      <p>
        Click the button below to authenticate with your InsurUp account.
        You will be redirected to the authorization server.
      </p>
      <button id="login-btn" style="width: 100%;">
        Login with InsurUp
      </button>
      <footer>
        <small>
          This demo uses OAuth2 with PKCE for secure authentication.
          Your credentials are never shared with this application.
        </small>
      </footer>
    </article>
  `;

  const loginBtn = container.querySelector('#login-btn');
  loginBtn?.addEventListener('click', async () => {
    loginBtn.setAttribute('aria-busy', 'true');
    try {
      await startLogin();
    } catch (error) {
      console.error('Login failed:', error);
      loginBtn.removeAttribute('aria-busy');

      const errorMsg = document.createElement('p');
      errorMsg.style.color = 'var(--pico-del-color)';
      errorMsg.textContent = `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      container.querySelector('article')?.appendChild(errorMsg);
    }
  });
}
