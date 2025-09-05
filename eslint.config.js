import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  ...compat.extends('next/core-web-vitals'),
  {
    ignores: [
      'node_modules/',
      '.pnp',
      '.pnp.js',
      '.next/',
      'out/',
      'dist/',
      'build/',
      'coverage/',
      '*.lcov',
      '.npm',
      '.eslintcache',
      '.cache',
      '.parcel-cache',
      '.env*',
      '.env.local',
      '.env.production',
      'logs/',
      '*.log',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'tmp/',
      'temp/',
      '*.tsbuildinfo',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // TypeScript ESLint recommended rules
      ...typescript.configs.recommended.rules,
      // Temporarily relaxed rules for Phase 2 completion
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
    },
  },
  {
    files: ['lib/ai/**/*.{ts,tsx}', 'app/api/ai/**/*.{ts,tsx}'],
    rules: {
      // Pragmatic rules for AI plumbing
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'off'
    },
  },
  {
    files: ['scripts/**/*.{js,ts,tsx,mjs}'],
    rules: {
      // Relaxed rules for scripts
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  // Server-only files can use process.env (must come before client rule)
  {
    files: [
      'app/api/**/*.{ts,tsx}',
      'app/_debug/**/*.{ts,tsx}',
      'app/probe/**/*.{ts,tsx}',
      'app/status/**/*.{ts,tsx}',
      'app/test-simple/**/*.{ts,tsx}',
      'app/global-error.tsx',
      'lib/**/*.{ts,tsx}',
      'scripts/**/*.{ts,tsx,mjs}',
      'middleware.ts',
      'next.config.ts',
      'playwright.config.ts',
      'sentry.server.config.ts',
      'sentry.client.config.ts'
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  // Custom rule to prevent server-only imports and env vars in client code
  {
    files: [
      'app/client-portal/**/*.{ts,tsx}',
      'app/sessions/**/*.{ts,tsx}',
      'app/weekly-plans/**/*.{ts,tsx}',
      'app/clients/**/*.{ts,tsx}',
      'app/login/**/*.{ts,tsx}',
      'app/operability/**/*.{ts,tsx}',
      'app/progress/**/*.{ts,tsx}',
      'app/trainer-profile/**/*.{ts,tsx}',
      'app/auto-save-demo/**/*.{ts,tsx}',
      'app/guardian-demo/**/*.{ts,tsx}',
      'app/intake/**/*.{ts,tsx}',
      'app/ai/**/*.{ts,tsx}',
      'app/layout.tsx',
      'app/page.tsx',
      'app/error.tsx',
      'components/**/*.{ts,tsx}',
      'hooks/**/*.{ts,tsx}',
      'types/**/*.{ts,tsx}'
    ],
    rules: {
      // Block server-only imports in client components
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'fs',
            'path',
            'winston',
            '@opentelemetry/*',
            'server-only'
          ],
          paths: [
            {
              name: 'fs',
              message: 'Node.js "fs" module not allowed in client components. Use server actions or API routes.'
            },
            {
              name: 'path',
              message: 'Node.js "path" module not allowed in client components. Use server actions or API routes.'
            },
            {
              name: 'winston',
              message: 'Winston logging not allowed in client components. Use console or client-side logging.'
            },
            {
              name: 'server-only',
              message: '"server-only" package not allowed in client components. This enforces server-only code.'
            }
          ]
        }
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.name="process"][property.name="env"]',
          message: 'Direct process.env access is forbidden. Use @lib/env functions instead.',
        },
        {
          selector: 'ImportDeclaration[source.value=/^@opentelemetry/]',
          message: 'OpenTelemetry imports not allowed in client components. Use server-side observability.'
        }
      ],
    },
  },
];
