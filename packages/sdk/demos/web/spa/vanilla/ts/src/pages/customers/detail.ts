/**
 * Customer detail page.
 */

import { getClient } from '../../client';
import { renderLoading, renderError } from '../../components/loading';
import { formatDate, formatDateTime, formatCustomerType } from '../../utils/format';
import { escapeHtml } from '../../utils/dom';
import type { RouteParams } from '../../utils/router';
import { CustomerType, type GetCustomerResult, type CustomerPhoneNumber } from '@insurup/contracts';

/** Helper to get display name from any customer type */
function getCustomerDisplayName(customer: GetCustomerResult): string {
  if (customer.type === CustomerType.Company) {
    return customer.title || 'Unnamed Company';
  }
  return customer.fullName || 'Unnamed Customer';
}

/** Helper to format phone number */
function formatPhoneNumber(phone: CustomerPhoneNumber | null | undefined): string {
  if (!phone) return '-';
  return `+${phone.countryCode} ${phone.number}`;
}

export async function render(container: HTMLElement, params?: RouteParams): Promise<void> {
  const customerId = params?.id;

  if (!customerId) {
    renderError(container, 'Error', 'No customer ID provided');
    return;
  }

  renderLoading(container, 'Loading customer details...');

  try {
    const client = getClient();
    const res = await client.customers.getCustomer(customerId);

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || 'Failed to load customer');
    }

    const customer = res.data;
    const displayName = getCustomerDisplayName(customer);
    const isCompany = customer.type === CustomerType.Company;

    container.innerHTML = `
      <div class="detail-header">
        <div>
          <h1>${escapeHtml(displayName)}</h1>
          <span class="badge ${isCompany ? 'primary' : ''}">
            ${formatCustomerType(customer.type)}
          </span>
        </div>
        <a href="#/customers" role="button" class="secondary outline">Back to List</a>
      </div>

      <div class="card-grid">
        <article>
          <header><strong>Basic Information</strong></header>
          <dl>
            <dt>ID</dt>
            <dd><code>${escapeHtml(customer.id)}</code></dd>
            
            <dt>Name</dt>
            <dd>${escapeHtml(displayName)}</dd>
            
            <dt>Type</dt>
            <dd>${formatCustomerType(customer.type)}</dd>
            
            ${
              customer.type === CustomerType.Individual || customer.type === CustomerType.Foreign
                ? `
              <dt>Identity Number</dt>
              <dd>${escapeHtml(String(customer.identityNumber))}</dd>
            `
                : ''
            }
            
            ${
              customer.type === CustomerType.Company
                ? `
              <dt>Tax Number</dt>
              <dd>${escapeHtml(customer.taxNumber)}</dd>
            `
                : ''
            }
            
            ${
              (customer.type === CustomerType.Individual ||
                customer.type === CustomerType.Foreign) &&
              customer.birthDate
                ? `
              <dt>Date of Birth</dt>
              <dd>${formatDate(customer.birthDate.toString())}</dd>
            `
                : ''
            }
          </dl>
        </article>

        <article>
          <header><strong>Contact Information</strong></header>
          <dl>
            <dt>Primary Email</dt>
            <dd>${customer.primaryEmail ? `<a href="mailto:${escapeHtml(customer.primaryEmail)}">${escapeHtml(customer.primaryEmail)}</a>` : '-'}</dd>
            
            <dt>Primary Phone</dt>
            <dd>${formatPhoneNumber(customer.primaryPhoneNumber)}</dd>
            
            ${
              customer.city
                ? `
              <dt>City</dt>
              <dd>${escapeHtml(customer.city.text || customer.city.value || '-')}</dd>
            `
                : ''
            }
            
            ${
              customer.district
                ? `
              <dt>District</dt>
              <dd>${escapeHtml(customer.district.text || customer.district.value || '-')}</dd>
            `
                : ''
            }
          </dl>
        </article>

        <article>
          <header><strong>Metadata</strong></header>
          <dl>
            <dt>Created At</dt>
            <dd>${formatDateTime(customer.createdAt?.toString())}</dd>
            
            <dt>Created By</dt>
            <dd>
              ${customer.createdBy?.name ? escapeHtml(customer.createdBy.name) : '-'}
              ${customer.createdBy?.id ? ` (<code>${escapeHtml(customer.createdBy.id)}</code>)` : ''}
            </dd>
            
            ${
              customer.representedBy
                ? `
              <dt>Representative</dt>
              <dd>
                ${customer.representedBy.name ? escapeHtml(customer.representedBy.name) : '-'}
                ${customer.representedBy.id ? ` (<code>${escapeHtml(customer.representedBy.id)}</code>)` : ''}
              </dd>
            `
                : ''
            }
          </dl>
        </article>
      </div>

      <div id="related-data"></div>
    `;

    // Load related data (vehicles, addresses) if needed
    await loadRelatedData(container.querySelector('#related-data') as HTMLElement, customerId);
  } catch (error) {
    console.error('Failed to load customer:', error);
    renderError(
      container,
      'Error Loading Customer',
      error instanceof Error ? error.message : 'Unknown error',
      () => render(container, params)
    );
  }
}

async function loadRelatedData(container: HTMLElement, customerId: string): Promise<void> {
  const client = getClient();

  try {
    // Load vehicles and addresses in parallel
    const [vehiclesRes, addressesRes] = await Promise.all([
      client.vehicles.getCustomerVehicles({ customerId }),
      client.customers.getCustomerAddresses(customerId),
    ]);

    let html = '';

    // Vehicles section
    if (vehiclesRes.isSuccess && vehiclesRes.data && vehiclesRes.data.length > 0) {
      html += `
        <section class="detail-section">
          <h2>Vehicles (${vehiclesRes.data.length})</h2>
          <div class="data-table">
            <table>
              <thead>
                <tr>
                  <th>Plate</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                ${vehiclesRes.data
                  .map(
                    (v) => `
                  <tr>
                    <td>${escapeHtml(v.plate ? `${v.plate.city} ${v.plate.code || ''}`.trim() : '-')}</td>
                    <td>${escapeHtml(v.model?.brand?.text || '-')}</td>
                    <td>${escapeHtml(v.model?.type?.text || '-')}</td>
                    <td>${v.model?.year || '-'}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }

    // Addresses section
    if (addressesRes.isSuccess && addressesRes.data && addressesRes.data.length > 0) {
      html += `
        <section class="detail-section">
          <h2>Addresses (${addressesRes.data.length})</h2>
          <div class="card-grid">
            ${addressesRes.data
              .map((a) => {
                const parts = [
                  a.address?.neighborhood?.text,
                  a.address?.street?.text,
                  a.address?.building?.text,
                  a.address?.apartment?.text,
                ].filter(Boolean);
                const location = [a.address?.district?.text, a.address?.city?.text]
                  .filter(Boolean)
                  .join(', ');
                return `
              <article>
                <header><strong>${escapeHtml(a.addressType || 'Address')}</strong></header>
                <p>
                  ${escapeHtml(parts.join(' ') || '-')}
                  ${location ? `<br>${escapeHtml(location)}` : ''}
                </p>
              </article>
            `;
              })
              .join('')}
          </div>
        </section>
      `;
    }

    container.innerHTML = html;
  } catch (error) {
    console.error('Failed to load related data:', error);
    // Don't show error for related data, just skip
  }
}
