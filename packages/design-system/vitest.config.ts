import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Web components + shared logic under jsdom. Native components are exercised in apps/mobile.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    css: false,
  },
});
