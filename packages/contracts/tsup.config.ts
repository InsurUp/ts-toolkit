import { defineConfig } from 'tsup';

export default defineConfig([
  // Node/bundler builds (ESM + CJS)
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    clean: true,
    sourcemap: true,
    splitting: false,
    outDir: 'dist',
  },
  // Browser bundle (minified, standalone)
  {
    entry: { 'index.browser': 'src/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    minify: true,
    sourcemap: true,
    platform: 'browser',
    target: 'es2020',
  },
]);
