import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const here = dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(resolve(here, '../../.env'));
} catch {
  // No .env at repo root — tests will skip.
}

export default defineConfig({
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
