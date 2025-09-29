# Template Development and Integration Guide

## Overview

This guide provides comprehensive instructions for developing and integrating templates with the Modular Admin Interface system. Templates automatically extend the admin interface with their own settings and functionality.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Template Structure](#template-structure)
3. [Settings Schema Design](#settings-schema-design)
4. [Component Development](#component-development)
5. [Integration Process](#integration-process)
6. [Testing Templates](#testing-templates)
7. [Publishing Templates](#publishing-templates)
8. [Best Practices](#best-practices)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Understanding of React and TypeScript
- Access to the Modular Admin Interface system

### Template Development Environment

```bash
# Clone the template development repository
git clone https://github.com/agency-toolkit/template-dev-kit.git
cd template-dev-kit

# Install dependencies
pnpm install

# Start development server
pnpm run dev:template
```

## Template Structure

### Basic Template Structure

```
my-template/
├── package.json                 # Template metadata and dependencies
├── template.json               # Template definition file
├── src/
│   ├── components/             # Template-specific components
│   ├── pages/                  # Template pages
│   ├── settings/               # Settings configuration
│   ├── hooks/                  # Custom hooks
│   └── utils/                  # Utility functions
├── admin/                      # Admin interface integration
│   ├── settings.ts             # Settings schema definition
│   ├── components.tsx          # Admin components
│   └── hooks.ts                # Admin hooks
└── docs/                       # Template documentation
```

### Template Definition File

```json
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "description": "A comprehensive template for modern web applications",
  "category": "business",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com",
    "website": "https://yourwebsite.com"
  },
  "keywords": ["business", "modern", "responsive"],
  "dependencies": {
    "react": "^18.0.0",
    "@agency-toolkit/core": "^2.0.0"
  },
  "peerDependencies": {
    "next": "^13.0.0"
  },
  "adminIntegration": {
    "settings": "./admin/settings.ts",
    "components": "./admin/components.tsx",
    "hooks": "./admin/hooks.ts"
  }
}
```

## Settings Schema Design

### Basic Settings Schema

```typescript
// admin/settings.ts
import { SettingsSchema } from '@agency-toolkit/admin';

export const settingsSchema: SettingsSchema = {
  // General settings section
  general: {
    type: 'object',
    title: 'General Settings',
    properties: {
      siteName: {
        type: 'string',
        title: 'Site Name',
        description: 'The name of your website',
        default: 'My Website',
        validation: {
          required: true,
          minLength: 3,
          maxLength: 100
        }
      },
      
      siteDescription: {
        type: 'text',
        title: 'Site Description',
        description: 'Brief description of your website',
        default: '',
        validation: {
          maxLength: 500
        }
      },
      
      theme: {
        type: 'select',
        title: 'Theme',
        description: 'Choose your preferred theme',
        options: [
          { value: 'light', label: 'Light Theme' },
          { value: 'dark', label: 'Dark Theme' },
          { value: 'auto', label: 'Auto (System)' }
        ],
        default: 'light'
      }
    }
  },
  
  // Appearance settings section
  appearance: {
    type: 'object',
    title: 'Appearance',
    properties: {
      primaryColor: {
        type: 'color',
        title: 'Primary Color',
        description: 'Main brand color',
        default: '#3b82f6'
      },
      
      secondaryColor: {
        type: 'color',
        title: 'Secondary Color',
        description: 'Secondary brand color',
        default: '#64748b'
      },
      
      fontFamily: {
        type: 'select',
        title: 'Font Family',
        description: 'Choose your preferred font',
        options: [
          { value: 'inter', label: 'Inter' },
          { value: 'roboto', label: 'Roboto' },
          { value: 'open-sans', label: 'Open Sans' },
          { value: 'custom', label: 'Custom Font' }
        ],
        default: 'inter'
      },
      
      customFont: {
        type: 'string',
        title: 'Custom Font URL',
        description: 'URL to your custom font (Google Fonts, etc.)',
        default: '',
        conditional: {
          dependsOn: 'appearance.fontFamily',
          value: 'custom'
        }
      }
    }
  },
  
  // Features settings section
  features: {
    type: 'object',
    title: 'Features',
    properties: {
      enableBlog: {
        type: 'boolean',
        title: 'Enable Blog',
        description: 'Enable blog functionality',
        default: true
      },
      
      enableContact: {
        type: 'boolean',
        title: 'Enable Contact Form',
        description: 'Enable contact form functionality',
        default: true
      },
      
      enableSEO: {
        type: 'boolean',
        title: 'Enable SEO Features',
        description: 'Enable advanced SEO features',
        default: true
      },
      
      analytics: {
        type: 'object',
        title: 'Analytics',
        properties: {
          googleAnalytics: {
            type: 'string',
            title: 'Google Analytics ID',
            description: 'Your Google Analytics tracking ID',
            default: '',
            validation: {
              pattern: '^G-[A-Z0-9]+$'
            }
          },
          
          enableTracking: {
            type: 'boolean',
            title: 'Enable Tracking',
            description: 'Enable user tracking and analytics',
            default: true
          }
        }
      }
    }
  }
};
```

### Advanced Settings Schema

```typescript
// admin/advanced-settings.ts
import { SettingsSchema, ConditionalLogic } from '@agency-toolkit/admin';

export const advancedSettingsSchema: SettingsSchema = {
  // Complex nested settings
  ecommerce: {
    type: 'object',
    title: 'E-commerce Settings',
    properties: {
      store: {
        type: 'object',
        title: 'Store Configuration',
        properties: {
          name: {
            type: 'string',
            title: 'Store Name',
            default: 'My Store',
            validation: { required: true }
          },
          
          currency: {
            type: 'select',
            title: 'Currency',
            options: [
              { value: 'USD', label: 'US Dollar ($)' },
              { value: 'EUR', label: 'Euro (€)' },
              { value: 'GBP', label: 'British Pound (£)' }
            ],
            default: 'USD'
          },
          
          taxSettings: {
            type: 'object',
            title: 'Tax Settings',
            properties: {
              enableTax: {
                type: 'boolean',
                title: 'Enable Tax Calculation',
                default: true
              },
              
              taxRate: {
                type: 'number',
                title: 'Tax Rate (%)',
                default: 8.5,
                validation: { min: 0, max: 100 },
                conditional: {
                  dependsOn: 'ecommerce.store.taxSettings.enableTax',
                  value: true
                }
              },
              
              taxIncluded: {
                type: 'boolean',
                title: 'Tax Included in Prices',
                default: false
              }
            }
          }
        }
      },
      
      products: {
        type: 'array',
        title: 'Product Categories',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              title: 'Category Name',
              validation: { required: true }
            },
            
            description: {
              type: 'text',
              title: 'Description'
            },
            
            image: {
              type: 'image',
              title: 'Category Image'
            },
            
            featured: {
              type: 'boolean',
              title: 'Featured Category',
              default: false
            }
          }
        },
        default: []
      }
    }
  },
  
  // Conditional settings with complex logic
  integrations: {
    type: 'object',
    title: 'Integrations',
    properties: {
      paymentGateway: {
        type: 'select',
        title: 'Payment Gateway',
        options: [
          { value: 'stripe', label: 'Stripe' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'square', label: 'Square' },
          { value: 'none', label: 'None' }
        ],
        default: 'none'
      },
      
      stripeConfig: {
        type: 'object',
        title: 'Stripe Configuration',
        properties: {
          publishableKey: {
            type: 'string',
            title: 'Publishable Key',
            validation: { required: true }
          },
          
          secretKey: {
            type: 'password',
            title: 'Secret Key',
            validation: { required: true }
          },
          
          webhookSecret: {
            type: 'password',
            title: 'Webhook Secret'
          }
        },
        conditional: {
          dependsOn: 'integrations.paymentGateway',
          value: 'stripe'
        }
      },
      
      paypalConfig: {
        type: 'object',
        title: 'PayPal Configuration',
        properties: {
          clientId: {
            type: 'string',
            title: 'Client ID',
            validation: { required: true }
          },
          
          clientSecret: {
            type: 'password',
            title: 'Client Secret',
            validation: { required: true }
          },
          
          environment: {
            type: 'select',
            title: 'Environment',
            options: [
              { value: 'sandbox', label: 'Sandbox' },
              { value: 'live', label: 'Live' }
            ],
            default: 'sandbox'
          }
        },
        conditional: {
          dependsOn: 'integrations.paymentGateway',
          value: 'paypal'
        }
      }
    }
  }
};
```

## Component Development

### Admin Components

```typescript
// admin/components.tsx
import React from 'react';
import { AdminComponent, SettingInput, SettingGroup } from '@agency-toolkit/admin';

export const MyTemplateAdminComponents: AdminComponent[] = [
  {
    id: 'custom-color-picker',
    component: CustomColorPicker,
    settings: ['appearance.primaryColor', 'appearance.secondaryColor']
  },
  
  {
    id: 'font-preview',
    component: FontPreview,
    settings: ['appearance.fontFamily', 'appearance.customFont']
  },
  
  {
    id: 'feature-toggle',
    component: FeatureToggle,
    settings: ['features.enableBlog', 'features.enableContact', 'features.enableSEO']
  }
];

// Custom Color Picker Component
function CustomColorPicker({ 
  value, 
  onChange, 
  setting 
}: {
  value: string;
  onChange: (value: string) => void;
  setting: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];
  
  return (
    <div className="custom-color-picker">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="color-picker-button"
        style={{ backgroundColor: value }}
      >
        <span className="sr-only">Choose color</span>
      </button>
      
      {isOpen && (
        <div className="color-picker-dropdown">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChange(color);
                setIsOpen(false);
              }}
              className="color-option"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
          
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="color-input"
          />
        </div>
      )}
    </div>
  );
}

// Font Preview Component
function FontPreview({ 
  value, 
  setting 
}: {
  value: string;
  setting: string;
}) {
  const fontFamily = value === 'custom' ? 'inherit' : value;
  
  return (
    <div className="font-preview">
      <p style={{ fontFamily }}>
        The quick brown fox jumps over the lazy dog
      </p>
      <p style={{ fontFamily, fontSize: '14px' }}>
        ABCDEFGHIJKLMNOPQRSTUVWXYZ
      </p>
    </div>
  );
}

// Feature Toggle Component
function FeatureToggle({ 
  features, 
  onChange 
}: {
  features: Record<string, boolean>;
  onChange: (features: Record<string, boolean>) => void;
}) {
  const handleToggle = (feature: string, enabled: boolean) => {
    onChange({
      ...features,
      [feature]: enabled
    });
  };
  
  return (
    <div className="feature-toggle-grid">
      {Object.entries(features).map(([feature, enabled]) => (
        <div key={feature} className="feature-toggle-item">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => handleToggle(feature, e.target.checked)}
              className="rounded"
            />
            <span className="capitalize">
              {feature.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
}
```

### Custom Hooks

```typescript
// admin/hooks.ts
import { useTemplateSettings, useTemplateActions } from '@agency-toolkit/admin';

export function useMyTemplateSettings() {
  const { settings, updateSettings, isLoading, error } = useTemplateSettings('my-template');
  
  const updateGeneralSettings = (generalSettings: any) => {
    updateSettings({
      ...settings,
      general: {
        ...settings.general,
        ...generalSettings
      }
    });
  };
  
  const updateAppearanceSettings = (appearanceSettings: any) => {
    updateSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        ...appearanceSettings
      }
    });
  };
  
  const toggleFeature = (feature: string) => {
    updateSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature]
      }
    });
  };
  
  return {
    settings,
    updateSettings,
    updateGeneralSettings,
    updateAppearanceSettings,
    toggleFeature,
    isLoading,
    error
  };
}

export function useMyTemplateActions() {
  const { 
    installTemplate, 
    uninstallTemplate, 
    updateTemplate,
    validateSettings 
  } = useTemplateActions('my-template');
  
  const handleInstall = async () => {
    try {
      await installTemplate({
        configureDefaults: true,
        enableFeatures: ['blog', 'contact', 'seo']
      });
    } catch (error) {
      console.error('Failed to install template:', error);
    }
  };
  
  const handleUpdate = async () => {
    try {
      await updateTemplate({
        backupSettings: true,
        preserveCustomizations: true
      });
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };
  
  const validateCurrentSettings = async () => {
    const result = await validateSettings();
    if (!result.isValid) {
      console.error('Settings validation failed:', result.errors);
    }
    return result;
  };
  
  return {
    installTemplate: handleInstall,
    uninstallTemplate,
    updateTemplate: handleUpdate,
    validateSettings: validateCurrentSettings
  };
}
```

## Integration Process

### Template Registration

```typescript
// src/template-registration.ts
import { registerTemplate } from '@agency-toolkit/admin';
import { settingsSchema } from './admin/settings';
import { MyTemplateAdminComponents } from './admin/components';
import { useMyTemplateSettings, useMyTemplateActions } from './admin/hooks';

export function registerMyTemplate() {
  registerTemplate({
    id: 'my-template',
    name: 'My Template',
    version: '1.0.0',
    description: 'A comprehensive template for modern web applications',
    category: 'business',
    
    // Settings configuration
    settings: settingsSchema,
    
    // Admin components
    adminComponents: MyTemplateAdminComponents,
    
    // Custom hooks
    hooks: {
      useSettings: useMyTemplateSettings,
      useActions: useMyTemplateActions
    },
    
    // Template lifecycle hooks
    lifecycle: {
      onInstall: async () => {
        console.log('My Template installed');
        // Initialize default settings
        // Set up database tables
        // Configure initial features
      },
      
      onUninstall: async () => {
        console.log('My Template uninstalled');
        // Clean up resources
        // Remove database tables
        // Clear cached data
      },
      
      onUpdate: async (fromVersion: string, toVersion: string) => {
        console.log(`My Template updated from ${fromVersion} to ${toVersion}`);
        // Handle version migrations
        // Update settings schema
        // Migrate data if needed
      }
    },
    
    // Dependencies and conflicts
    dependencies: ['@agency-toolkit/core'],
    conflicts: ['legacy-template'],
    
    // AI integration
    ai: {
      recommendations: {
        enabled: true,
        provider: 'ht031-ai',
        model: 'template-optimizer-v2'
      },
      
      smartDefaults: {
        enabled: true,
        learnFromUsage: true
      }
    },
    
    // Performance optimization
    performance: {
      lazyLoad: true,
      cacheSettings: true,
      optimizeRendering: true
    }
  });
}
```

### Automatic Registration

```typescript
// src/index.ts
import { registerMyTemplate } from './template-registration';

// Automatically register the template when the module is loaded
registerMyTemplate();

// Export template components and utilities
export * from './components';
export * from './pages';
export * from './hooks';
export * from './utils';
export { settingsSchema } from './admin/settings';
export { MyTemplateAdminComponents } from './admin/components';
```

## Testing Templates

### Unit Testing

```typescript
// tests/admin/settings.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { validateSettings } from '@agency-toolkit/admin';
import { settingsSchema } from '../src/admin/settings';

describe('Template Settings', () => {
  it('should validate valid settings', async () => {
    const validSettings = {
      general: {
        siteName: 'My Test Site',
        siteDescription: 'A test website',
        theme: 'light'
      },
      appearance: {
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        fontFamily: 'inter'
      },
      features: {
        enableBlog: true,
        enableContact: true,
        enableSEO: false
      }
    };
    
    const result = await validateSettings('my-template', validSettings);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  it('should reject invalid settings', async () => {
    const invalidSettings = {
      general: {
        siteName: '', // Too short
        siteDescription: 'A'.repeat(600), // Too long
        theme: 'invalid' // Invalid option
      }
    };
    
    const result = await validateSettings('my-template', invalidSettings);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
```

### Integration Testing

```typescript
// tests/admin/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminInterface } from '@agency-toolkit/admin';
import { MyTemplateAdminComponents } from '../src/admin/components';

describe('Template Admin Integration', () => {
  beforeEach(() => {
    // Mock the admin interface
    jest.mock('@agency-toolkit/admin', () => ({
      AdminInterface: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="admin-interface">{children}</div>
      )
    }));
  });
  
  it('should render template settings in admin interface', () => {
    render(
      <AdminInterface>
        <MyTemplateAdminComponents />
      </AdminInterface>
    );
    
    expect(screen.getByTestId('admin-interface')).toBeInTheDocument();
    expect(screen.getByText('General Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
  });
  
  it('should handle settings changes', async () => {
    const mockOnChange = jest.fn();
    
    render(
      <CustomColorPicker
        value="#3b82f6"
        onChange={mockOnChange}
        setting="appearance.primaryColor"
      />
    );
    
    const colorButton = screen.getByRole('button');
    fireEvent.click(colorButton);
    
    const redColor = screen.getByTitle('#ef4444');
    fireEvent.click(redColor);
    
    expect(mockOnChange).toHaveBeenCalledWith('#ef4444');
  });
});
```

### E2E Testing

```typescript
// tests/e2e/template-admin.e2e.ts
import { test, expect } from '@playwright/test';

test.describe('Template Admin Interface', () => {
  test('should display template settings in admin interface', async ({ page }) => {
    await page.goto('/admin');
    
    // Navigate to template settings
    await page.click('[data-testid="template-settings-my-template"]');
    
    // Check if settings sections are visible
    await expect(page.locator('h2:has-text("General Settings")')).toBeVisible();
    await expect(page.locator('h2:has-text("Appearance")')).toBeVisible();
    await expect(page.locator('h2:has-text("Features")')).toBeVisible();
  });
  
  test('should save and load template settings', async ({ page }) => {
    await page.goto('/admin/templates/my-template/settings');
    
    // Change site name
    await page.fill('[data-testid="site-name-input"]', 'My Updated Site');
    
    // Change primary color
    await page.click('[data-testid="primary-color-button"]');
    await page.click('[data-testid="color-option-red"]');
    
    // Enable blog feature
    await page.check('[data-testid="enable-blog-checkbox"]');
    
    // Save settings
    await page.click('[data-testid="save-settings-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Reload page and verify settings persisted
    await page.reload();
    await expect(page.locator('[data-testid="site-name-input"]')).toHaveValue('My Updated Site');
    await expect(page.locator('[data-testid="enable-blog-checkbox"]')).toBeChecked();
  });
  
  test('should validate settings and show errors', async ({ page }) => {
    await page.goto('/admin/templates/my-template/settings');
    
    // Enter invalid site name (too short)
    await page.fill('[data-testid="site-name-input"]', 'A');
    
    // Try to save
    await page.click('[data-testid="save-settings-button"]');
    
    // Verify validation error
    await expect(page.locator('[data-testid="site-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="site-name-error"]')).toHaveText('Site name must be at least 3 characters');
  });
});
```

## Publishing Templates

### Package Configuration

```json
{
  "name": "@agency-toolkit/template-my-template",
  "version": "1.0.0",
  "description": "A comprehensive template for modern web applications",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "admin",
    "docs",
    "README.md"
  ],
  "scripts": {
    "build": "tsc && npm run build:admin",
    "build:admin": "tsc --project tsconfig.admin.json",
    "test": "vitest",
    "test:e2e": "playwright test",
    "validate": "npm run test && npm run test:e2e",
    "publish:template": "npm run validate && npm publish"
  },
  "keywords": [
    "agency-toolkit",
    "template",
    "admin-interface",
    "business"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "peerDependencies": {
    "@agency-toolkit/core": "^2.0.0",
    "react": "^18.0.0",
    "next": "^13.0.0"
  },
  "devDependencies": {
    "@agency-toolkit/core": "^2.0.0",
    "@testing-library/react": "^13.0.0",
    "@playwright/test": "^1.30.0",
    "typescript": "^4.9.0",
    "vitest": "^0.28.0"
  }
}
```

### Publishing Process

```bash
# Build the template
npm run build

# Run all tests
npm run validate

# Publish to npm
npm publish

# Publish to template marketplace
npm run publish:marketplace
```

### Marketplace Listing

```yaml
# marketplace/listing.yml
template:
  id: my-template
  name: My Template
  version: 1.0.0
  description: A comprehensive template for modern web applications
  category: business
  tags: [business, modern, responsive, seo]
  
pricing:
  type: free
  # or: premium with price and currency
  
screenshots:
  - path: screenshots/desktop.png
    alt: Desktop view
  - path: screenshots/mobile.png
    alt: Mobile view
  - path: screenshots/admin.png
    alt: Admin interface
    
features:
  - name: Responsive Design
    description: Fully responsive across all devices
  - name: SEO Optimized
    description: Built-in SEO features and optimization
  - name: Admin Integration
    description: Seamless admin interface integration
    
requirements:
  minAgencyToolkitVersion: "2.0.0"
  nodeVersion: "18.x"
  
documentation:
  - title: Getting Started
    path: docs/getting-started.md
  - title: Configuration
    path: docs/configuration.md
  - title: Customization
    path: docs/customization.md
```

## Best Practices

### Settings Design

1. **Use Clear Labels**: Make setting labels descriptive and user-friendly.

2. **Provide Defaults**: Always provide sensible default values.

3. **Group Related Settings**: Organize settings into logical groups.

4. **Use Appropriate Input Types**: Choose the right input type for each setting.

5. **Add Validation**: Implement comprehensive validation rules.

### Component Development

1. **Follow Design System**: Use consistent design patterns and components.

2. **Handle Loading States**: Show loading indicators for async operations.

3. **Provide Error Handling**: Handle and display errors gracefully.

4. **Make Accessible**: Ensure components are accessible to all users.

5. **Optimize Performance**: Use React.memo and other optimization techniques.

### Testing Strategy

1. **Test Settings Validation**: Verify all validation rules work correctly.

2. **Test Component Rendering**: Ensure components render properly.

3. **Test User Interactions**: Verify user interactions work as expected.

4. **Test Integration**: Ensure template integrates properly with admin interface.

5. **Test Performance**: Monitor and optimize performance.

### Documentation

1. **Document Settings**: Provide clear documentation for all settings.

2. **Include Examples**: Provide usage examples and code samples.

3. **Document Dependencies**: Clearly list all dependencies and requirements.

4. **Provide Screenshots**: Include screenshots of the template and admin interface.

5. **Write Clear README**: Create a comprehensive README file.

## Advanced Features

### Conditional Logic

```typescript
// Advanced conditional settings
const conditionalSettings = {
  paymentGateway: {
    type: 'select',
    title: 'Payment Gateway',
    options: [
      { value: 'stripe', label: 'Stripe' },
      { value: 'paypal', label: 'PayPal' },
      { value: 'none', label: 'None' }
    ],
    default: 'none'
  },
  
  stripeConfig: {
    type: 'object',
    title: 'Stripe Configuration',
    conditional: {
      dependsOn: 'paymentGateway',
      value: 'stripe',
      show: ['publishableKey', 'secretKey']
    },
    properties: {
      publishableKey: {
        type: 'string',
        title: 'Publishable Key',
        validation: { required: true }
      },
      secretKey: {
        type: 'password',
        title: 'Secret Key',
        validation: { required: true }
      }
    }
  }
};
```

### Custom Validation

```typescript
// Custom validation functions
const customValidation = {
  emailList: {
    type: 'array',
    title: 'Email List',
    items: {
      type: 'string',
      validation: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      }
    },
    validation: {
      custom: (emails: string[]) => {
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
          return 'Email addresses must be unique';
        }
        return true;
      }
    }
  }
};
```

### AI Integration

```typescript
// AI-powered settings recommendations
const aiIntegration = {
  ai: {
    recommendations: {
      enabled: true,
      provider: 'ht031-ai',
      model: 'template-optimizer-v2',
      context: {
        industry: 'technology',
        targetAudience: 'developers',
        contentVolume: 'high'
      }
    },
    
    smartDefaults: {
      enabled: true,
      learnFromUsage: true,
      personalizeForUser: true
    }
  }
};
```

## Troubleshooting

### Common Issues

#### Template Not Loading

**Problem**: Template doesn't appear in admin interface after installation.

**Solutions**:
1. Check template registration:
   ```typescript
   import { getRegisteredTemplates } from '@agency-toolkit/admin';
   console.log(getRegisteredTemplates());
   ```

2. Verify settings schema:
   ```typescript
   import { validateSchema } from '@agency-toolkit/admin';
   const result = validateSchema(settingsSchema);
   console.log(result);
   ```

3. Check console for errors:
   ```bash
   pnpm run dev:admin
   # Check browser console
   ```

#### Settings Not Saving

**Problem**: Template settings are not being persisted.

**Solutions**:
1. Verify settings validation:
   ```typescript
   const validationResult = await validateSettings('my-template', settings);
   console.log(validationResult);
   ```

2. Check storage permissions:
   ```typescript
   const hasPermission = await checkStoragePermission('my-template');
   console.log(hasPermission);
   ```

3. Test settings API:
   ```bash
   curl -X POST /api/admin/templates/my-template/settings \
     -H "Content-Type: application/json" \
     -d '{"test": "value"}'
   ```

#### Component Rendering Issues

**Problem**: Custom admin components are not rendering correctly.

**Solutions**:
1. Check component registration:
   ```typescript
   console.log(MyTemplateAdminComponents);
   ```

2. Verify component props:
   ```typescript
   // Add debug logging
   console.log('Component props:', { value, onChange, setting });
   ```

3. Test component isolation:
   ```typescript
   // Test component in isolation
   render(<CustomColorPicker value="#3b82f6" onChange={jest.fn()} setting="test" />);
   ```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable template debug mode
localStorage.setItem('template-debug', 'true');

// Or set environment variable
process.env.TEMPLATE_DEBUG = 'true';
```

Debug information includes:
- Template registration logs
- Settings loading/saving logs
- Component rendering logs
- Validation results
- Error details

## Conclusion

This guide provides comprehensive instructions for developing and integrating templates with the Modular Admin Interface. By following these guidelines and best practices, you can create templates that integrate seamlessly with the admin interface and provide an excellent user experience.

For additional resources:
- [Modular Interface Guide](./modular-interface-guide.md)
- [AI Integration Guide](./ai-integration-guide.md)
- [Platform Architecture Documentation](./platform-architecture.md)
- [API Documentation](./api-documentation.md)
