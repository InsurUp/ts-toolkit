<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { Button, Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui';
import { Users, FileText, Shield } from 'lucide-vue-next';

const router = useRouter();
const { isAuthenticated, loginInProgress, login } = useAuth();
</script>

<template>
  <div
    v-if="!isAuthenticated"
    class="flex flex-col items-center justify-center min-h-[70vh] text-center"
  >
    <Shield class="h-16 w-16 text-primary mb-6" />
    <h1 class="text-4xl font-bold tracking-tight mb-4">InsurUp SDK Demo</h1>
    <p class="text-xl text-muted-foreground mb-8 max-w-md">
      A Vue SPA demonstrating the InsurUp SDK for insurance platform integration.
    </p>
    <Button size="lg" @click="login" :disabled="loginInProgress">
      {{ loginInProgress ? 'Signing in...' : 'Sign in to get started' }}
    </Button>
  </div>

  <div v-else class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome to the InsurUp SDK Demo. Explore customers and policies.
      </p>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card
        class="cursor-pointer hover:bg-muted/50 transition-colors"
        @click="router.push('/customers')"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Customers</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            View and manage customer records. Create new customers, search, and filter.
          </CardDescription>
        </CardContent>
      </Card>

      <Card
        class="cursor-pointer hover:bg-muted/50 transition-colors"
        @click="router.push('/policies')"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Policies</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <CardDescription>
            Browse insurance policies. View details, coverage, and status information.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
