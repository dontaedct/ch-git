/**
 * @fileoverview HT-011.2.8: Brand Configuration Documentation
 * @module docs/brand-configuration/README.md
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.2.8 - Create Brand Configuration Documentation
 * Focus: Comprehensive documentation for brand configuration system usage and best practices
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (documentation creation)
 */

# Brand Configuration System Documentation

## Overview

The Brand Configuration System is a comprehensive solution for managing and customizing brand elements across the DCT Micro-Apps platform. This system enables complete white-labeling capabilities, allowing clients to customize colors, typography, logos, and brand identity while maintaining design consistency and accessibility compliance.

## Table of Contents

1. [Quick Start Guide](#quick-start-guide)
2. [System Architecture](#system-architecture)
3. [Configuration Management](#configuration-management)
4. [Validation System](#validation-system)
5. [API Reference](#api-reference)
6. [React Integration](#react-integration)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)
9. [Migration Guide](#migration-guide)

## Quick Start Guide

### 1. Basic Brand Configuration

```typescript
import { brandConfigService } from '@/lib/branding/brand-config-service';

// Create a new brand configuration
const brandConfig = await brandConfigService.createBrandConfig({
  name: 'My Organization',
  description: 'My Application',
  basePreset: 'professional',
  overrides: {
    colors: {
      primary: '#007AFF',
      secondary: '#34C759',
      accent: '#FF9500'
    },
    typography: {
      fontFamily: 'Inter',
      fontWeights: [400, 500, 600, 700]
    },
    assets: {
      logo: 'https://example.com/logo.png',
      favicon: 'https://example.com/favicon.ico'
    }
  }
});
```

### 2. Validate Brand Configuration

```typescript
import { brandConfigValidator } from '@/lib/branding/brand-config-validation';

// Validate brand configuration
const validationResult = await brandConfigValidator.validateBrandConfig(brandConfig);

if (validationResult.valid) {
  console.log('✅ Brand configuration is valid');
} else {
  console.log('❌ Validation errors:', validationResult.errors);
}
```

### 3. Apply Brand Configuration

```typescript
// Apply brand configuration to tenant
await brandConfigService.applyBrandConfig(tenantId, brandConfig.id);
```

## System Architecture

### Core Components

#### 1. Brand Configuration Service
- **Location**: `lib/branding/brand-config-service.ts`
- **Purpose**: Core service for brand configuration management
- **Features**: CRUD operations, preset management, configuration inheritance

#### 2. Validation Framework
- **Location**: `lib/branding/brand-config-validation.ts`
- **Purpose**: Comprehensive brand configuration validation
- **Features**: Multi-category validation, WCAG compliance, custom rules

#### 3. Multi-Brand Generator
- **Location**: `lib/design-tokens/multi-brand-generator.ts`
- **Purpose**: Dynamic color palette generation
- **Features**: Automatic color scales, dark/light variants, accessibility compliance

#### 4. Typography Generator
- **Location**: `lib/design-tokens/typography-generator.ts`
- **Purpose**: Dynamic typography system
- **Features**: Custom font loading, typography scales, responsive design

#### 5. Logo Manager
- **Location**: `lib/branding/logo-manager.ts`
- **Purpose**: Dynamic logo and brand name management
- **Features**: Logo upload, fallback initials, brand name variants

### Database Schema

```sql
-- Tenant branding configurations
CREATE TABLE tenant_branding_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  organization_name TEXT NOT NULL,
  description TEXT,
  preset_name TEXT DEFAULT 'default',
  brand_colors JSONB,
  typography_config JSONB,
  logo_src TEXT,
  logo_alt TEXT,
  logo_width INTEGER DEFAULT 40,
  logo_height INTEGER DEFAULT 40,
  logo_initials TEXT,
  logo_fallback_bg_color TEXT DEFAULT 'from-blue-600 to-indigo-600',
  validation_status TEXT DEFAULT 'pending',
  validation_errors TEXT[],
  validation_warnings TEXT[],
  validation_scores JSONB,
  wcag_compliance JSONB,
  is_active BOOLEAN DEFAULT true,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_at TIMESTAMP WITH TIME ZONE,
  validated_by UUID,
  created_by UUID
);
```

## Configuration Management

### Brand Configuration Structure

```typescript
interface BrandConfig {
  id: string;
  name: string;
  description?: string;
  basePreset: string;
  overrides: {
    colors: {
      primary?: string;
      secondary?: string;
      accent?: string;
      custom?: Record<string, string>;
    };
    typography: {
      fontFamily?: string;
      fontWeights?: number[];
      scales?: Record<string, string>;
    };
    assets: {
      logo?: string;
      logoDark?: string;
      favicon?: string;
      icon?: string;
    };
    content: {
      tagline?: string;
      description?: string;
      contact?: {
        email?: string;
        phone?: string;
        website?: string;
      };
    };
  };
  metadata: {
    industry?: string;
    style?: string;
    colorScheme?: string;
    maturity?: string;
    audience?: string;
    keywords?: string[];
    version?: string;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastApplied?: Date;
  };
}
```

### Preset System

The system includes 7 industry-specific presets:

1. **Professional** - Clean, corporate design
2. **Healthcare** - Calming, trustworthy colors
3. **Financial** - Conservative, stable design
4. **Technology** - Modern, innovative styling
5. **Education** - Friendly, accessible design
6. **E-commerce** - Conversion-focused design
7. **Creative** - Bold, artistic styling

```typescript
// Use a preset as base
const brandConfig = await brandConfigService.createBrandConfig({
  name: 'My Company',
  basePreset: 'healthcare',
  overrides: {
    colors: {
      primary: '#2563eb' // Override preset primary color
    }
  }
});
```

## Validation System

### Validation Categories

#### 1. Accessibility Validation
- **Color Contrast**: WCAG A, AA, AAA compliance
- **Logo Accessibility**: Alt text, fallback initials
- **Typography Accessibility**: Font size, readability
- **Brand Name Accessibility**: Screen reader compatibility

#### 2. Usability Validation
- **Brand Name Usability**: Memorability, simplicity
- **Logo Usability**: Size, aspect ratio
- **Color Usability**: Color-blind friendly colors
- **Navigation Usability**: Brand element placement

#### 3. Design Validation
- **Color Harmony**: Visual balance and harmony
- **Typography Consistency**: Font scales and weights
- **Brand Element Consistency**: Consistent brand application
- **Visual Hierarchy**: Proper design hierarchy

#### 4. Branding Validation
- **Brand Uniqueness**: Unique brand elements
- **Brand Memorability**: Memorable brand names
- **Brand Scalability**: Scalable brand elements
- **Brand Consistency**: Consistent brand application

### Custom Validation Rules

```typescript
import { ValidationRule } from '@/lib/branding/brand-config-validation';

// Add custom validation rule
const customRule: ValidationRule = {
  id: 'company-logo-requirement',
  name: 'Company Logo Requirement',
  description: 'Require company logo for enterprise clients',
  category: 'branding',
  severity: 'error',
  enabled: true,
  validator: (config, context) => {
    const hasLogo = Boolean(config.theme?.logo?.src);
    const isEnterprise = context.maturity === 'enterprise';
    
    return {
      id: 'company-logo-requirement',
      name: 'Company Logo Requirement',
      severity: 'error',
      passed: !isEnterprise || hasLogo,
      message: isEnterprise && !hasLogo 
        ? 'Enterprise clients must have a company logo'
        : 'Logo requirement satisfied',
      category: 'branding'
    };
  }
};

brandConfigValidator.addCustomRule(customRule);
```

## API Reference

### Brand Configuration Endpoints

#### GET /api/brand
List all brand configurations for a tenant.

**Query Parameters:**
- `tenantId` (optional): Tenant ID (defaults to 'default')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "brand-123",
      "name": "My Organization",
      "description": "My Application",
      "basePreset": "professional",
      "overrides": { ... },
      "metadata": { ... },
      "timestamps": { ... }
    }
  ],
  "count": 1
}
```

#### POST /api/brand
Create a new brand configuration.

**Request Body:**
```json
{
  "name": "My Organization",
  "description": "My Application",
  "basePreset": "professional",
  "overrides": {
    "colors": {
      "primary": "#007AFF",
      "secondary": "#34C759"
    }
  },
  "metadata": {
    "industry": "technology",
    "audience": "professionals"
  },
  "tenantId": "tenant-123"
}
```

#### GET /api/brand/[id]
Get a specific brand configuration.

#### PUT /api/brand/[id]
Update a brand configuration.

#### DELETE /api/brand/[id]
Delete a brand configuration.

#### POST /api/brand/[id]/validate
Validate a brand configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "errors": [],
    "warnings": [],
    "accessibilityScore": 95,
    "usabilityScore": 90,
    "designScore": 85,
    "brandScore": 88,
    "overallScore": 90,
    "wcagCompliance": {
      "levelA": true,
      "levelAA": true,
      "levelAAA": false
    },
    "summary": {
      "status": "valid",
      "message": "✅ Brand configuration is valid (90/100)",
      "details": []
    },
    "statistics": {
      "totalErrors": 0,
      "totalWarnings": 0,
      "criticalErrors": 0,
      "accessibilityIssues": 0,
      "usabilityIssues": 0,
      "designIssues": 0,
      "brandingIssues": 0
    }
  }
}
```

### Brand Preset Endpoints

#### GET /api/brand/presets
List all available brand presets.

#### GET /api/brand/presets/[id]
Get a specific brand preset.

### Brand Import/Export Endpoints

#### POST /api/brand/import
Import brand configuration from file.

#### GET /api/brand/[id]/export
Export brand configuration to file.

## React Integration

### Hooks

#### useBrandValidation

```typescript
import { useBrandValidation } from '@/hooks/useBrandValidation';

function BrandConfigForm({ config }: { config: TenantBrandConfig }) {
  const {
    result,
    isValidating,
    summary,
    statistics,
    validate,
    clearValidation
  } = useBrandValidation(config, {
    autoValidate: true,
    debounceMs: 500,
    context: {
      strictness: 'standard',
      industry: 'technology'
    }
  });

  return (
    <div>
      {isValidating && <div>Validating...</div>}
      {result && (
        <div>
          <div>Status: {summary?.status}</div>
          <div>Score: {summary?.score}/100</div>
          <div>Errors: {summary?.errorCount}</div>
          <div>Warnings: {summary?.warningCount}</div>
        </div>
      )}
    </div>
  );
}
```

#### useBrandPresetValidation

```typescript
import { useBrandPresetValidation } from '@/hooks/useBrandValidation';

function PresetValidation({ presetId }: { presetId: string }) {
  const {
    result,
    isValidating,
    validatePreset
  } = useBrandPresetValidation(presetId, {
    strictness: 'standard',
    industry: 'healthcare'
  });

  return (
    <div>
      {isValidating && <div>Validating preset...</div>}
      {result && (
        <div>
          <div>Valid: {result.valid ? 'Yes' : 'No'}</div>
          <div>Score: {result.overallScore}/100</div>
        </div>
      )}
    </div>
  );
}
```

### Components

#### BrandValidationPanel

```typescript
import { BrandValidationPanel } from '@/components/brand/BrandValidationComponents';

function BrandConfigPage({ config }: { config: TenantBrandConfig }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        {/* Brand configuration form */}
      </div>
      <div>
        <BrandValidationPanel 
          config={config}
          showStatistics={true}
          showHistory={false}
        />
      </div>
    </div>
  );
}
```

#### ValidationStatusIndicator

```typescript
import { ValidationStatusIndicator } from '@/components/brand/BrandValidationComponents';

function BrandConfigCard({ config }: { config: TenantBrandConfig }) {
  const { result } = useBrandValidation(config);
  
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <h3>{config.brand.name}</h3>
        <ValidationStatusIndicator 
          result={result} 
          size="sm" 
          showScore={true} 
        />
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Brand Configuration Design

#### Color Selection
- **Primary Color**: Choose a color that represents your brand identity
- **Secondary Color**: Select a complementary color for accents
- **Accessibility**: Ensure sufficient contrast ratios (4.5:1 for AA, 7:1 for AAA)
- **Consistency**: Use the same color palette across all brand elements

```typescript
// Good: High contrast colors
const colors = {
  primary: '#007AFF',    // Blue
  secondary: '#34C759',  // Green
  accent: '#FF9500'      // Orange
};

// Avoid: Low contrast colors
const badColors = {
  primary: '#CCCCCC',    // Light gray
  secondary: '#DDDDDD',  // Very light gray
  accent: '#EEEEEE'      // Almost white
};
```

#### Typography
- **Font Family**: Choose web-safe fonts or use font loading
- **Font Weights**: Include multiple weights for hierarchy
- **Font Sizes**: Use consistent typography scales
- **Readability**: Ensure fonts are readable at all sizes

```typescript
// Good: Comprehensive typography
const typography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeights: [400, 500, 600, 700],
  scales: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  }
};
```

#### Logo Design
- **Format**: Use SVG or high-resolution PNG
- **Size**: Ensure logo works at different sizes
- **Alt Text**: Provide descriptive alt text for accessibility
- **Fallback**: Include initials as fallback

```typescript
// Good: Complete logo configuration
const logo = {
  src: 'https://example.com/logo.svg',
  alt: 'My Company Logo',
  width: 40,
  height: 40,
  initials: 'MC',
  fallbackBgColor: 'from-blue-600 to-indigo-600'
};
```

### 2. Validation Best Practices

#### Regular Validation
- **Pre-deployment**: Always validate before applying configurations
- **Automated Validation**: Use auto-validation in development
- **Manual Review**: Review validation results before production

```typescript
// Validate before applying
const validationResult = await brandConfigValidator.validateBrandConfig(config);
if (!validationResult.valid) {
  console.error('Validation failed:', validationResult.errors);
  return;
}
await brandConfigService.applyBrandConfig(tenantId, config.id);
```

#### Custom Rules
- **Industry-Specific**: Create rules for your industry
- **Client Requirements**: Add rules for client-specific needs
- **Compliance**: Include compliance-related rules

```typescript
// Industry-specific rule
const healthcareRule: ValidationRule = {
  id: 'healthcare-colors',
  name: 'Healthcare Color Compliance',
  description: 'Ensure colors are appropriate for healthcare',
  category: 'branding',
  severity: 'warning',
  enabled: true,
  validator: (config, context) => {
    if (context.industry !== 'healthcare') {
      return { id: 'healthcare-colors', name: 'Healthcare Color Compliance', severity: 'info', passed: true, message: 'Not applicable', category: 'branding' };
    }
    
    const primaryColor = config.theme?.colors?.primary;
    const isAppropriate = primaryColor && isHealthcareAppropriate(primaryColor);
    
    return {
      id: 'healthcare-colors',
      name: 'Healthcare Color Compliance',
      severity: 'warning',
      passed: isAppropriate,
      message: isAppropriate ? 'Colors are appropriate for healthcare' : 'Consider using calming colors for healthcare',
      category: 'branding'
    };
  }
};
```

### 3. Performance Optimization

#### Caching
- **Enable Caching**: Use caching for validation results
- **Cache Invalidation**: Clear cache when configurations change
- **Client-Side Caching**: Use React hooks with caching

```typescript
// Enable caching
const validationResult = await brandConfigValidator.validateBrandConfig(config, {
  strictness: 'standard',
  enableCache: true
});
```

#### Lazy Loading
- **Dynamic Imports**: Use dynamic imports for validation service
- **Code Splitting**: Split validation code into separate chunks
- **On-Demand Loading**: Load validation only when needed

```typescript
// Lazy load validation service
const { brandConfigValidator } = await import('@/lib/branding/brand-config-validation');
const result = await brandConfigValidator.validateBrandConfig(config);
```

### 4. Error Handling

#### Graceful Degradation
- **Fallback Values**: Provide fallback values for missing configurations
- **Error Recovery**: Implement error recovery mechanisms
- **User Feedback**: Provide clear error messages to users

```typescript
// Graceful error handling
try {
  const result = await brandConfigValidator.validateBrandConfig(config);
  return result;
} catch (error) {
  console.error('Validation error:', error);
  return {
    valid: false,
    errors: [{ code: 'VALIDATION_ERROR', message: 'Validation failed', path: 'config', severity: 'error', category: 'technical' }],
    warnings: [],
    accessibilityScore: 0,
    usabilityScore: 0,
    designScore: 0,
    brandScore: 0,
    overallScore: 0,
    wcagCompliance: { levelA: false, levelAA: false, levelAAA: false },
    timestamp: new Date(),
    duration: 0
  };
}
```

## Troubleshooting

### Common Issues

#### 1. Validation Errors

**Issue**: Brand configuration validation fails
**Solution**: Check validation errors and fix issues

```typescript
const result = await brandConfigValidator.validateBrandConfig(config);
if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.path}: ${error.message}`);
    if (error.suggestion) {
      console.log(`Suggestion: ${error.suggestion}`);
    }
  });
}
```

#### 2. Color Contrast Issues

**Issue**: Color contrast validation fails
**Solution**: Use color contrast checker and adjust colors

```typescript
// Check contrast ratio
const contrastRatio = calculateContrastRatio('#007AFF', '#FFFFFF');
console.log(`Contrast ratio: ${contrastRatio}:1`);

// Minimum ratios:
// WCAG A: 3:1
// WCAG AA: 4.5:1
// WCAG AAA: 7:1
```

#### 3. Logo Loading Issues

**Issue**: Logo fails to load
**Solution**: Check URL validity and provide fallback

```typescript
// Validate logo URL
const logoUrl = 'https://example.com/logo.png';
const isValidUrl = logoUrl.match(/^https?:\/\/.+/);

if (!isValidUrl) {
  console.error('Invalid logo URL');
  // Use fallback initials
  const fallbackLogo = {
    src: '',
    alt: 'Company Logo',
    initials: 'CL',
    fallbackBgColor: 'from-blue-600 to-indigo-600'
  };
}
```

#### 4. Font Loading Issues

**Issue**: Custom fonts fail to load
**Solution**: Use font loading strategies and fallbacks

```typescript
// Font loading with fallbacks
const fontFamily = 'Inter, system-ui, -apple-system, sans-serif';

// Preload fonts
const fontLink = document.createElement('link');
fontLink.rel = 'preload';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
fontLink.as = 'style';
document.head.appendChild(fontLink);
```

### Debug Mode

Enable debug mode for detailed logging:

```typescript
// Enable debug mode
const result = await brandConfigValidator.validateBrandConfig(config, {
  strictness: 'standard',
  debug: true
});

// Debug information
console.log('Validation duration:', result.duration);
console.log('Cache hit:', result.cacheHit);
console.log('Validation steps:', result.steps);
```

## Migration Guide

### From Basic Branding to Full Configuration

#### 1. Update Database Schema

```sql
-- Add new columns to existing table
ALTER TABLE tenant_branding_configs 
ADD COLUMN validation_status TEXT DEFAULT 'pending',
ADD COLUMN validation_errors TEXT[],
ADD COLUMN validation_warnings TEXT[],
ADD COLUMN validation_scores JSONB,
ADD COLUMN wcag_compliance JSONB;
```

#### 2. Migrate Existing Configurations

```typescript
import { brandConfigService } from '@/lib/branding/brand-config-service';

// Migrate existing configurations
async function migrateExistingConfigurations() {
  const existingConfigs = await getExistingBrandConfigs();
  
  for (const config of existingConfigs) {
    const newConfig = await brandConfigService.createBrandConfig({
      name: config.organization_name,
      description: config.app_name,
      basePreset: 'default',
      overrides: {
        colors: config.brand_colors,
        typography: config.typography_config,
        assets: {
          logo: config.logo_src,
          favicon: config.favicon_src
        }
      }
    });
    
    // Validate migrated configuration
    const validationResult = await brandConfigValidator.validateBrandConfig(newConfig);
    console.log(`Migrated ${config.id}: ${validationResult.valid ? 'Valid' : 'Invalid'}`);
  }
}
```

#### 3. Update Application Code

```typescript
// Old way
const brandColors = getBrandColors(tenantId);

// New way
const brandConfig = await brandConfigService.getBrandConfig(tenantId);
const brandColors = brandConfig.overrides.colors;
```

### Version Compatibility

The system maintains backward compatibility:

- **v1.0**: Basic branding support
- **v2.0**: Full configuration system (current)
- **v3.0**: Advanced features (future)

```typescript
// Check version compatibility
const config = await brandConfigService.getBrandConfig(tenantId);
const version = config.metadata.version || '1.0';

if (version === '1.0') {
  // Handle legacy configuration
  const legacyConfig = convertLegacyConfig(config);
  return legacyConfig;
}
```

## Support

For additional support:

- **Documentation**: Check this documentation for detailed information
- **API Reference**: Use the API reference for endpoint details
- **Examples**: Review code examples for implementation patterns
- **Community**: Join the community for discussions and help
- **Issues**: Report issues through the issue tracker

## Changelog

### Version 2.0.0 (Current)
- ✅ Complete brand configuration system
- ✅ Comprehensive validation framework
- ✅ React hooks and components
- ✅ API endpoints for all operations
- ✅ Industry-specific presets
- ✅ WCAG compliance checking
- ✅ Custom validation rules
- ✅ Performance optimization
- ✅ Comprehensive documentation

### Version 1.0.0 (Legacy)
- ✅ Basic branding support
- ✅ Simple color and typography configuration
- ✅ Basic logo management
