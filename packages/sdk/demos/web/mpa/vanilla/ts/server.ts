/**
 * MPA Development Server
 *
 * Serves static HTML files and bundles TypeScript on-the-fly.
 * Each page has its own entry point that gets bundled when requested.
 */

const PORT = process.env.PORT || 3011;

// Map bundle paths to their TypeScript entry points
const BUNDLE_ENTRIES: Record<string, string> = {
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

// Cache for bundled scripts
const bundleCache = new Map<string, { code: string; mtime: number }>();

async function bundleEntry(entryPath: string): Promise<string> {
  const stat = await Bun.file(entryPath).stat();
  const cached = bundleCache.get(entryPath);

  if (cached && cached.mtime === stat.mtimeMs) {
    return cached.code;
  }

  const result = await Bun.build({
    entrypoints: [entryPath],
    format: 'esm',
    target: 'browser',
    minify: false,
    sourcemap: 'inline',
  });

  if (!result.success) {
    console.error('Build errors:', result.logs);
    throw new Error(`Failed to bundle ${entryPath}`);
  }

  const code = await result.outputs[0].text();
  bundleCache.set(entryPath, { code, mtime: stat.mtimeMs });
  return code;
}

function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  return 'text/plain';
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Handle OAuth callback (real path, not hash-based)
    if (pathname === '/callback') {
      pathname = '/callback.html';
    }

    // Serve bundled JS for page entries
    if (pathname.endsWith('.bundle.js')) {
      const entryPath = BUNDLE_ENTRIES[pathname];
      if (entryPath) {
        try {
          const code = await bundleEntry(entryPath);
          return new Response(code, {
            headers: { 'Content-Type': 'application/javascript' },
          });
        } catch (error) {
          console.error(error);
          return new Response(`console.error("Bundle error: ${error}")`, {
            status: 500,
            headers: { 'Content-Type': 'application/javascript' },
          });
        }
      }
    }

    // Serve static files from public/
    let filePath = `public${pathname}`;
    if (pathname.endsWith('/')) {
      filePath = `public${pathname}index.html`;
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file, {
        headers: { 'Content-Type': getContentType(filePath) },
      });
    }

    // Try with .html extension
    const htmlFile = Bun.file(`${filePath}.html`);
    if (await htmlFile.exists()) {
      return new Response(htmlFile, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 MPA Demo server running at http://localhost:${server.port}`);
