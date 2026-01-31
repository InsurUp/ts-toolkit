import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const PORT = Number(process.env.PORT) || 3001;

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "./src/lib"),
      // Dev mode: resolve workspace packages to source for instant HMR
      "@insurup/sdk": path.resolve(__dirname, "../../../../src/index.ts"),
      "@insurup/contracts": path.resolve(__dirname, "../../../../../contracts/src/index.ts"),
    },
  },
  server: {
    port: PORT,
  },
  // SPA fallback - serve index.html for all routes
  appType: "spa",
});
