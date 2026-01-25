/**
 * InsurUp SDK Web Demo - Main Entry Point
 *
 * Initializes the router, renders the header, and handles navigation.
 */

import { loadConfig } from "./config";
import { initRouter, type Route } from "./utils/router";
import { renderHeader, initTheme } from "./components/header";
import { showInfo } from "./components/toast";

/**
 * Handle OAuth callback if on /callback path.
 * This runs before the SPA router since OAuth redirects to a real path.
 */
async function handleOAuthCallback(): Promise<boolean> {
  if (window.location.pathname !== "/callback") {
    return false;
  }

  const mainContent = document.getElementById("main-content");
  if (!mainContent) return false;

  // Dynamically import and render the callback page
  const { render } = await import("./pages/callback");
  await render(mainContent);
  return true;
}

// Define application routes
const routes: Route[] = [
  {
    path: "/",
    component: () => import("./pages/home"),
    title: "Home",
  },
  {
    path: "/login",
    component: () => import("./pages/login"),
    title: "Login",
  },
  {
    path: "/customers",
    component: () => import("./pages/customers/list"),
    title: "Customers",
    protected: true,
  },
  {
    path: "/customers/create",
    component: () => import("./pages/customers/create"),
    title: "Create Customer",
    protected: true,
  },
  {
    path: "/customers/:id",
    component: () => import("./pages/customers/detail"),
    title: "Customer Details",
    protected: true,
  },
  {
    path: "/policies",
    component: () => import("./pages/policies/list"),
    title: "Policies",
    protected: true,
  },
  {
    path: "/policies/:id",
    component: () => import("./pages/policies/detail"),
    title: "Policy Details",
    protected: true,
  },
  {
    path: "/profile",
    component: () => import("./pages/profile"),
    title: "Profile",
    protected: true,
  },
];

/**
 * Initialize the application.
 */
async function init(): Promise<void> {
  // Load configuration
  loadConfig();

  // Initialize theme
  initTheme();

  // Get DOM elements
  const navContainer = document.getElementById("main-nav");
  const mainContent = document.getElementById("main-content");

  if (!navContainer || !mainContent) {
    throw new Error("Required DOM elements not found");
  }

  // Handle OAuth callback first (before SPA routing)
  const isCallback = await handleOAuthCallback();
  if (isCallback) {
    // Callback page handles its own navigation after token exchange
    return;
  }

  // Render header
  renderHeader(navContainer);

  // Initialize router
  initRouter({
    routes,
    container: mainContent,
    onNavigate: () => {
      // Re-render header on navigation to update auth status
      renderHeader(navContainer);
    },
    onAuthRequired: () => {
      showInfo("Please log in to access this page.");
    },
  });
}

// Start the application
init().catch((error) => {
  console.error("Failed to initialize application:", error);
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = `
      <article>
        <header><h2>Application Error</h2></header>
        <p>Failed to initialize the application. Please refresh the page and try again.</p>
        <pre>${error instanceof Error ? error.message : "Unknown error"}</pre>
      </article>
    `;
  }
});
