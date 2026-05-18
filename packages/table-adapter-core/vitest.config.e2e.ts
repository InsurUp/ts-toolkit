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

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/e2e/**/*.e2e.spec.ts'],
    exclude: ['node_modules', 'dist'],
    // Real-network calls — give them room and avoid flaky timeouts.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Run files serially so we don't hammer the API; tests within a file still parallelize.
    fileParallelism: false,
  },
});
