<script lang="ts">
  import { Button } from "$lib/components/ui";
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
  } from "$lib/components/ui";
  import { User, LogOut, Moon, Sun } from "lucide-svelte";
  import { getAuthState, login } from "$lib/auth/index.svelte";
  import { navigate, isActive } from "$lib/router";

  const THEME_KEY = "insurup-demo-theme";

  function getInitialTheme(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const auth = getAuthState();
  let isDark = $state(getInitialTheme());

  $effect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  });

  function toggleTheme() {
    isDark = !isDark;
  }

  async function handleLogin() {
    auth.setLoginInProgress(true);
    await login();
  }

  async function handleLogout() {
    await auth.logOut();
  }
</script>

<header
  class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
  <div class="container mx-auto px-4 flex h-14 items-center">
    <div class="mr-4 flex">
      <a href="/" class="mr-6 flex items-center space-x-2">
        <span class="font-bold">InsurUp SDK Demo</span>
      </a>
      {#if auth.isAuthenticated}
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <a
            href="/customers"
            class={isActive("/customers")
              ? "text-foreground"
              : "text-foreground/60 transition-colors hover:text-foreground"}
          >
            Customers
          </a>
          <a
            href="/policies"
            class={isActive("/policies")
              ? "text-foreground"
              : "text-foreground/60 transition-colors hover:text-foreground"}
          >
            Policies
          </a>
        </nav>
      {/if}
    </div>
    <div class="flex flex-1 items-center justify-end space-x-2">
      <Button variant="ghost" size="icon" onclick={toggleTheme}>
        {#if isDark}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </Button>
      {#if auth.isAuthenticated}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <User class="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => navigate("/profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut class="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      {:else}
        <Button onclick={handleLogin} disabled={auth.loginInProgress}>
          {auth.loginInProgress ? "Logging in..." : "Login"}
        </Button>
      {/if}
    </div>
  </div>
</header>
