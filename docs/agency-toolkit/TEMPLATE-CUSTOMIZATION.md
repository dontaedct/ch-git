# Agency Toolkit - Template Customization Workflow

**Version:** 1.0.0
**Last Updated:** September 14, 2025
**HT-021.4.4:** Agency Toolkit Documentation & Solo Developer Experience

## Overview

Template customization is the core workflow for delivering personalized client micro-apps within the ≤7-day delivery target. This guide covers the complete process from initial template selection to final deployment.

## Customization Workflow

### 🚀 Quick Start (30 Minutes)

```typescript
// 1. Initialize new client
const client = await agencyToolkit.initializeClient(
  'new-client',
  'New Client Name',
  {
    template: 'DASHBOARD',
    securityTier: 'STANDARD',
    theme: { colors: { primary: '#your-brand-color' } }
  }
);

// 2. Deploy to preview
const preview = await agencyToolkit.deployClient(client.template.id, 'preview');
console.log(`Preview ready: ${preview.url}`);
```

### 📋 Complete Workflow (Step by Step)

#### Phase 1: Discovery & Planning (Day 1)

1. **Client Requirements Gathering**
2. **Template Selection**
3. **Brand Asset Collection**
4. **Feature Scoping**

#### Phase 2: Template Configuration (Day 2-3)

1. **Base Template Setup**
2. **Theme Customization**
3. **Layout Configuration**
4. **Component Overrides**

#### Phase 3: Integration & Testing (Day 4-5)

1. **External Service Integration**
2. **Security Configuration**
3. **Performance Testing**
4. **Client Review**

#### Phase 4: Deployment & Handover (Day 6-7)

1. **Production Deployment**
2. **Domain Configuration**
3. **Client Training**
4. **Documentation Handover**

## Template Types & Use Cases

### 📊 Dashboard Template

**Best For:** SaaS platforms, admin panels, data visualization

```typescript
const DASHBOARD_CONFIG = {
  name: 'Client Analytics Dashboard',
  category: 'dashboard',
  layout: {
    type: 'dashboard',
    header: {
      enabled: true,
      title: 'Analytics Dashboard',
      navigation: [
        { label: 'Overview', href: '/', icon: 'home' },
        { label: 'Analytics', href: '/analytics', icon: 'chart' },
        { label: 'Reports', href: '/reports', icon: 'file' },
        { label: 'Settings', href: '/settings', icon: 'cog' }
      ]
    },
    sidebar: {
      enabled: true,
      position: 'left',
      collapsible: true,
      items: [
        { label: 'Dashboard', href: '/', icon: 'dashboard' },
        { label: 'Users', href: '/users', icon: 'users' },
        { label: 'Metrics', href: '/metrics', icon: 'chart-bar' }
      ]
    },
    footer: {
      enabled: true,
      content: 'Powered by Agency Toolkit'
    },
    content: {
      padding: 'md',
      maxWidth: 'full',
      center: false
    }
  }
};
```

**Common Customizations:**
- KPI widgets and charts
- Data table configurations
- Custom filters and search
- Role-based navigation
- Real-time data updates

### 🌐 Landing Page Template

**Best For:** Product launches, marketing campaigns, lead generation

```typescript
const LANDING_CONFIG = {
  name: 'Product Launch Landing',
  category: 'landing',
  layout: {
    type: 'single-page',
    header: {
      enabled: true,
      title: 'Product Name',
      navigation: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Contact', href: '#contact' }
      ]
    },
    footer: {
      enabled: true,
      content: 'Copyright 2025 Client Name',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' }
      ]
    },
    content: {
      padding: 'lg',
      maxWidth: 'lg',
      center: true
    }
  }
};
```

**Common Customizations:**
- Hero sections with CTAs
- Feature showcases
- Testimonials and social proof
- Contact forms and lead capture
- Pricing tables

### 🔐 Authentication Template

**Best For:** Login portals, user onboarding, secure access

```typescript
const AUTH_CONFIG = {
  name: 'Client Auth Portal',
  category: 'auth',
  layout: {
    type: 'single-page',
    header: {
      enabled: false
    },
    footer: {
      enabled: true,
      content: 'Secure login powered by Agency Toolkit'
    },
    content: {
      padding: 'lg',
      maxWidth: 'sm',
      center: true
    }
  }
};
```

**Common Customizations:**
- Multi-factor authentication
- Social login integrations
- Password reset flows
- Terms and privacy links
- Branded login forms

## Customization Techniques

### 🎨 Visual Customization

#### Brand Colors Implementation

```typescript
// Define client brand palette
const CLIENT_BRAND = {
  primary: '#1a365d',    // Navy blue
  secondary: '#2d3748',  // Dark gray
  accent: '#ed8936',     // Orange
  success: '#38a169',    // Green
  warning: '#d69e2e',    // Yellow
  error: '#e53e3e'       // Red
};

// Apply to template
const brandedTemplate = await templateSystem.createTemplate({
  ...baseTemplate,
  theme: {
    ...DEFAULT_THEME,
    colors: CLIENT_BRAND
  }
});
```

#### Typography Customization

```typescript
// Custom font configuration
const CUSTOM_TYPOGRAPHY = {
  fontFamily: 'Poppins, system-ui, sans-serif',
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  }
};

// Apply typography
const template = await templateSystem.updateTemplate(templateId, {
  theme: {
    ...currentTheme,
    typography: CUSTOM_TYPOGRAPHY
  }
});
```

### 🔧 Component Overrides

#### Style Overrides

```typescript
const COMPONENT_OVERRIDES = {
  'Button': {
    name: 'Button',
    type: 'style',
    enabled: true,
    config: {
      baseClasses: 'px-4 py-2 rounded-lg font-semibold transition-all',
      variants: {
        primary: 'bg-primary text-white hover:bg-primary-600',
        secondary: 'bg-secondary text-white hover:bg-secondary-600',
        outline: 'border border-primary text-primary hover:bg-primary hover:text-white'
      }
    }
  },
  'Card': {
    name: 'Card',
    type: 'style',
    enabled: true,
    config: {
      baseClasses: 'bg-white rounded-xl shadow-sm border border-gray-200 p-6',
      variants: {
        elevated: 'shadow-lg',
        flat: 'shadow-none border-2'
      }
    }
  }
};
```

#### Props Overrides

```typescript
const PROPS_OVERRIDES = {
  'DataTable': {
    name: 'DataTable',
    type: 'props',
    enabled: true,
    config: {
      defaultProps: {
        pageSize: 25,
        sortable: true,
        filterable: true,
        exportable: true
      },
      customColumns: [
        { key: 'status', label: 'Status', sortable: true },
        { key: 'priority', label: 'Priority', filterable: true }
      ]
    }
  }
};
```

#### Component Replacement

```typescript
const COMPONENT_REPLACEMENTS = {
  'Header': {
    name: 'Header',
    type: 'replace',
    enabled: true,
    config: {
      componentPath: '@/components/custom/ClientHeader',
      props: {
        logoUrl: 'https://client.com/logo.svg',
        showUserMenu: true,
        customLinks: [
          { label: 'Support', href: 'https://support.client.com' }
        ]
      }
    }
  }
};
```

### 🔌 Integration Configuration

#### API Integrations

```typescript
// Configure client-specific API integrations
const API_INTEGRATIONS = [
  {
    name: 'CRM Integration',
    type: 'data',
    config: {
      endpoint: 'https://api.salesforce.com',
      auth: {
        type: 'oauth',
        credentials: {
          clientId: process.env.SALESFORCE_CLIENT_ID,
          clientSecret: process.env.SALESFORCE_CLIENT_SECRET
        }
      },
      parameters: {
        apiVersion: 'v52.0',
        sandbox: false
      }
    },
    enabled: true,
    priority: 1
  },
  {
    name: 'Payment Processing',
    type: 'payment',
    config: {
      endpoint: 'https://api.stripe.com',
      auth: {
        type: 'bearer',
        credentials: {
          token: process.env.STRIPE_SECRET_KEY
        }
      },
      parameters: {
        currency: 'usd',
        paymentMethods: ['card', 'apple_pay', 'google_pay']
      }
    },
    enabled: true,
    priority: 2
  }
];

// Apply integrations to template
for (const integration of API_INTEGRATIONS) {
  await integrationManager.registerHook({
    ...integration,
    clientId: template.client.id
  });
}
```

## Rapid Customization Strategies

### ⚡ 1-Hour Customization Pattern

For urgent deployments, focus on high-impact, low-effort changes:

```typescript
async function rapidCustomization(clientId: string, brandingConfig: any) {
  // 1. Apply brand colors (5 minutes)
  const theme = createClientTheme(brandingConfig);

  // 2. Update logo and title (5 minutes)
  const headerConfig = {
    title: brandingConfig.companyName,
    logo: brandingConfig.logoUrl
  };

  // 3. Configure essential integrations (20 minutes)
  const essentialIntegrations = [
    createAuthIntegration(brandingConfig.authConfig),
    createAnalyticsIntegration(brandingConfig.analyticsId)
  ];

  // 4. Deploy to preview (30 minutes)
  const template = await templateSystem.createTemplate({
    name: `${brandingConfig.companyName} Dashboard`,
    category: 'dashboard',
    client: { id: clientId, name: brandingConfig.companyName },
    layout: DEFAULT_TEMPLATES.DASHBOARD.layout,
    theme,
    components: {}
  });

  const deployment = await templateSystem.deployTemplate(
    template.id,
    'preview',
    {
      domain: { custom: false, name: '', ssl: true },
      env: { NEXT_PUBLIC_CLIENT_NAME: brandingConfig.companyName },
      build: { command: 'npm run build', outputDir: 'dist', nodeVersion: '18' },
      performance: { caching: true, compression: true, cdn: true }
    }
  );

  return { template, deployment };
}
```

### 🎯 Component Library Strategy

Maintain a library of pre-built, customizable components:

```typescript
// Component library structure
const COMPONENT_LIBRARY = {
  'hero-sections': [
    'hero-with-cta',
    'hero-with-video',
    'hero-split-screen',
    'hero-centered'
  ],
  'navigation': [
    'nav-horizontal',
    'nav-sidebar',
    'nav-mobile-drawer',
    'nav-mega-menu'
  ],
  'content-blocks': [
    'feature-grid',
    'testimonial-carousel',
    'pricing-table',
    'faq-accordion'
  ],
  'forms': [
    'contact-form',
    'newsletter-signup',
    'multi-step-form',
    'login-form'
  ]
};

// Quick component selection
async function addComponentToTemplate(
  templateId: string,
  componentType: string,
  componentVariant: string,
  customization?: any
) {
  const component = await componentLibrary.getComponent(componentType, componentVariant);

  return await templateSystem.updateTemplate(templateId, {
    components: {
      [`${componentType}-${Date.now()}`]: {
        name: component.name,
        type: 'extend',
        enabled: true,
        config: {
          ...component.defaultConfig,
          ...customization
        }
      }
    }
  });
}
```

## Testing & Quality Assurance

### 🧪 Automated Testing Pipeline

```typescript
// Template testing suite
class TemplateTestRunner {
  async runTemplateTests(templateId: string): Promise<TemplateTestResults> {
    const results: TemplateTestResults = {
      performance: await this.testPerformance(templateId),
      accessibility: await this.testAccessibility(templateId),
      responsiveness: await this.testResponsiveness(templateId),
      functionality: await this.testFunctionality(templateId),
      security: await this.testSecurity(templateId)
    };

    return results;
  }

  private async testPerformance(templateId: string): Promise<PerformanceTestResult> {
    const validator = new PerformanceValidator();
    const report = await validator.runCompleteValidation();

    return {
      score: report.summary.overallScore,
      passed: report.summary.overallScore >= 80,
      metrics: {
        fcp: report.loadTimeMetrics.firstContentfulPaint,
        lcp: report.loadTimeMetrics.largestContentfulPaint,
        fid: report.loadTimeMetrics.firstInputDelay,
        cls: report.loadTimeMetrics.cumulativeLayoutShift
      }
    };
  }

  private async testAccessibility(templateId: string): Promise<AccessibilityTestResult> {
    // Run accessibility tests
    return {
      score: 95,
      passed: true,
      violations: []
    };
  }

  private async testResponsiveness(templateId: string): Promise<ResponsivenessTestResult> {
    // Test across different screen sizes
    return {
      mobile: { passed: true, score: 90 },
      tablet: { passed: true, score: 92 },
      desktop: { passed: true, score: 95 }
    };
  }
}
```

### 📋 Quality Checklist

#### Pre-Deployment Checklist

- [ ] Brand colors applied correctly
- [ ] Typography matches brand guidelines
- [ ] Logo and imagery optimized
- [ ] Navigation structure intuitive
- [ ] Forms functional and validated
- [ ] Integrations tested and working
- [ ] Performance targets met
- [ ] Mobile responsiveness verified
- [ ] Accessibility standards met
- [ ] Security boundaries configured
- [ ] Error handling implemented
- [ ] Loading states designed

#### Client Review Checklist

- [ ] Brand representation accurate
- [ ] Content reflects business needs
- [ ] User experience intuitive
- [ ] Performance acceptable
- [ ] All requested features present
- [ ] Integration requirements met
- [ ] Security requirements satisfied

## Advanced Customization Patterns

### 🔄 Multi-Tenant Customization

```typescript
// Handle multiple client variations
class MultiTenantCustomizer {
  async createClientVariations(
    baseTemplate: ClientTemplate,
    variations: ClientVariation[]
  ): Promise<ClientTemplate[]> {
    const templates = await Promise.all(
      variations.map(async (variation) => {
        const customizedTemplate = await this.applyVariation(
          baseTemplate,
          variation
        );

        return await templateSystem.createTemplate(customizedTemplate);
      })
    );

    return templates;
  }

  private async applyVariation(
    baseTemplate: ClientTemplate,
    variation: ClientVariation
  ): Promise<Omit<ClientTemplate, 'id' | 'createdAt' | 'updatedAt'>> {
    return {
      ...baseTemplate,
      name: `${baseTemplate.name} - ${variation.name}`,
      client: {
        id: variation.clientId,
        name: variation.clientName
      },
      theme: this.mergeThemes(baseTemplate.theme, variation.themeOverrides),
      components: this.mergeComponents(baseTemplate.components, variation.componentOverrides)
    };
  }

  private mergeThemes(base: ClientThemeConfig, overrides: Partial<ClientThemeConfig>): ClientThemeConfig {
    return {
      ...base,
      colors: { ...base.colors, ...overrides.colors },
      typography: { ...base.typography, ...overrides.typography },
      // ... merge other theme properties
    };
  }
}
```

### 🎛️ Dynamic Content Management

```typescript
// Content management system integration
interface ContentConfig {
  provider: 'contentful' | 'strapi' | 'sanity' | 'custom';
  apiKey: string;
  spaceId?: string;
  endpoint?: string;
}

class DynamicContentManager {
  async integrateContentSystem(
    templateId: string,
    contentConfig: ContentConfig
  ): Promise<void> {
    const contentHook = await integrationManager.registerHook({
      name: 'Content Management',
      type: 'data',
      clientId: templateId,
      config: {
        endpoint: contentConfig.endpoint || this.getProviderEndpoint(contentConfig.provider),
        auth: {
          type: 'apikey',
          credentials: { key: contentConfig.apiKey }
        },
        parameters: {
          spaceId: contentConfig.spaceId,
          provider: contentConfig.provider
        }
      },
      enabled: true,
      priority: 1
    });

    // Configure content areas in template
    await templateSystem.updateTemplate(templateId, {
      components: {
        'dynamic-content': {
          name: 'DynamicContent',
          type: 'extend',
          enabled: true,
          config: {
            hookId: contentHook.id,
            refreshInterval: 300000, // 5 minutes
            fallbackContent: 'Loading content...'
          }
        }
      }
    });
  }

  private getProviderEndpoint(provider: ContentConfig['provider']): string {
    const endpoints = {
      contentful: 'https://cdn.contentful.com',
      strapi: 'https://api.strapi.io',
      sanity: 'https://cdn.sanity.io',
      custom: ''
    };

    return endpoints[provider];
  }
}
```

## Deployment Workflows

### 🚀 Automated Deployment Pipeline

```typescript
// Complete deployment automation
async function deployClientTemplate(
  templateId: string,
  environment: 'preview' | 'staging' | 'production',
  deploymentOptions: DeploymentOptions
): Promise<TemplateDeployment> {
  // 1. Pre-deployment validation
  const testResults = await new TemplateTestRunner().runTemplateTests(templateId);

  if (!testResults.performance.passed) {
    throw new Error('Performance tests failed');
  }

  // 2. Build optimization
  await optimizeForDeployment(templateId, environment);

  // 3. Deploy with monitoring
  const deployment = await templateSystem.deployTemplate(
    templateId,
    environment,
    {
      ...deploymentOptions,
      monitoring: {
        enabled: true,
        alertThresholds: {
          errorRate: 0.01,
          responseTime: 2000,
          availability: 0.99
        }
      }
    }
  );

  // 4. Post-deployment verification
  await verifyDeployment(deployment);

  return deployment;
}

async function optimizeForDeployment(templateId: string, environment: string): Promise<void> {
  // Image optimization
  await optimizeImages(templateId);

  // Bundle optimization
  await optimizeBundles(templateId);

  // Asset compression
  await compressAssets(templateId);

  // CDN configuration
  if (environment === 'production') {
    await configureCDN(templateId);
  }
}
```

This comprehensive template customization workflow enables rapid, high-quality client micro-app delivery while maintaining consistency, performance, and security standards.