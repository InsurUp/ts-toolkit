import { isAuthenticated } from "$lib/auth/oauth";

export function renderHome(): string {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return `
      <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div class="text-6xl mb-6">📊</div>
        <h1 class="text-4xl font-bold tracking-tight mb-4">
          Table Adapter Vanilla Demo
        </h1>
        <p class="text-xl text-muted-foreground mb-8 max-w-md">
          A Vanilla TypeScript SPA demonstrating the @insurup/table-adapter-core package
          with TanStack Table integration.
        </p>
        <button id="login-btn-home" class="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          Sign in to get started
        </button>
      </div>
    `;
  }

  return `
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p class="text-muted-foreground">
          Welcome to the Table Adapter Vanilla Demo. Explore the customer table.
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button id="go-customers" class="cursor-pointer rounded-xl border bg-card p-6 shadow-sm hover:bg-muted/50 transition-colors text-left">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium">Customer Table</span>
            <span>👥</span>
          </div>
          <p class="text-sm text-muted-foreground">
            View customers using createCustomerTable with TanStack Table.
            Features sorting, pagination, and search.
          </p>
        </button>
      </div>
    </div>
  `;
}
