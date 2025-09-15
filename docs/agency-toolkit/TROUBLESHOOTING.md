# Agency Toolkit - Troubleshooting Guide

**Version:** 1.0.0
**Last Updated:** September 14, 2025
**HT-021.4.4:** Agency Toolkit Documentation & Solo Developer Experience

## Quick Fixes

### 🚨 Emergency Reset

If everything is broken, try this sequence:

```bash
# Nuclear option - complete reset
rm -rf node_modules .next
npm install
npm run tokens:build
npm run build
npm run dev
```

### ⚡ Common Quick Fixes

1. **Clear Next.js cache**: `rm -rf .next`
2. **Rebuild dependencies**: `rm -rf node_modules && npm install`
3. **Reset design tokens**: `npm run tokens:build`
4. **Check environment variables**: Verify `.env.local` exists
5. **Restart dev server**: `npm run dev`

## Build Issues

### TypeScript Compilation Errors

#### Error: Cannot find module '@/lib/agency-toolkit'

**Cause:** Path mapping or build order issue

**Solutions:**
```bash
# 1. Check tsconfig.json paths
cat tsconfig.json | grep -A 5 '"paths"'

# 2. Verify file exists
ls -la lib/agency-toolkit/index.ts

# 3. Clear TypeScript cache
rm -rf .next/cache
npx tsc --build --clean
```

#### Error: Type 'X' is not assignable to type 'Y'

**Cause:** Type mismatch in agency toolkit interfaces

**Solutions:**
```typescript
// Check interface definitions
import type { ClientTemplate, IntegrationHook } from '@/lib/agency-toolkit';

// Verify type compatibility
const template: ClientTemplate = {
  // Ensure all required properties are present
  id: 'template-id',
  name: 'Template Name',
  // ... other required properties
};
```

#### Error: Property 'X' does not exist on type 'Y'

**Solutions:**
```typescript
// 1. Check if property exists in interface
// 2. Use optional chaining for optional properties
const value = config?.optionalProperty;

// 3. Type assertion if you're certain
const typedValue = (value as SpecificType).property;
```

### Build Failures

#### Error: "Module not found: Can't resolve 'X'"

**Causes & Solutions:**

1. **Missing dependency**
   ```bash
   npm install missing-package
   ```

2. **Incorrect import path**
   ```typescript
   // Wrong
   import { Component } from './wrong/path';

   // Correct
   import { Component } from '@/components/Component';
   ```

3. **Case sensitivity issues**
   ```bash
   # Check actual filename
   ls -la components/
   ```

#### Error: "Failed to compile - SyntaxError"

**Common causes:**
- Missing semicolons (if using strict mode)
- Invalid JSX syntax
- ES6+ features in wrong context

**Solutions:**
```bash
# Check for syntax errors
npm run lint
npm run type-check
```

### Performance Build Issues

#### Bundle Size Exceeding Limits

**Check bundle size:**
```bash
npm run build:analyze
```

**Common fixes:**
```typescript
// 1. Use dynamic imports
const DynamicComponent = dynamic(() => import('./HeavyComponent'));

// 2. Optimize lodash imports
// Wrong
import _ from 'lodash';

// Right
import { debounce } from 'lodash';

// 3. Remove unused dependencies
npm run build -- --analyze
```

## Runtime Issues

### Agency Toolkit Initialization

#### Error: "Agency toolkit not initialized"

**Cause:** Missing initialization or configuration

**Solutions:**
```typescript
// 1. Verify environment variables
console.log(process.env.NEXT_PUBLIC_AGENCY_TOOLKIT_ENABLED);

// 2. Check initialization in app
import { agencyToolkit } from '@/lib/agency-toolkit';

// 3. Verify configuration
const config = agencyToolkit.getClientOverview('client-id');
```

#### Error: "Template system not available"

**Cause:** Template system not properly initialized

**Solutions:**
```typescript
// Check template system status
import { templateSystem } from '@/lib/agency-toolkit';

// Verify templates are loaded
console.log(templateSystem.getClientTemplates('client-id'));

// Re-initialize if needed
const template = await templateSystem.createTemplate({
  // Template configuration
});
```

### Security Issues

#### Error: "Access denied - security boundary violation"

**Cause:** Client accessing restricted resources

**Debug steps:**
```typescript
// 1. Check security boundary
import { clientSecurityManager } from '@/lib/agency-toolkit';

const boundary = clientSecurityManager.getSecurityBoundary('client-id');
console.log('Security config:', boundary?.config);

// 2. Validate access explicitly
const access = await clientSecurityManager.validateAccess(
  'client-id',
  '/resource/path',
  'read',
  { ip: 'user-ip', userAgent: 'user-agent', route: '/current/route' }
);
console.log('Access result:', access);
```

#### Error: "Rate limit exceeded"

**Cause:** Too many requests from client

**Solutions:**
```typescript
// 1. Check rate limit configuration
const boundary = clientSecurityManager.getSecurityBoundary('client-id');
console.log('Rate limit:', boundary?.config.rateLimit);

// 2. Implement exponential backoff
const delay = Math.pow(2, retryCount) * 1000;
setTimeout(() => retryRequest(), delay);

// 3. Upgrade security tier if needed
const newConfig = {
  ...DEFAULT_SECURITY_CONFIGS.PREMIUM,
  clientId: 'client-id'
};
```

### Integration Issues

#### Error: "Integration hook failed to execute"

**Debug integration hooks:**
```typescript
import { integrationManager } from '@/lib/agency-toolkit';

// 1. Check hook configuration
const hook = integrationManager.getHook('hook-id');
console.log('Hook config:', hook);

// 2. Check hook execution history
const executions = integrationManager.getHookExecutions('hook-id');
console.log('Recent executions:', executions);

// 3. Test hook manually
const execution = await integrationManager.executeHook(
  'hook-id',
  'test-trigger',
  { test: true }
);
console.log('Test execution:', execution);
```

#### Error: "External service timeout"

**Solutions:**
```typescript
// 1. Increase timeout in hook config
const hookConfig = {
  timeout: 60000, // 60 seconds
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
};

// 2. Check service status
const statusResponse = await fetch('https://status.external-service.com');

// 3. Implement fallback
try {
  const result = await executeHook();
} catch (error) {
  const fallbackResult = await executeFallback();
}
```

## Performance Issues

### Slow Rendering

#### Component render time >200ms

**Debug steps:**
```typescript
// 1. Use React DevTools Profiler
// 2. Check component performance
import { usePerformanceMonitorService } from '@/lib/monitoring';

function SlowComponent() {
  const { measureComponent } = usePerformanceMonitorService();

  useEffect(() => {
    const endMeasure = measureComponent('SlowComponent');
    return () => endMeasure('render');
  }, []);

  return <div>Component content</div>;
}
```

**Common fixes:**
```typescript
// 1. Use React.memo
const MemoizedComponent = React.memo(SlowComponent);

// 2. Use useCallback for functions
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 3. Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

### Memory Leaks

#### Memory usage growing over time

**Debug memory:**
```typescript
// 1. Check memory usage
if ('memory' in performance) {
  const memory = (performance as any).memory;
  console.log('Memory usage:', {
    used: memory.usedJSHeapSize / 1024 / 1024,
    total: memory.totalJSHeapSize / 1024 / 1024,
    limit: memory.jsHeapSizeLimit / 1024 / 1024
  });
}

// 2. Check for event listener leaks
useEffect(() => {
  const handler = () => { /* handler logic */ };
  window.addEventListener('event', handler);

  return () => {
    window.removeEventListener('event', handler);
  };
}, []);
```

### Poor Core Web Vitals

#### LCP (Largest Contentful Paint) >2.5s

**Solutions:**
```typescript
// 1. Preload critical resources
// In _document.tsx or layout
<link rel="preload" href="/critical-image.jpg" as="image" />

// 2. Optimize images
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
/>

// 3. Use dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />
});
```

#### CLS (Cumulative Layout Shift) >0.1

**Solutions:**
```typescript
// 1. Reserve space for images
<div style={{ width: '500px', height: '300px' }}>
  <Image src="/image.jpg" fill alt="Description" />
</div>

// 2. Use CSS aspect-ratio
.image-container {
  aspect-ratio: 16 / 9;
}

// 3. Avoid inserting content above existing content
```

## Development Issues

### Hot Reload Not Working

**Solutions:**
```bash
# 1. Check if files are being watched
lsof -i :3000

# 2. Restart dev server
npm run dev

# 3. Clear browser cache
# 4. Check for file permission issues
ls -la pages/

# 5. Disable browser extensions
```

### Environment Variables Not Loading

**Debug steps:**
```bash
# 1. Check file exists
ls -la .env.local

# 2. Verify naming (NEXT_PUBLIC_ prefix for client-side)
cat .env.local | grep NEXT_PUBLIC

# 3. Restart dev server after changes
npm run dev
```

### Database Connection Issues

**Solutions:**
```typescript
// 1. Test connection
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const { data, error } = await supabase.from('test').select('*').limit(1);
console.log('DB test:', { data, error });

// 2. Check environment variables
console.log('DB URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// 3. Verify network connectivity
```

## Monitoring & Debugging Tools

### Performance Monitoring

```bash
# Run performance tests
node scripts/performance-test.mjs

# Build analysis
npm run build:analyze

# Memory profiling (Chrome DevTools)
# 1. Open DevTools
# 2. Go to Memory tab
# 3. Take heap snapshot
# 4. Compare over time
```

### Error Tracking

```typescript
// Manual error reporting
import { captureException } from '@sentry/nextjs';

try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  captureException(error);
}

// Global error boundary
import { ErrorBoundary } from '@/components/ui/error-boundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Network Debugging

```javascript
// Service worker debugging
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});

// Network request interception
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    console.log('SW message:', event.data);
  });
}
```

## Getting Help

### Debug Information to Collect

When reporting issues, include:

```bash
# System info
node --version
npm --version
cat package.json | grep '"version"'

# Build info
npm run build 2>&1 | head -20

# Runtime errors
# Browser console errors
# Network tab for failed requests
```

### Log Analysis

```typescript
// Enable debug logging
localStorage.setItem('debug', 'agency-toolkit:*');

// Check application logs
console.log('App state:', useAppStore.getState());

// Performance metrics
console.log('Performance:', performance.getEntriesByType('navigation'));
```

### Common Error Patterns

```bash
# Search for common issues
grep -r "Cannot find module" .next/
grep -r "Type error" .next/

# Check for circular dependencies
npx madge --circular src/

# Analyze bundle duplicates
npx webpack-bundle-analyzer .next/static/chunks/
```

## Prevention

### Code Quality

```bash
# Run before committing
npm run lint
npm run type-check
npm run test
npm run build
```

### Performance Monitoring

```typescript
// Add performance monitoring to critical paths
useEffect(() => {
  const startTime = performance.now();

  // Critical operation

  const duration = performance.now() - startTime;
  if (duration > 100) {
    console.warn('Slow operation detected:', duration);
  }
}, []);
```

### Regular Maintenance

```bash
# Weekly maintenance
npm audit fix
npm update
npm run test
npm run build

# Monthly maintenance
npx npm-check-updates -u
npm install
```

Remember: When in doubt, check the browser DevTools console, Network tab, and Performance tab for detailed debugging information.