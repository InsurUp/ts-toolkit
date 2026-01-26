<script lang="ts">
  import { getAuthState, parseIdTokenClaims } from "$lib/auth/index.svelte";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Badge,
    Button,
  } from "$lib/components/ui";
  import { User, Mail, Clock, LogOut } from "lucide-svelte";

  const auth = getAuthState();
  const claims = $derived(parseIdTokenClaims());
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
    <p class="text-muted-foreground">
      View your account information and session details.
    </p>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <User class="h-5 w-5" />
          Account Information
        </CardTitle>
        <CardDescription>Your profile details from the identity provider.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        {#if typeof claims?.name === "string"}
          <div class="flex items-center gap-2">
            <User class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Name:</span>
            <span>{claims.name}</span>
          </div>
        {/if}
        {#if typeof claims?.email === "string"}
          <div class="flex items-center gap-2">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Email:</span>
            <span>{claims.email}</span>
          </div>
        {/if}
        {#if claims?.email_verified !== undefined}
          <div class="flex items-center gap-2">
            <span class="font-medium">Email Verified:</span>
            <Badge variant={claims.email_verified ? "default" : "secondary"}>
              {claims.email_verified ? "Yes" : "No"}
            </Badge>
          </div>
        {/if}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="h-5 w-5" />
          Session
        </CardTitle>
        <CardDescription>Current authentication session details.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <span class="font-medium">Status:</span>{" "}
          <Badge variant="default">Authenticated</Badge>
        </div>
        {#if typeof claims?.iat === "number"}
          <div>
            <span class="font-medium">Issued At:</span>{" "}
            <span class="text-muted-foreground">
              {new Date(claims.iat * 1000).toLocaleString()}
            </span>
          </div>
        {/if}
        {#if typeof claims?.exp === "number"}
          <div>
            <span class="font-medium">Expires:</span>{" "}
            <span class="text-muted-foreground">
              {new Date(claims.exp * 1000).toLocaleString()}
            </span>
          </div>
        {/if}
        <div class="pt-4">
          <Button variant="destructive" onclick={() => auth.logOut()}>
            <LogOut class="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>

  {#if auth.token}
    <Card>
      <CardHeader>
        <CardTitle>Access Token</CardTitle>
        <CardDescription>
          The current access token (truncated for display).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <code class="block p-4 bg-muted rounded-md text-sm break-all">
          {auth.token.slice(0, 50)}...{auth.token.slice(-20)}
        </code>
      </CardContent>
    </Card>
  {/if}
</div>
