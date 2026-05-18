/**
 * Home page - landing page for the demo.
 */

import { isAuthenticated } from '../auth';

export async function render(container: HTMLElement): Promise<void> {
  const authenticated = isAuthenticated();

  container.innerHTML = `
    <div class="hero">
      <h1>InsurUp SDK Demo</h1>
      <p>
        A comprehensive demonstration of the InsurUp TypeScript SDK for the browser.
        Explore customers, policies, and more with OAuth2 authentication.
      </p>
      <div class="hero-actions">
        ${
          authenticated
            ? `
              <a href="#/customers" role="button">View Customers</a>
              <a href="#/policies" role="button" class="secondary">View Policies</a>
            `
            : `
              <a href="#/login" role="button">Login to Get Started</a>
            `
        }
      </div>
    </div>

    <div class="feature-grid">
      <article class="feature-card">
        <h3>OAuth2/PKCE Authentication</h3>
        <p>
          Secure authentication using the OAuth2 authorization code flow with PKCE,
          implemented entirely in the browser.
        </p>
      </article>

      <article class="feature-card">
        <h3>GraphQL Queries</h3>
        <p>
          Type-safe GraphQL queries with field selection, cursor-based pagination,
          and filtering support.
        </p>
      </article>

      <article class="feature-card">
        <h3>Customer Management</h3>
        <p>
          Browse customers, view details, and create new customers with full
          validation and error handling.
        </p>
      </article>

      <article class="feature-card">
        <h3>Policy Management</h3>
        <p>
          View policies with filtering by state, branch, and date. Access policy
          details and documents.
        </p>
      </article>

      <article class="feature-card">
        <h3>Vanilla JavaScript</h3>
        <p>
          No frameworks required. Built with vanilla TypeScript to demonstrate
          SDK usage in any environment.
        </p>
      </article>

      <article class="feature-card">
        <h3>Pico CSS</h3>
        <p>
          Minimal, semantic styling with Pico CSS. Dark mode support included.
          No complex build setup needed.
        </p>
      </article>
    </div>

    <article style="margin-top: 3rem;">
      <header>
        <h3>Getting Started</h3>
      </header>
      <ol>
        <li>Click the <strong>Login</strong> button to authenticate with your InsurUp account</li>
        <li>Browse <strong>Customers</strong> to see the GraphQL query in action</li>
        <li>Create a new customer using the <strong>Create Customer</strong> form</li>
        <li>Explore <strong>Policies</strong> to view insurance policy data</li>
        <li>Check your <strong>Profile</strong> to see your agent user information</li>
      </ol>
    </article>
  `;
}
