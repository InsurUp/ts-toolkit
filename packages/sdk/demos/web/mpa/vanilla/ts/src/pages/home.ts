/**
 * Home page entry point.
 */

import { loadConfig } from "../shared/config";
import { renderHeader, initTheme } from "../shared/components";
import { isAuthenticated } from "../shared/auth";

function init(): void {
  loadConfig();
  initTheme();

  const nav = document.getElementById("main-nav");
  if (nav) renderHeader(nav);

  const main = document.getElementById("main-content");
  if (main) renderHome(main);
}

function renderHome(container: HTMLElement): void {
  const authenticated = isAuthenticated();

  container.innerHTML = `
    <article>
      <header>
        <h1>InsurUp SDK Demo</h1>
        <p>Multi-Page Application with Vanilla TypeScript</p>
      </header>
      
      <p>
        This demo showcases the InsurUp SDK in a traditional multi-page application
        architecture. Each page is a separate HTML file with its own JavaScript bundle.
      </p>

      <h3>Features</h3>
      <ul>
        <li><strong>OAuth2/PKCE Authentication</strong> - Secure browser-based authentication</li>
        <li><strong>Customer Management</strong> - List, view, and create customers</li>
        <li><strong>Policy Management</strong> - Browse policies with filtering and pagination</li>
        <li><strong>No Framework</strong> - Pure TypeScript, no React/Vue/Svelte</li>
      </ul>

      ${authenticated ? `
        <h3>Quick Links</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="/customers/" role="button">View Customers</a>
          <a href="/policies/" role="button" class="secondary">View Policies</a>
          <a href="/profile.html" role="button" class="outline">My Profile</a>
        </div>
      ` : `
        <h3>Get Started</h3>
        <p>Login to explore the demo.</p>
        <a href="/login.html" role="button">Login with InsurUp</a>
      `}
    </article>
  `;
}

init();
