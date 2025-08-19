/** AI-scope ESLint config (CommonJS to avoid ESM/import-assertion issues) */
module.exports = [
  {
    files: ['lib/ai/**/*.{ts,tsx}', 'app/api/ai/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin')
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // pragmatic for AI plumbing
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off', // pragmatic for AI plumbing
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // pragmatic for AI plumbing
      '@typescript-eslint/prefer-optional-chain': 'off' // pragmatic for AI plumbing
    }
  }
];
