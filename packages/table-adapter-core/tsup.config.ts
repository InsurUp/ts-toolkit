import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/internal.ts'],
  format: ['esm', 'cjs'],
  clean: true,
  sourcemap: true,
  splitting: false,
  outDir: 'dist',
  external: ['@insurup/sdk'],
});
