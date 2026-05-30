import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { authReady } from '@/lib/auth';

import Home from '@/views/Home.vue';
import Callback from '@/views/Callback.vue';
import CustomerTable from '@/views/CustomerTable.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/callback',
      name: 'callback',
      component: Callback,
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomerTable,
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  // Wait for the persisted session to hydrate so a reload onto a protected route
  // isn't bounced to home before the restored token is recognized.
  await authReady;
  const { isAuthenticated } = useAuth();

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next({ name: 'home' });
  } else {
    next();
  }
});

export default router;
