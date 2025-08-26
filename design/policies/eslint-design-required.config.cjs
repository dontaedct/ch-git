/**
 * @fileoverview MIT Hero Design Safety ESLint Configuration - Required Mode
 * @description Portable design safety rules for UI components and design system (errors block)
 * @version 1.0.0
 * @author MIT Hero Design Safety Module
 */

module.exports = {
  // This config extends the main ESLint config, so we only define rules
  rules: {
    // Design Guardian Rules - Required Mode (Errors Block)
    
    // Ban raw hex colors in JSX/classNames
    'no-restricted-properties': [
      'error', // Error in required mode
      {
        object: 'className',
        property: 'includes',
        message: 'Use design tokens instead of raw hex colors. Use Tailwind color classes or CSS custom properties.'
      }
    ],
    
    // Ban inline styles (allow controlled exceptions via comment)
    'react/forbid-component-props': [
      'error', // Error in required mode
      {
        forbid: [
          {
            propName: 'style',
            message: 'Avoid inline styles. Use Tailwind utilities or CSS classes. To allow, add: /* eslint-disable-next-line react/forbid-component-props */'
          }
        ]
      }
    ],
    
    // Enforce single icon set (Lucide) and single font (Geist)
    'no-restricted-imports': [
      'error', // Error in required mode
      {
        patterns: [
          {
            group: ['react-icons/*', '@heroicons/*', '@mui/icons-material/*'],
            message: 'Use Lucide React icons only. Import from lucide-react.'
          },
          {
            group: ['@fontsource/*', 'next/font/*'],
            message: 'Use Geist font only. Import from next/font/geist.'
          },
          {
            group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
            message: 'UI components must use adapters, not direct data imports. Create an adapter in @/lib/adapters/* or use existing data hooks.'
          }
        ]
      }
    ]
  },
  overrides: [
    {
      files: ['components/ui/**/*', 'design/**/*', 'tests/ui/**/*'],
      rules: {
        // Design Guardian Rules - Required Mode for UI components
        'no-restricted-properties': [
          'error', // Error for UI components in required mode
          {
            object: 'className',
            property: 'includes',
            message: 'UI components must use design tokens. Use Tailwind color classes or CSS custom properties.'
          }
        ],
        
        'react/forbid-component-props': [
          'error', // Error for UI components in required mode
          {
            forbid: [
              {
                propName: 'style',
                message: 'UI components cannot use inline styles. Use Tailwind utilities or CSS classes.'
              }
            ]
          }
        ],
        
        'no-restricted-imports': [
          'error', // Error for UI components in required mode
          {
            patterns: [
              {
                group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
                message: 'UI components must use adapters, not direct data imports.'
              }
            ]
          }
        ]
      }
    }
  ]
};
