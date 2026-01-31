import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Dev mode: resolve workspace packages to source for instant HMR
      "@insurup/table-adapter-vue": path.resolve(__dirname, "../../../src/index.ts"),
      "@insurup/table-adapter-core": path.resolve(__dirname, "../../../../table-adapter-core/src/index.ts"),
      "@insurup/sdk": path.resolve(__dirname, "../../../../sdk/src/index.ts"),
      "@insurup/contracts": path.resolve(__dirname, "../../../../contracts/src/index.ts"),
    },
  },
  server: {
    port: 4001,
  },
});
