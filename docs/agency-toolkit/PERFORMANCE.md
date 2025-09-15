# Agency Toolkit - Performance Guide

**Version:** 1.0.0
**Last Updated:** September 14, 2025
**HT-021.4.4:** Agency Toolkit Documentation & Solo Developer Experience

## Performance Targets

### 🎯 Rapid Delivery Targets

For ≤7-day client delivery, we maintain strict performance budgets:

| Metric | Target | Critical Threshold |
|--------|--------|--------------------|
| Component Render Time | <200ms | 300ms |
| Bundle Size | <1MB | 1.5MB |
| First Contentful Paint (FCP) | <1.8s | 3s |
| Largest Contentful Paint (LCP) | <2.5s | 4s |
| First Input Delay (FID) | <100ms | 300ms |
| Cumulative Layout Shift (CLS) | <0.1 | 0.25 |
| Memory Usage | <50MB | 100MB |
| Client Customization Time | <500ms | 1s |

### 📊 Performance Monitoring

```typescript
import { PerformanceValidator } from '@/lib/agency-toolkit';

// Run complete validation
const validator = new PerformanceValidator();
const report = await validator.runCompleteValidation();

console.log(`Performance Score: ${report.summary.overallScore}/100`);
console.log(`Passed: ${report.summary.passedTargets}/${report.summary.totalTargets}`);
```

## Component Performance Optimization

### 🚀 React Performance Best Practices

#### 1. Use React.memo for Pure Components

```typescript
// ❌ Avoid - Component re-renders unnecessarily
function ExpensiveComponent({ data, settings }) {
  const expensiveCalculation = () => {
    // Heavy computation
    return data.reduce((acc, item) => acc + item.value, 0);
  };

  return <div>{expensiveCalculation()}</div>;
}

// ✅ Optimized - Memoized component with useMemo
const OptimizedComponent = React.memo(({ data, settings }) => {
  const calculatedValue = useMemo(() => {
    return data.reduce((acc, item) => acc + item.value, 0);
  }, [data]);

  return <div>{calculatedValue}</div>;
});
```

#### 2. Optimize Event Handlers with useCallback

```typescript
// ❌ Avoid - New function on every render
function ParentComponent() {
  const [count, setCount] = useState(0);

  return (
    <ChildComponent
      onClick={() => setCount(count + 1)} // New function every render
    />
  );
}

// ✅ Optimized - Memoized callback
function OptimizedParentComponent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}
```

#### 3. Component Lazy Loading

```typescript
// ✅ Dynamic imports for code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // If component doesn't need SSR
});

// ✅ Conditional loading based on visibility
const ConditionalComponent = dynamic(() => import('./ConditionalComponent'), {
  loading: () => <div>Loading...</div>
});

function App() {
  const [showHeavy, setShowHeavy] = useState(false);

  return (
    <div>
      <button onClick={() => setShowHeavy(true)}>
        Load Heavy Component
      </button>
      {showHeavy && <HeavyComponent />}
    </div>
  );
}
```

### 📱 Agency Toolkit Component Optimization

#### Template Rendering Performance

```typescript
// ✅ Optimized template component
const ClientTemplate = memo(({ template, client }: ClientTemplateProps) => {
  const { getBrandClasses } = useBrandStyling();

  // Memoize expensive theme calculations
  const themeClasses = useMemo(() => {
    return getBrandClasses(template.layout.content.padding);
  }, [template.layout.content.padding, getBrandClasses]);

  // Lazy load non-critical components
  const Footer = useMemo(() =>
    template.layout.footer.enabled
      ? dynamic(() => import('./TemplateFooter'))
      : null,
    [template.layout.footer.enabled]
  );

  return (
    <div className={themeClasses}>
      <TemplateHeader config={template.layout.header} />
      <main>{children}</main>
      {Footer && <Footer config={template.layout.footer} />}
    </div>
  );
});
```

#### Integration Hook Performance

```typescript
// ✅ Optimized hook execution with caching
class PerformantIntegrationManager extends IntegrationHookManager {
  private executionCache = new Map<string, { result: any; timestamp: number }>();

  async executeHook(hookId: string, trigger: string, context: any) {
    const cacheKey = `${hookId}:${trigger}:${JSON.stringify(context)}`;
    const cached = this.executionCache.get(cacheKey);

    // Use cache for identical requests within 5 minutes
    if (cached && Date.now() - cached.timestamp < 300000) {
      return cached.result;
    }

    const result = await super.executeHook(hookId, trigger, context);
    this.executionCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // Clean old cache entries
    this.cleanCache();

    return result;
  }

  private cleanCache() {
    const now = Date.now();
    for (const [key, value] of this.executionCache) {
      if (now - value.timestamp > 300000) {
        this.executionCache.delete(key);
      }
    }
  }
}
```

## Bundle Optimization

### 📦 Code Splitting Strategies

#### 1. Route-Based Splitting

```typescript
// app/dashboard/page.tsx - Automatic route splitting
export default function DashboardPage() {
  return <Dashboard />;
}

// Additional dynamic splitting within routes
const AnalyticsPanel = dynamic(() => import('./AnalyticsPanel'));
const ReportsPanel = dynamic(() => import('./ReportsPanel'));

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'analytics' && <AnalyticsPanel />}
      {activeTab === 'reports' && <ReportsPanel />}
    </div>
  );
}
```

#### 2. Library Splitting

```typescript
// ✅ Import specific functions instead of entire libraries
import { debounce } from 'lodash/debounce';
import { format } from 'date-fns/format';

// ❌ Avoid importing entire libraries
import _ from 'lodash'; // Imports entire lodash
import * as dateFns from 'date-fns'; // Imports entire date-fns
```

#### 3. Agency Toolkit Selective Imports

```typescript
// ✅ Import only what you need
import { templateSystem } from '@/lib/agency-toolkit/template-system';
import { integrationManager } from '@/lib/agency-toolkit/integration-hooks';

// ❌ Avoid importing entire toolkit unnecessarily
import * as agencyToolkit from '@/lib/agency-toolkit'; // Imports everything
```

### 🗜️ Bundle Analysis

```bash
# Analyze bundle size
npm run build:analyze

# Check specific chunks
npx webpack-bundle-analyzer .next/static/chunks/

# Monitor bundle size changes
echo "Bundle sizes:" > bundle-report.txt
find .next/static/chunks -name "*.js" -exec wc -c {} + >> bundle-report.txt
```

## Core Web Vitals Optimization

### 🎨 Largest Contentful Paint (LCP) <2.5s

#### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Optimized images with Next.js
function OptimizedImage() {
  return (
    <Image
      src="/hero-image.jpg"
      alt="Hero image"
      width={1200}
      height={600}
      priority // For above-the-fold images
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..." // Low-quality placeholder
    />
  );
}

// ✅ Responsive images
function ResponsiveImage() {
  return (
    <Image
      src="/image.jpg"
      alt="Responsive image"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      fill
      style={{ objectFit: 'cover' }}
    />
  );
}
```

#### Resource Preloading

```typescript
// app/layout.tsx or _document.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/critical-image.jpg" as="image" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://api.stripe.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### ⚡ First Input Delay (FID) <100ms

#### Optimize JavaScript Execution

```typescript
// ✅ Use Web Workers for heavy calculations
// workers/calculation.worker.js
self.onmessage = function(e) {
  const result = performHeavyCalculation(e.data);
  self.postMessage(result);
};

// Main thread
function useHeavyCalculation(data) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const worker = new Worker('/workers/calculation.worker.js');
    worker.postMessage(data);
    worker.onmessage = (e) => {
      setResult(e.data);
    };

    return () => worker.terminate();
  }, [data]);

  return result;
}
```

#### Debounce User Interactions

```typescript
// ✅ Debounce expensive operations
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery) {
        const results = await searchAPI(searchQuery);
        setResults(results);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 🎢 Cumulative Layout Shift (CLS) <0.1

#### Reserve Space for Dynamic Content

```css
/* ✅ Reserve space with aspect-ratio */
.image-container {
  aspect-ratio: 16 / 9;
  width: 100%;
}

.skeleton {
  width: 100%;
  height: 200px; /* Exact height of content */
}

/* ✅ Font loading without layout shift */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
  font-display: swap;
  size-adjust: 100%; /* Adjust to match fallback font */
}
```

#### Avoid Layout Shifts

```typescript
// ✅ Load content with placeholders
function ContentWithSkeleton() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(null);

  return (
    <div style={{ minHeight: '200px' }}> {/* Reserve minimum space */}
      {loading ? (
        <Skeleton height={200} /> // Exact same height as content
      ) : (
        <ContentComponent data={content} />
      )}
    </div>
  );
}
```

## Memory Optimization

### 🧠 Memory Management

#### Prevent Memory Leaks

```typescript
// ✅ Proper cleanup in useEffect
function ComponentWithCleanup() {
  useEffect(() => {
    const subscription = dataSource.subscribe(handleData);
    const timer = setInterval(updateData, 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // ✅ Cleanup event listeners
  useEffect(() => {
    const handleScroll = () => { /* scroll logic */ };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return <div>Component content</div>;
}
```

#### Optimize State Management

```typescript
// ✅ Use refs for values that don't trigger re-renders
function OptimizedComponent() {
  const [displayValue, setDisplayValue] = useState('');
  const internalValueRef = useRef(''); // Won't cause re-renders

  const updateValue = useCallback((newValue: string) => {
    internalValueRef.current = newValue;
    // Only update display value when needed
    setDisplayValue(newValue.slice(0, 100)); // Truncate for display
  }, []);

  return <input onChange={e => updateValue(e.target.value)} />;
}
```

### 📊 Memory Monitoring

```typescript
// Memory monitoring utility
function useMemoryMonitor() {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);

        if (used > 50) { // 50MB threshold
          console.warn(`High memory usage: ${used}MB`);
        }

        return {
          used: used,
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
      }
    };

    const interval = setInterval(checkMemory, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);
}
```

## Client Theming Performance

### 🎨 Theme Application Optimization

#### CSS Variable Optimization

```typescript
// ✅ Optimize CSS variable updates
function useOptimizedTheming() {
  const applyTheme = useCallback((theme: ClientThemeConfig) => {
    // Batch CSS variable updates
    const root = document.documentElement;
    const updates: [string, string][] = [];

    Object.entries(theme.colors).forEach(([key, value]) => {
      updates.push([`--color-${key}`, value]);
    });

    // Apply all updates in a single operation
    requestAnimationFrame(() => {
      updates.forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    });
  }, []);

  return { applyTheme };
}
```

#### Theme Caching

```typescript
// ✅ Cache compiled themes
class ThemeCache {
  private cache = new Map<string, CompiledTheme>();
  private maxSize = 50;

  getCompiledTheme(themeConfig: ClientThemeConfig): CompiledTheme {
    const cacheKey = this.generateThemeHash(themeConfig);

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const compiled = this.compileTheme(themeConfig);

    // Implement LRU cache
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, compiled);
    return compiled;
  }

  private compileTheme(config: ClientThemeConfig): CompiledTheme {
    // Theme compilation logic
    return {
      cssVariables: this.generateCSSVariables(config),
      componentClasses: this.generateComponentClasses(config)
    };
  }

  private generateThemeHash(config: ClientThemeConfig): string {
    return btoa(JSON.stringify(config));
  }
}
```

## Performance Testing

### 🧪 Automated Performance Testing

```bash
# Run performance validation
node scripts/performance-test.mjs

# Continuous performance monitoring
npm run test:performance -- --watch

# Performance regression testing
npm run test:performance -- --baseline=previous-build
```

### 📈 Custom Performance Metrics

```typescript
// Custom performance tracking
function useCustomPerformanceMetrics() {
  const { recordCustomMetric } = usePerformanceMonitorService();

  const trackComponentMount = useCallback((componentName: string) => {
    return performance.mark(`${componentName}-mount-start`);
  }, []);

  const trackComponentReady = useCallback((componentName: string) => {
    performance.mark(`${componentName}-mount-end`);
    performance.measure(
      `${componentName}-mount-duration`,
      `${componentName}-mount-start`,
      `${componentName}-mount-end`
    );

    const measure = performance.getEntriesByName(`${componentName}-mount-duration`)[0];
    recordCustomMetric(`component-mount-${componentName}`, measure.duration);
  }, [recordCustomMetric]);

  return { trackComponentMount, trackComponentReady };
}
```

## Performance Best Practices Checklist

### ✅ Development Checklist

- [ ] Components render in <200ms
- [ ] Bundle size <1MB
- [ ] Images optimized with next/image
- [ ] Critical resources preloaded
- [ ] Code split by routes and features
- [ ] Event handlers memoized with useCallback
- [ ] Expensive calculations memoized with useMemo
- [ ] Proper cleanup in useEffect hooks
- [ ] Memory usage monitored and optimized
- [ ] Core Web Vitals targets met

### ✅ Production Checklist

- [ ] Performance budget monitoring active
- [ ] Error tracking configured
- [ ] CDN configured for static assets
- [ ] Compression enabled (gzip/brotli)
- [ ] Service worker for caching
- [ ] Database queries optimized
- [ ] API response times <500ms
- [ ] Regular performance audits scheduled

### 🔧 Tools & Resources

#### Performance Analysis Tools
- Chrome DevTools Performance tab
- Lighthouse CI for automated audits
- webpack-bundle-analyzer
- React DevTools Profiler

#### Monitoring Services
- Sentry for error tracking
- Vercel Analytics for Core Web Vitals
- Custom performance monitoring dashboard

#### Testing Tools
```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Bundle analyzer
npm run build:analyze

# Performance testing
node scripts/performance-test.mjs
```

Remember: Performance optimization is an ongoing process. Regular monitoring and testing ensure your agency toolkit continues to meet rapid delivery targets while maintaining excellent user experience.