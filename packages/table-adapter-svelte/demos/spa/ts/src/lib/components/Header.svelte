<script lang="ts">
  import { Sun, Moon, User, LogOut } from "@lucide/svelte";
  import { getAuthState, login } from "$lib/auth/index.svelte";
  import { navigate, p, isActive } from "$lib/router";

  const auth = getAuthState();

  const THEME_KEY = "table-adapter-svelte-theme";

  function getInitialTheme(): boolean {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  let isDark = $state(getInitialTheme());
  let showDropdown = $state(false);

  $effect(() => {
    if (typeof document !== "undefined") {
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    }
  });

  function toggleTheme(): void {
    isDark = !isDark;
  }

  async function handleLogin(): Promise<void> {
    auth.setLoginInProgress(true);
    await login();
  }

  async function handleLogout(): Promise<void> {
    await auth.logOut();
    showDropdown = false;
    navigate("/");
  }
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
  <div class="container mx-auto px-4 flex h-14 items-center">
    <div class="mr-4 flex">
      <a href={p("/")} class="mr-6 flex items-center space-x-2 font-bold">
        Table Adapter Demo
      </a>
      {#if auth.isAuthenticated}
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <a
            href={p("/customers/basic")}
            class="transition-colors hover:text-foreground {isActive('/customers/basic') ? 'text-foreground' : 'text-foreground/60'}"
          >
            Basic
          </a>
          <a
            href={p("/customers")}
            class="transition-colors hover:text-foreground {isActive('/customers') && !isActive('/customers/infinite') && !isActive('/customers/basic') && !isActive('/customers/controlled') ? 'text-foreground' : 'text-foreground/60'}"
          >
            Advanced
          </a>
          <a
            href={p("/customers/controlled")}
            class="transition-colors hover:text-foreground {isActive('/customers/controlled') ? 'text-foreground' : 'text-foreground/60'}"
          >
            Controlled
          </a>
          <a
            href={p("/customers/infinite")}
            class="transition-colors hover:text-foreground {isActive('/customers/infinite') ? 'text-foreground' : 'text-foreground/60'}"
          >
            Infinite
          </a>
        </nav>
      {/if}
    </div>
    <div class="flex flex-1 items-center justify-end space-x-2">
      <button
        class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
        onclick={toggleTheme}
        aria-label="Toggle theme"
      >
        {#if isDark}
          <Sun class="h-5 w-5" />
        {:else}
          <Moon class="h-5 w-5" />
        {/if}
      </button>
      {#if auth.isAuthenticated}
        <div class="relative">
          <button
            class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent"
            onclick={() => showDropdown = !showDropdown}
          >
            <User class="h-5 w-5" />
          </button>
          {#if showDropdown}
            <div class="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md">
              <button
                class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                onclick={handleLogout}
              >
                <LogOut class="h-4 w-4" />
                Logout
              </button>
            </div>
          {/if}
        </div>
      {:else}
        <button
          class="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={auth.loginInProgress}
          onclick={handleLogin}
        >
          {auth.loginInProgress ? "Logging in..." : "Login"}
        </button>
      {/if}
    </div>
  </div>
</header>
