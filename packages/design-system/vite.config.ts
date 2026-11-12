import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Used by Storybook. The library build lives in vite.lib.config.ts.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
