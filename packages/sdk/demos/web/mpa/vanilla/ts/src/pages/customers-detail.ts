/**
 * Customer detail page entry point.
 */

import { loadConfig } from '../shared/config';
import {
  renderHeader,
  initTheme,
  renderLoading,
  renderError,
  escapeHtml,
  getQueryParam,
} from '../shared/components';
import { requireAuth } from '../shared/auth';
import { getClient } from '../shared/client';
import { formatDateTime, formatCustomerType } from '../shared/format';
import type { GetCustomerResult } from '@insurup/contracts';

async function init(): Promise<void> {
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

async function loadCustomer(container: HTMLElement, customerId: string): Promise<void> {
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

function getCustomerName(customer: GetCustomerResult): string {
  if ('fullName' in customer && customer.fullName) return customer.fullName;
  if ('title' in customer && customer.title) return customer.title;
  return 'Customer';
}

function getIdentityNumber(customer: GetCustomerResult): string {
  if ('identityNumber' in customer) return String(customer.identityNumber);
  if ('taxNumber' in customer) return customer.taxNumber;
  return '-';
}

function renderCustomer(container: HTMLElement, customer: GetCustomerResult): void {
  const name = getCustomerName(customer);
  const identityNumber = getIdentityNumber(customer);

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <h1>${escapeHtml(name)}</h1>
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
          <dd>${escapeHtml(name)}</dd>
          
          <dt>Type</dt>
          <dd>${formatCustomerType(customer.type)}</dd>
          
          <dt>Identity Number</dt>
          <dd>${escapeHtml(identityNumber)}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Contact Information</strong></header>
        <dl>
          <dt>Email</dt>
          <dd>${escapeHtml(customer.primaryEmail || '-')}</dd>
          
          <dt>Phone</dt>
          <dd>${customer.primaryPhoneNumber ? `+${customer.primaryPhoneNumber.countryCode} ${escapeHtml(customer.primaryPhoneNumber.number)}` : '-'}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Metadata</strong></header>
        <dl>
          <dt>Created At</dt>
          <dd>${formatDateTime(customer.createdAt)}</dd>
        </dl>
      </article>
    </div>
  `;
}

init();
