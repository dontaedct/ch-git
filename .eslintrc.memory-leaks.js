/**
 * ESLint Configuration for Memory Leak Detection
 * 
 * This configuration helps catch common memory leak patterns at build time:
 * - Missing useEffect cleanup functions
 * - Uncleaned timeouts and intervals
 * - Uncleaned event listeners
 * - Uncleaned subscriptions
 */

module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'react-hooks',
    'memory-leaks'
  ],
  rules: {
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Custom memory leak prevention rules
    'memory-leaks/use-effect-cleanup': 'error',
    'memory-leaks/no-uncleaned-timeouts': 'error',
    'memory-leaks/no-uncleaned-intervals': 'error',
    'memory-leaks/no-uncleaned-event-listeners': 'error',
    'memory-leaks/no-uncleaned-subscriptions': 'error',
    
    // Additional React best practices
    'react/jsx-no-bind': 'warn',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/no-danger': 'warn',
    'react/no-unsafe': 'warn',
    
    // Prevent common memory leak patterns
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    
    // Enforce proper cleanup patterns
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'warn'
  },
  overrides: [
    {
      // Apply stricter rules to React components
      files: ['**/*.tsx', '**/*.jsx'],
      rules: {
        'memory-leaks/use-effect-cleanup': 'error',
        'memory-leaks/no-uncleaned-timeouts': 'error',
        'memory-leaks/no-uncleaned-intervals': 'error',
        'memory-leaks/no-uncleaned-event-listeners': 'error',
        'memory-leaks/no-uncleaned-subscriptions': 'error'
      }
    },
    {
      // Apply stricter rules to custom hooks
      files: ['**/hooks/**/*.ts', '**/hooks/**/*.tsx'],
      rules: {
        'memory-leaks/use-effect-cleanup': 'error',
        'memory-leaks/no-uncleaned-timeouts': 'error',
        'memory-leaks/no-uncleaned-intervals': 'error',
        'memory-leaks/no-uncleaned-event-listeners': 'error',
        'memory-leaks/no-uncleaned-subscriptions': 'error',
        'react-hooks/exhaustive-deps': 'error'
      }
    }
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
};
