import { isAuthenticated } from "$lib/auth/oauth";
import { isDarkTheme } from "../theme";

export function renderHeader(): string {
  const authenticated = isAuthenticated();
  const isDark = isDarkTheme();

  return `
    <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div class="container mx-auto px-4 flex h-14 items-center">
        <div class="mr-4 flex">
          <button id="nav-home" class="mr-6 flex items-center space-x-2 font-bold">
            Table Adapter Demo
          </button>
          ${authenticated ? `
            <nav class="flex items-center space-x-6 text-sm font-medium">
              <button id="nav-customers" class="text-foreground/60 transition-colors hover:text-foreground">
                Customers
              </button>
            </nav>
          ` : ""}
        </div>
        <div class="flex flex-1 items-center justify-end space-x-2">
          <button id="toggle-theme" class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent" aria-label="Toggle theme">
            ${isDark ? "☀️" : "🌙"}
          </button>
          ${authenticated ? `
            <button id="logout-btn" class="inline-flex items-center justify-center h-9 px-4 rounded-md border hover:bg-accent">
              Logout
            </button>
          ` : `
            <button id="login-btn" class="inline-flex items-center justify-center h-9 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Login
            </button>
          `}
        </div>
      </div>
    </header>
  `;
}
