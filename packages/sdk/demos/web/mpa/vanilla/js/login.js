/**
 * Login page entry point.
 * @module pages/login
 */

import { loadConfig } from './js/shared/config.js';
import { renderHeader, initTheme } from './js/shared/components.js';
import { startLogin, isAuthenticated } from './js/shared/auth.js';

/**
 * Initializes the login page.
 */
function init() {
  loadConfig();
  initTheme();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  if (isAuthenticated()) {
    window.location.href = '/';
    return;
  }

  const main = document.getElementById('main-content');
  if (main) renderLogin(main);
}

/**
 * Renders the login form.
 * @param {HTMLElement} container - The container element
 */
function renderLogin(container) {
  container.innerHTML = `
    <article style="max-width: 400px; margin: 2rem auto;">
      <header>
        <h2>Login</h2>
      </header>
      <p>Click the button below to authenticate with InsurUp using OAuth2.</p>
      <button id="login-btn" style="width: 100%;">Login with InsurUp</button>
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
