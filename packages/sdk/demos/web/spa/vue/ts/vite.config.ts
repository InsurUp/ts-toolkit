import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const PORT = Number(process.env.PORT) || 3002;

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Dev mode: resolve workspace packages to source for instant HMR
      '@insurup/sdk': path.resolve(__dirname, '../../../../../src/index.ts'),
      '@insurup/contracts': path.resolve(__dirname, '../../../../../../contracts/src/index.ts'),
    },
  },
  server: {
    port: PORT,
  },
});
