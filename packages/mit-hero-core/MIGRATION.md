# MIT Hero Core Migration Guide

This guide provides step-by-step instructions for migrating from previous versions of MIT Hero Core to the latest version.

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Migration Steps](#migration-steps)
4. [Version-Specific Changes](#version-specific-changes)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Plan](#rollback-plan)

## Overview

The MIT Hero Core module has undergone significant improvements in version 2.0.0, introducing better type safety, improved performance, and enhanced configurability. This migration guide will help you transition smoothly while maintaining system stability.

## Breaking Changes

### Major Changes in v2.0.0

1. **Constructor API**: The `HeroSystem` constructor now requires explicit feature flags
2. **Monitor Interface**: Health monitors now use a more structured configuration
3. **Budget API**: Performance budgets have been simplified and made more flexible
4. **Error Handling**: Custom error types have been introduced
5. **Type Safety**: Improved TypeScript types with stricter validation

### Removed Features

- Automatic feature enabling (now explicit)
- Legacy health check format
- Deprecated performance monitoring methods
- Old circuit breaker configuration

## Migration Steps

### Step 1: Update Dependencies

Update your package.json to use the latest version:

```bash
npm install @mit-hero/core@latest
```

### Step 2: Update Import Statements

Update your import statements to use the new structure:

```typescript
// Old v1.x imports
import { HeroSystem } from '@mit-hero/core';

// New v2.x imports
import { 
  HeroSystem, 
  HealthMonitor, 
  PerformanceBudget,
  CircuitBreaker,
  RetryHelper 
} from '@mit-hero/core';
```

### Step 3: Update Constructor Calls

#### HeroSystem Constructor

```typescript
// Old v1.x code
const hero = new HeroSystem('my-app', '1.0.0');

// New v2.x code
const hero = new HeroSystem({
  name: 'my-app',
  version: '1.0.0',
  environment: 'development',
  features: {
    circuitBreaker: true,
    performanceMonitoring: true,
    retryMechanism: true,
    autonomousRecovery: true
  }
});
```

#### HealthMonitor Constructor

```typescript
// Old v1.x code
const monitor = new HealthMonitor(30000, 5000);

// New v2.x code
const monitor = new HealthMonitor({
  checkInterval: 30000,
  timeout: 5000,
  retries: 3,
  criticalFailureThreshold: 2
});
```

#### PerformanceBudget Constructor

```typescript
// Old v1.x code
const budget = new PerformanceBudget('build', 120000, 1024, 90);

// New v2.x code
const budget = new PerformanceBudget({
  name: 'build',
  maxDuration: 120000,
  maxMemory: 1024,
  maxCPU: 90,
  alertThreshold: 80
});
```

### Step 4: Update Health Check Configuration

```typescript
// Old v1.x code
monitor.addCheck('database', async () => await db.ping());

// New v2.x code
monitor.addCheck({
  name: 'database',
  check: async () => await db.ping(),
  timeout: 5000,
  retries: 2,
  critical: true
});
```

### Step 5: Update Performance Monitoring

```typescript
// Old v1.x code
const startTime = Date.now();
// ... perform operation
const duration = Date.now() - startTime;
budget.checkDuration(duration);

// New v2.x code
const token = budget.startMeasurement();
try {
  // ... perform operation
} finally {
  const result = budget.stopMeasurement(token);
  if (!result.withinBudget) {
    console.warn('Performance budget exceeded:', result.violations);
  }
}
```

### Step 6: Update Circuit Breaker Usage

```typescript
// Old v1.x code
const operation = breaker.wrap(riskyOperation);

// New v2.x code
const operation = breaker.wrap(async () => {
  return await riskyOperation();
});
```

### Step 7: Update Error Handling

```typescript
// Old v1.x code
try {
  await operation();
} catch (error) {
  if (error.message.includes('circuit breaker')) {
    // Handle circuit breaker error
  }
}

// New v2.x code
import { CircuitBreakerError } from '@mit-hero/core';

try {
  await operation();
} catch (error) {
  if (error instanceof CircuitBreakerError) {
    // Handle circuit breaker error
  }
}
```

## Version-Specific Changes

### v1.5.x to v2.0.0

#### Configuration Changes

```typescript
// Old v1.5.x configuration
const config = {
  autoRecovery: true,
  healthCheckInterval: 30000,
  performanceThresholds: {
    build: { maxDuration: 120000 }
  }
};

// New v2.0.0 configuration
const config = {
  features: {
    autonomousRecovery: true
  },
  healthMonitoring: {
    checkInterval: 30000
  },
  performanceBudgets: [
    {
      name: 'build',
      maxDuration: 120000,
      maxMemory: 1024,
      maxCPU: 90
    }
  ]
};
```

#### Method Signature Changes

```typescript
// Old v1.5.x methods
hero.getHealthStatus();
hero.getPerformanceData();
hero.isCircuitBreakerOpen('api');

// New v2.0.0 methods
hero.getHealth();
hero.getPerformanceMetrics();
hero.getCircuitBreakerStatus('api');
```

### v1.0.x to v2.0.0

#### Complete API Overhaul

The v1.0.x to v2.0.0 migration requires a complete rewrite of the integration code due to fundamental architectural changes.

```typescript
// Old v1.0.x code (completely different API)
const hero = HeroSystem.create({
  name: 'my-app',
  config: 'config.json'
});

hero.startMonitoring();
hero.enableAutoRecovery();

// New v2.0.0 code
const hero = new HeroSystem({
  name: 'my-app',
  version: '1.0.0',
  environment: 'development',
  features: {
    autonomousRecovery: true,
    performanceMonitoring: true
  }
});

await hero.start();
```

## Migration Checklist

Use this checklist to ensure a complete migration:

- [ ] Update package.json dependencies
- [ ] Update import statements
- [ ] Update HeroSystem constructor calls
- [ ] Update HealthMonitor constructor calls
- [ ] Update PerformanceBudget constructor calls
- [ ] Update health check configurations
- [ ] Update performance monitoring code
- [ ] Update circuit breaker usage
- [ ] Update error handling
- [ ] Update configuration files
- [ ] Run tests to verify functionality
- [ ] Update documentation
- [ ] Deploy and monitor

## Testing Migration

### Unit Tests

Create comprehensive tests to verify migration:

```typescript
import { HeroSystem, HealthMonitor, PerformanceBudget } from '@mit-hero/core';

describe('Migration Tests', () => {
  it('should create HeroSystem with new API', () => {
    const hero = new HeroSystem({
      name: 'test-app',
      version: '1.0.0',
      environment: 'test'
    });
    
    expect(hero).toBeInstanceOf(HeroSystem);
  });

  it('should create HealthMonitor with new API', () => {
    const monitor = new HealthMonitor({
      checkInterval: 30000,
      timeout: 5000,
      retries: 3
    });
    
    expect(monitor).toBeInstanceOf(HealthMonitor);
  });

  it('should create PerformanceBudget with new API', () => {
    const budget = new PerformanceBudget({
      name: 'test',
      maxDuration: 60000,
      maxMemory: 512,
      maxCPU: 80
    });
    
    expect(budget).toBeInstanceOf(PerformanceBudget);
  });
});
```

### Integration Tests

Test the complete system integration:

```typescript
describe('System Integration', () => {
  let hero: HeroSystem;

  beforeEach(async () => {
    hero = new HeroSystem({
      name: 'integration-test',
      version: '1.0.0',
      environment: 'test',
      features: {
        circuitBreaker: true,
        performanceMonitoring: true
      }
    });
  });

  afterEach(async () => {
    await hero.stop();
  });

  it('should start and stop system', async () => {
    await hero.start();
    expect(hero.getStatus().state).toBe('running');
    
    await hero.stop();
    expect(hero.getStatus().state).toBe('stopped');
  });

  it('should monitor health', async () => {
    await hero.start();
    
    const health = await hero.getHealth();
    expect(health.status).toBeDefined();
  });
});
```

## Troubleshooting

### Common Migration Issues

#### 1. TypeScript Compilation Errors

**Problem:** TypeScript errors after migration

**Solution:** Update type definitions and ensure proper imports

```typescript
// Check for missing types
import type { 
  HeroSystemConfig, 
  HealthMonitorConfig,
  BudgetConfig 
} from '@mit-hero/core';
```

#### 2. Runtime Errors

**Problem:** Runtime errors with new API

**Solution:** Verify all method calls use the new signatures

```typescript
// Old (will cause runtime error)
monitor.addCheck('name', checkFunction);

// New (correct)
monitor.addCheck({
  name: 'name',
  check: checkFunction
});
```

#### 3. Configuration Issues

**Problem:** System not starting with new configuration

**Solution:** Check feature flags and required configuration

```typescript
// Ensure all required fields are provided
const hero = new HeroSystem({
  name: 'my-app',           // Required
  version: '1.0.0',         // Required
  environment: 'development', // Required
  features: {                // Optional but recommended
    circuitBreaker: true,
    performanceMonitoring: true
  }
});
```

### Debug Mode

Enable debug logging during migration:

```typescript
const hero = new HeroSystem({
  name: 'migration-test',
  version: '1.0.0',
  environment: 'development',
  logging: {
    level: 'debug',
    format: 'text',
    destination: 'console'
  }
});
```

## Rollback Plan

### Preparation

Before starting migration, prepare a rollback plan:

1. **Backup Current Code**: Commit all current changes
2. **Create Migration Branch**: Work on a separate branch
3. **Document Current State**: Note current working configuration
4. **Prepare Rollback Script**: Create script to revert changes

### Rollback Steps

If migration fails, follow these steps:

```bash
# 1. Revert to previous version
npm install @mit-hero/core@1.5.0

# 2. Revert code changes
git checkout main
git reset --hard HEAD~1

# 3. Restore previous configuration
# (Manually restore your previous working code)

# 4. Verify system functionality
npm test
npm run build
```

### Rollback Verification

After rollback, verify:

- [ ] System starts successfully
- [ ] All health checks pass
- [ ] Performance monitoring works
- [ ] Circuit breakers function
- [ ] Tests pass
- [ ] No runtime errors

## Performance Considerations

### Migration Performance Impact

The new v2.0.0 architecture provides better performance, but migration may have temporary impacts:

1. **Initial Setup**: Slightly longer startup time due to explicit initialization
2. **Memory Usage**: More efficient memory usage after migration
3. **Runtime Performance**: Improved performance for health checks and monitoring

### Optimization Tips

```typescript
// Optimize health check intervals
const monitor = new HealthMonitor({
  checkInterval: 60000,  // Increase for non-critical checks
  timeout: 3000,         // Reduce timeout for faster failure detection
  retries: 2             // Reduce retries for faster recovery
});

// Use appropriate feature flags
const hero = new HeroSystem({
  name: 'optimized-app',
  version: '1.0.0',
  environment: 'production',
  features: {
    circuitBreaker: true,        // Enable only needed features
    performanceMonitoring: true,
    retryMechanism: false,       // Disable unused features
    autonomousRecovery: false
  }
});
```

## Support and Resources

### Documentation

- [Main README](./README.md)
- [API Documentation](./API.md)
- [Examples](./examples/)

### Community Support

- GitHub Issues: [Report bugs and issues](https://github.com/mit-hero/core/issues)
- GitHub Discussions: [Get help and share solutions](https://github.com/mit-hero/core/discussions)
- Documentation: [Comprehensive guides and tutorials](https://github.com/mit-hero/core/wiki)

### Migration Assistance

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review the examples and API documentation
3. Search existing GitHub issues
4. Create a new issue with detailed information
5. Join community discussions for help

## Conclusion

The migration to MIT Hero Core v2.0.0 provides significant improvements in type safety, performance, and maintainability. While the migration requires careful attention to breaking changes, the benefits far outweigh the migration effort.

Follow this guide step-by-step, test thoroughly, and don't hesitate to seek community support if needed. The result will be a more robust, maintainable, and performant system.

---

**Need Help?** Create an issue on GitHub or join our community discussions!
