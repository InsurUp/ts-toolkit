/**
 * Profile page - displays current user information.
 */

import { getClient } from "../client";
import { renderLoading, renderError } from "../components/loading";
import { formatDateTime, formatCustomerType } from "../utils/format";
import { escapeHtml } from "../utils/dom";
import { CustomerType, type GetAgentUserResult, type GetCustomerResult, type CustomerPhoneNumber } from "@insurup/contracts";

/** Helper to format phone number */
function formatPhoneNumber(phone: CustomerPhoneNumber | null | undefined): string {
  if (!phone) return "-";
  return `+${phone.countryCode} ${phone.number}`;
}

/** Helper to get customer display name */
function getCustomerDisplayName(customer: GetCustomerResult): string {
  if (customer.type === CustomerType.Company) {
    return customer.title;
  }
  return customer.fullName || "Customer";
}

export async function render(container: HTMLElement): Promise<void> {
  renderLoading(container, "Loading profile...");

  try {
    const client = getClient();

    // Try to get agent user first, then fall back to customer
    const agentUserRes = await client.agentUsers.getMyAgentUser();

    if (agentUserRes.isSuccess && agentUserRes.data) {
      renderAgentUserProfile(container, agentUserRes.data);
      return;
    }

    // Try customer
    const customerRes = await client.customers.getCurrentCustomer();

    if (customerRes.isSuccess && customerRes.data) {
      renderCustomerProfile(container, customerRes.data);
      return;
    }

    // Neither worked
    renderError(
      container,
      "Profile Not Found",
      "Could not load your profile. You may not have an agent user or customer account."
    );
  } catch (error) {
    console.error("Failed to load profile:", error);
    renderError(
      container,
      "Error Loading Profile",
      error instanceof Error ? error.message : "Unknown error",
      () => render(container)
    );
  }
}

function renderAgentUserProfile(container: HTMLElement, user: GetAgentUserResult): void {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Agent User";

  container.innerHTML = `
    <h1>Profile</h1>
    <p>Your agent user account information.</p>

    <div class="card-grid">
      <article>
        <header><strong>Account Information</strong></header>
        <dl>
          <dt>User ID</dt>
          <dd><code>${escapeHtml(user.id)}</code></dd>
          
          <dt>Full Name</dt>
          <dd>${escapeHtml(fullName)}</dd>
          
          <dt>Email</dt>
          <dd><a href="mailto:${escapeHtml(user.email)}">${escapeHtml(user.email)}</a></dd>
          
          <dt>2FA Enabled</dt>
          <dd>${user.twoFactorEnabled ? "Yes" : "No"}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Organization</strong></header>
        <dl>
          <dt>Agent Name</dt>
          <dd>${escapeHtml(user.agentName || "-")}</dd>
          
          <dt>Call Center</dt>
          <dd>${escapeHtml(user.callCenterImplementation || "-")}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Roles & Permissions</strong></header>
        <dl>
          <dt>Roles</dt>
          <dd>${user.roles.length > 0 ? user.roles.map(r => escapeHtml(r)).join(", ") : "-"}</dd>
          
          <dt>Permissions</dt>
          <dd style="max-height: 150px; overflow-y: auto;">
            ${user.permissions.length > 0 
              ? `<small>${user.permissions.slice(0, 10).map(p => escapeHtml(p)).join(", ")}${user.permissions.length > 10 ? ` (+${user.permissions.length - 10} more)` : ""}</small>`
              : "-"
            }
          </dd>
        </dl>
      </article>
    </div>
  `;
}

function renderCustomerProfile(container: HTMLElement, customer: GetCustomerResult): void {
  const displayName = getCustomerDisplayName(customer);
  const isCompany = customer.type === CustomerType.Company;

  container.innerHTML = `
    <h1>Profile</h1>
    <p>Your customer account information.</p>

    <div class="card-grid">
      <article>
        <header><strong>Account Information</strong></header>
        <dl>
          <dt>Customer ID</dt>
          <dd><code>${escapeHtml(customer.id)}</code></dd>
          
          <dt>Name</dt>
          <dd>${escapeHtml(displayName)}</dd>
          
          <dt>Type</dt>
          <dd>${formatCustomerType(customer.type)}</dd>
          
          <dt>Email</dt>
          <dd>${customer.primaryEmail ? `<a href="mailto:${escapeHtml(customer.primaryEmail)}">${escapeHtml(customer.primaryEmail)}</a>` : "-"}</dd>
          
          <dt>Phone</dt>
          <dd>${formatPhoneNumber(customer.primaryPhoneNumber)}</dd>
        </dl>
      </article>

      <article>
        <header><strong>Identity</strong></header>
        <dl>
          ${customer.type === CustomerType.Individual || customer.type === CustomerType.Foreign ? `
            <dt>Identity Number</dt>
            <dd>${escapeHtml(String(customer.identityNumber))}</dd>
          ` : ""}
          
          ${isCompany ? `
            <dt>Tax Number</dt>
            <dd>${escapeHtml(customer.taxNumber)}</dd>
          ` : ""}
          
          ${(customer.type === CustomerType.Individual || customer.type === CustomerType.Foreign) && customer.birthDate ? `
            <dt>Date of Birth</dt>
            <dd>${formatDateTime(customer.birthDate.toString())}</dd>
          ` : ""}
        </dl>
      </article>

      <article>
        <header><strong>Timestamps</strong></header>
        <dl>
          <dt>Created At</dt>
          <dd>${formatDateTime(customer.createdAt?.toString())}</dd>
        </dl>
      </article>
    </div>
  `;
}
