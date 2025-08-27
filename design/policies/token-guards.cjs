/**
 * @fileoverview MIT Hero Design Safety Token Guards
 * @description Protects design tokens and prevents unsafe overrides
 * @version 1.0.0
 * @author MIT Hero Design Safety Module
 */

module.exports = {
  rules: {
    // Flag class strings not composed from Tailwind tokens
    'no-restricted-properties': [
      'error', // Changed from warn to error
      {
        object: 'className',
        property: 'includes',
        message: 'Use design token variables instead of direct CSS custom properties'
      }
    ]
  },
  overrides: [
    {
      files: ['**/*.css', '**/*.scss', '**/*.tsx', '**/*.ts'],
      rules: {
        'no-restricted-properties': [
          'error', // Changed from warn to error
          {
            object: 'CSS',
            property: 'customProperty',
            message: 'Use @apply or design token variables for consistent styling'
          }
        ]
      }
    },
    {
      files: ['components/ui/**/*', 'design/**/*'],
      rules: {
        // Stricter token validation for UI components
        'no-restricted-properties': [
          'error', // Changed from warn to error
          {
            object: 'className',
            property: 'includes',
            message: 'UI components must use Tailwind design tokens. Avoid custom class names.'
          }
        ]
      }
    }
  ]
};
