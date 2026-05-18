<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import {
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { User, LogOut, Moon, Sun } from 'lucide-vue-next';

const THEME_KEY = 'insurup-demo-theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const router = useRouter();
const route = useRoute();
const { isAuthenticated, loginInProgress, login, logout } = useAuth();

const isDark = ref(getInitialTheme());

function updateTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light');
}

onMounted(() => {
  updateTheme();
});

watch(isDark, () => {
  updateTheme();
});

function toggleTheme() {
  isDark.value = !isDark.value;
}

function handleLogout() {
  logout();
  router.push('/');
}

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/');
}
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="container mx-auto px-4 flex h-14 items-center">
      <div class="mr-4 flex">
        <router-link to="/" class="mr-6 flex items-center space-x-2">
          <span class="font-bold">InsurUp SDK Demo</span>
        </router-link>
        <nav v-if="isAuthenticated" class="flex items-center space-x-6 text-sm font-medium">
          <router-link
            to="/customers"
            :class="
              isActive('/customers')
                ? 'text-foreground'
                : 'text-foreground/60 transition-colors hover:text-foreground'
            "
          >
            Customers
          </router-link>
          <router-link
            to="/policies"
            :class="
              isActive('/policies')
                ? 'text-foreground'
                : 'text-foreground/60 transition-colors hover:text-foreground'
            "
          >
            Policies
          </router-link>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-end space-x-2">
        <Button variant="ghost" size="icon" @click="toggleTheme">
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </Button>
        <template v-if="isAuthenticated">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <User class="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @select="router.push('/profile')"> Profile </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem @select="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </template>
        <template v-else>
          <Button @click="login" :disabled="loginInProgress">
            {{ loginInProgress ? 'Logging in...' : 'Login' }}
          </Button>
        </template>
      </div>
    </div>
  </header>
</template>
