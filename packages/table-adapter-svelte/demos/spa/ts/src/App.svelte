<script lang="ts">
  import { Router } from "sv-router";
  import { Toaster } from "svelte-sonner";
  import Header from "$lib/components/Header.svelte";
  import "$lib/router";
</script>

<div class="min-h-screen bg-background">
  <Header />
  <main class="container mx-auto px-4 py-6">
    <Router />
  </main>
  <Toaster />
</div>
