/**
 * Create customer page entry point.
 */

import { loadConfig } from "../shared/config";
import { renderHeader, initTheme, showSuccess, showError } from "../shared/components";
import { requireAuth } from "../shared/auth";
import { getClient } from "../shared/client";
import { CustomerType } from "@insurup/contracts";

async function init(): Promise<void> {
  loadConfig();
  initTheme();
  await requireAuth();

  const nav = document.getElementById("main-nav");
  if (nav) renderHeader(nav);

  const main = document.getElementById("main-content");
  if (main) renderForm(main);
}

function renderForm(container: HTMLElement): void {
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

        <div id="individual-fields">
          <label>
            Full Name
            <input type="text" name="fullName" placeholder="John Doe" />
          </label>

          <label>
            Identity Number (TC Kimlik No)
            <input type="text" name="identityNumber" placeholder="12345678901" pattern="[0-9]{11}" />
          </label>
        </div>

        <div id="company-fields" style="display: none;">
          <label>
            Company Title
            <input type="text" name="title" placeholder="Acme Corporation" />
          </label>

          <label>
            Tax Number
            <input type="text" name="taxNumber" placeholder="1234567890" />
          </label>
        </div>

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

  const form = container.querySelector("#create-form") as HTMLFormElement;
  const typeSelect = form.querySelector('select[name="type"]') as HTMLSelectElement;
  const individualFields = container.querySelector("#individual-fields") as HTMLElement;
  const companyFields = container.querySelector("#company-fields") as HTMLElement;

  typeSelect?.addEventListener("change", () => {
    const isCompany = typeSelect.value === "Company";
    individualFields.style.display = isCompany ? "none" : "block";
    companyFields.style.display = isCompany ? "block" : "none";
  });

  form?.addEventListener("submit", handleSubmit);
}

async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
  const formData = new FormData(form);

  submitBtn.setAttribute("aria-busy", "true");
  submitBtn.disabled = true;

  try {
    const client = getClient();
    const typeValue = formData.get("type") as string;
    const isCompany = typeValue === "Company";

    const baseRequest = {
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
    };

    const res = isCompany
      ? await client.customers.createCustomer({
          ...baseRequest,
          type: CustomerType.Company,
          title: formData.get("title") as string,
          taxNumber: formData.get("taxNumber") as string,
          fillMissingFields: true,
        })
      : await client.customers.createCustomer({
          ...baseRequest,
          type: CustomerType.Individual,
          identityNumber: formData.get("identityNumber") as string,
          fullName: formData.get("fullName") as string || undefined,
          fillMissingFields: true,
        });

    if (!res.isSuccess) {
      throw new Error(res.message || "Failed to create customer");
    }

    showSuccess("Customer created successfully!");
    setTimeout(() => {
      window.location.href = `/customers/detail.html?id=${res.data?.id}`;
    }, 500);
  } catch (error) {
    console.error("Failed to create customer:", error);
    showError(error instanceof Error ? error.message : "Failed to create customer");
    submitBtn.removeAttribute("aria-busy");
    submitBtn.disabled = false;
  }
}

init();
