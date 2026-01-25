/**
 * Get current user action - fetch the authenticated user's profile.
 */

import * as p from "@clack/prompts";
import color from "picocolors";
import { client } from "../client";
import type { Action } from "./index";

export const action: Action = {
  id: "get-current-user",
  label: color.cyan("Get current user"),
  hint: "Fetch your user profile",
  showWhen: "authenticated",

  async execute() {
    const spinner = p.spinner();
    spinner.start("Fetching current user...");

    try {
      // Try agent user endpoint first
      const agentRes = await client.agentUsers.getMyAgentUser();

      if (agentRes.isSuccess && agentRes.data) {
        spinner.stop(color.green("✓") + " User fetched successfully");
        p.note(
          JSON.stringify(
            {
              id: agentRes.data.id,
              email: agentRes.data.email,
              firstName: agentRes.data.firstName,
              lastName: agentRes.data.lastName,
            },
            null,
            2
          ),
          "Current Agent User"
        );
        return;
      }

      // If agent user failed, try customer endpoint
      const customerRes = await client.customers.getCurrentCustomer();

      if (customerRes.isSuccess && customerRes.data) {
        spinner.stop(color.green("✓") + " User fetched successfully");
        p.note(JSON.stringify(customerRes.data, null, 2), "Current Customer");
        return;
      }

      spinner.stop(color.red("✗") + " Failed to fetch user");
      console.log(`  ${color.red("✗")} ${customerRes.message || agentRes.message || "Failed to fetch user"}`);
    } catch (error) {
      spinner.stop(color.red("✗") + " Failed to fetch user");
      console.log(`  ${color.red("✗")} ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};
