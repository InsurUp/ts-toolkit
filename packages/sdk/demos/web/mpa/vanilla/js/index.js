/**
 * Home page entry point.
 * @module pages/home
 */

import { loadConfig } from './js/shared/config.js';
import { renderHeader, initTheme } from './js/shared/components.js';
import { isAuthenticated } from './js/shared/auth.js';

/**
 * Initializes the home page.
 */
function init() {
  loadConfig();
  initTheme();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) renderHome(main);
}

/**
 * Renders the home page content.
 * @param {HTMLElement} container - The container element
 */
function renderHome(container) {
  const authenticated = isAuthenticated();

  container.innerHTML = `
    <article>
      <header>
        <h1>InsurUp SDK Demo</h1>
        <p>Multi-Page Application with Vanilla JavaScript</p>
      </header>
      
      <p>
        This demo showcases the InsurUp SDK in a traditional multi-page application
        using <strong>plain JavaScript</strong> with no build step required.
      </p>

      <h3>Features</h3>
      <ul>
        <li><strong>OAuth2/PKCE Authentication</strong> - Secure browser-based authentication</li>
        <li><strong>Customer Management</strong> - List, view, and create customers</li>
        <li><strong>Policy Management</strong> - Browse policies with filtering and pagination</li>
        <li><strong>No Build Step</strong> - Pure JavaScript, just edit and refresh</li>
        <li><strong>No Framework</strong> - Vanilla JS, no React/Vue/Svelte</li>
      </ul>

      ${
        authenticated
          ? `
        <h3>Quick Links</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/customers/" role="button">View Customers</a>
          <a href="/policies/" role="button" class="secondary">View Policies</a>
          <a href="/profile.html" role="button" class="outline">My Profile</a>
        </div>
      `
          : `
        <h3>Get Started</h3>
        <p>Login to explore the demo.</p>
        <a href="/login.html" role="button">Login with InsurUp</a>
      `
      }
    </article>
  `;
}

init();
