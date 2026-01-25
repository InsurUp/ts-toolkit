/**
 * List customers action - browse customers with pagination.
 */

import color from "picocolors";
import { client } from "../client.js";
import { createPaginator } from "../pagination.js";
import type { Action } from "./index.js";

const PAGE_SIZE = 10;

export const action: Action = {
  id: "list-customers",
  label: color.cyan("List customers"),
  hint: "Browse customers with pagination",
  showWhen: "authenticated",

  async execute() {
    try {
      const paginator = createPaginator(
        async (cursor) => {
          const res = await client.customers.getCustomers({
            first: PAGE_SIZE,
            after: cursor ?? undefined,
            select: ["id", "name", "identityNumber", "taxNumber", "primaryEmail", "type", "createdAt"] as const,
          });

          if (!res.isSuccess || !res.data) {
            throw new Error(res.message || "Failed to fetch customers");
          }

          return {
            nodes: res.data.nodes ?? [],
            pageInfo: res.data.pageInfo,
            totalCount: res.data.totalCount,
          };
        },
        { pageSize: PAGE_SIZE }
      );

      await paginator.run((data) => {
        const customers = data.nodes.filter((c): c is NonNullable<typeof c> => c !== null);

        if (customers.length === 0) {
          console.log();
          console.log(color.dim("  No customers found"));
          console.log();
          return;
        }

        console.log();
        console.log(`  ${color.bold("Customers")} (${customers.length} of ${data.totalCount.toLocaleString()})`);
        console.log();
        console.log(JSON.stringify(customers, null, 2));
        console.log();
      });
    } catch (error) {
      console.log(`  ${color.red("✗")} ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  },
};
