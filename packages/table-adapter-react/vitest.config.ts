import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const rootNodeModules = fileURLToPath(new URL('../../node_modules', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      react: `${rootNodeModules}/react`,
      'react-dom': `${rootNodeModules}/react-dom`,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'test', '**/*.config.ts', '**/*.d.ts'],
    },
  },
});
