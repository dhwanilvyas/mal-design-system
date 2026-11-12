import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'node_modules', '!.storybook'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.strict,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Components must use semantic tokens, not raw palette values or hex.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message: 'Use a semantic token class (e.g. bg-surface) instead of a hard-coded colour.',
        },
      ],
    },
  },
  {
    // Token source files and docs are where raw values are allowed to live.
    files: ['src/tokens/**', 'src/docs/**', 'scripts/**', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  ...storybook.configs['flat/recommended'],
);
