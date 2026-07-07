// FB-F-17: ESLint 9 flat config — typescript-eslint recommended (sin type-checking para mantener
// el lint rápido), react-hooks (rules-of-hooks/exhaustive-deps) y jsx-a11y recommended.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js', 'postcss.config.js', 'tailwind.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },
);
