import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "$lib": path.resolve(__dirname, "./src/lib"),
      // Dev mode: resolve workspace packages to source for instant HMR
      "@insurup/table-adapter-core": path.resolve(__dirname, "../../../src/index.ts"),
      "@insurup/sdk": path.resolve(__dirname, "../../../../sdk/src/index.ts"),
      "@insurup/contracts": path.resolve(__dirname, "../../../../contracts/src/index.ts"),
    },
  },
  server: {
    port: 4003,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        infinite: path.resolve(__dirname, "infinite.html"),
      },
    },
  },
});
