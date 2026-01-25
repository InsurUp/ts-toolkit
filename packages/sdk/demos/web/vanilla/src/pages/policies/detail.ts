/**
 * Policy detail page.
 */

import { getClient } from "../../client";
import { renderLoading, renderError } from "../../components/loading";
import { formatDate, formatDateTime, formatCurrency, formatPolicyState, getPolicyStateBadgeClass } from "../../utils/format";
import { escapeHtml } from "../../utils/dom";
import type { RouteParams } from "../../utils/router";

export async function render(container: HTMLElement, params?: RouteParams): Promise<void> {
  const policyId = params?.id;

  if (!policyId) {
    renderError(container, "Error", "No policy ID provided");
    return;
  }

  renderLoading(container, "Loading policy details...");

  try {
    const client = getClient();
    const res = await client.policies.getPolicyDetail({ policyId });

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || "Failed to load policy");
    }

    const policy = res.data;
    const badgeClass = getPolicyStateBadgeClass(policy.state);

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <h1>Policy ${escapeHtml(policy.insuranceCompanyPolicyNumber || "N/A")}</h1>
          <span class="badge ${badgeClass}">
            ${formatPolicyState(policy.state)}
          </span>
        </div>
        <a href="#/policies" role="button" class="secondary outline">Back to List</a>
      </div>

      <div class="card-grid">
        <article>
          <header><strong>Policy Information</strong></header>
          <dl>
            <dt>Policy ID</dt>
            <dd><code>${escapeHtml(policy.id)}</code></dd>
            
            <dt>Policy Number</dt>
            <dd>${escapeHtml(policy.insuranceCompanyPolicyNumber || "-")}</dd>
            
            <dt>State</dt>
            <dd>
              <span class="badge ${badgeClass}">
                ${formatPolicyState(policy.state)}
              </span>
            </dd>
            
            <dt>Start Date</dt>
            <dd>${formatDate(policy.startDate)}</dd>
            
            <dt>End Date</dt>
            <dd>${formatDate(policy.endDate)}</dd>
            
            ${policy.arrangementDate ? `
              <dt>Arrangement Date</dt>
              <dd>${formatDate(policy.arrangementDate)}</dd>
            ` : ""}
          </dl>
        </article>

        <article>
          <header><strong>Product Details</strong></header>
          <dl>
            <dt>Product Branch</dt>
            <dd>${escapeHtml(policy.productBranch || "-")}</dd>
            
            <dt>Product ID</dt>
            <dd><code>${policy.productId}</code></dd>
            
            <dt>Insurance Company ID</dt>
            <dd><code>${policy.insuranceCompanyId}</code></dd>
            
            <dt>Channel</dt>
            <dd>${escapeHtml(policy.channel || "-")}</dd>
          </dl>
        </article>

        <article>
          <header><strong>Customer</strong></header>
          <dl>
            <dt>Insurer Customer ID</dt>
            <dd>
              <a href="#/customers/${policy.insurerCustomerId}">
                <code>${escapeHtml(policy.insurerCustomerId)}</code>
              </a>
            </dd>
            
            <dt>Insured Customer ID</dt>
            <dd>
              <a href="#/customers/${policy.insuredCustomerId}">
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
            
            ${policy.commission != null ? `
              <dt>Commission</dt>
              <dd>${formatCurrency(policy.commission, policy.currency)}</dd>
            ` : ""}
            
            <dt>Currency</dt>
            <dd>${escapeHtml(policy.currency)}</dd>
            
            <dt>Payment Type</dt>
            <dd>${escapeHtml(policy.paymentType || "-")}</dd>
            
            ${policy.installmentNumber != null ? `
              <dt>Installments</dt>
              <dd>${policy.installmentNumber}</dd>
            ` : ""}
          </dl>
        </article>

        <article>
          <header><strong>Reference Numbers</strong></header>
          <dl>
            <dt>Proposal Number</dt>
            <dd>${escapeHtml(policy.insuranceCompanyProposalNumber || "-")}</dd>
            
            <dt>Proposal ID</dt>
            <dd><code>${escapeHtml(policy.proposalId)}</code></dd>
            
            ${policy.daskPolicyNumber ? `
              <dt>DASK Policy Number</dt>
              <dd>${escapeHtml(policy.daskPolicyNumber)}</dd>
            ` : ""}
            
            <dt>Endorsement Number</dt>
            <dd>${policy.insuranceCompanyEndorsementNumber}</dd>
            
            <dt>Renewal Number</dt>
            <dd>${policy.insuranceCompanyRenewalNumber}</dd>
          </dl>
        </article>

        <article>
          <header><strong>Metadata</strong></header>
          <dl>
            <dt>Created At</dt>
            <dd>${formatDateTime(policy.createdAt)}</dd>
            
            <dt>Created By</dt>
            <dd>
              ${policy.createdBy?.name ? escapeHtml(policy.createdBy.name) : "-"}
              ${policy.createdBy?.id ? ` (<code>${escapeHtml(policy.createdBy.id)}</code>)` : ""}
            </dd>
            
            ${policy.representedBy ? `
              <dt>Representative</dt>
              <dd>
                ${policy.representedBy.name ? escapeHtml(policy.representedBy.name) : "-"}
                ${policy.representedBy.id ? ` (<code>${escapeHtml(policy.representedBy.id)}</code>)` : ""}
              </dd>
            ` : ""}
          </dl>
        </article>
      </div>
    `;
  } catch (error) {
    console.error("Failed to load policy:", error);
    renderError(
      container,
      "Error Loading Policy",
      error instanceof Error ? error.message : "Unknown error",
      () => render(container, params)
    );
  }
}
