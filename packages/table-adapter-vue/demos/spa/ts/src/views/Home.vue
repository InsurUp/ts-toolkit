<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { TableIcon, Users } from 'lucide-vue-next';

const router = useRouter();
const { isAuthenticated, login, loginInProgress } = useAuth();
</script>

<template>
  <div
    v-if="!isAuthenticated"
    class="flex flex-col items-center justify-center min-h-[70vh] text-center"
  >
    <TableIcon class="h-16 w-16 text-primary mb-6" />
    <h1 class="text-4xl font-bold tracking-tight mb-4">Table Adapter Vue Demo</h1>
    <p class="text-xl text-muted-foreground mb-8 max-w-md">
      A Vue SPA demonstrating the @insurup/table-adapter-vue package with TanStack Table
      integration.
    </p>
    <button
      class="h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      :disabled="loginInProgress"
      @click="login"
    >
      {{ loginInProgress ? 'Signing in...' : 'Sign in to get started' }}
    </button>
  </div>

  <div v-else class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to the Table Adapter Vue Demo. Explore the customer table.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        class="cursor-pointer rounded-xl border bg-card p-6 shadow-sm hover:bg-muted/50 transition-colors"
        @click="router.push('/customers')"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium">Customer Table</span>
          <Users class="h-4 w-4 text-muted-foreground" />
        </div>
        <p class="text-sm text-muted-foreground">
          View customers using the useCustomerTable composable with TanStack Table. Features
          sorting, pagination, and search.
        </p>
      </div>
    </div>
  </div>
</template>
