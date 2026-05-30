<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { handleCallback } = useAuth();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');

  if (code && state) {
    try {
      await handleCallback();
      window.history.replaceState({}, '', window.location.pathname);
      router.replace('/');
    } catch (error) {
      console.error('Callback error:', error);
      router.replace('/');
    }
  } else {
    router.replace('/');
  }
});
</script>

<template>
  <div class="flex min-h-[50vh] items-center justify-center">
    <div class="text-center">
      <div
        class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"
      ></div>
      <p class="text-muted-foreground">Completing login...</p>
    </div>
  </div>
</template>
