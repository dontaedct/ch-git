/**
 * @fileoverview OSS Hero Design Safety Import Boundaries
 * @description Enforces clean import architecture for design system
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

module.exports = {
  rules: {
    'no-restricted-imports': [
      'error', // Changed from warn to error
      {
        patterns: [
          // Design system imports should use absolute paths from @design/*
          {
            group: ['../**/design/**'],
            message: 'Design system imports should use absolute paths from @design/*'
          },
          // Component imports should use @components/* or relative paths
          {
            group: ['../../**/components/**'],
            message: 'Component imports should use @components/* or relative paths'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['design/**/*'],
      rules: {
        'no-restricted-imports': [
          'error', // Changed from warn to error
          {
            patterns: [
              // Design system should not import from app layer
              {
                group: ['../**/app/**'],
                message: 'Design system should not import from app layer'
              }
            ]
          }
        ]
      }
    },
    {
      files: ['components/ui/**/*', 'components/**/*.tsx', 'components/**/*.ts'],
      rules: {
        'no-restricted-imports': [
          'error', // Changed from warn to error
          {
            patterns: [
              // UI components cannot import from core/adapter layers
              {
                group: ['app/(core)/**', 'app/adapters/**', 'lib/db/**', 'lib/supabase/**', 'supabase/**'],
                message: 'UI components cannot import from core/adapter layers. Use adapters in @/lib/adapters/* or existing data hooks.'
              },
              // UI components cannot import from data layer directly
              {
                group: ['@/data/**', '@/lib/db/**', '@/lib/supabase/**', '@/supabase/**'],
                message: 'UI components must use adapters, not direct data imports. Create an adapter in @/lib/adapters/* or use existing data hooks.'
              }
            ]
          }
        ]
      }
    }
  ]
};
