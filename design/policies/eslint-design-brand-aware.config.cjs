/**
 * @fileoverview OSS Hero Design Safety ESLint Configuration - Brand Aware
 * @description Brand-aware design safety rules for UI components and design system
 * @version 2.0.0
 * @author OSS Hero Design Safety Module
 */

module.exports = {
  // This config extends the main ESLint config, so we only define rules
  rules: {
    // Design Guardian Rules - Brand Aware Mode
    
    // Ban raw hex colors in JSX/classNames (brand-aware)
    'no-restricted-properties': [
      'error',
      {
        object: 'className',
        property: 'includes',
        message: 'Use brand-aware design tokens instead of raw hex colors. Use Tailwind color classes, CSS custom properties, or brand color variables.'
      }
    ],
    
    // Ban inline styles (allow controlled exceptions via comment) - brand-aware
    'react/forbid-component-props': [
      'error',
      {
        forbid: [
          {
            propName: 'style',
            message: 'Avoid inline styles. Use Tailwind utilities, CSS classes, or brand-aware styling. To allow, add: /* eslint-disable-next-line react/forbid-component-props */'
          }
        ]
      }
    ],
    
    // Enforce single icon set (Lucide) and brand-aware font system
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['react-icons/*', '@heroicons/*', '@mui/icons-material/*'],
            message: 'Use Lucide React icons only. Import from lucide-react.'
          },
          {
            group: ['@fontsource/*'],
            message: 'Use brand-aware font system. Import fonts through the brand configuration system.'
          },
          {
            group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
            message: 'UI components must use adapters, not direct data imports. Create an adapter in @/lib/adapters/* or use existing data hooks.'
          }
        ]
      }
    ],
    
    // Brand-aware color validation
    'no-restricted-syntax': [
      'error',
      {
        selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
        message: 'Raw hex colors are not allowed. Use brand color variables, Tailwind classes, or CSS custom properties from the brand system.'
      }
    ],
    
    // Brand-aware className validation
    'no-restricted-syntax': [
      'error',
      {
        selector: 'TemplateLiteral[quasis.0.value.raw*="bg-[#"]',
        message: 'Raw hex colors in Tailwind classes are not allowed. Use brand color variables or Tailwind color classes.'
      }
    ]
  },
  overrides: [
    {
      files: ['components/ui/**/*', 'design/**/*', 'tests/ui/**/*'],
      rules: {
        // Design Guardian Rules - Brand Aware Mode for UI components
        
        'no-restricted-properties': [
          'error',
          {
            object: 'className',
            property: 'includes',
            message: 'UI components must use brand-aware design tokens. Use Tailwind color classes, CSS custom properties, or brand color variables.'
          }
        ],
        
        'react/forbid-component-props': [
          'error',
          {
            forbid: [
              {
                propName: 'style',
                message: 'UI components cannot use inline styles. Use Tailwind utilities, CSS classes, or brand-aware styling.'
              }
            ]
          }
        ],
        
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
                message: 'UI components must use adapters, not direct data imports.'
              }
            ]
          }
        ],
        
        // Brand-aware validation for UI components
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
            message: 'UI components cannot use raw hex colors. Use brand color variables or Tailwind classes.'
          }
        ]
      }
    },
    {
      files: ['lib/branding/**/*', 'components/branding/**/*'],
      rules: {
        // Relaxed rules for branding system files
        'no-restricted-syntax': 'off',
        'no-restricted-properties': 'off'
      }
    }
  ]
};
