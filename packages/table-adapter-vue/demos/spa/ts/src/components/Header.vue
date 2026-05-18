<script setup lang="ts">
import { ref, watchEffect } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { Sun, Moon, User, LogOut } from 'lucide-vue-next';

const THEME_KEY = 'table-adapter-vue-theme';

function getInitialTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const { isAuthenticated, login, logout, loginInProgress } = useAuth();
const isDark = ref(getInitialTheme());
const showDropdown = ref(false);

watchEffect(() => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light');
});

function toggleTheme(): void {
  isDark.value = !isDark.value;
}
</script>

<template>
  <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
    <div class="container mx-auto px-4 flex h-14 items-center">
      <div class="mr-4 flex">
        <RouterLink to="/" class="mr-6 flex items-center space-x-2">
          <span class="font-bold">Table Adapter Demo</span>
        </RouterLink>
        <nav v-if="isAuthenticated" class="flex items-center space-x-6 text-sm font-medium">
          <RouterLink
            to="/customers"
            class="text-foreground/60 transition-colors hover:text-foreground"
            active-class="text-foreground"
          >
            Customers
          </RouterLink>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-end space-x-2">
        <button
          class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
          aria-label="Toggle theme"
          @click="toggleTheme"
        >
          <Sun v-if="isDark" class="h-5 w-5" />
          <Moon v-else class="h-5 w-5" />
        </button>
        <template v-if="isAuthenticated">
          <div class="relative">
            <button
              class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
              @click="showDropdown = !showDropdown"
            >
              <User class="h-5 w-5" />
            </button>
            <div
              v-if="showDropdown"
              class="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md"
              @click="showDropdown = false"
            >
              <button
                class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                @click="logout"
              >
                <LogOut class="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </template>
        <button
          v-else
          class="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          :disabled="loginInProgress"
          @click="login"
        >
          {{ loginInProgress ? 'Logging in...' : 'Login' }}
        </button>
      </div>
    </div>
  </header>
</template>
