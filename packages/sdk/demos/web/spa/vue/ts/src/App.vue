<script setup lang="ts">
import { Toaster } from 'vue-sonner';
import Header from '@/components/Header.vue';
</script>

<template>
  <div class="min-h-screen bg-background">
    <Header />
    <main class="container mx-auto px-4 py-6">
      <router-view />
    </main>
    <Toaster />
  </div>
</template>
