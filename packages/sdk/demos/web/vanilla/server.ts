/**
 * Development server for the InsurUp SDK Web Demo.
 * Uses Bun's built-in HTML imports with HMR support.
 */

import index from "./index.html";

const PORT = Number(process.env.PORT) || 3000;

const server = Bun.serve({
  port: PORT,
  routes: {
    "/": index,
    // Serve index.html for all routes (SPA routing)
    "/*": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 InsurUp SDK Web Demo running at http://localhost:${server.port}`);
