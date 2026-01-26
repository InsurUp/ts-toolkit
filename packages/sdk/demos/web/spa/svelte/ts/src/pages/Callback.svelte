<script lang="ts">
  import { onMount } from "svelte";
  import { replace } from "svelte-spa-router";
  import { getAuthState, handleCallback } from "$lib/auth";

  const auth = getAuthState();

  onMount(async () => {
    // Parse the callback URL parameters
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      try {
        const tokens = await handleCallback(code, state);
        auth.setTokens(tokens);
        // Clear the URL params and redirect to home
        window.history.replaceState({}, "", window.location.pathname);
        replace("/");
      } catch (error) {
        console.error("Callback error:", error);
        replace("/");
      }
    } else {
      // No code/state, just redirect home
      replace("/");
    }
  });
</script>

<div class="flex min-h-[50vh] items-center justify-center">
  <div class="text-center">
    <div class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
    <p class="text-muted-foreground">Completing login...</p>
  </div>
</div>
