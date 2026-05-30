import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { authReady } from '@/lib/auth';

import Home from '@/views/Home.vue';
import Callback from '@/views/Callback.vue';
import Profile from '@/views/Profile.vue';
import CustomerList from '@/views/customers/CustomerList.vue';
import CustomerDetail from '@/views/customers/CustomerDetail.vue';
import PolicyList from '@/views/policies/PolicyList.vue';
import PolicyDetail from '@/views/policies/PolicyDetail.vue';

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
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomerList,
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/:id',
      name: 'customer-detail',
      component: CustomerDetail,
      meta: { requiresAuth: true },
    },
    {
      path: '/policies',
      name: 'policies',
      component: PolicyList,
      meta: { requiresAuth: true },
    },
    {
      path: '/policies/:id',
      name: 'policy-detail',
      component: PolicyDetail,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard for protected routes
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
