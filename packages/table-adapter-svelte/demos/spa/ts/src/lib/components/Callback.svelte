<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { navigate } from "$lib/router";
  import { handleCallback } from "$lib/auth/index.svelte";

  onMount(async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      try {
        // The auth handle exchanges the code, persists the tokens, and notifies
        // subscribers; the reactive auth store updates automatically.
        const result = await handleCallback();
        if (!result.isSuccess) {
          toast.error(`Login failed: ${result.error.description ?? result.error.message}`);
        }
        window.history.replaceState({}, "", window.location.pathname);
        navigate("/");
      } catch (error) {
        toast.error(`Login failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        navigate("/");
      }
    } else {
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
