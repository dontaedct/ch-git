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
      // Enforce strict TypeScript usage
      '@typescript-eslint/no-explicit-any': ['error', {
        'fixToUnknown': false,
        'ignoreRestArgs': false
      }],
      '@typescript-eslint/no-unused-vars': ['error', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_'
      }],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
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
  // Custom rule to prevent server-only env vars in client code (excludes server-only files)
  {
    files: [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'hooks/**/*.{ts,tsx}',
      'types/**/*.{ts,tsx}'
    ],
    ignores: [
      'app/api/**/*.{ts,tsx}',
      'app/_debug/**/*.{ts,tsx}',
      'app/probe/**/*.{ts,tsx}',
      'app/status/**/*.{ts,tsx}',
      'app/test-simple/**/*.{ts,tsx}',
      'app/global-error.tsx'
    ],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'MemberExpression[object.name="process"][property.name="env"]',
          message: 'Direct process.env access is forbidden. Use @lib/env functions instead.',
        },
      ],
    },
  },
];
