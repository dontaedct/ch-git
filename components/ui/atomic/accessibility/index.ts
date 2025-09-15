/**
 * @fileoverview HT-022.2.3: Basic Accessibility & Performance System - Main Export
 * @module components/ui/atomic/accessibility
 * @author Agency Component System
 * @version 1.0.0
 *
 * ACCESSIBILITY & PERFORMANCE SYSTEM: WCAG 2.1 AA compliance and optimization
 *
 * Features:
 * - WCAG 2.1 AA accessibility compliance
 * - Keyboard navigation and focus management
 * - Screen reader compatibility and ARIA support
 * - Performance monitoring and optimization
 * - Component render time tracking
 * - Accessibility settings management
 * - System preference detection
 *
 * Usage:
 * ```tsx
 * import {
 *   AccessibilityProvider,
 *   PerformanceProvider,
 *   useAccessibility,
 *   usePerformance
 * } from '@/components/ui/atomic/accessibility'
 *
 * function App() {
 *   return (
 *     <AccessibilityProvider>
 *       <PerformanceProvider>
 *         <YourApp />
 *       </PerformanceProvider>
 *     </AccessibilityProvider>
 *   )
 * }
 * ```
 */

// Core Providers
export {
  AccessibilityProvider,
  useAccessibility,
  useAnnouncer,
  useKeyboardNavigation,
  SkipLink
} from './accessibility-provider';

// Performance System
export {
  PerformanceProvider,
  usePerformance,
  useRenderPerformance,
  withPerformanceMonitoring,
  PerformanceMetrics,
  benchmarkComponent
} from '../performance/performance-monitor';

// Performance Optimization
export {
  optimizeComponent,
  VirtualScroll,
  LazyLoad,
  DebouncedInput,
  OptimizedImage,
  OptimizedButton,
  RenderBudgetWarning
} from '../performance/performance-optimizer';

// Keyboard Navigation
export {
  FocusManager,
  useFocusTrap,
  useKeyboardShortcuts,
  useRovingTabIndex,
  useAutoFocus,
  KeyboardHints,
  LiveRegion
} from './keyboard-navigation';

// Screen Reader Support
export {
  useScreenReaderDetection,
  ARIA,
  Announcement,
  useStatusAnnouncer,
  LoadingAnnouncer,
  FormValidationAnnouncer,
  NavigationAnnouncer,
  ScreenReaderOnly,
  VisuallyHiddenLabel,
  Description,
  ErrorMessage,
  SuccessMessage,
  AccessibleTable
} from './screen-reader-support';

// Combined provider for convenience - disabled due to TypeScript conflicts
// Use AccessibilityProvider and PerformanceProvider separately for now

// Accessibility configuration constants
export const ACCESSIBILITY_CONFIG = {
  // WCAG 2.1 AA Requirements
  minimumContrastRatio: 4.5,
  minimumLargeTextContrastRatio: 3,
  minimumTouchTargetSize: 44, // pixels
  maximumAnimationDuration: 5000, // milliseconds

  // Performance Targets
  renderTimeThreshold: 200, // milliseconds
  budgetWarningThreshold: 16, // milliseconds (60fps)
  maxComponentRenderTime: 100, // milliseconds

  // Keyboard Navigation
  focusableElements: [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', '),

  // ARIA Live Region Politeness
  liveRegionPoliteness: {
    status: 'polite' as const,
    alert: 'assertive' as const,
    error: 'assertive' as const,
    success: 'polite' as const,
    loading: 'polite' as const
  }
} as const;

// Utility functions
export function checkWCAGCompliance() {
  const issues: string[] = [];

  // Check for missing alt text
  const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    issues.push(`Found ${imagesWithoutAlt.length} images without alt text`);
  }

  // Check for missing form labels
  const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
  if (inputsWithoutLabels.length > 0) {
    issues.push(`Found ${inputsWithoutLabels.length} inputs without labels`);
  }

  // Check for missing headings structure
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    issues.push('No heading structure found');
  }

  // Check for missing skip links
  const skipLinks = document.querySelectorAll('a[href^="#"]');
  if (skipLinks.length === 0) {
    issues.push('No skip links found');
  }

  return {
    isCompliant: issues.length === 0,
    issues,
    score: Math.max(0, 100 - (issues.length * 20))
  };
}

export function getPerformanceScore(metrics: any) {
  let score = 100;

  // Penalize slow components
  const slowComponents = Object.entries(metrics.componentRenderTimes || {})
    .filter(([, times]) => {
      if (!Array.isArray(times)) return false;
      const avgTime = times.reduce((sum: number, time: number) => sum + time, 0) / times.length;
      return avgTime > ACCESSIBILITY_CONFIG.renderTimeThreshold;
    });

  score -= slowComponents.length * 10;

  // Penalize high total render time
  if (metrics.totalRenderTime > 1000) {
    score -= 20;
  }

  // Penalize high render count (too many re-renders)
  if (metrics.renderCount > 100) {
    score -= 10;
  }

  return Math.max(0, score);
}

// Export configuration
export { ACCESSIBILITY_CONFIG as config };