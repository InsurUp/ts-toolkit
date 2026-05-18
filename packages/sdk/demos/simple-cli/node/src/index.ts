/**
 * InsurUp SDK CLI - Main Entry Point
 *
 * Interactive CLI demo for the InsurUp SDK.
 * Run with: npx tsx src/index.ts
 */

import 'dotenv/config';

import * as p from '@clack/prompts';
import color from 'picocolors';
import { loadConfig } from './config.js';
import { getAuthStatus } from './auth/index.js';
import { getMenuActions, getAction } from './actions/index.js';

async function showHeader(): Promise<void> {
  console.clear();

  const authStatus = await getAuthStatus();
  const statusIcon = authStatus.isAuthenticated ? color.green('●') : color.red('○');

  let statusText = authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated';

  // Add expiry time if authenticated
  if (authStatus.isAuthenticated && authStatus.expiresAt) {
    const diff = authStatus.expiresAt.getTime() - Date.now();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      statusText += ` (expires in ${hours}h ${minutes % 60}m)`;
    } else if (minutes > 0) {
      statusText += ` (expires in ${minutes}m)`;
    } else {
      statusText += ` (expires soon)`;
    }
  }

  // Add auto-refresh indicator
  if (authStatus.isAuthenticated && authStatus.hasRefreshToken) {
    statusText += color.dim(' [auto-refresh]');
  }

  p.intro(color.bgCyan(color.black(' InsurUp SDK CLI ')));
  console.log(`  ${statusIcon} ${statusText}`);
  console.log();
}

async function main(): Promise<void> {
  process.on('SIGINT', () => {
    console.log();
    p.outro('Interrupted. Goodbye!');
    process.exit(0);
  });

  try {
    await loadConfig();
    await showHeader();

    let running = true;

    while (running) {
      const authStatus = await getAuthStatus();
      const actions = getMenuActions(authStatus.isAuthenticated);

      const options = [
        ...actions.map((a) => ({ value: a.id, label: a.label, hint: a.hint })),
        { value: '__quit__', label: color.dim('Quit'), hint: 'Exit the CLI' },
      ];

      const result = await p.select({
        message: 'What would you like to do?',
        options,
      });

      if (p.isCancel(result) || result === '__quit__') {
        running = false;
        continue;
      }

      const action = getAction(result);
      if (action) {
        console.log();
        await action.execute();
        console.log();
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    p.outro('Thanks for using InsurUp SDK CLI!');
  } catch (error) {
    console.error();
    console.error(
      color.red(`  Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    );
    console.error();
    process.exit(1);
  }
}

main();
