<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { navigate } from "$lib/router";
  import { handleCallback, setTokens } from "$lib/auth/index.svelte";

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (code && state) {
      handleCallback(code, state)
        .then((tokens) => {
          setTokens(tokens);
          navigate("/");
        })
        .catch((error) => {
          toast.error(`Login failed: ${error.message}`);
          navigate("/");
        });
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
