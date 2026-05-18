/**
 * Login page entry point.
 */

import { loadConfig } from '../shared/config';
import { renderHeader, initTheme } from '../shared/components';
import { startLogin, isAuthenticated } from '../shared/auth';

function init(): void {
  loadConfig();
  initTheme();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  // Redirect if already authenticated
  if (isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  const main = document.getElementById('main-content');
  if (main) renderLogin(main);
}

function renderLogin(container: HTMLElement): void {
  container.innerHTML = `
    <article style="max-width: 400px; margin: 2rem auto;">
      <header>
        <h2>Login</h2>
      </header>
      <p>
        Click the button below to authenticate with InsurUp using OAuth2.
      </p>
      <button id="login-btn" style="width: 100%;">
        Login with InsurUp
      </button>
      <footer>
        <small>You will be redirected to the InsurUp authentication server.</small>
      </footer>
    </article>
  `;

  const loginBtn = container.querySelector('#login-btn');
  loginBtn?.addEventListener('click', async () => {
    loginBtn.setAttribute('aria-busy', 'true');
    loginBtn.textContent = 'Redirecting...';
    try {
      await startLogin();
    } catch (error) {
      console.error('Login error:', error);
      loginBtn.removeAttribute('aria-busy');
      loginBtn.textContent = 'Login with InsurUp';
    }
  });
}

init();
