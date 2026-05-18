/**
 * Action registry.
 */

import { action as loginAction } from './login.js';
import { action as logoutAction } from './logout.js';
import { action as statusAction } from './status.js';
import { action as getCurrentUserAction } from './get-current-user.js';
import { action as listCustomersAction } from './list-customers.js';
import { action as createCustomerAction } from './create-customer.js';

export interface Action {
  id: string;
  label: string;
  hint?: string;
  showWhen?: 'always' | 'authenticated' | 'unauthenticated';
  execute: () => Promise<void | boolean>;
}

const actions: Action[] = [
  loginAction,
  logoutAction,
  statusAction,
  getCurrentUserAction,
  listCustomersAction,
  createCustomerAction,
];

export function getMenuActions(isAuthenticated: boolean): Action[] {
  return actions.filter((a) => {
    if (a.showWhen === 'authenticated') return isAuthenticated;
    if (a.showWhen === 'unauthenticated') return !isAuthenticated;
    return true;
  });
}

export function getAction(id: string): Action | undefined {
  return actions.find((a) => a.id === id);
}
