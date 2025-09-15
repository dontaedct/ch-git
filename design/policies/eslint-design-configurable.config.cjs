/**
 * @fileoverview Configurable Design Rules ESLint Configuration
 * @description Dynamic ESLint configuration based on brand and tenant rules
 * @version 2.0.0
 * @author OSS Hero Design Safety Module
 */

const { configurableRulesEngine } = require('@/lib/design-rules/configurable-rules-engine');
const { ruleConfigurationSystem } = require('@/lib/design-rules/rule-configuration-system');
const { getCurrentBrandConfig } = require('@/lib/branding/brand-context');

/**
 * Get current tenant ID from environment or context
 */
function getCurrentTenantId() {
  // Try to get tenant ID from environment variables
  if (process.env.TENANT_ID) {
    return process.env.TENANT_ID;
  }
  
  // Try to get from Next.js headers in server context
  if (typeof window === 'undefined' && process.env.NEXT_PUBLIC_TENANT_ID) {
    return process.env.NEXT_PUBLIC_TENANT_ID;
  }
  
  // Default tenant
  return 'default';
}

/**
 * Generate configurable ESLint configuration
 */
function generateConfigurableConfig() {
  try {
    // Get current brand context
    const brandContext = getCurrentBrandConfig();
    
    // Get current tenant ID
    const tenantId = getCurrentTenantId();
    
    // Create rule validation context
    const context = {
      brandContext,
      tenantId,
      filePath: process.cwd(), // Will be overridden per file
      metadata: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      },
    };
    
    // Generate ESLint configuration
    const eslintConfig = configurableRulesEngine.generateESLintConfig(context);
    
    return eslintConfig;
  } catch (error) {
    console.warn('Failed to generate configurable ESLint config, falling back to default:', error.message);
    
    // Fallback to default configuration
    return {
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
            message: 'Raw hex colors are not allowed. Use brand color variables or Tailwind classes.',
          },
        ],
        'react/forbid-component-props': [
          'error',
          {
            forbid: [
              {
                propName: 'style',
                message: 'Avoid inline styles. Use Tailwind utilities or CSS classes.',
              },
            ],
          },
        ],
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['react-icons/*', '@heroicons/*', '@mui/icons-material/*'],
                message: 'Use Lucide React icons only. Import from lucide-react.',
              },
              {
                group: ['@fontsource/*'],
                message: 'Use brand-aware font system. Import fonts through the brand configuration system.',
              },
              {
                group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
                message: 'UI components must use adapters, not direct data imports.',
              },
            ],
          },
        ],
      },
      overrides: [
        {
          files: ['components/ui/**/*', 'design/**/*', 'tests/ui/**/*'],
          rules: {
            'no-restricted-syntax': [
              'error',
              {
                selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
                message: 'UI components cannot use raw hex colors. Use brand color variables or Tailwind classes.',
              },
            ],
            'react/forbid-component-props': [
              'error',
              {
                forbid: [
                  {
                    propName: 'style',
                    message: 'UI components cannot use inline styles. Use Tailwind utilities or CSS classes.',
                  },
                ],
              },
            ],
            'no-restricted-imports': [
              'error',
              {
                patterns: [
                  {
                    group: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
                    message: 'UI components must use adapters, not direct data imports.',
                  },
                ],
              },
            ],
          },
        },
        {
          files: ['lib/branding/**/*', 'components/branding/**/*'],
          rules: {
            'no-restricted-syntax': 'off',
            'no-restricted-properties': 'off',
          },
        },
      ],
    };
  }
}

module.exports = generateConfigurableConfig();
