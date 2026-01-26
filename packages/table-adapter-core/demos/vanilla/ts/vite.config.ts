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
});
