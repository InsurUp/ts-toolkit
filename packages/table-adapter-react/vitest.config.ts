import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Force a single React instance. Bun nests a second react copy inside this
// package's node_modules (peer + devDep), which makes the hooks dispatcher
// resolve to a different instance than the one testing-library/react uses
// and crashes tests with "Cannot read properties of null (reading 'useRef')".
// Resolve react from the workspace root so every import hits the same module.
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
    include: ['test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', 'test/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'test', '**/*.config.ts', '**/*.d.ts'],
    },
  },
});
