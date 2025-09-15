# Basic Accessibility & Performance Optimization

**HT-022.2.3: Basic Accessibility & Performance Optimization Implementation**

## Overview

A comprehensive accessibility and performance optimization system designed for WCAG 2.1 AA compliance with component render time monitoring and optimization.

## Features

✅ **WCAG 2.1 AA Compliance** - Full accessibility compliance
✅ **Component Render Times <200ms** - Performance monitoring and optimization
✅ **Keyboard Navigation** - Comprehensive keyboard support
✅ **Screen Reader Compatibility** - ARIA attributes and announcements
✅ **Performance Monitoring** - Real-time component performance tracking

## Quick Start

### 1. Setup Accessibility & Performance Provider

```tsx
import { AccessibilityAndPerformanceProvider } from '@/components/ui/atomic/accessibility';

function App() {
  return (
    <AccessibilityAndPerformanceProvider>
      <YourApp />
    </AccessibilityAndPerformanceProvider>
  );
}
```

### 2. Import Accessibility CSS

```css
@import '@/components/ui/atomic/accessibility/accessibility.css';
```

### 3. Add Skip Link

```tsx
import { SkipLink } from '@/components/ui/atomic/accessibility';

function Layout() {
  return (
    <>
      <SkipLink />
      <main id="main-content">
        <YourContent />
      </main>
    </>
  );
}
```

## Accessibility Features

### System Preference Detection
- **Reduced Motion**: Automatically detects `prefers-reduced-motion`
- **High Contrast**: Responds to `prefers-contrast: high`
- **Screen Reader Mode**: Detects screen reader usage patterns

### Keyboard Navigation
```tsx
import { useKeyboardShortcuts, useFocusTrap } from '@/components/ui/atomic/accessibility';

function Component() {
  const trapRef = useFocusTrap(true);

  useKeyboardShortcuts({
    'escape': () => closeModal(),
    'ctrl+s': () => saveData(),
    'alt+h': () => showHelp()
  });

  return <div ref={trapRef}>Modal content</div>;
}
```

### Screen Reader Support
```tsx
import {
  ARIA,
  useStatusAnnouncer,
  ScreenReaderOnly
} from '@/components/ui/atomic/accessibility';

function Form() {
  const { announceSuccess, announceError } = useStatusAnnouncer();

  return (
    <form>
      <input
        {...ARIA.required(true)}
        {...ARIA.describedBy('help-text')}
        aria-label="Email address"
      />
      <ScreenReaderOnly>
        This field is required for account creation
      </ScreenReaderOnly>
      <div id="help-text">Enter your email address</div>
    </form>
  );
}
```

### Focus Management
```tsx
import { useRovingTabIndex, useAutoFocus } from '@/components/ui/atomic/accessibility';

function Toolbar() {
  const toolbarRef = useRovingTabIndex(true, 'horizontal');

  return (
    <div ref={toolbarRef} role="toolbar">
      <button>Save</button>
      <button>Copy</button>
      <button>Paste</button>
    </div>
  );
}
```

## Performance Features

### Component Monitoring
```tsx
import { useRenderPerformance, withPerformanceMonitoring } from '@/components/ui/atomic/accessibility';

// Hook-based monitoring
function MyComponent() {
  useRenderPerformance('MyComponent');
  return <div>Content</div>;
}

// HOC-based monitoring
const OptimizedComponent = withPerformanceMonitoring(MyComponent, 'MyComponent');
```

### Performance Optimization
```tsx
import {
  optimizeComponent,
  VirtualScroll,
  LazyLoad,
  DebouncedInput
} from '@/components/ui/atomic/accessibility';

// Optimize component with memoization and monitoring
const OptimizedButton = optimizeComponent(Button, {
  memoize: true,
  monitoring: true,
  lazyLoad: false
});

// Virtual scrolling for large lists
<VirtualScroll
  items={largeDataset}
  itemHeight={50}
  containerHeight={400}
  renderItem={(item) => <ItemComponent item={item} />}
/>

// Lazy load heavy components
<LazyLoad>
  <HeavyComponent />
</LazyLoad>

// Debounced input
<DebouncedInput
  onDebouncedChange={(value) => search(value)}
  debounceMs={300}
/>
```

### Performance Metrics
```tsx
import { PerformanceMetrics, usePerformance } from '@/components/ui/atomic/accessibility';

function DevTools() {
  const { metrics, getSlowComponents } = usePerformance();

  return (
    <div>
      <PerformanceMetrics /> {/* Development only */}
      <p>Total renders: {metrics.renderCount}</p>
      <p>Slow components: {getSlowComponents(200).length}</p>
    </div>
  );
}
```

## Accessibility Settings

### User Preferences
```tsx
import { useAccessibility } from '@/components/ui/atomic/accessibility';

function AccessibilitySettings() {
  const { settings, updateSetting } = useAccessibility();

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
        />
        Reduce motion
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={(e) => updateSetting('highContrast', e.target.checked)}
        />
        High contrast
      </label>

      <label>
        <input
          type="checkbox"
          checked={settings.largeText}
          onChange={(e) => updateSetting('largeText', e.target.checked)}
        />
        Large text
      </label>
    </div>
  );
}
```

## WCAG 2.1 AA Compliance

### Color Contrast
- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **High contrast mode**: Automatic high contrast detection

### Keyboard Navigation
- **Tab order**: Logical tab sequence
- **Focus indicators**: Visible focus states (2px minimum)
- **Skip links**: Navigation shortcuts
- **Arrow key navigation**: For complex widgets

### Screen Reader Support
- **Semantic HTML**: Proper heading structure
- **ARIA attributes**: Complete ARIA implementation
- **Live regions**: Status announcements
- **Alternative text**: All images have descriptive alt text

### Touch Targets
- **Minimum size**: 44x44 pixels on touch devices
- **Spacing**: Adequate spacing between targets
- **Touch feedback**: Visual feedback on interaction

## Performance Targets

- ✅ **Component Render Time**: <200ms average
- ✅ **Theme Switch Time**: <100ms
- ✅ **Focus Change Time**: <16ms (1 frame)
- ✅ **Screen Reader Response**: <100ms
- ✅ **Keyboard Response**: <16ms (1 frame)

## Verification Checklist

### WCAG 2.1 AA Compliance ✅
- All images have alt text or are decorative
- Form elements have proper labels
- Color contrast meets 4.5:1 ratio
- Content is keyboard accessible
- Focus indicators are visible
- Headings create logical structure

### Performance Optimization ✅
- Components render in <200ms
- Virtual scrolling for large lists
- Lazy loading for heavy components
- Debounced inputs prevent excessive updates
- Performance monitoring active in development

### Keyboard Navigation ✅
- Tab order is logical
- All interactive elements are focusable
- Arrow key navigation works in complex widgets
- Escape key closes modals and menus
- Skip links provide navigation shortcuts

### Screen Reader Support ✅
- ARIA attributes provide context
- Live regions announce status changes
- Screen reader only content provides additional context
- Form validation is announced
- Navigation changes are announced

## Development Tools

### Accessibility Audit
```tsx
import { checkWCAGCompliance } from '@/components/ui/atomic/accessibility';

const auditResults = checkWCAGCompliance();
console.log(`Compliance: ${auditResults.isCompliant ? 'PASS' : 'FAIL'}`);
console.log(`Issues: ${auditResults.issues.length}`);
console.log(`Score: ${auditResults.score}/100`);
```

### Performance Benchmarking
```tsx
import { benchmarkComponent } from '@/components/ui/atomic/accessibility';

const results = await benchmarkComponent(() => <MyComponent />, 100);
console.log(`Average render time: ${results.averageTime.toFixed(2)}ms`);
```

## Next Steps

1. **HT-022.2.4**: Basic Component Testing & Documentation
2. **HT-022.3.1**: Basic Module Registry & Management System

## Support

For accessibility questions or performance optimization, refer to the agency component toolkit documentation.