import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Shared plugins (Storybook extends this file). Library build lives in vite.lib.config.ts.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
