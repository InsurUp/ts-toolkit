/**
 * Simple static file server for the MPA JavaScript demo.
 * No bundling required - serves files as-is.
 */

const PORT = process.env.PORT || 3010;

function getContentType(path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".json")) return "application/json";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;

    // Handle OAuth callback
    if (pathname === "/callback") {
      pathname = "/callback.html";
    }

    // Default to index.html for directories
    if (pathname.endsWith("/")) {
      pathname += "index.html";
    }

    // Serve SDK dist files (e.g., /dist/index.browser.js -> ../../../../../dist/index.browser.js)
    if (pathname.startsWith("/dist/")) {
      const file = Bun.file(`../../../../../dist${pathname.slice(5)}`);
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": getContentType(pathname) },
        });
      }
    }

    // Serve contracts dist files (e.g., /contracts/dist/index.browser.js -> ../../../../../../contracts/dist/index.browser.js)
    if (pathname.startsWith("/contracts/")) {
      const file = Bun.file(`../../../../../../${pathname.slice(1)}`);
      if (await file.exists()) {
        return new Response(file, {
          headers: { "Content-Type": getContentType(pathname) },
        });
      }
    }

    // Try to serve the file directly
    let file = Bun.file(`.${pathname}`);
    if (await file.exists()) {
      return new Response(file, {
        headers: { "Content-Type": getContentType(pathname) },
      });
    }

    // Try with .html extension
    file = Bun.file(`.${pathname}.html`);
    if (await file.exists()) {
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 MPA JS Demo server running at http://localhost:${server.port}`);
console.log("   No build step required - edit files and refresh!");
