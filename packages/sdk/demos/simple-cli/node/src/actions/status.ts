/**
 * Status action - show current authentication status.
 */

import * as p from "@clack/prompts";
import color from "picocolors";
import { getAuthStatus } from "../auth/index.js";
import { getConfig } from "../config.js";
import type { Action } from "./index.js";

export const action: Action = {
  id: "status",
  label: color.blue("Status"),
  hint: "Show authentication and config status",
  showWhen: "always",

  async execute() {
    const authStatus = await getAuthStatus();
    const config = getConfig();

    const lines: string[] = [];

    // Auth status
    lines.push(`${color.bold("Authentication")}`);
    lines.push(`  Status: ${authStatus.isAuthenticated ? color.green("Authenticated") : color.red("Not authenticated")}`);

    if (authStatus.isAuthenticated) {
      if (authStatus.expiresAt) {
        const diff = authStatus.expiresAt.getTime() - Date.now();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
          lines.push(`  Expires: in ${hours}h ${minutes % 60}m`);
        } else if (minutes > 0) {
          lines.push(`  Expires: in ${minutes}m`);
        } else {
          lines.push(`  Expires: ${color.yellow("soon")}`);
        }
      }

      lines.push(`  Auto-refresh: ${authStatus.hasRefreshToken ? color.green("enabled") : color.dim("disabled")}`);
    }

    lines.push("");
    lines.push(`${color.bold("Configuration")}`);
    lines.push(`  Environment: ${config.environment}`);
    lines.push(`  Auth Server: ${config.authServer}`);
    lines.push(`  Client ID: ${config.clientId}`);
    lines.push(`  Scopes: ${config.scopes.join(", ")}`);

    if (config.apiBaseUrl) {
      lines.push(`  API URL: ${config.apiBaseUrl}`);
    }

    p.note(lines.join("\n"), "Status");
  },
};
