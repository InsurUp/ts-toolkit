import { createRouter } from 'sv-router';
import Home from './components/Home.svelte';
import BasicCustomerTable from './components/BasicCustomerTable.svelte';
import CustomerTable from './components/CustomerTable.svelte';
import CustomerTableInfinite from './components/CustomerTableInfinite.svelte';
import Callback from './components/Callback.svelte';

export const { p, navigate, isActive, route } = createRouter({
  '/': Home,
  '/customers/basic': BasicCustomerTable,
  '/customers': CustomerTable,
  '/customers/infinite': CustomerTableInfinite,
  '/callback': Callback,
});
