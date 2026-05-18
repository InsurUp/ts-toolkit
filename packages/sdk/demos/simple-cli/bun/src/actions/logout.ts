/**
 * Logout action - clear stored credentials.
 */

import * as p from '@clack/prompts';
import color from 'picocolors';
import { logout } from '../auth/oauth';
import type { Action } from './index';

export const action: Action = {
  id: 'logout',
  label: color.yellow('Logout'),
  hint: 'Clear stored credentials',
  showWhen: 'authenticated',

  async execute() {
    const confirmed = await p.confirm({
      message: 'Are you sure you want to logout?',
      initialValue: false,
    });

    if (p.isCancel(confirmed) || !confirmed) {
      return false;
    }

    const spinner = p.spinner();
    spinner.start('Logging out...');

    try {
      await logout();
      spinner.stop(color.green('✓') + ' Logged out successfully');
      console.log(`  ${color.green('✓')} You have been logged out`);
      return true;
    } catch (error) {
      spinner.stop(color.red('✗') + ' Failed to logout');
      console.log(
        `  ${color.red('✗')} ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  },
};
