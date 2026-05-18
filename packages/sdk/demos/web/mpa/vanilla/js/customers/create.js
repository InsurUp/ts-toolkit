/**
 * Create customer page entry point.
 * @module pages/customers/create
 */

import { loadConfig } from '../js/shared/config.js';
import { renderHeader, initTheme, showSuccess, showError } from '../js/shared/components.js';
import { requireAuth } from '../js/shared/auth.js';
import { getClient } from '../js/shared/client.js';

/**
 * Initializes the create customer page.
 */
async function init() {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById('main-nav');
  if (nav) renderHeader(nav);

  const main = document.getElementById('main-content');
  if (main) renderForm(main);
}

/**
 * Renders the create customer form.
 * @param {HTMLElement} container - The container element
 */
function renderForm(container) {
  container.innerHTML = `
    <div class="detail-header">
      <h1>Create Customer</h1>
      <a href="/customers/" role="button" class="secondary outline">Cancel</a>
    </div>

    <article>
      <form id="create-form">
        <div class="grid">
          <label>
            Customer Type
            <select name="type" required>
              <option value="Individual">Individual</option>
              <option value="Company">Company</option>
            </select>
          </label>
        </div>

        <div class="grid">
          <label>
            First Name
            <input type="text" name="firstName" required placeholder="John" />
          </label>
          <label>
            Last Name
            <input type="text" name="lastName" required placeholder="Doe" />
          </label>
        </div>

        <label>
          Identity Number (TC Kimlik No)
          <input type="text" name="identityNumber" required placeholder="12345678901" pattern="[0-9]{11}" />
        </label>

        <label>
          Email
          <input type="email" name="email" placeholder="john@example.com" />
        </label>

        <label>
          Phone
          <input type="tel" name="phone" placeholder="+90 555 123 4567" />
        </label>

        <button type="submit">Create Customer</button>
      </form>
    </article>
  `;

  const form = container.querySelector('#create-form');
  form?.addEventListener('submit', handleSubmit);
}

/**
 * Handles form submission.
 * @param {Event} e - The submit event
 */
async function handleSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  submitBtn.setAttribute('aria-busy', 'true');
  submitBtn.disabled = true;

  try {
    const client = getClient();
    const res = await client.customers.createCustomer({
      type: formData.get('type'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      identityNumber: formData.get('identityNumber'),
      email: formData.get('email') || undefined,
      phone: formData.get('phone') || undefined,
    });

    if (!res.isSuccess) {
      throw new Error(res.message || 'Failed to create customer');
    }

    showSuccess('Customer created successfully!');
    setTimeout(() => {
      window.location.href = `/customers/detail.html?id=${res.data?.id}`;
    }, 500);
  } catch (error) {
    console.error('Failed to create customer:', error);
    showError(error instanceof Error ? error.message : 'Failed to create customer');
    submitBtn.removeAttribute('aria-busy');
    submitBtn.disabled = false;
  }
}

init();
