<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/ui';
import { User, Mail, Clock, LogOut } from 'lucide-vue-next';

const { token, logout, parseIdTokenClaims } = useAuth();
const claims = computed(() => parseIdTokenClaims());
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Profile</h1>
      <p class="text-muted-foreground">View your account information and session details.</p>
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
          <div v-if="typeof claims?.name === 'string'" class="flex items-center gap-2">
            <User class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Name:</span>
            <span>{{ claims.name }}</span>
          </div>
          <div v-if="typeof claims?.email === 'string'" class="flex items-center gap-2">
            <Mail class="h-4 w-4 text-muted-foreground" />
            <span class="font-medium">Email:</span>
            <span>{{ claims.email }}</span>
          </div>
          <div v-if="claims?.email_verified !== undefined" class="flex items-center gap-2">
            <span class="font-medium">Email Verified:</span>
            <Badge :variant="claims.email_verified ? 'default' : 'secondary'">
              {{ claims.email_verified ? 'Yes' : 'No' }}
            </Badge>
          </div>
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
            <span class="font-medium">Status:</span>
            <Badge variant="default" class="ml-2">Authenticated</Badge>
          </div>
          <div v-if="typeof claims?.iat === 'number'">
            <span class="font-medium">Issued At:</span>
            <span class="text-muted-foreground ml-2">
              {{ new Date(claims.iat * 1000).toLocaleString() }}
            </span>
          </div>
          <div v-if="typeof claims?.exp === 'number'">
            <span class="font-medium">Expires:</span>
            <span class="text-muted-foreground ml-2">
              {{ new Date(claims.exp * 1000).toLocaleString() }}
            </span>
          </div>
          <div class="pt-4">
            <Button variant="destructive" @click="logout">
              <LogOut class="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <Card v-if="token">
      <CardHeader>
        <CardTitle>Access Token</CardTitle>
        <CardDescription> The current access token (truncated for display). </CardDescription>
      </CardHeader>
      <CardContent>
        <code class="block p-4 bg-muted rounded-md text-sm break-all">
          {{ token.slice(0, 50) }}...{{ token.slice(-20) }}
        </code>
      </CardContent>
    </Card>
  </div>
</template>
