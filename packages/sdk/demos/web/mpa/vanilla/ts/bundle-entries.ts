/**
 * Page bundle map: served bundle path → TypeScript entry point.
 *
 * Single source of truth shared by `server.ts` (on-the-fly dev bundling) and
 * `build-pages.ts` (static build). Add a page here once.
 */
export const BUNDLE_ENTRIES: Record<string, string> = {
  '/index.html.bundle.js': 'src/pages/home.ts',
  '/login.html.bundle.js': 'src/pages/login.ts',
  '/callback.html.bundle.js': 'src/pages/callback.ts',
  '/profile.html.bundle.js': 'src/pages/profile.ts',
  '/customers/index.html.bundle.js': 'src/pages/customers-list.ts',
  '/customers/detail.html.bundle.js': 'src/pages/customers-detail.ts',
  '/customers/create.html.bundle.js': 'src/pages/customers-create.ts',
  '/policies/index.html.bundle.js': 'src/pages/policies-list.ts',
  '/policies/detail.html.bundle.js': 'src/pages/policies-detail.ts',
};
