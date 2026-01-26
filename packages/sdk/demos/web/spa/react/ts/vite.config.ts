import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const PORT = Number(process.env.PORT) || 3000;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ...tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    port: PORT,
  },
});
