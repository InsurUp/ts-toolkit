import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Dev mode: resolve workspace packages to source for instant HMR
      '@insurup/table-adapter-react': path.resolve(__dirname, '../../../src/index.ts'),
      '@insurup/table-adapter-core': path.resolve(
        __dirname,
        '../../../../table-adapter-core/src/index.ts'
      ),
      '@insurup/sdk': path.resolve(__dirname, '../../../../sdk/src/index.ts'),
      '@insurup/contracts': path.resolve(__dirname, '../../../../contracts/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 4000,
  },
});
