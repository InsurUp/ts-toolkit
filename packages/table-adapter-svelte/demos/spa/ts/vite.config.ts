import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    svelte({
      inspector: {
        toggleKeyCombo: "meta-shift",
        showToggleButton: "always",
        toggleButtonPos: "bottom-right",
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "$lib": path.resolve(__dirname, "./src/lib"),
      // Dev mode: resolve workspace packages to source for instant HMR
      "@insurup/table-adapter-svelte": path.resolve(__dirname, "../../../src/lib/index.ts"),
      "@insurup/table-adapter-core": path.resolve(__dirname, "../../../../table-adapter-core/src/index.ts"),
      "@insurup/sdk": path.resolve(__dirname, "../../../../sdk/src/index.ts"),
      "@insurup/contracts": path.resolve(__dirname, "../../../../contracts/src/index.ts"),
    },
  },
  server: {
    port: 4002,
  },
});
