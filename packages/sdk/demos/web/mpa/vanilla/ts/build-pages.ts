/**
 * Static build
 *
 * Bundles each page entry point (the same map `server.ts` serves on the fly)
 * and copies the `public/` assets into `dist/` for static hosting.
 */

import { $ } from 'bun';

import { BUNDLE_ENTRIES } from './bundle-entries';

const OUT = 'dist';

await $`rm -rf ${OUT}`;
await $`mkdir -p ${OUT}`;
// Copy static assets (HTML, CSS, images) from public/ into dist/.
await $`cp -R public/. ${OUT}/`;

for (const [outPath, entry] of Object.entries(BUNDLE_ENTRIES)) {
  const result = await Bun.build({
    entrypoints: [entry],
    format: 'esm',
    target: 'browser',
    minify: true,
    sourcemap: 'linked',
  });

  if (!result.success) {
    console.error(`Failed to bundle ${entry}:`, result.logs);
    process.exit(1);
  }

  await Bun.write(`${OUT}${outPath}`, await result.outputs[0].text());
}

console.log(`Built ${Object.keys(BUNDLE_ENTRIES).length} page bundles into ${OUT}/`);
