/**
 * Create customer action - create a new customer with input prompts.
 */

import * as p from "@clack/prompts";
import color from "picocolors";
import { CustomerType, type CreateCustomerRequest } from "@insurup/contracts";
import { client } from "../client";
import type { Action } from "./index";

export const action: Action = {
  id: "create-customer",
  label: color.cyan("Create customer"),
  hint: "Create a new customer",
  showWhen: "authenticated",

  async execute() {
    const customerType = await p.select({
      message: "Customer type:",
      options: [
        { value: CustomerType.Individual, label: "Individual (Bireysel)" },
        { value: CustomerType.Company, label: "Company (Kurumsal)" },
        { value: CustomerType.Foreign, label: "Foreign (Yabanci)" },
      ],
    });

    if (p.isCancel(customerType)) {
      console.log(`  ${color.blue("ℹ")} Cancelled`);
      return;
    }

    let request: CreateCustomerRequest;

    if (customerType === CustomerType.Company) {
      const title = await p.text({
        message: "Company title:",
        placeholder: "Acme Ltd.",
        validate: (value) => {
          if (!value) return "Company title is required";
        },
      });

      if (p.isCancel(title)) return;

      const taxNumber = await p.text({
        message: "Tax number:",
        placeholder: "1234567890",
        validate: (value) => {
          if (!value) return "Tax number is required";
        },
      });

      if (p.isCancel(taxNumber)) return;

      const email = await p.text({
        message: "Email (optional):",
        placeholder: "contact@company.com",
      });

      if (p.isCancel(email)) return;

      request = {
        type: CustomerType.Company,
        title,
        taxNumber,
        email: email || undefined,
        fillMissingFields: true,
      };
    } else {
      const identityNumber = await p.text({
        message:
          customerType === CustomerType.Individual
            ? "TC Identity Number (11 digits):"
            : "Foreign ID / Passport Number:",
        placeholder: customerType === CustomerType.Individual ? "12345678901" : "AB1234567",
        validate: (value) => {
          if (!value) return "Identity number is required";
          if (customerType === CustomerType.Individual && value.length !== 11) {
            return "TC Identity Number must be 11 digits";
          }
        },
      });

      if (p.isCancel(identityNumber)) return;

      const fullName = await p.text({
        message: "Full name (optional):",
        placeholder: "John Doe",
      });

      if (p.isCancel(fullName)) return;

      const email = await p.text({
        message: "Email (optional):",
        placeholder: "john.doe@example.com",
      });

      if (p.isCancel(email)) return;

      request = {
        type: customerType,
        identityNumber,
        fullName: fullName || undefined,
        email: email || undefined,
        fillMissingFields: true,
      };
    }

    const summary =
      request.type === CustomerType.Company
        ? `${request.title} (Tax: ${request.taxNumber})`
        : `${request.fullName || "No name"} (ID: ${request.identityNumber})`;

    const confirmed = await p.confirm({
      message: `Create ${request.type.toLowerCase()} customer: ${summary}?`,
      initialValue: true,
    });

    if (p.isCancel(confirmed) || !confirmed) return;

    const spinner = p.spinner();
    spinner.start("Creating customer...");

    try {
      const res = await client.customers.createCustomer(request);

      if (res.isSuccess && res.data) {
        spinner.stop(color.green("✓") + " Customer created successfully");
        p.note(JSON.stringify({ id: res.data.id }, null, 2), "New Customer");
      } else {
        spinner.stop(color.red("✗") + " Failed to create customer");
        console.log(`  ${color.red("✗")} ${res.message || "Operation failed"}`);
      }
    } catch (error) {
      spinner.stop(color.red("✗") + " Failed to create customer");
      console.log(`  ${color.red("✗")} ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};
