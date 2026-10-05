// ESLint flat config. Rules here enforce docs/05-coding-standards.md.
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import astro from 'eslint-plugin-astro';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      'dist/',
      'dist-e2e/',
      '.astro/',
      'node_modules/',
      'docs/design/',
      'playwright-report/',
      'test-results/',
      'coverage/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.strict,
  astro.configs.recommended,
  astro.configs['jsx-a11y-recommended'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Standards §2: no `any`, prefer explicit narrowing.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Standards §9: no leftover debug logging in app code.
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'prefer-const': 'error',
    },
  },
  {
    // Build scripts, services, and tests are programs whose logs are their output.
    files: ['scripts/**', 'services/**', 'tests/**', '*.config.*'],
    rules: { 'no-console': 'off' },
  },
  prettier,
);
