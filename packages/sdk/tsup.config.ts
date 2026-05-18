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
  // Browser bundle (all dependencies bundled, minified)
  {
    entry: { 'index.browser': 'src/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    noExternal: ['@insurup/contracts'],
    minify: true,
    sourcemap: true,
    platform: 'browser',
    target: 'es2020',
  },
]);
