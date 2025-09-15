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

const StyleDictionary = require('style-dictionary');

module.exports = {
  source: [
    'tokens/base.json',
    'tokens/core/**/*.json',
    'tokens/brands/**/*.json'
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
                   (!token.semantic || token.semantic === 'light');
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
                   (token.semantic && token.semantic === 'dark');
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
          destination: 'tokens.cjs',
          format: 'javascript/module',
        }
      ],
    },

    // TypeScript definitions
    ts: {
      transformGroup: 'js',
      buildPath: 'dist/tokens/',
      files: [
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
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
      files: [
        {
          destination: 'default.css',
          format: 'css/variables',
          filter: (token) => {
            return token.filePath.includes('default.json');
          },
          options: {
            outputReferences: true,
          },
        },
        {
          destination: 'salon.css',
          format: 'css/variables',
          filter: (token) => {
            return token.filePath.includes('salon.json');
          },
          options: {
            outputReferences: true,
          },
        }
      ],
    },
  },

  // Custom transforms
  transform: {
    // Transform shadow objects to CSS shadow strings
    'shadow/css': {
      type: 'value',
      matcher: (token) => {
        return token.$type === 'shadow';
      },
      transformer: (token) => {
        const shadow = token.$value;
        if (typeof shadow === 'object') {
          return `${shadow.offsetX} ${shadow.offsetY} ${shadow.blur} ${shadow.spread || '0px'} ${shadow.color}`;
        }
        return shadow;
      }
    },

    // Transform font family arrays to CSS strings
    'fontFamily/css': {
      type: 'value',
      matcher: (token) => {
        return token.$type === 'fontFamily';
      },
      transformer: (token) => {
        const fonts = token.$value;
        if (Array.isArray(fonts)) {
          return fonts.map(font => font.includes(' ') ? `"${font}"` : font).join(', ');
        }
        return fonts;
      }
    }
  },

  // Custom formats
  format: {
    // CSS custom properties with semantic organization
    'css/custom-properties': {
      name: 'css/custom-properties',
      formatter: function({ dictionary, options, file }) {
        const { outputReferences } = options;
        return fileHeader({ file }) +
          ':root {\n' +
          formattedVariables({
            format: 'css',
            dictionary,
            outputReferences
          }) +
          '\n}\n';
      }
    },

    // TypeScript module with proper types
    'typescript/es6-declarations': {
      name: 'typescript/es6-declarations',
      formatter: function({ dictionary }) {
        return fileHeader({ file: { destination: 'tokens.d.ts' } }) +
          'export interface DesignTokens {\n' +
          dictionary.allTokens.map(token => {
            const path = token.path.join('.');
            const type = getTokenType(token.$type);
            return `  "${path}": ${type};`;
          }).join('\n') +
          '\n}\n\n' +
          'declare const tokens: DesignTokens;\n' +
          'export default tokens;\n';
      }
    },

    // Performance-optimized JSON
    'json/flat': {
      name: 'json/flat',
      formatter: function({ dictionary }) {
        const tokens = {};
        dictionary.allTokens.forEach(token => {
          const key = token.path.join('-');
          tokens[key] = token.value;
        });
        return JSON.stringify(tokens, null, 2);
      }
    }
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

// Helper function to determine TypeScript type
function getTokenType(tokenType) {
  switch (tokenType) {
    case 'color': return 'string';
    case 'dimension': return 'string';
    case 'fontFamily': return 'string';
    case 'fontWeight': return 'string | number';
    case 'number': return 'number';
    case 'shadow': return 'string';
    default: return 'string';
  }
}