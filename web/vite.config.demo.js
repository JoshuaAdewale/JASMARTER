/**
 * Vite config for the single-file offline demo build.
 *
 *   cd web && npx vite build --config vite.config.demo.js
 *
 * Then demo/build-demo.py inlines the emitted JS + CSS into one HTML file.
 *
 * Key differences from the normal build:
 *   - `services/api` is aliased to the offline mock (api.demo.js)
 *   - base './' and relative asset names, so the file works from anywhere
 *   - a large assetsInlineLimit so the demo photos become data URIs
 *   - the entry is index.demo.html (HashRouter variant)
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

/**
 * Swaps every `../services/api` import for the offline mock.
 * Uses resolveId (not `resolve.alias`) because it must return an unambiguous
 * absolute path for relative specifiers like '../../services/api'.
 */
function demoApiSwap() {
  const mock = path.resolve(dir, 'src/services/api.demo.js');
  return {
    name: 'demo-api-swap',
    enforce: 'pre',
    resolveId(source) {
      if (/(^|\/)services\/api(\.js)?$/.test(source)) return mock;
      return null;
    },
  };
}

export default defineConfig({
  plugins: [demoApiSwap(), react()],
  base: './',
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 400_000, // inline the demo JPEGs as data URIs
    rollupOptions: {
      input: path.resolve(dir, 'index.demo.html'),
      output: {
        entryFileNames: 'app.js',
        chunkFileNames: 'app.[name].js',
        assetFileNames: 'app.[ext]',
        inlineDynamicImports: true,
      },
    },
  },
});
