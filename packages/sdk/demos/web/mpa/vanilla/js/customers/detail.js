/**
 * Customer detail page entry point.
 * @module pages/customers/detail
 */

import { loadConfig } from '../js/shared/config.js';
import {
  renderHeader,
  initTheme,
  renderLoading,
  renderError,
  escapeHtml,
  getQueryParam,
} from '../js/shared/components.js';
import { requireAuth } from '../js/shared/auth.js';
import { getClient } from '../js/shared/client.js';
import { formatDateTime, formatCustomerType } from '../js/shared/format.js';

/**
 * Initializes the customer detail page.
 */
async function init() {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  const customerId = getQueryParam('id');

  if (!customerId) {
    if (main) renderError(main, 'Error', 'No customer ID provided');
    return;
  }

  if (main) await loadCustomer(main, customerId);
}

/**
 * Loads a customer from the API.
 * @param {HTMLElement} container - The container element
 * @param {string} customerId - The customer ID
 */
async function loadCustomer(container, customerId) {
  renderLoading(container, 'Loading customer...');

  try {
    const client = getClient();
    const res = await client.customers.getCustomer(customerId);

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || 'Failed to load customer');
    }

    renderCustomer(container, res.data);
  } catch (error) {
    console.error('Failed to load customer:', error);
    renderError(
      container,
      'Error Loading Customer',
      error instanceof Error ? error.message : 'Unknown error',
      () => loadCustomer(container, customerId)
    );
  }
}

/**
 * Renders the customer detail view.
 * @param {HTMLElement} container - The container element
 * @param {Object} customer - The customer data
 */
function renderCustomer(container, customer) {
  container.innerHTML = `
    <div class="detail-header">
      <div>
        <h1>${escapeHtml(customer.name || 'Customer')}</h1>
        <span class="badge">${formatCustomerType(customer.type)}</span>
      </div>
      <a href="/customers/" role="button" class="secondary outline">Back to List</a>
    </div>

    <div class="card-grid">
      <article>
        <header><strong>Basic Information</strong></header>
        <dl>
          <dt>Customer ID</dt>
          <dd><code>${escapeHtml(customer.id)}</code></dd>
          
          <dt>Name</dt>
          <dd>${escapeHtml(customer.name || '-')}</dd>
          
          <dt>Type</dt>
          <dd>${formatCustomerType(customer.type)}</dd>
          
          <dt>Identity Number</dt>
          <dd>${escapeHtml(customer.identityNumber || '-')}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Contact Information</strong></header>
        <dl>
          <dt>Email</dt>
          <dd>${escapeHtml(customer.primaryEmail || '-')}</dd>
          
          <dt>Phone</dt>
          <dd>${escapeHtml(customer.primaryPhone || '-')}</dd>
          
          <dt>Address</dt>
          <dd>${escapeHtml(customer.primaryAddress || '-')}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Metadata</strong></header>
        <dl>
          <dt>Created At</dt>
          <dd>${formatDateTime(customer.createdAt)}</dd>
          
          <dt>Updated At</dt>
          <dd>${formatDateTime(customer.updatedAt)}</dd>
        </dl>
      </article>
    </div>
  `;
}

init();
