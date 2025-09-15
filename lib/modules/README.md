# Basic Module Registry & Tenant Theming System

**HT-022.3.1 & HT-022.3.2 Implementation**

A comprehensive module system for agency micro-app toolkit with activation capabilities, basic dependency management, simple version control, and complete tenant theming with configuration management.

## Features

### 🏗️ Module Registry
- **Simple Registration**: Register modules with metadata, dependencies, and tier restrictions
- **Activation Management**: Activate/deactivate modules per tenant with lifecycle hooks
- **Dependency Resolution**: Basic dependency validation and circular dependency detection
- **Version Control**: Simple version tracking and update management

### 🔧 Configuration Management
- **Schema Validation**: Zod-based configuration validation with type safety
- **Tenant Overrides**: Per-tenant configuration with inheritance from defaults
- **Config Templates**: Pre-built configuration schemas for common modules
- **Import/Export**: Configuration backup and migration utilities

### 🔄 Lifecycle Management
- **Event Hooks**: Before/after activation, deactivation, and error events
- **Built-in Logging**: Automatic event logging and metrics tracking
- **Error Handling**: Comprehensive error reporting and recovery
- **Event History**: Audit trail of all module lifecycle events

### 🎨 Tenant Theming System
- **Multi-Tenant Themes**: Per-tenant theme management with inheritance from default
- **Theme Presets**: Built-in professional themes (Blue, Green, Purple)
- **Customization Support**: Allow per-tenant theme customizations with restrictions
- **Token-Based Design**: Complete design token system with colors, typography, spacing
- **Theme Activation**: Simple theme switching with customization overlay

### 🔒 Data Separation & Security
- **Tenant Isolation**: Complete data separation between tenants
- **Access Validation**: Multi-tenant security with access control policies
- **Configuration Inheritance**: Controlled inheritance from default configurations
- **Audit Logging**: Comprehensive audit trail for security and compliance
- **Data Sanitization**: Automatic cross-tenant data reference removal

## Quick Start

### Basic Module Operations

```typescript
import {
  activateModule,
  deactivateModule,
  getActiveModulesForTenant,
  getModuleInfo
} from '@/lib/modules'

// Activate a module for a tenant
const result = await activateModule('questionnaire-engine', 'tenant-123', {
  maxSteps: 8,
  progressStyle: 'steps'
})

// Check activation result
if (result.success) {
  console.log('Module activated:', result.message)
} else {
  console.error('Activation failed:', result.message)
}

// Get active modules for tenant
const activeModules = getActiveModulesForTenant('tenant-123')
console.log('Active modules:', activeModules.map(m => m.label))

// Deactivate module
const deactivated = await deactivateModule('questionnaire-engine', 'tenant-123')
console.log('Deactivation success:', deactivated)
```

### Configuration Management

```typescript
import {
  getModuleConfig,
  setModuleConfig,
  validateModuleConfig
} from '@/lib/modules'

// Get module configuration
const config = getModuleConfig('consultation-generator', 'tenant-123')
console.log('Current config:', config)

// Update module configuration
const updated = setModuleConfig('consultation-generator', {
  aiProvider: 'anthropic',
  maxTokens: 3000,
  temperature: 0.8
}, 'tenant-123')

// Validate configuration before setting
const validation = validateModuleConfig('consultation-generator', {
  aiProvider: 'invalid-provider', // This will fail validation
  maxTokens: 5000
})

if (!validation.valid) {
  console.error('Invalid config:', validation.errors)
}
```

### Lifecycle Hooks

```typescript
import { onModuleActivation, onModuleError } from '@/lib/modules'

// Register custom activation hook
onModuleActivation(async (data) => {
  console.log(`Module ${data.moduleId} activated for ${data.tenantId}`)
  // Send activation notification, update metrics, etc.
})

// Register error handler
onModuleError(async (data) => {
  console.error(`Module error in ${data.moduleId}:`, data.error?.message)
  // Send error notification, log to external service, etc.
})
```

### Tenant Theming

```typescript
import {
  getTenantActiveTheme,
  activateThemeForTenant,
  getTenantThemes,
  setTenantModuleConfiguration
} from '@/lib/modules'

// Get active theme for a tenant
const activeTheme = getTenantActiveTheme('tenant-123')
console.log('Current theme:', activeTheme?.displayName)

// Activate a theme with customizations
const result = activateThemeForTenant('tenant-123', 'default-green', {
  colors: {
    primary: '#059669' // Custom green shade
  }
})

if (result.success) {
  console.log('Theme activated:', result.appliedTokens)
}

// Get all available themes for tenant
const themes = getTenantThemes('tenant-123')
console.log('Available themes:', themes.map(t => t.displayName))

// Configure module for specific tenant
setTenantModuleConfiguration('tenant-123', 'theme-customizer', {
  allowCustomColors: true,
  maxThemes: 3,
  previewMode: true
})
```

### Tenant Security

```typescript
import {
  validateTenantAccess,
  sanitizeDataForTenant,
  getTenantSecurityHealth
} from '@/lib/modules'

// Validate tenant access
const access = validateTenantAccess('tenant-a', 'tenant-b', 'theme-customize', 'theme')
if (!access.allowed) {
  console.error('Access denied:', access.reason)
}

// Sanitize data for tenant isolation
const userThemes = [
  { tenantId: 'tenant-a', theme: 'blue' },
  { tenantId: 'tenant-b', theme: 'green' }
]
const sanitized = sanitizeDataForTenant('tenant-a', userThemes)
// Only returns theme for tenant-a

// Check security health
const health = getTenantSecurityHealth('tenant-123')
console.log('Security score:', health.score)
console.log('Issues:', health.issues)
```

## Available Modules

### Core Modules
- **`questionnaire-engine`** - Core questionnaire functionality (Foundation+)
- **`consultation-generator`** - AI-powered consultation reports (Growth+)
- **`theme-customizer`** - Client branding and theming (All tiers)
- **`email-integration`** - Email service integration (Growth+)
- **`analytics-basic`** - Simple usage tracking (All tiers)

### Module Dependencies
- `consultation-generator` → requires `questionnaire-engine`
- `email-integration` → requires `consultation-generator`

## Configuration Schemas

### Questionnaire Engine
```typescript
{
  maxSteps: number (1-50, default: 10),
  allowSkipRequired: boolean (default: false),
  saveProgress: boolean (default: true),
  progressStyle: 'thinBar' | 'steps' | 'percentage' (default: 'thinBar')
}
```

### Consultation Generator
```typescript
{
  aiProvider: 'openai' | 'anthropic' | 'local' (default: 'openai'),
  maxTokens: number (100-4000, default: 2000),
  temperature: number (0-1, default: 0.7),
  includeRecommendations: boolean (default: true)
}
```

### Theme Customizer
```typescript
{
  allowCustomColors: boolean (default: true),
  allowCustomFonts: boolean (default: false),
  maxThemes: number (1-10, default: 5),
  previewMode: boolean (default: true)
}
```

## API Reference

### Registry Functions
- `activateModule(moduleId, tenantId?, config?)` - Activate module with optional config
- `deactivateModule(moduleId, tenantId?)` - Deactivate module for tenant
- `getActiveModulesForTenant(tenantId?)` - Get all active modules for tenant
- `getModuleInfo(moduleId)` - Get module metadata and status
- `getAllAvailableModules()` - Get all registered modules
- `getModulesForTier(tier)` - Get modules available for specific tier

### Configuration Functions
- `getModuleConfig(moduleId, tenantId?)` - Get merged module configuration
- `setModuleConfig(moduleId, config, tenantId?)` - Set module configuration
- `validateModuleConfig(moduleId, config)` - Validate configuration against schema
- `registerModuleConfigSchema(moduleId, schema)` - Register Zod validation schema

### Lifecycle Functions
- `onModuleActivation(hook)` - Register activation hook
- `onModuleDeactivation(hook)` - Register deactivation hook
- `onModuleError(hook)` - Register error handler
- `getModuleLifecycleStatus(moduleId, tenantId)` - Get lifecycle status and history

## Integration Examples

### With Existing Module System
```typescript
// Migration from existing system
import { getLegacyModuleRegistry } from '@/lib/modules'

// Convert to legacy format for existing code
const legacyRegistry = getLegacyModuleRegistry('tenant-123')
console.log('Legacy format:', legacyRegistry)
```

### Custom Module Registration
```typescript
import { moduleRegistry } from '@/lib/modules'

// Register custom module
moduleRegistry.registerModule({
  id: 'custom-analytics',
  label: 'Custom Analytics',
  description: 'Advanced analytics dashboard',
  version: '1.0.0',
  status: 'inactive',
  dependencies: ['analytics-basic'],
  tiers: ['enterprise']
})
```

## Error Handling

The system provides comprehensive error handling with detailed error messages:

```typescript
const result = await activateModule('non-existent-module')
if (!result.success) {
  switch (result.status) {
    case 'failed':
      console.error('Module not found:', result.message)
      break
    case 'dependency_missing':
      console.error('Dependencies missing:', result.dependencyErrors)
      break
  }
}
```

## Verification Checkpoints ✅

### HT-022.3.1: Basic Module Registry & Management System
- ✅ **Basic module registry system implemented** - Core registry with registration, activation, and metadata management
- ✅ **Simple activation working** - Module activation with dependency validation and tenant isolation
- ✅ **Basic module dependency resolution functional** - Dependency validation with circular dependency detection
- ✅ **Simple version management system operational** - Version tracking and update capabilities
- ✅ **Basic module lifecycle management implemented** - Comprehensive lifecycle hooks and event system

### HT-022.3.2: Simple Tenant Theming & Configuration
- ✅ **Simple tenant theming architecture implemented** - Multi-tenant theme management with inheritance
- ✅ **Per-tenant configuration system functional** - Complete per-tenant configuration with validation
- ✅ **Basic data separation enforced** - Tenant isolation with cross-tenant access prevention
- ✅ **Simple configuration inheritance working** - Controlled inheritance from default configurations
- ✅ **Basic multi-tenant security validated** - Comprehensive security policies and audit logging

## Performance Considerations

- **Memory Efficient**: Modules stored in Map structures for O(1) lookups
- **Async Operations**: All activation/deactivation operations are async to prevent blocking
- **Event Batching**: Lifecycle events are batched to reduce overhead
- **Configuration Caching**: Default configurations cached to reduce I/O

## Security Features

- **Schema Validation**: All configurations validated before application
- **Tenant Isolation**: Complete separation of module states between tenants
- **Dependency Validation**: Prevents activation of modules with missing dependencies
- **Error Boundaries**: Comprehensive error handling prevents system crashes