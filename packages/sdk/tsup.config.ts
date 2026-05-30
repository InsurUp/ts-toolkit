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
    // oauth4webapi is ESM-only; bundle it in so the CJS output never require()s it.
    noExternal: ['oauth4webapi'],
  },
  // Browser bundle (all dependencies bundled, minified)
  {
    entry: { 'index.browser': 'src/index.ts' },
    format: ['esm'],
    outDir: 'dist',
    noExternal: ['@insurup/contracts', 'oauth4webapi'],
    minify: true,
    sourcemap: true,
    platform: 'browser',
    target: 'es2020',
  },
]);
