import { resolve } from 'node:path';
import { defineConfig, mergeConfig } from 'vite';
import base from './vite.config';

export default mergeConfig(
  base,
  defineConfig({
    build: {
      lib: {
        entry: {
          index: resolve(import.meta.dirname, 'src/index.ts'),
          tokens: resolve(import.meta.dirname, 'src/tokens/tokens.ts'),
        },
        formats: ['es'],
        cssFileName: 'mal-design-system',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
      },
    },
  }),
);
