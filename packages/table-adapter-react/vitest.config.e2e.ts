import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Load the repo-root `.env` so credentials are shared across every package's
// e2e suite. Missing file is fine — `describeE2E` skips when creds are absent.
const here = dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(resolve(here, '../../.env'));
} catch {
  // No .env at repo root — tests will skip.
}

// Same React resolution trick as vitest.config.ts: force the workspace-root
// React copy so the hooks dispatcher and testing-library share a module.
const require = createRequire(import.meta.url);
const workspaceRoot = fileURLToPath(new URL('../../', import.meta.url));
const reactPath = dirname(require.resolve('react/package.json', { paths: [workspaceRoot] }));
const reactDomPath = dirname(require.resolve('react-dom/package.json', { paths: [workspaceRoot] }));

export default defineConfig({
  resolve: {
    alias: {
      react: reactPath,
      'react-dom': reactDomPath,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/e2e/**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'dist'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
