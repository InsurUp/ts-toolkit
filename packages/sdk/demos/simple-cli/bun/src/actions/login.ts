/**
 * Login action - authenticate with OAuth2/OIDC flow.
 */

import * as p from '@clack/prompts';
import color from 'picocolors';
import { login, isAuthenticated } from '../auth';
import type { Action } from './index';

export const action: Action = {
  id: 'login',
  label: color.green('Login'),
  hint: 'Authenticate with your InsurUp account',
  showWhen: 'unauthenticated',

  async execute() {
    if (await isAuthenticated()) {
      console.log(`  ${color.blue('ℹ')} You are already logged in`);
      return;
    }

    console.log();
    console.log(color.dim('  A browser window will open for authentication...'));
    console.log(color.dim('  Please complete the login in your browser.'));
    console.log();

    const spinner = p.spinner();
    spinner.start('Waiting for authentication...');

    try {
      const tokenData = await login();
      spinner.stop(color.green('✓') + ' Authentication successful!');

      console.log(`  ${color.green('✓')} You are now logged in!`);

      if (tokenData.expiresAt) {
        const diff = tokenData.expiresAt - Date.now();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
          console.log(color.dim(`  Session expires in ${hours}h ${minutes % 60}m`));
        } else {
          console.log(color.dim(`  Session expires in ${minutes}m`));
        }
      }

      if (tokenData.refreshToken) {
        console.log(color.dim('  Auto-refresh enabled - your session will stay active'));
      }

      return true;
    } catch (error) {
      spinner.stop(color.red('✗') + ' Authentication failed');
      console.log(
        `  ${color.red('✗')} ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      console.log();
      console.log(color.dim('  Tip: Make sure you complete the login in the browser window.'));
      return false;
    }
  },
};
