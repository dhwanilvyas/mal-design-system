import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

/**
 * Import boundaries, enforced so the platform split can't erode:
 *  - *.web.tsx never imports React Native; *.native.tsx never imports web files.
 *  - *.types.ts / *.shared.ts are platform-neutral: neither.
 *  - core/ never imports banking/ (generic controls know nothing about money).
 */
const ban = {
  native: { group: ['react-native', 'react-native-*', '**/*.native'], message: 'Web files must not import React Native code.' },
  web: { group: ['react-dom', '**/*.web'], message: 'Native files must not import web code.' },
  banking: { group: ['**/banking/**'], message: 'core/ is generic and must not depend on banking/. Move shared code into core/.' },
};
const restrict = (...groups) => ({ 'no-restricted-imports': ['error', { patterns: groups }] });

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'node_modules', '!.storybook'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Components must use semantic tokens, never raw palette values or hex.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3,8}\\b/]',
          message: 'Use a semantic token (bg-surface on web, colors.surface on native) instead of a hard-coded colour.',
        },
      ],
    },
  },
  // DOM accessibility rules apply to web components only.
  { files: ['src/**/*.web.tsx', 'src/**/*.stories.tsx', 'src/docs/**'], ...jsxA11y.flatConfigs.strict },
  { files: ['src/banking/**/*.web.tsx'], rules: restrict(ban.native) },
  { files: ['src/banking/**/*.native.{ts,tsx}'], rules: restrict(ban.web) },
  { files: ['src/banking/**/*.{types,shared}.ts'], rules: restrict(ban.native, ban.web) },
  { files: ['src/core/**/*.web.tsx'], rules: restrict(ban.native, ban.banking) },
  { files: ['src/core/**/*.native.{ts,tsx}'], rules: restrict(ban.web, ban.banking) },
  { files: ['src/core/**/*.{types,shared}.ts', 'src/core/**/icons.ts'], rules: restrict(ban.native, ban.web, ban.banking) },
  {
    // Token sources, generated output, docs and tooling are where raw values may live.
    files: ['src/tokens/**', 'src/docs/**', 'scripts/**', '**/*.test.{ts,tsx}'],
    rules: { 'no-restricted-syntax': 'off' },
  },
  ...storybook.configs['flat/recommended'],
);
