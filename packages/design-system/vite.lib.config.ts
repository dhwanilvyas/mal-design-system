import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Web build: src/index.ts → dist/index.js. Only .web.tsx and shared files are reachable
 * from the web entry, so no React Native code ends up in it. Native apps don't use dist/:
 * Metro compiles src/index.native.ts directly.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    lib: { entry: resolve(import.meta.dirname, 'src/index.ts'), formats: ['es'], fileName: 'index' },
    sourcemap: true,
    rollupOptions: {
      external: [/^react($|\/)/, /^react-dom($|\/)/],
      // Components use state and handlers: mark the bundle as client code for React Server Components.
      output: { banner: "'use client';" },
    },
  },
});
