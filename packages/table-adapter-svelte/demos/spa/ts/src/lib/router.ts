import { createRouter } from 'sv-router';
import Home from './components/Home.svelte';
import CustomerTable from './components/CustomerTable.svelte';
import Callback from './components/Callback.svelte';

export const { p, navigate, isActive, route } = createRouter({
  '/': Home,
  '/customers': CustomerTable,
  '/callback': Callback,
});
