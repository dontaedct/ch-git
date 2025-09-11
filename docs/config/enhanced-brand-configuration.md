# Enhanced Brand Configuration System

## Overview

The Enhanced Brand Configuration System extends the existing configuration infrastructure to support client-specific branding with full type safety, validation, and React integration. This system enables runtime brand switching, brand inheritance, and comprehensive brand management capabilities.

## Architecture

### Core Components

1. **BrandConfigService** - Main service class for configuration management
2. **React Hooks** - React integration for UI components
3. **Type System** - Comprehensive TypeScript types for brand configuration
4. **Validation Framework** - Brand configuration validation and error handling
5. **Override System** - Environment, database, and runtime overrides

### Configuration Hierarchy

```
Base Configuration
├── Environment Overrides (highest priority)
├── Database Overrides
├── Runtime Overrides
├── Preset Overrides
└── Default Overrides (lowest priority)
```

## API Reference

### BrandConfigService

#### `getEnhancedConfig(tenantId?: string): Promise<EnhancedAppConfig>`

Loads the complete enhanced configuration with brand support.

```typescript
import { brandConfigService } from '@/lib/config/brand-config-service';

const config = await brandConfigService.getEnhancedConfig('tenant-123');
console.log(config.branding.tenant.organizationName);
```

#### `getBrandOverrides(): Promise<BrandConfigOverride[]>`

Retrieves all brand configuration overrides, sorted by priority.

```typescript
const overrides = await brandConfigService.getBrandOverrides();
const primaryColorOverride = overrides.find(o => o.id === 'brand-primary-color');
```

#### `applyBrandOverride(override: BrandConfigOverride): Promise<boolean>`

Applies a brand configuration override.

```typescript
const override: BrandConfigOverride = {
  id: 'custom-primary-color',
  label: 'Custom Primary Color',
  description: 'Custom primary color override',
  active: true,
  value: '#ff0000',
  path: 'branding.tenant.brandColors.primary',
  priority: 100,
  source: 'user',
  userModifiable: true,
  validation: {
    required: true,
    type: 'string',
    pattern: '^#[0-9A-Fa-f]{6}$'
  }
};

const success = await brandConfigService.applyBrandOverride(override);
```

#### `validateBrandConfig(config: EnhancedAppConfig): Promise<BrandConfigValidationResult>`

Validates a brand configuration for errors and warnings.

```typescript
const validation = await brandConfigService.validateBrandConfig(config);
if (!validation.isValid) {
  console.error('Validation errors:', validation.errors);
}
```

#### `clearCache(): void`

Clears the configuration cache to force reload.

```typescript
brandConfigService.clearCache();
```

### React Hooks

#### `useEnhancedConfig(tenantId?: string)`

Hook for managing enhanced application configuration.

```typescript
import { useEnhancedConfig } from '@/lib/config/brand-config-hooks';

function BrandConfigComponent() {
  const { config, loading, error, refreshConfig } = useEnhancedConfig('tenant-123');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{config?.branding.tenant.organizationName}</h1>
      <button onClick={refreshConfig}>Refresh</button>
    </div>
  );
}
```

#### `useBrandOverrides()`

Hook for managing brand configuration overrides.

```typescript
import { useBrandOverrides } from '@/lib/config/brand-config-hooks';

function OverrideManager() {
  const { 
    overrides, 
    loading, 
    applyOverride, 
    toggleOverride, 
    updateOverrideValue 
  } = useBrandOverrides();

  const handleColorChange = async (overrideId: string, newColor: string) => {
    await updateOverrideValue(overrideId, newColor);
  };

  return (
    <div>
      {overrides.map(override => (
        <div key={override.id}>
          <label>{override.label}</label>
          <input
            type="color"
            value={override.value as string}
            onChange={(e) => handleColorChange(override.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
```

#### `useBrandValidation(config: EnhancedAppConfig | null)`

Hook for brand configuration validation.

```typescript
import { useBrandValidation } from '@/lib/config/brand-config-hooks';

function ValidationStatus({ config }) {
  const { validation, validating } = useBrandValidation(config);

  if (validating) return <div>Validating...</div>;

  return (
    <div>
      <div>Status: {validation?.isValid ? 'Valid' : 'Invalid'}</div>
      <div>Score: {validation?.score}/100</div>
      {validation?.errors.map(error => (
        <div key={error} className="error">{error}</div>
      ))}
    </div>
  );
}
```

#### `useTenantBranding(tenantId?: string)`

Hook for managing tenant branding configuration.

```typescript
import { useTenantBranding } from '@/lib/config/brand-config-hooks';

function BrandEditor() {
  const { 
    branding, 
    updateBranding, 
    updateBrandColors, 
    updateTypography, 
    updateBrandNames 
  } = useTenantBranding('tenant-123');

  const handleColorUpdate = async () => {
    await updateBrandColors({ primary: '#ff0000' });
  };

  const handleNameUpdate = async () => {
    await updateBrandNames({ 
      organizationName: 'New Organization',
      appName: 'New App'
    });
  };

  return (
    <div>
      <input 
        value={branding?.organizationName || ''}
        onChange={(e) => updateBrandNames({ organizationName: e.target.value })}
      />
      <button onClick={handleColorUpdate}>Update Colors</button>
    </div>
  );
}
```

#### `useBrandTheme(tenantId?: string)`

Hook for accessing brand theme data.

```typescript
import { useBrandTheme } from '@/lib/config/brand-config-hooks';

function ThemedComponent() {
  const { 
    theme, 
    brandColors, 
    typography, 
    colorVariants, 
    customFonts 
  } = useBrandTheme('tenant-123');

  return (
    <div style={{ 
      backgroundColor: brandColors?.primary,
      fontFamily: typography?.fontFamily 
    }}>
      Themed Content
    </div>
  );
}
```

#### `useBrandPersistence(tenantId?: string)`

Hook for brand configuration persistence.

```typescript
import { useBrandPersistence } from '@/lib/config/brand-config-hooks';

function BrandManager() {
  const { 
    saving, 
    error, 
    saveBranding, 
    exportBranding, 
    importBranding 
  } = useBrandPersistence('tenant-123');

  const handleExport = async () => {
    const exportData = await exportBranding();
    if (exportData) {
      // Download or copy to clipboard
      navigator.clipboard.writeText(exportData);
    }
  };

  const handleImport = async (file: File) => {
    const text = await file.text();
    await importBranding(text);
  };

  return (
    <div>
      <button onClick={handleExport} disabled={saving}>
        Export Branding
      </button>
      <input type="file" onChange={(e) => handleImport(e.target.files[0])} />
      {error && <div className="error">{error}</div>}
    </div>
  );
}
```

#### `useBrandAnalytics(tenantId?: string)`

Hook for brand configuration analytics.

```typescript
import { useBrandAnalytics } from '@/lib/config/brand-config-hooks';

function AnalyticsDashboard() {
  const { 
    analytics, 
    trackOverrideApplication, 
    trackValidationCheck 
  } = useBrandAnalytics('tenant-123');

  return (
    <div>
      <div>Config Loads: {analytics.configLoads}</div>
      <div>Override Applications: {analytics.overrideApplications}</div>
      <div>Validation Checks: {analytics.validationChecks}</div>
      <div>Last Updated: {analytics.lastUpdated.toLocaleString()}</div>
    </div>
  );
}
```

#### `useDebouncedConfigUpdate(value, delay, onUpdate)`

Hook for debounced configuration updates.

```typescript
import { useDebouncedConfigUpdate } from '@/lib/config/brand-config-hooks';

function ColorPicker({ value, onChange }) {
  const debouncedValue = useDebouncedConfigUpdate(value, 500, onChange);

  return (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

#### `useConfigChangeDetection(config, onConfigChange)`

Hook for detecting configuration changes.

```typescript
import { useConfigChangeDetection } from '@/lib/config/brand-config-hooks';

function ConfigWatcher({ config }) {
  useConfigChangeDetection(config, (newConfig) => {
    console.log('Configuration changed:', newConfig);
  });

  return <div>Watching for changes...</div>;
}
```

## Type Definitions

### EnhancedAppConfig

```typescript
interface EnhancedAppConfig extends MicroAppConfig {
  branding: {
    tenant: TenantBrandingConfig;
    overrides: BrandConfigOverride[];
    validationStatus: 'valid' | 'invalid' | 'pending' | 'warning';
    validationErrors: string[];
    validationWarnings: string[];
  };
  theme: EnhancedThemeTokens;
  integrations: MicroAppConfig['integrations'] & {
    email?: {
      fromAddress: string;
      subjectTemplate: string;
      brandSignature?: string;
      brandFooter?: string;
    };
  };
}
```

### BrandConfigOverride

```typescript
interface BrandConfigOverride {
  id: string;
  label: string;
  description: string;
  active: boolean;
  value: unknown;
  path: string;
  priority: number;
  source: 'environment' | 'database' | 'runtime' | 'preset' | 'user';
  userModifiable: boolean;
  validation?: {
    required?: boolean;
    type?: string;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
  };
}
```

### BrandConfigValidationResult

```typescript
interface BrandConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}
```

## Environment Variables

The system supports the following environment variables for brand configuration:

```bash
# Brand Colors
NEXT_PUBLIC_BRAND_PRIMARY_COLOR=#3b82f6
NEXT_PUBLIC_BRAND_SECONDARY_COLOR=#f59e0b
NEXT_PUBLIC_BRAND_ACCENT_COLOR=#10b981

# Brand Names
NEXT_PUBLIC_ORGANIZATION_NAME="Your Organization"
NEXT_PUBLIC_APP_NAME="Your App"

# Brand Typography
NEXT_PUBLIC_BRAND_FONT_FAMILY="Inter"

# Brand Logo
NEXT_PUBLIC_BRAND_LOGO_URL="https://example.com/logo.png"
NEXT_PUBLIC_BRAND_LOGO_INITIALS="YO"
```

## Usage Examples

### Basic Brand Configuration

```typescript
import { brandConfigService } from '@/lib/config/brand-config-service';

// Load configuration
const config = await brandConfigService.getEnhancedConfig('tenant-123');

// Access brand data
console.log('Organization:', config.branding.tenant.organizationName);
console.log('Primary Color:', config.branding.tenant.brandColors.primary);
console.log('Font Family:', config.branding.tenant.typographyConfig.fontFamily);
```

### Dynamic Brand Switching

```typescript
import { useBrandOverrides } from '@/lib/config/brand-config-hooks';

function BrandSwitcher() {
  const { overrides, updateOverrideValue } = useBrandOverrides();

  const switchToRedTheme = async () => {
    const primaryColorOverride = overrides.find(o => o.id === 'brand-primary-color');
    if (primaryColorOverride) {
      await updateOverrideValue(primaryColorOverride.id, '#ff0000');
    }
  };

  return (
    <button onClick={switchToRedTheme}>
      Switch to Red Theme
    </button>
  );
}
```

### Brand Validation

```typescript
import { useBrandValidation } from '@/lib/config/brand-config-hooks';

function BrandValidator({ config }) {
  const { validation, validating } = useBrandValidation(config);

  if (validating) return <div>Validating brand configuration...</div>;

  return (
    <div>
      <div className={`status ${validation?.isValid ? 'valid' : 'invalid'}`}>
        {validation?.isValid ? '✓ Valid' : '✗ Invalid'}
      </div>
      <div>Score: {validation?.score}/100</div>
      
      {validation?.errors.map(error => (
        <div key={error} className="error">Error: {error}</div>
      ))}
      
      {validation?.warnings.map(warning => (
        <div key={warning} className="warning">Warning: {warning}</div>
      ))}
    </div>
  );
}
```

### Brand Import/Export

```typescript
import { useBrandPersistence } from '@/lib/config/brand-config-hooks';

function BrandManager() {
  const { exportBranding, importBranding } = useBrandPersistence('tenant-123');

  const handleExport = async () => {
    const exportData = await exportBranding();
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brand-config.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const text = await file.text();
      const success = await importBranding(text);
      if (success) {
        alert('Brand configuration imported successfully!');
      }
    }
  };

  return (
    <div>
      <button onClick={handleExport}>Export Branding</button>
      <input type="file" accept=".json" onChange={handleImport} />
    </div>
  );
}
```

## Best Practices

### 1. Use React Hooks for UI Components

Always use the provided React hooks when building UI components that interact with brand configuration:

```typescript
// ✅ Good
function BrandColorPicker() {
  const { branding, updateBrandColors } = useTenantBranding();
  // ...
}

// ❌ Avoid
function BrandColorPicker() {
  const [config, setConfig] = useState(null);
  useEffect(() => {
    brandConfigService.getEnhancedConfig().then(setConfig);
  }, []);
  // ...
}
```

### 2. Validate Before Applying Changes

Always validate brand configuration before applying changes:

```typescript
const { validation } = useBrandValidation(config);
if (!validation?.isValid) {
  console.error('Cannot apply changes: validation failed');
  return;
}
```

### 3. Use Debounced Updates for Real-time Changes

For real-time brand updates (like color pickers), use debounced updates:

```typescript
const debouncedValue = useDebouncedConfigUpdate(colorValue, 300, (value) => {
  updateBrandColors({ primary: value });
});
```

### 4. Handle Loading and Error States

Always handle loading and error states in your components:

```typescript
function BrandConfigComponent() {
  const { config, loading, error } = useEnhancedConfig();

  if (loading) return <div>Loading brand configuration...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config) return <div>No configuration available</div>;

  return <div>{/* Your component */}</div>;
}
```

### 5. Use TypeScript for Type Safety

Leverage TypeScript for full type safety:

```typescript
import type { EnhancedAppConfig, BrandConfigOverride } from '@/lib/config/brand-config-service';

function processConfig(config: EnhancedAppConfig) {
  // TypeScript will enforce correct property access
  const orgName = config.branding.tenant.organizationName;
  const primaryColor = config.branding.tenant.brandColors.primary;
}
```

## Migration Guide

### From Basic Configuration to Enhanced Configuration

1. **Update imports**:
   ```typescript
   // Old
   import { getAppConfig } from '@/app.config.base';
   
   // New
   import { useEnhancedConfig } from '@/lib/config/brand-config-hooks';
   ```

2. **Update configuration access**:
   ```typescript
   // Old
   const config = getAppConfig();
   const primaryColor = config.presetData?.theme.colors.primary;
   
   // New
   const { config } = useEnhancedConfig();
   const primaryColor = config?.branding.tenant.brandColors.primary;
   ```

3. **Update theme access**:
   ```typescript
   // Old
   const theme = config.presetData?.theme;
   
   // New
   const { theme, brandColors, typography } = useBrandTheme();
   ```

## Troubleshooting

### Common Issues

1. **Configuration not loading**: Check that the tenant ID is correct and the service is properly initialized.

2. **Overrides not applying**: Verify that the override path is correct and the validation rules are met.

3. **Validation errors**: Check the validation result for specific error messages and fix the configuration accordingly.

4. **Type errors**: Ensure you're using the correct TypeScript types and importing from the right modules.

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
NEXT_PUBLIC_BRAND_CONFIG_DEBUG=true
```

This will log detailed information about configuration loading, override application, and validation.

## Performance Considerations

- Configuration is cached after first load
- Use `clearCache()` only when necessary
- Debounce real-time updates to avoid excessive API calls
- Use React hooks' memoization features for expensive computations

## Security Considerations

- Environment variables are read-only and cannot be modified by users
- Database overrides require proper authentication
- User overrides are validated before application
- Sensitive configuration should not be exposed to the client

---

This enhanced configuration system provides a robust foundation for client-specific branding while maintaining type safety, performance, and developer experience.
