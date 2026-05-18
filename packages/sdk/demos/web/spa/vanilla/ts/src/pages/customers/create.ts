/**
 * Create customer page.
 */

import { getClient } from '../../client';
import { showSuccess, showError } from '../../components/toast';
import { navigate } from '../../utils/router';
import { CustomerType, type CreateCustomerRequest } from '@insurup/contracts';

type FormCustomerType = 'Individual' | 'Company' | 'Foreign';

export async function render(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="max-width: 600px; margin: 0 auto;">
      <h1>Create Customer</h1>
      <p>Create a new customer in the system.</p>

      <form id="create-customer-form">
        <fieldset>
          <legend>Customer Type</legend>
          <label>
            <input type="radio" name="type" value="Individual" checked />
            Individual
          </label>
          <label>
            <input type="radio" name="type" value="Company" />
            Company
          </label>
          <label>
            <input type="radio" name="type" value="Foreign" />
            Foreign
          </label>
        </fieldset>

        <div id="individual-fields">
          <label>
            Full Name
            <input type="text" name="fullName" required />
          </label>
          <label>
            Identity Number (TC Kimlik No)
            <input type="text" name="identityNumber" pattern="[0-9]{11}" maxlength="11" required />
            <small>11-digit Turkish identity number</small>
          </label>
          <label>
            Date of Birth
            <input type="date" name="birthDate" />
          </label>
        </div>

        <div id="company-fields" style="display: none;">
          <label>
            Company Title
            <input type="text" name="title" />
          </label>
          <label>
            Tax Number (Vergi No)
            <input type="text" name="taxNumber" pattern="[0-9]{10}" maxlength="10" />
            <small>10-digit tax number</small>
          </label>
        </div>

        <div id="foreign-fields" style="display: none;">
          <label>
            Full Name
            <input type="text" name="foreignFullName" />
          </label>
          <label>
            Identity Number (Passport/ID)
            <input type="text" name="foreignIdentityNumber" />
          </label>
          <label>
            Date of Birth
            <input type="date" name="foreignBirthDate" />
          </label>
        </div>

        <hr />

        <fieldset>
          <legend>Contact Information (Optional)</legend>
          <label>
            Email
            <input type="email" name="email" />
          </label>
          <label>
            Phone Number
            <input type="tel" name="phoneNumber" placeholder="+90 5XX XXX XX XX" />
          </label>
        </fieldset>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <a href="#/customers" role="button" class="secondary outline">Cancel</a>
          <button type="submit">Create Customer</button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector('#create-customer-form') as HTMLFormElement;
  const typeRadios = form.querySelectorAll('input[name="type"]');
  const individualFields = container.querySelector('#individual-fields') as HTMLElement;
  const companyFields = container.querySelector('#company-fields') as HTMLElement;
  const foreignFields = container.querySelector('#foreign-fields') as HTMLElement;

  // Toggle fields based on customer type
  function updateFieldVisibility(type: FormCustomerType): void {
    individualFields.style.display = type === 'Individual' ? 'block' : 'none';
    companyFields.style.display = type === 'Company' ? 'block' : 'none';
    foreignFields.style.display = type === 'Foreign' ? 'block' : 'none';

    // Update required attributes
    const indivInputs = individualFields.querySelectorAll('input');
    const companyInputs = companyFields.querySelectorAll('input');
    const foreignInputs = foreignFields.querySelectorAll('input');

    indivInputs.forEach((i) => {
      if (i.name === 'fullName' || i.name === 'identityNumber') {
        i.required = type === 'Individual';
      }
    });
    companyInputs.forEach((i) => {
      if (i.name === 'title' || i.name === 'taxNumber') {
        i.required = type === 'Company';
      }
    });
    foreignInputs.forEach((i) => {
      if (i.name === 'foreignFullName' || i.name === 'foreignIdentityNumber') {
        i.required = type === 'Foreign';
      }
    });
  }

  typeRadios.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const type = (e.target as HTMLInputElement).value as FormCustomerType;
      updateFieldVisibility(type);
    });
  });

  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.setAttribute('aria-busy', 'true');
    submitBtn.disabled = true;

    try {
      const formData = new FormData(form);
      const type = formData.get('type') as FormCustomerType;

      // Build request based on type
      let request: CreateCustomerRequest;

      if (type === 'Individual') {
        request = {
          type: CustomerType.Individual,
          identityNumber: formData.get('identityNumber') as string,
          fullName: (formData.get('fullName') as string) || undefined,
          birthDate: (formData.get('birthDate') as string) || undefined,
          fillMissingFields: true,
        };
      } else if (type === 'Company') {
        request = {
          type: CustomerType.Company,
          title: formData.get('title') as string,
          taxNumber: formData.get('taxNumber') as string,
          fillMissingFields: true,
        };
      } else {
        request = {
          type: CustomerType.Foreign,
          identityNumber: formData.get('foreignIdentityNumber') as string,
          fullName: (formData.get('foreignFullName') as string) || undefined,
          birthDate: (formData.get('foreignBirthDate') as string) || undefined,
          fillMissingFields: true,
        };
      }

      // Add optional contact info
      const email = formData.get('email') as string;
      if (email) {
        request.email = email;
      }

      const client = getClient();
      const res = await client.customers.createCustomer(request);

      if (!res.isSuccess) {
        throw new Error(res.message || 'Failed to create customer');
      }

      showSuccess('Customer created successfully!');
      navigate(`/customers/${res.data?.id || ''}`);
    } catch (error) {
      console.error('Failed to create customer:', error);
      showError(error instanceof Error ? error.message : 'Failed to create customer');
    } finally {
      submitBtn.removeAttribute('aria-busy');
      submitBtn.disabled = false;
    }
  });
}
