/**
 * Memory Leak Detection and Prevention Utility
 * 
 * This utility helps identify and prevent common memory leak patterns in React components:
 * - Missing useEffect cleanup functions
 * - Uncleaned timeouts and intervals
 * - Uncleaned event listeners
 * - Uncleaned subscriptions
 */

export interface MemoryLeakPattern {
  type: 'useEffect' | 'timeout' | 'interval' | 'eventListener' | 'subscription';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestedFix: string;
  componentName?: string;
  hookName?: string;
}

export class MemoryLeakDetector {
  private patterns: MemoryLeakPattern[] = [];
  private isEnabled: boolean = false;

  constructor() {
    // Only enable in development
    this.isEnabled = process.env.NODE_ENV === 'development';
  }

  /**
   * Enable or disable memory leak detection
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Check if a useEffect has proper cleanup
   */
  checkUseEffectCleanup(
    effectFunction: string,
    componentName?: string,
    hookName?: string
  ): MemoryLeakPattern | null {
    if (!this.isEnabled) return null;

    // Check for common patterns that indicate missing cleanup
    const hasReturnStatement = effectFunction.includes('return');
    const hasCleanupFunction = effectFunction.includes('removeEventListener') || 
                              effectFunction.includes('clearTimeout') || 
                              effectFunction.includes('clearInterval') ||
                              effectFunction.includes('unsubscribe');

    if (!hasReturnStatement || !hasCleanupFunction) {
      const pattern: MemoryLeakPattern = {
        type: 'useEffect',
        severity: 'high',
        description: `useEffect in ${hookName || 'component'} missing proper cleanup function`,
        suggestedFix: 'Add return function for cleanup in useEffect',
        componentName,
        hookName
      };
      
      this.patterns.push(pattern);
      return pattern;
    }

    return null;
  }

  /**
   * Check for timeout patterns without cleanup
   */
  checkTimeoutPattern(
    code: string,
    componentName?: string
  ): MemoryLeakPattern[] {
    if (!this.isEnabled) return [];

    const patterns: MemoryLeakPattern[] = [];
    
    // Check for setTimeout without clearTimeout
    if (code.includes('setTimeout') && !code.includes('clearTimeout')) {
      patterns.push({
        type: 'timeout',
        severity: 'medium',
        description: 'setTimeout used without clearTimeout cleanup',
        suggestedFix: 'Store timeout ID and clear it in useEffect cleanup',
        componentName
      });
    }

    // Check for setInterval without clearInterval
    if (code.includes('setInterval') && !code.includes('clearInterval')) {
      patterns.push({
        type: 'interval',
        severity: 'high',
        description: 'setInterval used without clearInterval cleanup',
        suggestedFix: 'Store interval ID and clear it in useEffect cleanup',
        componentName
      });
    }

    return patterns;
  }

  /**
   * Check for event listener patterns without cleanup
   */
  checkEventListenerPattern(
    code: string,
    componentName?: string
  ): MemoryLeakPattern[] {
    if (!this.isEnabled) return [];

    const patterns: MemoryLeakPattern[] = [];
    
    // Check for addEventListener without removeEventListener
    if (code.includes('addEventListener') && !code.includes('removeEventListener')) {
      patterns.push({
        type: 'eventListener',
        severity: 'high',
        description: 'addEventListener used without removeEventListener cleanup',
        suggestedFix: 'Add removeEventListener in useEffect cleanup or component unmount',
        componentName
      });
    }

    return patterns;
  }

  /**
   * Check for subscription patterns without cleanup
   */
  checkSubscriptionPattern(
    code: string,
    componentName?: string
  ): MemoryLeakPattern[] {
    if (!this.isEnabled) return [];

    const patterns: MemoryLeakPattern[] = [];
    
    // Check for subscription without unsubscribe
    if (code.includes('subscribe') && !code.includes('unsubscribe')) {
      patterns.push({
        type: 'subscription',
        severity: 'high',
        description: 'Subscription created without unsubscribe cleanup',
        suggestedFix: 'Store subscription and call unsubscribe in useEffect cleanup',
        componentName
      });
    }

    return patterns;
  }

  /**
   * Analyze a component's code for memory leak patterns
   */
  analyzeComponent(
    code: string,
    componentName?: string
  ): MemoryLeakPattern[] {
    if (!this.isEnabled) return [];

    const patterns: MemoryLeakPattern[] = [];
    
    // Check for useEffect patterns
    const useEffectMatches = code.match(/useEffect\s*\(\s*\(\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g);
    if (useEffectMatches) {
      useEffectMatches.forEach(match => {
        const pattern = this.checkUseEffectCleanup(match, componentName);
        if (pattern) patterns.push(pattern);
      });
    }

    // Check for other patterns
    patterns.push(...this.checkTimeoutPattern(code, componentName));
    patterns.push(...this.checkEventListenerPattern(code, componentName));
    patterns.push(...this.checkSubscriptionPattern(code, componentName));

    return patterns;
  }

  /**
   * Get all detected patterns
   */
  getPatterns(): MemoryLeakPattern[] {
    return [...this.patterns];
  }

  /**
   * Get patterns by severity
   */
  getPatternsBySeverity(severity: MemoryLeakPattern['severity']): MemoryLeakPattern[] {
    return this.patterns.filter(pattern => pattern.severity === severity);
  }

  /**
   * Get patterns by type
   */
  getPatternsByType(type: MemoryLeakPattern['type']): MemoryLeakPattern[] {
    return this.patterns.filter(pattern => pattern.type === type);
  }

  /**
   * Clear all patterns
   */
  clearPatterns() {
    this.patterns = [];
  }

  /**
   * Generate a summary report
   */
  generateReport(): string {
    if (!this.isEnabled) return 'Memory leak detection is disabled';

    const total = this.patterns.length;
    const bySeverity = {
      critical: this.getPatternsBySeverity('critical').length,
      high: this.getPatternsBySeverity('high').length,
      medium: this.getPatternsBySeverity('medium').length,
      low: this.getPatternsBySeverity('low').length
    };

    const byType = {
      useEffect: this.getPatternsByType('useEffect').length,
      timeout: this.getPatternsByType('timeout').length,
      interval: this.getPatternsByType('interval').length,
      eventListener: this.getPatternsByType('eventListener').length,
      subscription: this.getPatternsByType('subscription').length
    };

    return `
Memory Leak Detection Report
============================
Total Issues: ${total}

By Severity:
- Critical: ${bySeverity.critical}
- High: ${bySeverity.high}
- Medium: ${bySeverity.medium}
- Low: ${bySeverity.low}

By Type:
- useEffect: ${byType.useEffect}
- Timeout: ${byType.timeout}
- Interval: ${byType.interval}
- Event Listener: ${byType.eventListener}
- Subscription: ${byType.subscription}

${total > 0 ? '⚠️  Memory leaks detected! Review and fix the issues above.' : '✅ No memory leaks detected.'}
    `.trim();
  }
}

// Export singleton instance
export const memoryLeakDetector = new MemoryLeakDetector();

// Export utility functions
export const checkUseEffectCleanup = (effectFunction: string, componentName?: string, hookName?: string) =>
  memoryLeakDetector.checkUseEffectCleanup(effectFunction, componentName, hookName);

export const analyzeComponent = (code: string, componentName?: string) =>
  memoryLeakDetector.analyzeComponent(code, componentName);

export const getMemoryLeakReport = () => memoryLeakDetector.generateReport();
