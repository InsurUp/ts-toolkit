<script lang="ts">
  import Router from "svelte-spa-router";
  import wrap from "svelte-spa-router/wrap";
  import { Toaster } from "svelte-sonner";
  import Header from "$lib/components/Header.svelte";
  import { getAuthState } from "$lib/auth";

  import Home from "./pages/Home.svelte";
  import Callback from "./pages/Callback.svelte";
  import Profile from "./pages/Profile.svelte";
  import CustomerList from "./pages/customers/CustomerList.svelte";
  import CustomerDetail from "./pages/customers/CustomerDetail.svelte";
  import PolicyList from "./pages/policies/PolicyList.svelte";
  import PolicyDetail from "./pages/policies/PolicyDetail.svelte";

  const auth = getAuthState();

  // Condition function for protected routes
  function requireAuth(): boolean {
    return auth.isAuthenticated;
  }

  // Routes configuration
  // Note: svelte-spa-router types are not fully compatible with Svelte 5 Component types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const routes: Record<string, any> = {
    "/": Home,
    "/callback": Callback,
    "/profile": wrap({
      component: Profile as any,
      conditions: [requireAuth],
    }),
    "/customers": wrap({
      component: CustomerList as any,
      conditions: [requireAuth],
    }),
    "/customers/:id": wrap({
      component: CustomerDetail as any,
      conditions: [requireAuth],
    }),
    "/policies": wrap({
      component: PolicyList as any,
      conditions: [requireAuth],
    }),
    "/policies/:id": wrap({
      component: PolicyDetail as any,
      conditions: [requireAuth],
    }),
  };

  function conditionsFailed() {
    // Redirect to home if conditions fail (not authenticated)
    window.location.hash = "/";
  }
</script>

<div class="min-h-screen bg-background">
  <Header />
  <main class="container mx-auto px-4 py-6">
    <Router {routes} on:conditionsFailed={conditionsFailed} />
  </main>
  <Toaster />
</div>
