/**
 * @fileoverview OSS Hero Brand-Aware ESLint Configuration
 * @description ESLint rules for brand customization support and validation
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.4: Update ESLint Rules for Brand Support
 */

// Note: Brand context integration will be added in future iterations
// const { getCurrentBrandConfig } = require('../../lib/branding/brand-context');

export default {
  // Brand-aware ESLint rules that adapt to current brand configuration
  rules: {
    // Brand Color Validation Rules
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
        message: 'Raw hex colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      },
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{3}$/]',
        message: 'Raw hex colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      },
      {
        selector: 'Literal[value=/^rgb\\(/]',
        message: 'Raw RGB colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      },
      {
        selector: 'Literal[value=/^rgba\\(/]',
        message: 'Raw RGBA colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      },
      {
        selector: 'Literal[value=/^hsl\\(/]',
        message: 'Raw HSL colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      },
      {
        selector: 'Literal[value=/^hsla\\(/]',
        message: 'Raw HSLA colors are not allowed. Use brand colors or Tailwind classes. Use useBrandColors() hook for brand colors.'
      }
    ],

    // Brand Font Validation Rules
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@fontsource/*', 'next/font/google'],
            message: 'Use brand typography system. Import custom fonts through brand configuration or use useBrandTypography() hook.'
          }
        ]
      }
    ],

    // Brand Component Validation Rules
    'react/forbid-component-props': [
      'error',
      {
        forbid: [
          {
            propName: 'style',
            message: 'Avoid inline styles. Use brand styling system with useBrandStyling() hook or Tailwind classes.'
          }
        ]
      }
    ],

    // Brand Class Name Validation
    'no-restricted-properties': [
      'error',
      {
        object: 'className',
        property: 'includes',
        message: 'Use brand-aware styling. Use useBrandComponent() hook for component styling or Tailwind classes.'
      }
    ],

    // Brand Hook Usage Validation
    'no-restricted-syntax': [
      'error',
      {
        selector: 'CallExpression[callee.name="useState"][arguments.0.type="ObjectExpression"]',
        message: 'For brand styling state, use useBrandStyling() hook instead of useState with style objects.'
      }
    ]
  },

  // Brand-aware overrides for different file types
  overrides: [
    {
      // Brand configuration files
      files: ['lib/branding/**/*.{ts,tsx}', 'components/brand/**/*.{ts,tsx}'],
      rules: {
        // Allow brand-specific patterns in brand files
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off',
        'react/forbid-component-props': 'off',
        'no-restricted-properties': 'off'
      }
    },
    {
      // Brand preset files
      files: ['**/*brand-preset*.{ts,tsx}', '**/*brand-config*.{ts,tsx}'],
      rules: {
        // Allow brand configuration patterns
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off'
      }
    },
    {
      // Brand testing files
      files: ['**/*brand*.test.{ts,tsx}', '**/*brand*.spec.{ts,tsx}'],
      rules: {
        // Allow testing patterns
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off',
        'react/forbid-component-props': 'off'
      }
    },
    {
      // Brand migration files
      files: ['**/*brand-migration*.{ts,tsx}', '**/*brand-upgrade*.{ts,tsx}'],
      rules: {
        // Allow migration patterns
        'no-restricted-syntax': 'off',
        'no-restricted-imports': 'off'
      }
    }
  ],

  // Brand-aware settings
  settings: {
    'brand-config': {
      // This will be populated by the brand context system
      currentBrand: null,
      allowedColors: [],
      allowedFonts: [],
      validationRules: {
        allowCustomColors: false,
        allowCustomFonts: false,
        requireBrandConsistency: true,
        allowBrandOverrides: false
      }
    }
  }
};
