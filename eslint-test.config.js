/**
 * @fileoverview Simple ESLint test configuration for brand rules
 * @description Test configuration without TypeScript project requirements
 * @version 1.0.0
 * @author OSS Hero System
 */

import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['tests/eslint/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // Basic rules for testing
      'no-unused-vars': 'warn',
      'no-console': 'off',
      
      // Brand-aware rules (simplified for testing)
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
          message: 'Raw hex colors are not allowed. Use brand colors or Tailwind classes.'
        },
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3}$/]',
          message: 'Raw hex colors are not allowed. Use brand colors or Tailwind classes.'
        }
      ]
    }
  }
];
