/**
 * Style Dictionary Configuration
 * HT-021.3.1 - Design Token Pipeline Implementation
 *
 * Comprehensive multi-format token pipeline with:
 * - CSS custom properties
 * - SCSS variables
 * - JavaScript modules
 * - JSON data files
 * - TypeScript definitions
 */

export default {
  source: [
    'tokens/base.json',
    'tokens/core/**/*.json'
  ],

  platforms: {
    // CSS Custom Properties
    css: {
      transformGroup: 'css',
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        },
        {
          destination: 'variables-light.css',
          format: 'css/variables',
          filter: (token) => {
            return !token.filePath.includes('dark') &&
                   (!token.attributes?.semantic || token.attributes.semantic === 'light');
          },
          options: {
            outputReferences: true,
          },
        },
        {
          destination: 'variables-dark.css',
          format: 'css/variables',
          filter: (token) => {
            return token.filePath.includes('dark') ||
                   (token.attributes?.semantic && token.attributes.semantic === 'dark');
          },
          options: {
            outputReferences: true,
          },
        }
      ],
    },

    // SCSS Variables
    scss: {
      transformGroup: 'scss',
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: '_variables.scss',
          format: 'scss/variables',
          options: {
            outputReferences: true,
          },
        }
      ],
    },

    // JavaScript ES6 modules
    js: {
      transformGroup: 'js',
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.mjs',
          format: 'javascript/es6',
        }
      ],
    },

    // JSON data files
    json: {
      transformGroup: 'js',
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/flat',
        },
        {
          destination: 'tokens-nested.json',
          format: 'json/nested',
        }
      ],
    },

    // Brand-specific CSS files
    'css-brands': {
      transformGroup: 'css',
      buildPath: 'dist/tokens/brands/',
      source: [
        'tokens/base.json',
        'tokens/core/**/*.json',
        'tokens/brands/salon.json'
      ],
      files: [
        {
          destination: 'salon.css',
          format: 'css/variables',
          options: {
            outputReferences: true,
          },
        }
      ],
    },
  },

  // Logging configuration
  log: {
    warnings: 'warn',
    verbosity: 'verbose',
    errors: {
      brokenReferences: 'throw'
    }
  }
};