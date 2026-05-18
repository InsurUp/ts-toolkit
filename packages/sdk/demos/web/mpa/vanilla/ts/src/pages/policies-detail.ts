/**
 * Policy detail page entry point.
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
import {
  formatDate,
  formatDateTime,
  formatCurrency,
  formatPolicyState,
  getPolicyStateBadgeClass,
} from '../shared/format';
import type { GetPolicyDetailResult } from '@insurup/contracts';

async function init(): Promise<void> {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  const policyId = getQueryParam('id');

  if (!policyId) {
    if (main) renderError(main, 'Error', 'No policy ID provided');
    return;
  }

  if (main) await loadPolicy(main, policyId);
}

async function loadPolicy(container: HTMLElement, policyId: string): Promise<void> {
  renderLoading(container, 'Loading policy...');

  try {
    const client = getClient();
    const res = await client.policies.getPolicyDetail({ policyId });

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || 'Failed to load policy');
    }

    renderPolicy(container, res.data);
  } catch (error) {
    console.error('Failed to load policy:', error);
    renderError(
      container,
      'Error Loading Policy',
      error instanceof Error ? error.message : 'Unknown error',
      () => loadPolicy(container, policyId)
    );
  }
}

function renderPolicy(container: HTMLElement, policy: GetPolicyDetailResult): void {
  const badgeClass = getPolicyStateBadgeClass(policy.state);

  container.innerHTML = `
    <div class="detail-header">
      <div>
        <h1>Policy ${escapeHtml(policy.insuranceCompanyPolicyNumber || 'N/A')}</h1>
        <span class="badge ${badgeClass}">${formatPolicyState(policy.state)}</span>
      </div>
      <a href="/policies/" role="button" class="secondary outline">Back to List</a>
    </div>

    <div class="card-grid">
      <article>
        <header><strong>Policy Information</strong></header>
        <dl>
          <dt>Policy ID</dt>
          <dd><code>${escapeHtml(policy.id)}</code></dd>
          
          <dt>Policy Number</dt>
          <dd>${escapeHtml(policy.insuranceCompanyPolicyNumber || '-')}</dd>
          
          <dt>State</dt>
          <dd><span class="badge ${badgeClass}">${formatPolicyState(policy.state)}</span></dd>
          
          <dt>Start Date</dt>
          <dd>${formatDate(policy.startDate)}</dd>
          
          <dt>End Date</dt>
          <dd>${formatDate(policy.endDate)}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Product Details</strong></header>
        <dl>
          <dt>Product Branch</dt>
          <dd>${escapeHtml(policy.productBranch || '-')}</dd>
          
          <dt>Product ID</dt>
          <dd><code>${policy.productId}</code></dd>
          
          <dt>Insurance Company ID</dt>
          <dd><code>${policy.insuranceCompanyId}</code></dd>
        </dl>
      </article>

      <article>
        <header><strong>Customer</strong></header>
        <dl>
          <dt>Insurer Customer ID</dt>
          <dd>
            <a href="/customers/detail.html?id=${policy.insurerCustomerId}">
              <code>${escapeHtml(policy.insurerCustomerId)}</code>
            </a>
          </dd>
          
          <dt>Insured Customer ID</dt>
          <dd>
            <a href="/customers/detail.html?id=${policy.insuredCustomerId}">
              <code>${escapeHtml(policy.insuredCustomerId)}</code>
            </a>
          </dd>
        </dl>
      </article>

      <article>
        <header><strong>Premium</strong></header>
        <dl>
          <dt>Gross Premium</dt>
          <dd><strong>${formatCurrency(policy.grossPremium, policy.currency)}</strong></dd>
          
          <dt>Net Premium</dt>
          <dd>${formatCurrency(policy.netPremium, policy.currency)}</dd>
          
          <dt>Currency</dt>
          <dd>${escapeHtml(policy.currency)}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Metadata</strong></header>
        <dl>
          <dt>Created At</dt>
          <dd>${formatDateTime(policy.createdAt)}</dd>
          
          <dt>Proposal ID</dt>
          <dd><code>${escapeHtml(policy.proposalId)}</code></dd>
        </dl>
      </article>
    </div>
  `;
}

init();
