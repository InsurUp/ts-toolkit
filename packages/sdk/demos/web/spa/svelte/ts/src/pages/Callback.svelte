<script lang="ts">
  import { onMount } from "svelte";
  import { navigate } from "$lib/router";
  import { getAuthState, handleCallback } from "$lib/auth/index.svelte";

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
        navigate("/");
      } catch (error) {
        console.error("Callback error:", error);
        navigate("/");
      }
    } else {
      // No code/state, just redirect home
      navigate("/");
    }
  });
</script>

<div class="flex min-h-[50vh] items-center justify-center">
  <div class="text-center">
    <div class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
    <p class="text-muted-foreground">Completing login...</p>
  </div>
</div>
