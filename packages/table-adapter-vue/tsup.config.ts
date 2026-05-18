import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  sourcemap: true,
  splitting: false,
  outDir: 'dist',
  external: ['@insurup/table-adapter-core', 'vue', '@tanstack/vue-table'],
});
