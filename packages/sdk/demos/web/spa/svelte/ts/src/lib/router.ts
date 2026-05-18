/**
 * Router configuration using sv-router.
 * Provides path-based routing for the SPA.
 */

import { createRouter } from 'sv-router';
import Home from '../pages/Home.svelte';
import Callback from '../pages/Callback.svelte';
import Profile from '../pages/Profile.svelte';
import CustomerList from '../pages/customers/CustomerList.svelte';
import CustomerDetail from '../pages/customers/CustomerDetail.svelte';
import PolicyList from '../pages/policies/PolicyList.svelte';
import PolicyDetail from '../pages/policies/PolicyDetail.svelte';

export const { navigate, isActive, route } = createRouter({
  '/': Home,
  '/callback': Callback,
  '/profile': Profile,
  '/customers': CustomerList,
  '/customers/:id': CustomerDetail,
  '/policies': PolicyList,
  '/policies/:id': PolicyDetail,
});
