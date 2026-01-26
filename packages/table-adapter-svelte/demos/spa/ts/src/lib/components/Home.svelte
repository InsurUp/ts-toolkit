<script lang="ts">
  import { Table2, Users } from "@lucide/svelte";
  import { startLogin, isAuthenticatedStore, loginInProgress } from "$lib/auth/index.svelte";
  import { p } from "$lib/router";

  let isAuthenticated = $state(false);
  let isLoggingIn = $state(false);
  isAuthenticatedStore.subscribe((v) => (isAuthenticated = v));
  loginInProgress.subscribe((v) => (isLoggingIn = v));

  async function handleLogin(): Promise<void> {
    loginInProgress.set(true);
    await startLogin();
  }
</script>

{#if !isAuthenticated}
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <Table2 class="h-16 w-16 text-primary mb-6" />
    <h1 class="text-4xl font-bold tracking-tight mb-4">
      Table Adapter Svelte Demo
    </h1>
    <p class="text-xl text-muted-foreground mb-8 max-w-md">
      A Svelte 5 SPA demonstrating the @insurup/table-adapter-svelte package
      with TanStack Table integration.
    </p>
    <button
      class="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      disabled={isLoggingIn}
      onclick={handleLogin}
    >
      {isLoggingIn ? "Signing in..." : "Sign in to get started"}
    </button>
  </div>
{:else}
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to the Table Adapter Svelte Demo. Explore the customer table.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <a
        href={p("/customers")}
        class="cursor-pointer rounded-xl border bg-card p-6 shadow-sm hover:bg-muted/50 transition-colors text-left block"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium">Customer Table</span>
          <Users class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="text-sm text-muted-foreground">
          View customers using the createCustomerTable function with TanStack Table.
          Features sorting, pagination, and search.
        </p>
      </a>
    </div>
  </div>
{/if}
