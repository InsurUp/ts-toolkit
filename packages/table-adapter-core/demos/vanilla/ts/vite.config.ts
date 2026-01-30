import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "$lib": path.resolve(__dirname, "./src/lib"),
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
