# Brand Configuration Usage Guide

## Quick Start

### 1. Create Your First Brand Configuration

```typescript
import { brandConfigService } from '@/lib/branding/brand-config-service';

// Step 1: Create a basic brand configuration
const myBrand = await brandConfigService.createBrandConfig({
  name: 'Acme Corporation',
  description: 'Acme Business App',
  basePreset: 'professional',
  overrides: {
    colors: {
      primary: '#1e40af',    // Professional blue
      secondary: '#059669',  // Success green
      accent: '#dc2626'      // Alert red
    }
  }
});

console.log('Brand created:', myBrand.id);
```

### 2. Validate Your Configuration

```typescript
import { brandConfigValidator } from '@/lib/branding/brand-config-validation';

// Step 2: Validate the configuration
const validation = await brandConfigValidator.validateBrandConfig(myBrand);

if (validation.valid) {
  console.log('✅ Configuration is valid!');
  console.log(`Overall score: ${validation.overallScore}/100`);
} else {
  console.log('❌ Configuration has issues:');
  validation.errors.forEach(error => {
    console.log(`- ${error.message} (${error.path})`);
  });
}
```

### 3. Apply to Your Application

```typescript
// Step 3: Apply the brand configuration
await brandConfigService.applyBrandConfig('my-tenant', myBrand.id);

console.log('Brand applied successfully!');
```

## Common Use Cases

### Use Case 1: Healthcare Organization

```typescript
// Healthcare organizations need calming, trustworthy colors
const healthcareBrand = await brandConfigService.createBrandConfig({
  name: 'MediCare Plus',
  description: 'Patient Management System',
  basePreset: 'healthcare',
  overrides: {
    colors: {
      primary: '#0ea5e9',    // Calming blue
      secondary: '#10b981',  // Trust green
      accent: '#f59e0b'      // Warm orange
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeights: [400, 500, 600]
    },
    assets: {
      logo: 'https://medicare.com/logo.svg',
      alt: 'MediCare Plus Logo'
    }
  },
  metadata: {
    industry: 'healthcare',
    audience: 'medical-professionals',
    maturity: 'established'
  }
});

// Validate with healthcare-specific rules
const validation = await brandConfigValidator.validateBrandConfig(healthcareBrand, {
  strictness: 'standard',
  industry: 'healthcare',
  audience: 'medical-professionals'
});
```

### Use Case 2: Financial Services

```typescript
// Financial services need conservative, stable colors
const financialBrand = await brandConfigService.createBrandConfig({
  name: 'SecureBank',
  description: 'Online Banking Platform',
  basePreset: 'financial',
  overrides: {
    colors: {
      primary: '#1e3a8a',    // Conservative navy
      secondary: '#059669',  // Trust green
      accent: '#dc2626'      // Alert red
    },
    typography: {
      fontFamily: 'Roboto, system-ui, sans-serif',
      fontWeights: [400, 500, 700]
    }
  },
  metadata: {
    industry: 'financial',
    audience: 'adults',
    maturity: 'enterprise'
  }
});
```

### Use Case 3: Technology Startup

```typescript
// Tech startups often want modern, innovative styling
const techBrand = await brandConfigService.createBrandConfig({
  name: 'InnovateTech',
  description: 'AI-Powered Analytics',
  basePreset: 'technology',
  overrides: {
    colors: {
      primary: '#7c3aed',    // Modern purple
      secondary: '#06b6d4',  // Tech cyan
      accent: '#f59e0b'      // Energy orange
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      fontWeights: [300, 400, 600, 700]
    },
    assets: {
      logo: 'https://innovatetech.com/logo.svg',
      favicon: 'https://innovatetech.com/favicon.ico'
    }
  },
  metadata: {
    industry: 'technology',
    audience: 'professionals',
    maturity: 'startup'
  }
});
```

## Advanced Configuration

### Custom Color Palettes

```typescript
// Create a custom color palette with multiple shades
const customBrand = await brandConfigService.createBrandConfig({
  name: 'CustomCorp',
  description: 'Custom Business App',
  basePreset: 'professional',
  overrides: {
    colors: {
      primary: '#3b82f6',      // Blue-500
      secondary: '#10b981',   // Emerald-500
      accent: '#f59e0b',      // Amber-500
      custom: {
        'primary-50': '#eff6ff',
        'primary-100': '#dbeafe',
        'primary-200': '#bfdbfe',
        'primary-300': '#93c5fd',
        'primary-400': '#60a5fa',
        'primary-500': '#3b82f6',
        'primary-600': '#2563eb',
        'primary-700': '#1d4ed8',
        'primary-800': '#1e40af',
        'primary-900': '#1e3a8a'
      }
    }
  }
});
```

### Advanced Typography

```typescript
// Configure advanced typography with custom scales
const typographyBrand = await brandConfigService.createBrandConfig({
  name: 'TypographyPro',
  description: 'Typography Showcase',
  basePreset: 'creative',
  overrides: {
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeights: [300, 400, 500, 600, 700, 800],
      scales: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
        '5xl': '3rem',        // 48px
        '6xl': '3.75rem',     // 60px
        '7xl': '4.5rem',      // 72px
        '8xl': '6rem',        // 96px
        '9xl': '8rem'         // 128px
      }
    }
  }
});
```

### Multi-Asset Branding

```typescript
// Configure multiple brand assets
const multiAssetBrand = await brandConfigService.createBrandConfig({
  name: 'MultiAsset Corp',
  description: 'Multi-Asset Platform',
  basePreset: 'professional',
  overrides: {
    assets: {
      logo: 'https://multiasset.com/logo.svg',
      logoDark: 'https://multiasset.com/logo-dark.svg',
      favicon: 'https://multiasset.com/favicon.ico',
      icon: 'https://multiasset.com/icon.png',
      ogImage: 'https://multiasset.com/og-image.png'
    },
    content: {
      tagline: 'Innovation Through Technology',
      description: 'Leading the future of digital solutions',
      contact: {
        email: 'hello@multiasset.com',
        phone: '+1-555-0123',
        website: 'https://multiasset.com'
      }
    }
  }
});
```

## Validation Best Practices

### 1. Always Validate Before Applying

```typescript
// Good practice: Validate before applying
async function applyBrandSafely(tenantId: string, brandId: string) {
  const brand = await brandConfigService.getBrandConfig(brandId);
  const validation = await brandConfigValidator.validateBrandConfig(brand);
  
  if (!validation.valid) {
    throw new Error(`Brand validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }
  
  if (validation.overallScore < 70) {
    console.warn(`Brand score is low: ${validation.overallScore}/100`);
  }
  
  await brandConfigService.applyBrandConfig(tenantId, brandId);
  console.log('Brand applied successfully!');
}
```

### 2. Use Industry-Specific Validation

```typescript
// Validate with industry context
const healthcareValidation = await brandConfigValidator.validateBrandConfig(brand, {
  strictness: 'standard',
  industry: 'healthcare',
  audience: 'medical-professionals',
  maturity: 'established'
});

// Check for healthcare-specific issues
const healthcareIssues = healthcareValidation.warnings.filter(
  warning => warning.category === 'branding' && warning.message.includes('healthcare')
);
```

### 3. Monitor Validation Scores

```typescript
// Track validation scores over time
async function trackValidationScores(brandId: string) {
  const brand = await brandConfigService.getBrandConfig(brandId);
  const validation = await brandConfigValidator.validateBrandConfig(brand);
  
  const scores = {
    accessibility: validation.accessibilityScore,
    usability: validation.usabilityScore,
    design: validation.designScore,
    branding: validation.brandScore,
    overall: validation.overallScore,
    timestamp: new Date()
  };
  
  // Store scores for analytics
  await storeValidationScores(brandId, scores);
  
  return scores;
}
```

## React Integration Examples

### 1. Brand Configuration Form

```typescript
import { useBrandValidation } from '@/hooks/useBrandValidation';
import { BrandValidationPanel } from '@/components/brand/BrandValidationComponents';

function BrandConfigForm() {
  const [config, setConfig] = useState<TenantBrandConfig | null>(null);
  const { result, isValidating, summary } = useBrandValidation(config);

  const handleSave = async () => {
    if (!config) return;
    
    const validation = await brandConfigValidator.validateBrandConfig(config);
    if (!validation.valid) {
      alert('Please fix validation errors before saving');
      return;
    }
    
    await brandConfigService.createBrandConfig(config);
    alert('Brand configuration saved!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2>Brand Configuration</h2>
        {/* Form fields */}
        <input 
          placeholder="Organization Name"
          onChange={(e) => setConfig(prev => ({ ...prev, brand: { ...prev?.brand, name: e.target.value } }))}
        />
        {/* More form fields */}
        
        <button onClick={handleSave} disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Save Configuration'}
        </button>
      </div>
      
      <div>
        <BrandValidationPanel config={config} />
      </div>
    </div>
  );
}
```

### 2. Brand Selection Component

```typescript
import { ValidationStatusIndicator } from '@/components/brand/BrandValidationComponents';

function BrandSelector({ brands }: { brands: BrandConfig[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {brands.map(brand => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}

function BrandCard({ brand }: { brand: BrandConfig }) {
  const { result } = useBrandValidation(brand);
  
  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{brand.name}</h3>
        <ValidationStatusIndicator result={result} size="sm" />
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
      
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">
          Apply
        </button>
        <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded">
          Edit
        </button>
      </div>
    </div>
  );
}
```

### 3. Real-Time Validation

```typescript
function RealTimeValidationForm() {
  const [config, setConfig] = useState<TenantBrandConfig | null>(null);
  const { result, isValidating, summary } = useBrandValidation(config, {
    autoValidate: true,
    debounceMs: 300
  });

  return (
    <div>
      <h2>Real-Time Brand Configuration</h2>
      
      {/* Form with real-time validation */}
      <div className="space-y-4">
        <div>
          <label>Primary Color</label>
          <input 
            type="color"
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              theme: { 
                ...prev?.theme, 
                colors: { ...prev?.theme?.colors, primary: e.target.value } 
              } 
            }))}
          />
          {result?.errors.find(e => e.path.includes('primary')) && (
            <div className="text-red-600 text-sm">
              {result.errors.find(e => e.path.includes('primary'))?.message}
            </div>
          )}
        </div>
        
        {/* More form fields */}
      </div>
      
      {/* Real-time validation feedback */}
      {isValidating && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span>Validating...</span>
        </div>
      )}
      
      {result && (
        <div className={`p-3 rounded-lg ${result.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {summary?.message}
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting Common Issues

### Issue 1: Validation Always Fails

**Problem**: Brand configuration validation always returns invalid
**Solution**: Check for missing required fields

```typescript
// Check for missing required fields
const requiredFields = [
  'brand.name',
  'theme.colors.primary',
  'theme.typography.fontFamily',
  'theme.logo.initials'
];

const missingFields = requiredFields.filter(field => {
  const value = getNestedValue(config, field);
  return !value || value.trim() === '';
});

if (missingFields.length > 0) {
  console.log('Missing required fields:', missingFields);
}
```

### Issue 2: Colors Not Applying

**Problem**: Brand colors are not being applied to the UI
**Solution**: Ensure CSS variables are being generated

```typescript
// Generate CSS variables for colors
import { generateColorVariables } from '@/lib/design-tokens/multi-brand-generator';

const colorVariables = generateColorVariables(config.theme.colors);
console.log('Generated CSS variables:', colorVariables);

// Apply to document
Object.entries(colorVariables).forEach(([key, value]) => {
  document.documentElement.style.setProperty(key, value);
});
```

### Issue 3: Logo Not Loading

**Problem**: Logo images are not loading
**Solution**: Check URL validity and provide fallbacks

```typescript
// Validate and provide fallback for logo
function validateLogo(logoConfig: LogoConfig) {
  if (!logoConfig.src) {
    return {
      ...logoConfig,
      src: '',
      alt: logoConfig.alt || 'Company Logo',
      initials: logoConfig.initials || 'CL'
    };
  }
  
  // Check if URL is valid
  try {
    new URL(logoConfig.src);
    return logoConfig;
  } catch {
    return {
      ...logoConfig,
      src: '',
      alt: logoConfig.alt || 'Company Logo',
      initials: logoConfig.initials || 'CL'
    };
  }
}
```

### Issue 4: Performance Issues

**Problem**: Brand configuration operations are slow
**Solution**: Enable caching and optimize queries

```typescript
// Enable caching for better performance
const validationResult = await brandConfigValidator.validateBrandConfig(config, {
  strictness: 'standard',
  enableCache: true
});

// Use pagination for large lists
const brands = await brandConfigService.listBrandConfigs(tenantId, {
  page: 1,
  limit: 20,
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

## Migration Examples

### Migrating from Legacy System

```typescript
// Migrate from old branding system
async function migrateLegacyBranding(legacyConfig: LegacyBrandConfig) {
  const newConfig = await brandConfigService.createBrandConfig({
    name: legacyConfig.companyName,
    description: legacyConfig.appName,
    basePreset: 'default',
    overrides: {
      colors: {
        primary: legacyConfig.primaryColor,
        secondary: legacyConfig.secondaryColor,
        accent: legacyConfig.accentColor
      },
      typography: {
        fontFamily: legacyConfig.fontFamily || 'system-ui',
        fontWeights: [400, 500, 600, 700]
      },
      assets: {
        logo: legacyConfig.logoUrl,
        favicon: legacyConfig.faviconUrl
      }
    },
    metadata: {
      version: '2.0.0',
      migratedFrom: 'legacy'
    }
  });
  
  // Validate migrated configuration
  const validation = await brandConfigValidator.validateBrandConfig(newConfig);
  console.log(`Migration result: ${validation.valid ? 'Success' : 'Failed'}`);
  
  return newConfig;
}
```

### Bulk Migration

```typescript
// Migrate multiple configurations
async function bulkMigrateLegacyBrands(legacyConfigs: LegacyBrandConfig[]) {
  const results = [];
  
  for (const legacyConfig of legacyConfigs) {
    try {
      const newConfig = await migrateLegacyBranding(legacyConfig);
      results.push({ success: true, config: newConfig });
    } catch (error) {
      results.push({ success: false, error: error.message, config: legacyConfig });
    }
  }
  
  const successCount = results.filter(r => r.success).length;
  console.log(`Migration complete: ${successCount}/${legacyConfigs.length} successful`);
  
  return results;
}
```

This usage guide provides comprehensive examples and best practices for using the brand configuration system effectively!
