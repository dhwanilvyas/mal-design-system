import type { Decorator, Preview } from '@storybook/react-vite';
import { useLayoutEffect, type ReactNode } from 'react';
import '../src/styles/storybook.css';

/** Applies the theme + direction globals to <html>, exactly as a product app would. */
function ThemeRoot({ theme, dir, children }: { theme: string; dir: string; children: ReactNode }) {
  // Layout effect: apply before paint so components don't animate from the light theme.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dir = dir;
    root.lang = dir === 'rtl' ? 'ar' : 'en';
  }, [theme, dir]);
  return (
    <div className="bg-canvas p-6 text-fg" style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}

const withThemeAndDirection: Decorator = (Story, context) => {
  const { theme = 'light', dir = 'ltr' } = context.globals as { theme?: string; dir?: string };
  return (
    <ThemeRoot theme={theme} dir={dir}>
      <Story />
    </ThemeRoot>
  );
};

const preview: Preview = {
  decorators: [withThemeAndDirection],
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR (English)' },
          { value: 'rtl', title: 'RTL (Arabic)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', dir: 'ltr' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Introduction', 'Native app (React Native)', 'Foundations', ['Tokens'], 'Core', 'Banking', '*'],
      },
    },
  },
};

export default preview;
