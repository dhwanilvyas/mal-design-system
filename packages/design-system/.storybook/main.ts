import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Web playground. Stories render the .web.tsx implementations; apps/mobile is the native demo.
  stories: ['../src/docs/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  // iOS screenshots for the "Native app" page. The browser build of the native
  // app is copied into storybook-static/native by the root `npm run build`.
  staticDirs: ['../public'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
};

export default config;
