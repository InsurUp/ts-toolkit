/**
 * Simple hash-based router for SPA navigation.
 * Supports route guards, dynamic parameters, and query string handling.
 */

import { isAuthenticated } from "../auth";

export interface Route {
  path: string;
  component: () => Promise<{ render: (container: HTMLElement, params?: RouteParams, query?: QueryParams) => void | Promise<void> }>;
  /** If true, requires authentication */
  protected?: boolean;
  /** Page title */
  title?: string;
}

export interface RouteParams {
  [key: string]: string;
}

export interface QueryParams {
  [key: string]: string;
}

interface RouterOptions {
  routes: Route[];
  container: HTMLElement;
  onNavigate?: (path: string) => void;
  onAuthRequired?: () => void;
}

class Router {
  private routes: Route[];
  private container: HTMLElement;
  private onNavigate?: (path: string) => void;
  private onAuthRequired?: () => void;
  private currentPath: string = "";
  private currentQuery: QueryParams = {};

  constructor(options: RouterOptions) {
    this.routes = options.routes;
    this.container = options.container;
    this.onNavigate = options.onNavigate;
    this.onAuthRequired = options.onAuthRequired;

    // Listen for hash changes
    window.addEventListener("hashchange", () => this.handleRoute());
    // Listen for popstate (back/forward navigation)
    window.addEventListener("popstate", () => this.handleRoute());
    // Handle initial route
    window.addEventListener("load", () => this.handleRoute());
  }

  /**
   * Parse query string from hash.
   */
  private parseQuery(hash: string): { path: string; query: QueryParams } {
    const queryIndex = hash.indexOf("?");
    if (queryIndex === -1) {
      return { path: hash, query: {} };
    }

    const path = hash.slice(0, queryIndex);
    const queryString = hash.slice(queryIndex + 1);
    const params = new URLSearchParams(queryString);
    const query: QueryParams = {};

    for (const [key, value] of params.entries()) {
      query[key] = value;
    }

    return { path, query };
  }

  /**
   * Navigate to a path.
   */
  navigate(path: string): void {
    window.location.hash = path;
  }

  /**
   * Get the current path.
   */
  getCurrentPath(): string {
    return this.currentPath;
  }

  /**
   * Get the current query params.
   */
  getCurrentQuery(): QueryParams {
    return this.currentQuery;
  }

  /**
   * Handle route changes.
   */
  async handleRoute(): Promise<void> {
    const hash = window.location.hash.slice(1) || "/";
    const { path, query } = this.parseQuery(hash);

    this.currentPath = path;
    this.currentQuery = query;

    // Find matching route
    const { route, params } = this.matchRoute(path);

    if (!route) {
      // 404 - show not found
      this.container.innerHTML = `
        <article>
          <header><h2>Page Not Found</h2></header>
          <p>The page you're looking for doesn't exist.</p>
          <a href="#/" role="button">Go Home</a>
        </article>
      `;
      return;
    }

    // Check auth guard
    if (route.protected && !isAuthenticated()) {
      this.onAuthRequired?.();
      this.navigate("/login");
      return;
    }

    // Update page title
    if (route.title) {
      document.title = `${route.title} | InsurUp SDK Demo`;
    } else {
      document.title = "InsurUp SDK Demo";
    }

    // Notify navigation
    this.onNavigate?.(path);

    // Load and render component
    try {
      this.container.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner large"></div>
          <p>Loading...</p>
        </div>
      `;

      const component = await route.component();
      await component.render(this.container, params, query);
    } catch (error) {
      console.error("Failed to load page:", error);
      this.container.innerHTML = `
        <article>
          <header><h2>Error</h2></header>
          <p>Failed to load the page. Please try again.</p>
          <pre>${error instanceof Error ? error.message : "Unknown error"}</pre>
          <a href="#/" role="button">Go Home</a>
        </article>
      `;
    }
  }

  /**
   * Match a path to a route.
   */
  private matchRoute(path: string): { route: Route | null; params: RouteParams } {
    for (const route of this.routes) {
      const params = this.matchPath(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return { route: null, params: {} };
  }

  /**
   * Match a route pattern to a path.
   * Supports :param syntax for dynamic segments.
   */
  private matchPath(pattern: string, path: string): RouteParams | null {
    const patternParts = pattern.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: RouteParams = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (!patternPart || !pathPart) {
        return null;
      }

      if (patternPart.startsWith(":")) {
        // Dynamic parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        // No match
        return null;
      }
    }

    return params;
  }

  /**
   * Force a route refresh.
   */
  refresh(): void {
    this.handleRoute();
  }
}

let routerInstance: Router | null = null;

/**
 * Initialize the router with routes.
 */
export function initRouter(options: RouterOptions): Router {
  routerInstance = new Router(options);
  return routerInstance;
}

/**
 * Get the router instance.
 */
export function getRouter(): Router {
  if (!routerInstance) {
    throw new Error("Router not initialized. Call initRouter first.");
  }
  return routerInstance;
}

/**
 * Navigate to a path.
 */
export function navigate(path: string): void {
  getRouter().navigate(path);
}

/**
 * Refresh the current route.
 */
export function refreshRoute(): void {
  getRouter().refresh();
}

/**
 * Get the current query params.
 */
export function getQueryParams(): QueryParams {
  return getRouter().getCurrentQuery();
}
