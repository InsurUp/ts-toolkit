<script lang="ts">
  import { navigate } from "$lib/router";
  import { getAuthState, startLogin } from "$lib/auth/index.svelte";
  import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from "$lib/components/ui";
  import { Users, FileText, Shield } from "lucide-svelte";

  const auth = getAuthState();

  async function handleLogin() {
    auth.setLoginInProgress(true);
    await startLogin();
  }
</script>

{#if !auth.isAuthenticated}
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center">
    <Shield class="h-16 w-16 text-primary mb-6" />
    <h1 class="text-4xl font-bold tracking-tight mb-4">
      InsurUp SDK Demo
    </h1>
    <p class="text-xl text-muted-foreground mb-8 max-w-md">
      A Svelte SPA demonstrating the InsurUp SDK for insurance platform
      integration.
    </p>
    <Button size="lg" onclick={handleLogin} disabled={auth.loginInProgress}>
      {auth.loginInProgress ? "Signing in..." : "Sign in to get started"}
    </Button>
  </div>
{:else}
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to the InsurUp SDK Demo. Explore customers and policies.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        class="cursor-pointer hover:bg-muted/50 transition-colors"
        onclick={() => navigate("/customers")}
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Customers</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            View and manage customer records. Create new customers, search,
            and filter.
          </CardDescription>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer hover:bg-muted/50 transition-colors"
        onclick={() => navigate("/policies")}
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Policies</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse insurance policies. View details, coverage, and status
            information.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
{/if}
